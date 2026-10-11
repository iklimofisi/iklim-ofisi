// -----------------------------------------------------------------------------
// HAVALANDIRMA — OTOMATİK SİSTEM ÖNERİSİ
// Kullanıcı yalnız mahalleri (tip + ölçü) girer; program her mahalin nasıl
// havalandırılacağını (taze hava + egzoz / yalnız egzoz / ayrı mutfak, otopark,
// teknik fan / doğal) belirler, mahalleri gruplayıp santral / fan tipini seçer
// ve her seçimin gerekçesini yazar.
//
// Kurallar (tasarım pratiği; EN 16798-3, AB 1253/2014, ASHRAE 62.1, VDI 2052):
//  · Genel kullanım mahalleri (ofis, mağaza, kuaför, okul, otel…) + bunlara ait
//    WC / ıslak hacimler aynı ısı geri kazanımlı cihaza bağlanır (bölge başına bir cihaz).
//      ≤ 2.500 m³/h → tavan tipi kompakt IGK cihazı · üstü → IGK klima santrali.
//      Kokulu / kimyasal egzoz (WC, kuaför, laboratuvar, fotokopi…) varsa plakalı
//      (karşı akışlı) eşanjör; yoksa ve ≥ 4.000 m³/h ise rotorlu (nem de geri kazanılır).
//  · Konut: daire (bölge) başına konut tipi HRV; kuru odalara besleme, ıslak hacimlerden emiş.
//  · Ticari mutfak: ayrı mutfak egzoz fanı + telafi havası (yağlı hava IGK'ya girmez).
//  · Kapalı otopark: iki hızlı egzoz / duman tahliye fanları + jet fan.
//  · Teknik mahaller: mahal başına termostatlı egzoz fanı, doğal besleme panjuru.
//  · Kazan dairesi: doğal alt / üst menfez (fan yok).
// -----------------------------------------------------------------------------
import { ilBul } from "@/lib/isi-hesap/iklim";
import { sy } from "@/lib/isi-hesap/hesap";
import { MAHAL_TIPLERI, type MahalTipi, type SantralTipi } from "./katalog";
import { yeniSantral, type HavalandirmaVerisi, type Mahal, type Santral } from "./tipler";
import { mahalDebisi } from "./debi";

export type SistemSinifi = "GENEL" | "KONUT" | "ENDUSTRI" | "MUTFAK" | "BULASIK" | "OTOPARK" | "TEKNIK" | "KAZAN";

export const KOMPAKT_SINIR = 2500; // m³/h — üstünde klima santrali
export const ROTOR_SINIR = 4000; // m³/h — kokulu egzoz yoksa bu debiden itibaren rotorlu eşanjör
export const KONUT_SINIR = 1000; // m³/h — tek konut cihazının üst sınırı

// Egzozu kokulu / kimyasal / nemli olan mahaller (rotorlu eşanjöre bağlanmaz)
const KOKULU = new Set<MahalTipi>([
  "KUAFOR",
  "LAB",
  "FOTOKOPI",
  "TEMIZLIK",
  "DUS_SOYUNMA",
  "BULASIK",
  "WC_GENEL",
  "WC_OZEL",
  "OTEL_BANYO",
  "KONUT_MUTFAK",
  "KONUT_BANYO",
  "KONUT_WC",
]);

export function sistemSinifi(tip: MahalTipi): SistemSinifi {
  const t = MAHAL_TIPLERI[tip];
  if (t.yontem === "MUTFAK") return "MUTFAK";
  if (tip === "BULASIK") return "BULASIK";
  if (t.yontem === "OTOPARK") return "OTOPARK";
  if (t.yontem === "TEKNIK_ISI") return "TEKNIK";
  if (t.yontem === "KAZAN") return "KAZAN";
  if (t.grup === "Konut") return "KONUT";
  if (t.grup === "Endüstri") return "ENDUSTRI";
  return "GENEL";
}

// Mahalin nasıl havalandırılacağı (her iki modda da mahal ekranında gösterilir)
export function mahalSistemNotu(tip: MahalTipi): string {
  const t = MAHAL_TIPLERI[tip] as (typeof MAHAL_TIPLERI)[MahalTipi] & { egzozOrani?: number };
  switch (t.yontem) {
    case "KONUT_KURU":
      return "Taze hava (besleme) verilir; hava kapı altı boşluğundan ıslak hacimlere geçer ve oradan emilir. Konut tipi ısı geri kazanımlı cihaza bağlanır.";
    case "KONUT_ISLAK":
      return "Yalnız egzoz (sürekli emiş, ayarlı disk valf); taze hava kuru odalardan kapı altı boşluğuyla gelir. Konut cihazının emiş tarafına bağlanır.";
    case "ARMATUR":
    case "EGZOZ_ALAN":
      return tip === "BULASIK"
        ? "Yalnız egzoz (buharlı, sıcak hava); mutfak telafi havasıyla beslenir. Bulaşık makinesi üstüne buhar davlumbazı konur."
        : "Yalnız egzoz (sürekli); besleme koridordan kapı menfezi / kapı altı boşluğuyla geçiş havası olarak gelir. Mahal negatif basınçta kalır, koku dışarı çıkmaz.";
    case "MUTFAK":
      return "Davlumbaz egzozu + egzozun %85'i kadar şartlandırılmış telafi havası; ayrı mutfak egzoz fanı (yağlı hava ısı geri kazanım cihazına girmez). Mutfak hafif negatif basınçta; eksik hava salondan geçer.";
    case "OTOPARK":
      return "Normalde CO sensörlü egzoz (6 hava değişimi), yangında duman tahliyesi (10 hava değişimi); iki hızlı F300 egzoz fanları + jet fanlar; taze hava rampadan ya da taze hava fanıyla.";
    case "TEKNIK_ISI":
      return "Cihaz ısısını atmak için termostat kontrollü egzoz fanı; besleme dış duvarda hava giriş panjurundan (doğal). Dış hava yeterince serin değilse split / hassas klima eklenir.";
    case "KAZAN":
      return "Fan kullanılmaz: yanma havası alt menfezden doğal giriş, üst menfezden doğal atış (menfez ölçüleri gaz dağıtım şirketi şartnamesine göre).";
    case "HAVA_DEGISIMI":
      return "Hava değişim sayısına göre besleme + egzoz (dengeli); genel cihaza bağlanır.";
    case "KISI_ALAN": {
      const o = t.egzozOrani ?? 0.8;
      let n = "Taze hava (besleme) + egzoz: taze hava kişi sayısı ve alana göre verilir";
      if (o === 0) n += "; egzoz bu mahalden alınmaz (banyodan / ıslak hacimden alınır — banyo mahalini ayrıca ekleyin).";
      else if (o < 1) n += `, beslemenin %${sy(o * 100, 0)}'i kadar egzoz alınır; kalan hava WC / ıslak hacimlere geçiş havası olur (mahal hafif pozitif basınçta).`;
      else if (o > 1) n += `, egzoz beslemeden %${sy((o - 1) * 100, 0)} fazla tutulur (mahal negatif basınçta; koku / kimyasal buhar komşu hacimlere geçmez).`;
      else n += ", egzoz beslemeye eşit (dengeli).";
      if (tip === "KUAFOR")
        n +=
          " Kuaförde boya, oksidan, amonyak, aseton ve sprey buharı oluşur: egzoz menfezlerini boya / yıkama / fön istasyonlarının ve tırnak masalarının üstüne yerleştirin; manikür / tırnak masası varsa masa başına ≈ 25 l/s yerel (masa üstü) emiş ekleyin. Egzoz havası taze havaya karışmaması için plakalı eşanjörlü cihaz seçilir.";
      if (tip === "LAB") n += " Çeker ocak egzozları ayrı fanla atılır; laboratuvar egzozu ısı geri kazanımına bağlanacaksa plakalı / ara akışkanlı eşanjör kullanılır.";
      if (tip === "RESTORAN" || tip === "KAFE") n += " Mutfak varsa salon havasının bir kısmı mutfağa geçer; mutfak telafi havası bu kadar azaltılabilir.";
      if (tip === "TOPLANTI" || tip === "KONFERANS" || tip === "DUGUN_SALONU" || tip === "SINIF" || tip === "AMFI" || tip === "SINEMA")
        n += " Doluluk değişken olduğundan CO₂ sensörlü değişken debi (VAV damperi) enerjiyi belirgin düşürür.";
      return n;
    }
  }
  return "";
}

type Grup = { anahtar: string; sinif: SistemSinifi; bolge: string; mahaller: Mahal[] };

export type OtoSistemSonucu = { veri: HavalandirmaVerisi; gerekce: Record<number, string> };

const kisaltListe = (l: string[], n = 6) => (l.length > n ? `${l.slice(0, n).join(", ")} ve ${l.length - n} mahal daha` : l.join(", "));
const r0 = (x: number) => sy(x, 0);

export function otomatikSistem(v: HavalandirmaVerisi): OtoSistemSonucu {
  const il = ilBul(v.il);
  const yazKT = v.yazKTElle ?? il.yazKT;
  const debi = new Map(v.mahaller.map((m) => [m.id, mahalDebisi(m, v, yazKT)]));
  const gruplar: Grup[] = [];
  const grup = (anahtar: string, sinif: SistemSinifi, bolge: string) => {
    let g = gruplar.find((x) => x.anahtar === anahtar);
    if (!g) {
      g = { anahtar, sinif, bolge, mahaller: [] };
      gruplar.push(g);
    }
    return g;
  };
  for (const m of v.mahaller) {
    const sinif = sistemSinifi(m.tip);
    const bolge = (m.bolge ?? "").trim();
    const b = bolge.toLocaleLowerCase("tr-TR");
    if (sinif === "KAZAN") continue;
    if (sinif === "MUTFAK" || sinif === "TEKNIK" || sinif === "BULASIK") grup(`${sinif}|${m.id}`, sinif, bolge).mahaller.push(m);
    else grup(`${sinif}|${b}`, sinif, bolge).mahaller.push(m);
  }

  const santraller: Santral[] = [];
  const gerekce: Record<number, string> = {};
  const atama = new Map<string, { santral: number; egzozSantral: number | null }>();
  gruplar.forEach((g, i) => {
    const no = i + 1;
    const B = g.mahaller.reduce((t, m) => t + (debi.get(m.id)?.b ?? 0), 0);
    const E = g.mahaller.reduce((t, m) => t + (debi.get(m.id)?.e ?? 0), 0);
    const Q = Math.max(B, E);
    const adlar = g.mahaller.map((m) => m.ad);
    const kokulu = g.mahaller.filter((m) => KOKULU.has(m.tip));
    const onEk = g.bolge ? `${g.bolge} — ` : "";
    let tip: SantralTipi;
    let ad: string;
    let neden: string;
    switch (g.sinif) {
      case "MUTFAK":
        tip = "MUTFAK";
        ad = `Mutfak — ${g.mahaller[0].ad}`;
        neden = `${kisaltListe(adlar)}: davlumbaz egzozu yağlı ve sıcaktır; ısı geri kazanımlı cihaza bağlanmaz, eşanjörü ve kanalları kirletir, yangın riski oluşturur. Bu yüzden ayrı mutfak egzoz fanı (motoru hava akımı dışında, yağ toplama tavalı) ve egzozun %85'i kadar telafi havası santrali seçildi; mutfak hafif negatif basınçta kalır, koku salona geçmez.`;
        break;
      case "OTOPARK":
        tip = "OTOPARK";
        ad = `${onEk}Otopark fanları`;
        neden = `${kisaltListe(adlar)}: kapalı otoparkta egzoz gazı (CO, NO₂) için sürekli egzoz ve yangında duman tahliyesi gerekir (BYKHY). İki hızlı, 300 °C / 2 saat (F300) egzoz fanları, CO sensörleri ve jet fanlar seçildi; taze hava rampadan ya da taze hava fanıyla alınır.`;
        break;
      case "BULASIK":
        tip = "EGZOZ";
        ad = `Buhar egzoz fanı — ${g.mahaller[0].ad}`;
        neden = `${g.mahaller[0].ad}: bulaşık makinesinin sıcak, nemli buharı yağsızdır ama ısı geri kazanım eşanjöründe yoğuşur; yağlı davlumbaz kanalına da bağlanmaz. Ayrı egzoz fanı (nem dayanımlı, kanal eğimli ve drenajlı) seçildi; telafi havası mutfaktan / salondan geçiş havasıyla gelir.`;
        break;
      case "TEKNIK":
        tip = "EGZOZ";
        ad = `Egzoz fanı — ${g.mahaller[0].ad}`;
        neden = `${g.mahaller[0].ad}: cihaz ısısını atmak için iç sıcaklık termostatıyla çalışan egzoz fanı; besleme havası dış duvardaki panjurdan doğal yolla girer. Teknik hacim ayrı yangın bölmesi olduğundan fanı diğer sistemlerden bağımsızdır.`;
        break;
      case "KONUT":
        if (B < 1) {
          tip = "EGZOZ";
          ad = `${onEk}Islak hacim egzoz fanı`;
          neden = `${kisaltListe(adlar)}: besleme gereken kuru oda yok, yalnız ıslak hacim egzozu; egzoz fanı seçildi (telafi havası kapı altlarından / pencere menfezinden).`;
        } else {
          tip = "KONUT_HRV";
          ad = `${g.bolge || "Konut"} HRV`;
          neden = `${kisaltListe(adlar)}: daire içi dengeli havalandırma — salon ve yatak odalarına taze hava, mutfak / banyo / WC'den sürekli emiş; konut tipi ısı geri kazanımlı cihaz (verim ≥ %85, by-pass, G4 / F7 filtre). Besleme ve egzoz eşit çalışır (≈ ${r0(Q)} m³/h); eksik taraf kuru odalara ya da ıslak hacimlere eklenir.`;
          if (Q > KONUT_SINIR)
            neden += ` Debi ${r0(Q)} m³/h, tek konut cihazı için büyük: birden fazla daire ise mahallerde "Bölge" alanına daire adını yazın (Daire 1, Daire 2…), her daireye ayrı cihaz seçilir.`;
        }
        break;
      default: {
        // GENEL / ENDÜSTRİ
        const sinifAd = g.sinif === "ENDUSTRI" ? "Atölye / üretim" : "Genel";
        const hvAd = g.sinif === "ENDUSTRI" ? "Atölye / üretim havalandırması" : "Genel havalandırma";
        if (B < 1) {
          tip = "EGZOZ";
          ad = `${onEk}${sinifAd} egzoz fanı`;
          neden = `${kisaltListe(adlar)}: taze hava gereken mahal yok, yalnız egzoz; egzoz fanı seçildi (telafi havası komşu hacimlerden / menfezden).`;
        } else if (Q <= KOMPAKT_SINIR) {
          tip = "TICARI_HRV";
          ad = `${onEk}${hvAd}`;
          neden = `${kisaltListe(adlar)}: en büyük debi ≈ ${r0(Q)} m³/h. ${sy(KOMPAKT_SINIR, 0)} m³/h'e kadar santral yerine tavan tipi kompakt ısı geri kazanım cihazı yeterli ve ekonomiktir (asma tavana asılır, makine dairesi gerekmez); kışın egzoz havasının ısısının ≈ %78'i taze havaya aktarılır.`;
        } else if (!kokulu.length && Q >= ROTOR_SINIR) {
          tip = "AHU_ROTOR";
          ad = `${onEk}${hvAd}`;
          neden = `${kisaltListe(adlar)}: en büyük debi ≈ ${r0(Q)} m³/h — ısı geri kazanımlı klima santrali. Kokulu / kimyasal egzoz olmadığı için rotorlu eşanjör seçildi: ısının yanında nemi de geri kazanır (kışın kuru hava, yazın nem yükü azalır), donmaya dayanıklıdır, verimi yüksektir.`;
        } else {
          tip = "AHU_PLAKA";
          ad = `${onEk}${hvAd}`;
          neden = `${kisaltListe(adlar)}: en büyük debi ≈ ${r0(Q)} m³/h — ${sy(KOMPAKT_SINIR, 0)} m³/h üstü olduğu için ısı geri kazanımlı klima santrali, karşı akışlı plakalı eşanjör.`;
        }
        if ((tip === "TICARI_HRV" || tip === "AHU_PLAKA") && kokulu.length)
          neden += ` ${kisaltListe(kokulu.map((m) => m.ad), 4)} egzozu kokulu / kimyasal / nemli olduğundan egzoz ve taze havanın birbirine hiç karışmadığı plakalı eşanjör kullanılır (rotorlu eşanjör koku taşır).`;
        else if (tip === "AHU_PLAKA") neden += ` Debi ${sy(ROTOR_SINIR, 0)} m³/h altında plakalı eşanjör daha ekonomiktir.`;
        if (tip !== "EGZOZ" && g.mahaller.some((m) => KOKULU.has(m.tip) && (debi.get(m.id)?.b ?? 0) < 1))
          neden += " WC / ıslak hacim egzozları da aynı cihaza bağlandı: egzoz ısısı geri kazanılır ve bina dengede kalır (taze hava kuru mahallerden geçiş havasıyla gelir).";
      }
    }
    const s = yeniSantral(no, tip);
    s.ad = ad.slice(0, 60);
    santraller.push(s);
    gerekce[no] = neden;
    for (const m of g.mahaller) atama.set(m.id, { santral: no, egzozSantral: null });
  });

  const mahaller = v.mahaller.map((m) => {
    const a = atama.get(m.id);
    return a ? { ...m, ...a } : { ...m, santral: 0, egzozSantral: 0 };
  });
  return { veri: { ...v, santraller, mahaller }, gerekce };
}
