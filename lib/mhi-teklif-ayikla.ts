// -----------------------------------------------------------------------------
// MITSUBISHI HEAVY (FORM MHI KLİMA) TEKLİF PDF'İ AYIKLAMA
// Biçim (DevExpress raporu): kapakta "TARİH : 19.11.2026", "NO : 233570 / 239848",
// müşteri unvanı, proje adı ve "Talep etmiş olduğunuz MITSUBISHI HEAVY IND. …".
// Kalem tablosu "Sıra · Ürün Açıklaması · Miktar · Birim · Birim Fiyat · Net Tutar":
//   "TİP 1 VİLLA                              53.541,00 $"   ← grup başlığı ve grup toplamı
//   "1  FDC121KXZEN1   9  adet   3.528,00 $   31.752,00 $"   ← kalem (sıra, model, adet, birim, fiyat, tutar)
//   "Micro KXZ Heat Pump Dış Ünite 4 hp …"                   ← Türkçe açıklama
//   "Micro KXZ Heat Pump Outdoor Unit 4 hp …"                ← İngilizce tekrarı (alınmaz)
// Sonda "GENEL TOPLAM 149.868,00 $", ardından "İDARİ ŞARTLAR" (KDV, ödeme, opsiyon).
// Fiyatlar firmamızın NET ALIŞ fiyatlarıdır (Viessmann teklifindeki gibi).
// PDF'te harfler parça parça gelir ("KX" "Z", "1" "2" "," "1"); satırlar, aralarındaki
// boşluğa bakılarak birleştirilir. Sonuç TCL ayıklayıcısıyla aynı biçimdedir.
// Saf fonksiyon (PDF okuma ayrı): metin parçaları konumlarıyla verilir.
// -----------------------------------------------------------------------------
import type { PdfSayfa } from "@/lib/netsa-ayikla";
import type { TclKalem, TclSonuc } from "@/lib/tcl-teklif-ayikla";

const sade = (s: string) => s.normalize("NFKC").replace(/\s+/g, " ").trim();

// "3.528,00" / "51,50" → sayı (Türkçe yazım: nokta binlik, virgül ondalık)
function sayiOku(ham: string): number | null {
  const t = ham.replace(/\s/g, "");
  if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(t)) return null;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const PB = "(\\$|€|₺|TL|USD|EUR|TRY)";
const paraBirimiOku = (s: string): TclSonuc["paraBirimi"] => (/€|EUR/i.test(s) ? "EUR" : /₺|TL|TRY/i.test(s) ? "TRY" : "USD");

// Sayfadaki parçaları satırlara çevirir. Aynı satırdaki parçalar arasında boşluk yoksa
// (harf harf gelen yazı) bitişik, varsa boşlukla birleştirilir.
function satirlar(sayfa: PdfSayfa): string[] {
  const og = sayfa.items.filter((i) => i.s && i.s.trim()).sort((a, b) => a.y - b.y || a.x - b.x);
  const gruplar: (typeof og)[] = [];
  for (const i of og) {
    const g = gruplar[gruplar.length - 1];
    if (g && Math.abs(i.y - g[0].y) <= 2.5) g.push(i);
    else gruplar.push([i]);
  }
  return gruplar.map((g) => {
    const s = g.sort((a, b) => a.x - b.x);
    let metin = "";
    let sonBitis = -Infinity;
    for (const i of s) {
      const bosluk = i.x - sonBitis;
      metin += metin && bosluk > 1.2 ? ` ${i.s.trim()}` : i.s.trim();
      sonBitis = i.x + (i.w || 0);
    }
    return sade(metin);
  });
}

// PDF bir Form MHI (Mitsubishi Heavy) teklifi mi?
export function mhiTeklifiMi(sayfalar: PdfSayfa[]): boolean {
  const metin = sayfalar.map((s) => s.items.map((i) => i.s).join(" ")).join(" ");
  return /FORM\s*MHI|MITSUBISHI\s*HEAVY/i.test(metin) && /Ürün\s*Açıklaması/i.test(metin) && /Net\s*Tutar/i.test(metin);
}

// Türkçe açıklama satırı mı? (İngilizce tekrarı alınmaz)
const turkceMi = (s: string) => /[çğıöşüÇĞİÖŞÜ]|\b(kumanda|dahil|hari[çc]|ünite|tipi|filtre|kaset|kanal|monofaze|trifaze|bağlant[ıi])\b/i.test(s);

export function mhiTeklifAyikla(sayfalar: PdfSayfa[]): TclSonuc {
  const uyarilar: string[] = [];
  const notlar: string[] = [];
  const S = sayfalar.flatMap((s) => satirlar(s));

  // Başlık bilgileri (kapak)
  let tarih = "";
  let teklifNo = "";
  let projeAdi = "";
  for (let i = 0; i < S.length; i++) {
    const s = S[i];
    if (!tarih) {
      const t = s.match(/^TAR[İI]H\s*:\s*(\d{1,2})[./](\d{1,2})[./](20\d\d)/i);
      if (t) tarih = `${t[1].padStart(2, "0")}.${t[2].padStart(2, "0")}.${t[3]}`;
    }
    if (!teklifNo) {
      const n = s.match(/^NO\s*:\s*(.+)$/i);
      if (n) teklifNo = sade(n[1]);
    }
    // Proje adı: "Talep etmiş olduğunuz …" cümlesinden hemen önceki satır
    if (!projeAdi && /^Talep\s+etmi[şs]\s+oldu[ğg]unuz/i.test(s) && i > 0 && !/^(TAR[İI]H|NO)\s*:/i.test(S[i - 1])) projeAdi = S[i - 1];
  }
  if (teklifNo) notlar.push(`Form MHI teklif no: ${teklifNo}`);

  // Kalem tablosu
  const KALEM = new RegExp(`^(\\d{1,4})\\s+(\\S+)\\s+([\\d.,]+)\\s+([A-Za-zÇĞİÖŞÜçğıöşü.²³]+)\\s+([\\d.,]+)\\s*${PB}\\s+([\\d.,]+)\\s*${PB}$`);
  const GRUP = new RegExp(`^(.+?)\\s+([\\d.]+,\\d{2})\\s*${PB}$`);
  // Sayfa başlıkları, tablo başlığı ve yazıyla toplam ("(Yalnız, YüzKırk… $)") kalem açıklamasına karışmaz
  const ATLA = /^(TAR[İI]H\s*:|NO\s*:|TEKL[İI]F\b|S[ıi]ra\s+Ürün|\(\s*Yaln[ıi]z)/i;
  type Acik = TclKalem & { satirlar: string[]; sira: number };
  const kalemler: Acik[] = [];
  const grupToplami = new Map<string, number>();
  let grup = "";
  let acik: Acik | null = null;
  let netTutar: number | null = null;
  let paraBirimi: TclSonuc["paraBirimi"] = "USD";
  let tabloda = false;

  for (const s of S) {
    if (!tabloda) {
      if (/^S[ıi]ra\s+Ürün\s+Açıklaması/i.test(s)) tabloda = true;
      continue;
    }
    const gt = s.match(new RegExp(`GENEL\\s+TOPLAM\\s+([\\d.,]+)\\s*${PB}`, "i"));
    if (gt) {
      netTutar = sayiOku(gt[1]);
      paraBirimi = paraBirimiOku(gt[2]);
      break;
    }
    if (/^[İI]DAR[İI]\s+ŞARTLAR/i.test(s)) break;
    if (ATLA.test(s)) continue;
    const k = s.match(KALEM);
    if (k) {
      const adet = sayiOku(k[3]);
      const birim = sayiOku(k[5]);
      const tutar = sayiOku(k[7]);
      paraBirimi = paraBirimiOku(k[6]);
      if (adet === null || birim === null || tutar === null) {
        uyarilar.push(`${k[2]}: adet / fiyat okunamadı (${s.slice(0, 80)}).`);
        acik = null;
        continue;
      }
      if (Math.abs(adet * birim - tutar) > Math.max(0.05, tutar * 0.002))
        uyarilar.push(`${k[2]}: adet × birim fiyat tutarı tutmuyor (${adet} × ${birim} ≠ ${tutar}).`);
      acik = { bolum: grup, kod: k[2], aciklama: "", adet, birimFiyat: birim, tutar, satirlar: [], sira: Number(k[1]) };
      kalemler.push(acik);
      continue;
    }
    const g = s.match(GRUP);
    if (g && !/\d\s+adet\b/i.test(s)) {
      grup = sade(g[1]);
      const t = sayiOku(g[2]);
      if (t !== null) grupToplami.set(grup, t);
      acik = null;
      continue;
    }
    if (acik) acik.satirlar.push(s);
  }

  // Açıklama: ilk satır her zaman; sonraki satırlardan yalnız Türkçe olanlar (İngilizce tekrarı alınmaz)
  const sonKalemler: TclKalem[] = kalemler.map(({ satirlar: ek, sira: _s, ...k }) => {
    void _s;
    const secilen = ek.filter((x, i) => i === 0 || turkceMi(x));
    return { ...k, bolum: k.bolum || "Mitsubishi Heavy Ürünleri", aciklama: sade(secilen.join(" · ")).slice(0, 480) };
  });

  // Kontroller: sıra numaraları, grup toplamları, genel toplam
  const siralar = kalemler.map((k) => k.sira);
  const eksik = siralar.length ? Array.from({ length: Math.max(...siralar) }, (_, i) => i + 1).filter((n) => !siralar.includes(n)) : [];
  if (eksik.length) uyarilar.push(`Teklifteki ${eksik.join(", ")}. sıra okunamadı; PDF ile karşılaştırın.`);
  for (const [ad, toplam] of grupToplami) {
    const hesap = Math.round(sonKalemler.filter((k) => k.bolum === ad).reduce((a, k) => a + k.tutar, 0) * 100) / 100;
    if (Math.abs(hesap - toplam) > 0.05) uyarilar.push(`"${ad}" kalemlerinin toplamı (${hesap}) teklifteki grup toplamıyla (${toplam}) tutmuyor.`);
  }
  if (!sonKalemler.length) uyarilar.push("Teklifte ürün satırı bulunamadı (\"Sıra · Ürün Açıklaması · Miktar\" tablosu yok ya da biçim farklı).");
  const kalemToplami = Math.round(sonKalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0) * 100) / 100;
  if (netTutar != null && Math.abs(netTutar - kalemToplami) > 0.05)
    uyarilar.push(`Kalemlerin toplamı (${kalemToplami}) teklifteki GENEL TOPLAM ile (${netTutar}) tutmuyor; satırları kontrol edin.`);
  if (netTutar == null && sonKalemler.length) uyarilar.push("\"GENEL TOPLAM\" bulunamadı; kalemleri kontrol edin.");

  // İdari şartlardan kısa notlar (bilgi için)
  const tum = S.join("\n");
  if (/KDV[^.\n]{0,20}dahil\s+de[ğg]ildir/i.test(tum)) notlar.push("Fiyatlara KDV dahil değildir.");
  if (/montaj\s+ve\s+i[şs][çc]ilik\s+bedelleri\s+dahil\s+de[ğg]ildir/i.test(tum)) notlar.push("Cihaz fiyatlarına montaj ve işçilik dahil değildir.");
  const ops = tum.match(/^Opsiyon\s*:\s*(.+)$/im);
  if (ops) notlar.push(`Opsiyon: ${sade(ops[1])}`);
  notlar.push("Form MHI teklifindeki fiyatlar net alış fiyatlarıdır (KDV hariç).");

  return { projeAdi, tarih, paraBirimi, kalemler: sonKalemler, netTutar, kalemToplami, fiyatsiz: false, notlar, uyarilar, firma: "MHI" };
}
