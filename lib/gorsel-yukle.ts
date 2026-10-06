// Tarayıcı tarafı: seçilen fotoğrafı küçültür (en uzun kenar 1200 px), beyaz zemine
// oturtup JPEG'e çevirir ve /api/gorsel adresine yükler. Telefon fotoğrafları
// (5-10 MB) böylece ~150 KB'a iner; PDF'te de net görünür.
export type YuklenenGorsel = { id: string; genislik: number; yukseklik: number };

const EN_UZUN = 1200;

async function resimAc(dosya: File): Promise<{ kaynak: CanvasImageSource; g: number; y: number; kapat: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(dosya, { imageOrientation: "from-image" } as ImageBitmapOptions);
      return { kaynak: bmp, g: bmp.width, y: bmp.height, kapat: () => bmp.close() };
    } catch {
      /* aşağıdaki yönteme düş */
    }
  }
  const url = URL.createObjectURL(dosya);
  const img = new Image();
  await new Promise<void>((tamam, hata) => {
    img.onload = () => tamam();
    img.onerror = () => hata(new Error("Fotoğraf açılamadı"));
    img.src = url;
  });
  return { kaynak: img, g: img.naturalWidth, y: img.naturalHeight, kapat: () => URL.revokeObjectURL(url) };
}

export async function fotografYukle(dosya: File): Promise<YuklenenGorsel> {
  if (!dosya.type.startsWith("image/")) throw new Error("Lütfen bir fotoğraf dosyası seçin (JPG, PNG…)");
  const r = await resimAc(dosya);
  try {
    const oran = Math.min(1, EN_UZUN / Math.max(r.g, r.y));
    const g = Math.max(1, Math.round(r.g * oran));
    const y = Math.max(1, Math.round(r.y * oran));
    const tuval = document.createElement("canvas");
    tuval.width = g;
    tuval.height = y;
    const ctx = tuval.getContext("2d");
    if (!ctx) throw new Error("Tarayıcı fotoğrafı işleyemedi");
    ctx.fillStyle = "#ffffff"; // saydam PNG'ler beyaz zemine
    ctx.fillRect(0, 0, g, y);
    ctx.drawImage(r.kaynak, 0, 0, g, y);
    const blob: Blob | null = await new Promise((t) => tuval.toBlob(t, "image/jpeg", 0.85));
    if (!blob) throw new Error("Fotoğraf dönüştürülemedi");
    const fd = new FormData();
    fd.append("dosya", blob, "foto.jpg");
    const yanit = await fetch("/api/gorsel", { method: "POST", body: fd });
    const veri = await yanit.json().catch(() => ({}));
    if (!yanit.ok || !veri?.id) throw new Error(veri?.hata || "Fotoğraf yüklenemedi");
    return veri as YuklenenGorsel;
  } finally {
    r.kapat();
  }
}
