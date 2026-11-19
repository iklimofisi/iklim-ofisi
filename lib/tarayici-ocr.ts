// -----------------------------------------------------------------------------
// TARAYICIDA PDF OKUMA (OCR) — yazı katmanı olmayan teklif PDF'leri için
// "Microsoft Print to PDF" ile basılan PDF'lerde yazılar resim gibidir; metin okunamaz.
// Bu dosya PDF sayfalarını tarayıcıda resme çevirir (pdf.js) ve resimdeki yazıyı okur
// (Tesseract, Türkçe). Her şey kullanıcının tarayıcısında olur: sunucuya yük binmez,
// dosya başka bir yere gönderilmez. Kütüphaneler ilk kullanımda CDN'den yüklenir
// (paket boyutu büyümesin diye); Türkçe dil dosyası bir kez indirilip tarayıcıda saklanır.
// Yalnız istemci bileşenlerinden çağrılır.
// -----------------------------------------------------------------------------

const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
const PDFJS_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
const TESSERACT = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
const EN_FAZLA_SAYFA = 30;
const OLCEK = 4; // 72 dpi × 4 ≈ 288 dpi: tablo yazıları ve kodlar net okunur

type PdfSayfasi = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
};
type PdfBelgesi = { numPages: number; getPage: (n: number) => Promise<PdfSayfasi>; destroy: () => Promise<void> };
type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (o: { data: Uint8Array }) => { promise: Promise<PdfBelgesi> };
};
type OcrIsci = {
  setParameters: (p: Record<string, string>) => Promise<unknown>;
  recognize: (g: HTMLCanvasElement) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<unknown>;
};
type TesseractJs = {
  createWorker: (dil: string, oem?: number, secenek?: { logger?: (m: { status: string; progress: number }) => void }) => Promise<OcrIsci>;
};

// Tablo çizgilerini siler: OCR, hücre kenarlarına yapışık yazıları (kod · açıklama · adet satırı)
// çizgiyle birlikte okuyamıyor. Uzun kesintisiz koyu yatay (sayfa eninin %15'i) ve dikey
// (sayfa boyunun %3'ü) dizileri beyaza boyanır; harfler bu uzunlukta olmadığı için bozulmaz.
function cizgileriSil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const veri = ctx.getImageData(0, 0, w, h);
  const p = veri.data;
  const koyu = new Uint8Array(w * h);
  for (let i = 0, j = 0; j < koyu.length; i += 4, j++) koyu[j] = p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114 < 128 ? 1 : 0;
  const sil = new Uint8Array(w * h);
  const enYatay = Math.round(w * 0.15);
  const enDikey = Math.round(h * 0.03);
  for (let y = 0; y < h; y++) {
    let bas = -1;
    for (let x = 0; x <= w; x++) {
      const k = x < w && koyu[y * w + x] === 1;
      if (k && bas < 0) bas = x;
      else if (!k && bas >= 0) {
        if (x - bas > enYatay) for (let z = bas; z < x; z++) sil[y * w + z] = 1;
        bas = -1;
      }
    }
  }
  for (let x = 0; x < w; x++) {
    let bas = -1;
    for (let y = 0; y <= h; y++) {
      const k = y < h && koyu[y * w + x] === 1;
      if (k && bas < 0) bas = y;
      else if (!k && bas >= 0) {
        if (y - bas > enDikey) for (let z = bas; z < y; z++) sil[z * w + x] = 1;
        bas = -1;
      }
    }
  }
  for (let j = 0, i = 0; j < sil.length; j++, i += 4) if (sil[j]) p[i] = p[i + 1] = p[i + 2] = 255;
  ctx.putImageData(veri, 0, 0);
}

const yuklenen = new Map<string, Promise<void>>();
function betikYukle(src: string): Promise<void> {
  const var_ = yuklenen.get(src);
  if (var_) return var_;
  const p = new Promise<void>((tamam, hata) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onload = () => tamam();
    s.onerror = () => {
      yuklenen.delete(src);
      hata(new Error("OCR kütüphanesi yüklenemedi (internet bağlantısını kontrol edin)."));
    };
    document.head.appendChild(s);
  });
  yuklenen.set(src, p);
  return p;
}

// PDF'in bütün sayfalarını okur; sayfalar arasında "\f" bulunan düz metin döner.
// ilerleme: kullanıcıya gösterilecek kısa durum metni ("Sayfa 2 / 4 okunuyor…")
export async function pdfGoruntudenOku(dosya: File, ilerleme?: (mesaj: string) => void): Promise<string> {
  ilerleme?.("OCR hazırlanıyor (ilk seferde birkaç saniye sürebilir)…");
  await Promise.all([betikYukle(PDFJS), betikYukle(TESSERACT)]);
  const w = window as unknown as { pdfjsLib?: PdfJs; "pdfjs-dist/build/pdf"?: PdfJs; Tesseract?: TesseractJs };
  const pdfjs = w.pdfjsLib ?? w["pdfjs-dist/build/pdf"];
  const tesseract = w.Tesseract;
  if (!pdfjs || !tesseract) throw new Error("OCR kütüphanesi yüklenemedi.");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

  const belge = await pdfjs.getDocument({ data: new Uint8Array(await dosya.arrayBuffer()) }).promise;
  const sayfaSayisi = Math.min(belge.numPages, EN_FAZLA_SAYFA);
  let isci: OcrIsci | null = null;
  try {
    isci = await tesseract.createWorker("tur", 1, {
      logger: (m) => {
        if (m.status === "loading language traineddata") ilerleme?.(`Türkçe dil dosyası yükleniyor… %${Math.round((m.progress || 0) * 100)}`);
      },
    });
    // 4: tek sütun, satır satır (tablo satırı kod · açıklama · adet bir arada okunur)
    await isci.setParameters({ tessedit_pageseg_mode: "4", preserve_interword_spaces: "1" });
    const metinler: string[] = [];
    for (let n = 1; n <= sayfaSayisi; n++) {
      ilerleme?.(`Sayfa ${n} / ${sayfaSayisi} görüntüden okunuyor…`);
      const sayfa = await belge.getPage(n);
      const vp = sayfa.getViewport({ scale: OLCEK });
      const tuval = document.createElement("canvas");
      tuval.width = Math.ceil(vp.width);
      tuval.height = Math.ceil(vp.height);
      const ctx = tuval.getContext("2d");
      if (!ctx) throw new Error("Tarayıcı sayfayı çizemedi.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tuval.width, tuval.height);
      await sayfa.render({ canvasContext: ctx, viewport: vp }).promise;
      cizgileriSil(ctx, tuval.width, tuval.height);
      const { data } = await isci.recognize(tuval);
      metinler.push(data.text || "");
      tuval.width = tuval.height = 0; // belleği bırak
    }
    return metinler.join("\n\f\n");
  } finally {
    await isci?.terminate().catch(() => undefined);
    await belge.destroy().catch(() => undefined);
  }
}
