"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import UrunArama from "@/components/UrunArama";
import { toplamaGoreDagit, tutarOku } from "@/lib/toplam-dagit";
import { donusumKalemleri } from "@/lib/satinalma-hesap";

export type Satir = {
  key: number | string;
  id?: string; // Düzenlemede mevcut kalemin veritabanı ID'si (sevkiyat/teslim kayıtlarını korumak için)
  bolum?: string;
  aciklama?: string;
  adet?: string | number;
  birimFiyat?: string | number;
  iskontoYuzde?: string | number;
  markaId?: string | null;
};

type Urun = {
  id: string;
  kod: string | null;
  ad: string;
  markaId: string | null;
  birimFiyat: number;
  paraBirimi: string;
};

// Türkçe virgülü ve noktayı güvenli sayıya çevirici
const parseSayi = (val: string | number | undefined): number => {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return val;
  const clean = val.toString().replace(",", ".").trim();
  return parseFloat(clean) || 0;
};

// Satırları bölümlerine göre bitişik hâle getirir (bölümler ilk göründükleri
// sırayla, bölüm içindeki sıra korunur). Ekrandaki sıra = kaydedilen sıra olur;
// "Sıra" kutusundaki numara da ekranda görünen sırayla birebir aynı olur.
function bolumlereGoreDiz(liste: Satir[]): Satir[] {
  const gruplar = new Map<string, Satir[]>();
  for (const s of liste) {
    const b = s.bolum || "Genel Kalemler";
    if (!gruplar.has(b)) gruplar.set(b, []);
    gruplar.get(b)!.push(s);
  }
  return Array.from(gruplar.values()).flat();
}

// Fiyat Formatlayıcı
const formatPara = (val: number) => {
  return val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function TeklifKalemleri({
  baslangic,
  markalar,
  urunler,
  paraBirimi = "TRY",
  kurlar = null,
}: {
  baslangic?: Satir[];
  markalar?: { id: string; ad: string }[];
  urunler?: Urun[];
  paraBirimi?: string;
  kurlar?: { tarih: string; USD: number; EUR: number } | null; // TCMB efektif satış (1 birim = ? TL)
}) {
  // State: Tüm kalemler
  const [satirlar, setSatirlar] = useState<Satir[]>(() => {
    if (baslangic && baslangic.length > 0) {
      return bolumlereGoreDiz(baslangic.map((s, idx) => ({
        key: s.key ?? idx,
        id: s.id,
        bolum: s.bolum || "VRF Sistemleri",
        aciklama: s.aciklama ?? "",
        adet: String(s.adet ?? 1),
        birimFiyat: String(s.birimFiyat ?? 0),
        iskontoYuzde: String(s.iskontoYuzde ?? 0),
        markaId: s.markaId ?? "",
      })));
    }
    return [
      {
        key: Date.now(),
        bolum: "VRF Sistemleri",
        aciklama: "",
        adet: "1",
        birimFiyat: "0",
        iskontoYuzde: "0",
        markaId: "",
      },
    ];
  });

  const [topluIskontoOrani, setTopluIskontoOrani] = useState("");
  const [yeniBolumAdi, setYeniBolumAdi] = useState("");
  const [seciliParaBirimi, setSeciliParaBirimi] = useState<string>(paraBirimi || "TRY");

  // Pazarlık sonrası toplam: birim fiyatları hedef toplama göre dağıtma
  const [hedefMetin, setHedefMetin] = useState("");
  const [tamSayi, setTamSayi] = useState(false);
  const [dagitimOncesi, setDagitimOncesi] = useState<Satir[] | null>(null);
  const [dagitimMesaji, setDagitimMesaji] = useState<{ tip: "ok" | "uyari" | "hata"; metin: string } | null>(null);
  const dagitimSonrasi = useRef<Satir[] | null>(null);
  const kokRef = useRef<HTMLDivElement>(null);
  // Fiyatsız kalemlere dağıtırken "kalem fiyatlarını gizle" kutusu işaretlenir;
  // Geri Al'da eski hâline dönmesi için önceki durumu tutulur.
  const gizleOncesi = useRef<boolean | null>(null);
  const fiyatGizleKutusu = () =>
    kokRef.current?.closest("form")?.querySelector<HTMLInputElement>('input[name="birimFiyatGoster"]') ?? null;

  // Ayarlamadan sonra kalemlerde elle değişiklik yapılırsa "Geri Al" kalkar
  // (yoksa geri almak sonradan yapılan düzeltmeleri de silerdi).
  useEffect(() => {
    if (dagitimSonrasi.current && satirlar !== dagitimSonrasi.current) {
      dagitimSonrasi.current = null;
      setDagitimOncesi(null);
      setDagitimMesaji(null);
    }
  }, [satirlar]);

  // DİNANMİK PARA BİRİMİ SİMGESİ (EUR -> €, USD -> $, TRY -> ₺)
  useEffect(() => {
    const selectEl = document.querySelector<HTMLSelectElement>('select[name="paraBirimi"]');
    if (!selectEl) return;

    const handler = () => setSeciliParaBirimi(selectEl.value);
    selectEl.addEventListener("change", handler);
    setSeciliParaBirimi(selectEl.value); // Açılışta oku
    setFiyatPb(selectEl.value); // fiyatlar açılışta bu para biriminde

    return () => selectEl.removeEventListener("change", handler);
  }, []);

  // --- PARA BİRİMİ DEĞİŞİNCE FİYATLARI KURLA ÇEVİRME ---
  // fiyatPb: kalemlerdeki fiyatların şu an hangi para biriminde olduğu.
  // Yukarıdan para birimi değiştirilince fiyatlar kendiliğinden DEĞİŞMEZ; çevirme
  // önerisi çıkar ("Fiyatları çevir" / "Sadece para birimini değiştir").
  const [fiyatPb, setFiyatPb] = useState<string | null>(null);
  const [oranMetin, setOranMetin] = useState("");
  const [kurOncesi, setKurOncesi] = useState<{ satirlar: Satir[]; pb: string } | null>(null);
  const [kurMesaji, setKurMesaji] = useState<string | null>(null);
  const fiyatliSatirVar = satirlar.some((s) => parseSayi(s.birimFiyat) > 0);
  const tlKarsiligi = (pb: string) => (pb === "TRY" ? 1 : kurlar ? (pb === "USD" ? kurlar.USD : pb === "EUR" ? kurlar.EUR : null) : null);
  const cevirmeBekliyor = fiyatPb !== null && fiyatPb !== seciliParaBirimi && fiyatliSatirVar;

  useEffect(() => {
    if (fiyatPb === null || fiyatPb === seciliParaBirimi) return;
    // Fiyat girilmemişse çevrilecek bir şey yok: yalnızca para birimi değişir
    if (!fiyatliSatirVar) {
      setFiyatPb(seciliParaBirimi);
      return;
    }
    const a = tlKarsiligi(fiyatPb), b = tlKarsiligi(seciliParaBirimi);
    // 7 anlamlı basamak: TL→EUR gibi küçük oranlarda da hassasiyet kaybolmaz
    setOranMetin(a && b ? String(Number((a / b).toPrecision(7))).replace(".", ",") : "");
    setKurMesaji(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fiyatPb, seciliParaBirimi]);

  const fiyatlariCevir = () => {
    if (!fiyatPb) return;
    const oran = tutarOku(oranMetin);
    if (!oran || oran <= 0) {
      setKurMesaji("Geçerli bir kur yazın.");
      return;
    }
    const yeni = satirlar.map((s) => {
      const f = parseSayi(s.birimFiyat);
      return f > 0 ? { ...s, birimFiyat: String(Math.round(f * oran * 100) / 100) } : s;
    });
    setKurOncesi({ satirlar, pb: fiyatPb });
    setSatirlar(yeni);
    setFiyatPb(seciliParaBirimi);
    setKurMesaji(
      `Fiyatlar ${fiyatPb} → ${seciliParaBirimi} çevrildi (1 ${fiyatPb} = ${oranMetin} ${seciliParaBirimi}). Kaydetmeyi unutmayın.`
    );
  };

  const kurCevirmesiniGeriAl = () => {
    if (!kurOncesi) return;
    setSatirlar(kurOncesi.satirlar);
    // Para birimi seçimini de eski hâline getir
    const sec = kokRef.current?.closest("form")?.querySelector<HTMLSelectElement>('select[name="paraBirimi"]');
    if (sec) sec.value = kurOncesi.pb;
    setSeciliParaBirimi(kurOncesi.pb);
    setFiyatPb(kurOncesi.pb);
    setKurOncesi(null);
    setKurMesaji("Çevirme geri alındı; fiyatlar ve para birimi eski hâline döndü.");
  };

  const sembol = useMemo(() => {
    if (seciliParaBirimi === "EUR") return "€";
    if (seciliParaBirimi === "USD") return "$";
    return "₺";
  }, [seciliParaBirimi]);

  // 📥 EXCEL'DEN KALEMLERİ OTOMATİK YÜKLEME
  const exceldenKalemYukle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const satirlarExcel: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const yeniKalemler: Satir[] = satirlarExcel
        .map((s, idx) => ({
          key: Date.now() + idx,
          bolum: String(s["Bölüm"] || s["Bolum"] || s["Kategori"] || "Genel Kalemler").trim(),
          aciklama: String(s["Açıklama"] || s["Aciklama"] || s["Ürün Adı"] || s["Urun Adi"] || "").trim(),
          adet: String(s["Miktar"] || s["Adet"] || "1"),
          birimFiyat: String(s["Birim Fiyat"] || s["Fiyat"] || "0"),
          iskontoYuzde: String(s["İskonto %"] || s["Iskonto"] || "0"),
          markaId: "",
        }))
        .filter((k) => k.aciklama);

      if (yeniKalemler.length > 0) {
        setSatirlar(bolumlereGoreDiz(yeniKalemler));
      } else {
        alert("Excel'de uygun sütun başlıkları (Açıklama, Adet, Birim Fiyat) bulunamadı.");
      }
    } catch (err) {
      alert("Excel dosyası okunamadı. Lütfen geçerli bir .xlsx dosyası seçin.");
    }
  };

  // 📄 ÖRNEK EXCEL ŞABLONUNU BİLGİSAYARA İNDİRME
  const ornekSablonIndir = async () => {
    const XLSX = await import("xlsx");
    const ornekVeri = [
      {
        "Bölüm": "VRF Sistemleri",
        "Açıklama": "Bosch VRF Dış Ünite 18HP (AF5301A 50 C-3)",
        "Miktar": 1,
        "Birim Fiyat": 5000,
        "İskonto %": 10,
      },
      {
        "Bölüm": "VRF Sistemleri",
        "Açıklama": "Bosch Kablolu Kumanda Bağlantı Kartı (AC-CCB)",
        "Miktar": 5,
        "Birim Fiyat": 150,
        "İskonto %": 0,
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(ornekVeri);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teklif Kalemleri");
    XLSX.writeFile(workbook, "Teklif_Kalemleri_Sablonu.xlsx");
  };

  const markaVar = markalar && markalar.length > 0;
  const urunVar = urunler && urunler.length > 0;

  // --- SIRALAMA & KONUM DEĞİŞTİRME MANTIKLARI ---
  const satirYukaritas = (orjinalIndex: number) => {
    if (orjinalIndex === 0) return;
    setSatirlar((prev) => {
      const clone = [...prev];
      const temp = clone[orjinalIndex];
      clone[orjinalIndex] = clone[orjinalIndex - 1];
      clone[orjinalIndex - 1] = temp;
      return bolumlereGoreDiz(clone);
    });
  };

  const satirAsagiTas = (orjinalIndex: number) => {
    if (orjinalIndex === satirlar.length - 1) return;
    setSatirlar((prev) => {
      const clone = [...prev];
      const temp = clone[orjinalIndex];
      clone[orjinalIndex] = clone[orjinalIndex + 1];
      clone[orjinalIndex + 1] = temp;
      return bolumlereGoreDiz(clone);
    });
  };

  const satirKonumDegistir = (currentIndex: number, hedefSira: number) => {
    const newIndex = hedefSira - 1;
    if (newIndex < 0 || newIndex >= satirlar.length || newIndex === currentIndex) return;
    setSatirlar((prev) => {
      const clone = [...prev];
      const [movedItem] = clone.splice(currentIndex, 1);
      clone.splice(newIndex, 0, movedItem);
      return bolumlereGoreDiz(clone);
    });
  };

  // Satır Güncelleme
  const satirGuncelle = (key: number | string, field: keyof Satir, value: string) => {
    setSatirlar((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  // Yeni Satır Ekle
  // Yeni satır kendi bölümünün sonuna eklenir (listenin en sonuna değil)
  const satirEkle = (bolumAdi: string = "Genel Kalemler") => {
    setSatirlar((prev) =>
      bolumlereGoreDiz([
        ...prev,
        {
          key: Date.now() + Math.random(),
          bolum: bolumAdi,
          aciklama: "",
          adet: "1",
          birimFiyat: "0",
          iskontoYuzde: topluIskontoOrani || "0",
          markaId: "",
        },
      ])
    );
  };

  // Satır Sil
  const satirSil = (key: number | string) => {
    setSatirlar((prev) => prev.filter((s) => s.key !== key));
  };

  // Katalogdan Ürün Seçildiğinde Fiyat ve Açıklamayı Doldur
  const urunSecildi = (key: number | string, urun: Urun) => {
    setSatirlar((prev) =>
      prev.map((s) => {
        if (s.key === key) {
          return {
            ...s,
            aciklama: urun.kod ? `${urun.ad} (${urun.kod})` : urun.ad,
            birimFiyat: String(urun.birimFiyat),
            markaId: urun.markaId ?? s.markaId,
          };
        }
        return s;
      })
    );
  };

  // TOPLU İSKONTO UYGULA
  const topluIskontoUygula = () => {
    if (!topluIskontoOrani) return;
    setSatirlar((prev) =>
      prev.map((s) => ({
        ...s,
        iskontoYuzde: topluIskontoOrani,
      }))
    );
  };

  // İSKONTOLARI SIFIRLA (%0)
  const iskontolariSifirla = () => {
    setTopluIskontoOrani("0");
    setSatirlar((prev) =>
      prev.map((s) => ({
        ...s,
        iskontoYuzde: "0",
      }))
    );
  };

  // TOPLAMI HEDEF TUTARA GÖRE AYARLA (birim fiyatlar aynı oranda değişir)
  const toplamaGoreAyarla = () => {
    const hedef = tutarOku(hedefMetin);
    if (hedef === null || hedef <= 0) {
      setDagitimMesaji({ tip: "hata", metin: "Geçerli bir toplam yazın. Örn: 7000 veya 7.000,50" });
      return;
    }
    // Açıklaması boş satırlar kaydedilmez; toplam şaşmasın diye önce uyar
    if (satirlar.some((s) => !(s.aciklama ?? "").trim() && parseSayi(s.birimFiyat) !== 0)) {
      setDagitimMesaji({ tip: "hata", metin: "Açıklaması boş ama fiyatı olan kalem var. Önce açıklamasını yazın ya da satırı silin." });
      return;
    }

    // FİYATSIZ KALEM VARSA: fiyatlı kalemler aynen kalır, kalan tutar fiyatsız
    // kalemlere adet başına eşit paylaştırılır ve müşteri belgesinde birim
    // fiyatlar gizlenir (müşteri kalemleri + genel toplamı görür).
    const doluMu = (s: Satir) => !!(s.aciklama ?? "").trim();
    const netBirim = (s: Satir) => parseSayi(s.birimFiyat) * (1 - parseSayi(s.iskontoYuzde) / 100);
    const fiyatsizlar = satirlar.filter((s) => doluMu(s) && !(netBirim(s) > 0));
    if (fiyatsizlar.length > 0) {
      const dolular = satirlar.filter(doluMu);
      const fiyatliToplam = dolular.reduce((a, s) => (netBirim(s) > 0 ? a + parseSayi(s.adet) * netBirim(s) : a), 0);
      if (hedef <= fiyatliToplam + 0.005) {
        setDagitimMesaji({
          tip: "hata",
          metin: `Yazdığınız toplam, fiyatı girilmiş kalemlerin toplamından (${formatPara(fiyatliToplam)} ${sembol}) düşük ya da eşit; fiyatsız kalemlere pay kalmıyor.`,
        });
        return;
      }
      const d = donusumKalemleri(
        {
          baslik: "",
          toplamTutar: hedef,
          kalemler: dolular.map((s) => ({
            aciklama: s.aciklama ?? "",
            adet: parseSayi(s.adet),
            birimFiyat: netBirim(s) > 0 ? netBirim(s) : 0,
          })),
        },
        0
      );
      const yeniDeger = new Map(dolular.map((s, i) => [s.key, d.kalemler[i]]));
      const yeni = satirlar.map((s) => {
        const k = yeniDeger.get(s.key);
        return k ? { ...s, adet: String(k.adet), birimFiyat: String(k.birimFiyat), iskontoYuzde: "0" } : s;
      });
      dagitimSonrasi.current = yeni;
      setDagitimOncesi(satirlar);
      setSatirlar(yeni);

      const kutu = fiyatGizleKutusu();
      let not = "";
      if (kutu) {
        gizleOncesi.current = kutu.checked;
        if (!kutu.checked) {
          kutu.checked = true;
          not = " Birim fiyatlar müşteriye gizlendi (\"kalem fiyatlarını gizle\" işaretlendi).";
        }
      }
      setDagitimMesaji({
        tip: "ok",
        metin: `Toplam ${formatPara(hedef)} ${sembol}: ${fiyatsizlar.length} fiyatsız kaleme ${formatPara(hedef - fiyatliToplam)} ${sembol} paylaştırıldı.${not} Müşteri kalemleri ve genel toplamı görür. Kaydetmeyi unutmayın.`,
      });
      return;
    }

    const sonuc = toplamaGoreDagit(
      satirlar.map((s) => ({
        adet: parseSayi(s.adet),
        birimFiyat: parseSayi(s.birimFiyat),
        iskontoYuzde: parseSayi(s.iskontoYuzde),
      })),
      hedef,
      tamSayi
    );
    if (!sonuc.ok) {
      setDagitimMesaji({ tip: "hata", metin: sonuc.hata });
      return;
    }
    const yeni = satirlar.map((s, i) => ({
      ...s,
      birimFiyat: String(sonuc.satirlar[i].birimFiyat),
      iskontoYuzde: String(sonuc.satirlar[i].iskontoYuzde),
    }));
    dagitimSonrasi.current = yeni;
    gizleOncesi.current = null;
    setDagitimOncesi(satirlar);
    setSatirlar(yeni);
    const oran = Math.abs(sonuc.oranYuzde).toLocaleString("tr-TR", { maximumFractionDigits: 2 });
    const yon = sonuc.oranYuzde < 0 ? "düşürüldü" : "artırıldı";
    const ozet = `${formatPara(sonuc.eskiToplam)} ${sembol} → ${formatPara(sonuc.yeniToplam)} ${sembol}. Birim fiyatlar yaklaşık %${oran} ${yon}.`;
    if (sonuc.kalanFark !== 0) {
      setDagitimMesaji({
        tip: "uyari",
        metin: `${ozet} Tam tutmadı, ${formatPara(Math.abs(sonuc.kalanFark))} ${sembol} fark kaldı: 1 adetlik kalem olmadığı için kuruş farkı kapatılamadı. Bir kalemin fiyatını elle düzeltebilirsiniz.`,
      });
    } else {
      setDagitimMesaji({ tip: "ok", metin: `${ozet} Kaydetmeyi unutmayın.` });
    }
  };

  const dagitimiGeriAl = () => {
    if (!dagitimOncesi) return;
    dagitimSonrasi.current = null;
    const kutu = fiyatGizleKutusu();
    if (kutu && gizleOncesi.current !== null) kutu.checked = gizleOncesi.current;
    gizleOncesi.current = null;
    setSatirlar(dagitimOncesi);
    setDagitimOncesi(null);
    setDagitimMesaji({ tip: "ok", metin: "Eski fiyatlara geri dönüldü." });
  };

  // Yeni Bölüm Ekle
  const bolumEkle = () => {
    if (!yeniBolumAdi.trim()) return;
    satirEkle(yeniBolumAdi.trim());
    setYeniBolumAdi("");
  };

  // Kalemleri Bölümlere Göre Grupla
  const gruplanmisSatirlar = useMemo(() => {
    const gruplar: { [key: string]: { item: Satir; orjinalIndex: number }[] } = {};
    satirlar.forEach((s, index) => {
      const b = s.bolum || "Genel Kalemler";
      if (!gruplar[b]) gruplar[b] = [];
      gruplar[b].push({ item: s, orjinalIndex: index });
    });
    return gruplar;
  }, [satirlar]);

  // CANLI DİP TOPLAM HESAPLAMA
  const canlıOzet = useMemo(() => {
    let brutToplam = 0;
    let netToplam = 0;

    satirlar.forEach((s) => {
      const adet = parseSayi(s.adet);
      const birimFiyat = parseSayi(s.birimFiyat);
      const iskontoYuzde = parseSayi(s.iskontoYuzde);

      const satirBrut = adet * birimFiyat;
      const satirNet = satirBrut * (1 - iskontoYuzde / 100);

      brutToplam += satirBrut;
      netToplam += satirNet;
    });

    const toplamIskontoTutari = brutToplam - netToplam;

    return {
      brutToplam,
      toplamIskontoTutari,
      netToplam,
    };
  }, [satirlar]);

  return (
    <div ref={kokRef} className="space-y-4 mb-6">
      {/* PARA BİRİMİ DEĞİŞTİ → FİYATLARI ÇEVİRME ÖNERİSİ */}
      {cevirmeBekliyor && fiyatPb && (
        <div role="alert" className="bg-amber-50 border border-amber-300 rounded-md p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-900">
            Para birimi {fiyatPb} → {seciliParaBirimi} değişti. Kalem fiyatları da çevrilsin mi?
          </p>
          <p className="text-xs text-amber-800">
            {tlKarsiligi(fiyatPb) && tlKarsiligi(seciliParaBirimi)
              ? `TCMB efektif satış kurları (${kurlar?.tarih}): ${[
                  kurlar && `1 USD = ${kurlar.USD.toLocaleString("tr-TR", { maximumFractionDigits: 4 })} TL`,
                  kurlar && `1 EUR = ${kurlar.EUR.toLocaleString("tr-TR", { maximumFractionDigits: 4 })} TL`,
                ]
                  .filter(Boolean)
                  .join(" · ")}. Oranı değiştirebilirsiniz.`
              : "TCMB kurları şu an alınamadı; çevirme oranını elle yazın."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-amber-900">
              1 {fiyatPb} =
              <input
                value={oranMetin}
                onChange={(e) => setOranMetin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    fiyatlariCevir();
                  }
                }}
                inputMode="decimal"
                aria-label="Çevirme kuru"
                className="focus-ring mx-2 w-32 border border-amber-300 rounded-md px-2 py-1 text-sm font-mono bg-white text-right"
              />
              {seciliParaBirimi}
            </label>
            <button
              type="button"
              onClick={fiyatlariCevir}
              className="focus-ring text-sm bg-soguk text-white px-4 py-1.5 rounded-md font-medium hover:bg-soguk-dim"
            >
              Fiyatları çevir
            </button>
            <button
              type="button"
              onClick={() => {
                setFiyatPb(seciliParaBirimi);
                setKurMesaji(null);
              }}
              className="focus-ring text-sm bg-white border border-amber-300 text-amber-900 px-4 py-1.5 rounded-md hover:bg-amber-100"
            >
              Hayır, sadece para birimini değiştir
            </button>
          </div>
        </div>
      )}
      {kurMesaji && !cevirmeBekliyor && (
        <div role="status" className="flex flex-wrap items-center gap-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md px-3 py-2">
          <span className="flex-1">{kurMesaji}</span>
          {kurOncesi && (
            <button type="button" onClick={kurCevirmesiniGeriAl} className="focus-ring underline font-medium">
              ↶ Geri al
            </button>
          )}
        </div>
      )}

      {/* 📥 EXCEL'DEN KALEM İTHAL ETME PANELI */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-md p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="text-xs text-emerald-900">
          <p className="font-bold">📊 Excel Çalışmanızı Doğrudan Teklife Aktarın:</p>
          <p className="text-[11px] text-emerald-800">Fiyat çalışmanızı hazırladığınız Excel dosyasını seçerek kalemleri ekrana otomatik dizebilirsiniz.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={ornekSablonIndir}
            className="text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded hover:bg-emerald-100"
          >
            📄 Örnek Excel Şablonu İndir
          </button>

          <label className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded cursor-pointer transition-colors">
            📥 Excel'den Kalemleri Yükle
            <input type="file" accept=".xlsx,.xls" onChange={exceldenKalemYukle} className="hidden" />
          </label>
        </div>
      </div>

      {/* ÜST PANEL: BÖLÜM EKLEME VE TOPLU İSKONTO */}
      <div className="bg-soguk-light rounded-md p-3 flex flex-wrap items-center justify-between gap-4 border border-hat">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={yeniBolumAdi}
            onChange={(e) => setYeniBolumAdi(e.target.value)}
            placeholder="Örn: VRF, DX veya Split"
            className="focus-ring border border-hat rounded-md px-3 py-1.5 text-sm bg-white w-52"
          />
          <button
            type="button"
            onClick={bolumEkle}
            className="focus-ring text-sm bg-soguk text-white px-3 py-1.5 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            + Bölüm Ekle
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-soguk-dim">
            Tüm Satırlara İskonto (%):
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={topluIskontoOrani}
            onChange={(e) => setTopluIskontoOrani(e.target.value)}
            placeholder="5"
            className="focus-ring w-16 border border-hat rounded-md px-2 py-1 text-sm bg-white text-center font-semibold text-amber-800"
          />
          <button
            type="button"
            onClick={topluIskontoUygula}
            className="focus-ring text-xs bg-soguk text-white px-3 py-1.5 rounded-md font-medium hover:bg-soguk-dim"
          >
            Uygula
          </button>
          <button
            type="button"
            onClick={iskontolariSifirla}
            className="focus-ring text-xs bg-sicak-dim/10 text-sicak-dim hover:bg-sicak-dim hover:text-white border border-sicak-dim/30 px-3 py-1.5 rounded-md font-medium transition-colors"
          >
            İskontoları Sıfırla (%0)
          </button>
        </div>
      </div>

      {/* BÖLÜMLERE GÖRE GRUPLANMIŞ SATIRLAR */}
      {Object.entries(gruplanmisSatirlar).map(([bolumAdi, satirlarGrubu]) => (
        <div key={bolumAdi} className="border border-hat rounded-md p-3 bg-yuzey space-y-3">
          <div className="flex justify-between items-center border-b border-hat pb-2">
            <span className="font-semibold text-xs text-soguk-dim uppercase tracking-wider flex items-center gap-1.5">
              <span>📌</span> Bölüm: <strong className="text-metin">{bolumAdi}</strong>
              <span className="normal-case tracking-normal font-mono text-metin/70 ml-2">
                Bölüm toplamı:{" "}
                {formatPara(
                  satirlarGrubu.reduce(
                    (a, { item: s }) => a + parseSayi(s.adet) * parseSayi(s.birimFiyat) * (1 - parseSayi(s.iskontoYuzde) / 100),
                    0
                  )
                )}{" "}
                {sembol}
              </span>
            </span>
            <button
              type="button"
              onClick={() => satirEkle(bolumAdi)}
              className="text-xs text-soguk-dim font-medium hover:underline"
            >
              + Bu Bölüme Kalem Ekle
            </button>
          </div>

          <div className="hidden sm:grid grid-cols-[65px_1fr_75px_110px_75px_110px_100px_28px] gap-2 text-xs text-metin/50 px-1 font-medium">
            <span className="text-center">Sıra / Taşı</span>
            <span>Açıklama</span>
            <span>Adet</span>
            <span>Birim Fiyat ({sembol})</span>
            <span>İskonto %</span>
            {markaVar ? <span>Marka</span> : <span></span>}
            <span className="text-right">Satır Toplamı</span>
            <span></span>
          </div>

          {satirlarGrubu.map(({ item: satir, orjinalIndex }) => {
            const adetSayi = parseSayi(satir.adet);
            const fiyatSayi = parseSayi(satir.birimFiyat);
            const iskontoSayi = parseSayi(satir.iskontoYuzde);
            const satirNetTutar = adetSayi * fiyatSayi * (1 - iskontoSayi / 100);

            return (
              <div key={satir.key} className="border border-hat rounded-md p-3 sm:border-0 sm:p-0 space-y-2 sm:space-y-0">
                <input type="hidden" name="kalemBolum" value={satir.bolum} />
                <input type="hidden" name="kalemId" value={satir.id ?? ""} />

                {urunVar && (
                  <div className="mb-1">
                    <UrunArama
                      urunler={urunler!}
                      onSec={(urun) => urunSecildi(satir.key, urun)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-[65px_1fr_75px_110px_75px_110px_100px_28px] gap-2 items-center">
                  <div className="flex items-center gap-1 justify-center bg-slate-50 border border-hat rounded p-1">
                    <input
                      type="number"
                      min={1}
                      max={satirlar.length}
                      value={orjinalIndex + 1}
                      onChange={(e) => {
                        const hedef = parseInt(e.target.value, 10);
                        if (!isNaN(hedef)) {
                          satirKonumDegistir(orjinalIndex, hedef);
                        }
                      }}
                      className="w-8 text-center font-bold text-xs bg-white border border-hat rounded py-0.5 text-metin focus:bg-amber-50"
                    />
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => satirYukaritas(orjinalIndex)}
                        disabled={orjinalIndex === 0}
                        className="text-[9px] leading-none px-1 py-0.5 hover:bg-slate-200 rounded disabled:opacity-20 text-slate-700 font-bold"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => satirAsagiTas(orjinalIndex)}
                        disabled={orjinalIndex === satirlar.length - 1}
                        className="text-[9px] leading-none px-1 py-0.5 hover:bg-slate-200 rounded disabled:opacity-20 text-slate-700 font-bold"
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  <input
                    name="kalemAciklama"
                    value={satir.aciklama}
                    onChange={(e) => satirGuncelle(satir.key, "aciklama", e.target.value)}
                    placeholder="Kalem açıklaması"
                    className="focus-ring col-span-2 sm:col-span-1 border border-hat rounded-md px-2.5 py-1.5 text-sm"
                  />

                  <input
                    name="kalemAdet"
                    type="text"
                    inputMode="decimal"
                    value={satir.adet}
                    onChange={(e) => satirGuncelle(satir.key, "adet", e.target.value)}
                    placeholder="Adet"
                    className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-center"
                  />

                  <input
                    name="kalemFiyat"
                    type="text"
                    inputMode="decimal"
                    value={satir.birimFiyat}
                    onChange={(e) => satirGuncelle(satir.key, "birimFiyat", e.target.value)}
                    placeholder="0,00"
                    className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-right font-mono"
                  />

                  <input
                    name="kalemIskonto"
                    type="text"
                    inputMode="decimal"
                    value={satir.iskontoYuzde}
                    onChange={(e) => satirGuncelle(satir.key, "iskontoYuzde", e.target.value)}
                    placeholder="0"
                    className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-center font-semibold text-amber-800"
                  />

                  {markaVar ? (
                    <select
                      name="kalemMarka"
                      value={satir.markaId ?? ""}
                      onChange={(e) => satirGuncelle(satir.key, "markaId", e.target.value)}
                      className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm bg-white"
                    >
                      <option value="">— Marka yok —</option>
                      {markalar!.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.ad}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div />
                  )}

                  <div className="text-right font-mono text-xs font-semibold text-metin pr-1">
                    {formatPara(satirNetTutar)} {sembol}
                  </div>

                  <button
                    type="button"
                    onClick={() => satirSil(satir.key)}
                    className="focus-ring text-metin/40 hover:text-sicak-dim text-sm text-center"
                    aria-label="Satırı kaldır"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* CANLI DİP TOPLAM PANELİ */}
      <div className="bg-soguk-light/40 border border-hat rounded-md p-4 flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="text-xs text-soguk-dim">
          <p className="font-semibold text-sm text-metin mb-0.5">Teklif Canlı Özeti</p>
          <p>Kaydetmeden önce anlık hesaplanır. İskonto sonrasındaki net tutarı buradan takip edebilirsiniz.</p>
        </div>

        <div className="text-right space-y-1">
          <div className="text-xs text-metin/60">
            Liste Fiyatı Toplamı: <span className="font-mono">{formatPara(canlıOzet.brutToplam)} {sembol}</span>
          </div>
          {canlıOzet.toplamIskontoTutari > 0 && (
            <div className="text-xs text-amber-700 font-medium">
              Uygulanan İskonto: -<span className="font-mono">{formatPara(canlıOzet.toplamIskontoTutari)} {sembol}</span>
            </div>
          )}
          <div className="text-base font-bold text-soguk-dim">
            KDV Hariç Net Toplam: <span className="font-mono text-lg text-metin">{formatPara(canlıOzet.netToplam)} {sembol}</span>
          </div>
        </div>

        {/* PAZARLIK: TOPLAMI YAZ, BİRİM FİYATLAR OTOMATİK AYARLANSIN */}
        <div className="w-full border-t border-hat pt-3 mt-1">
          <p className="text-sm font-semibold text-metin mb-0.5">🤝 Anlaşılan toplamı yazın, birim fiyatlar otomatik ayarlansın</p>
          <p className="text-[11px] text-metin/60 mb-2">
            Örn: teklif 7.130 {sembol}, masada 7.000 {sembol} anlaşıldı → 7000 yazıp &quot;Toplamı Ayarla&quot;ya basın. Tüm birim fiyatlar aynı
            oranda değişir, kuruş farkı tek kalemde kapatılır; teklifteki toplam tam olarak yazdığınız tutar olur. İskontolar birim
            fiyata katılır (müşteri belgesinde zaten net fiyat görünür).
          </p>
          <p className="text-[11px] text-metin/60 mb-2">
            <b>Birim fiyatınız yoksa:</b> kalemleri fiyatsız (0) girin, toplamı yazıp basın. Toplam fiyatsız kalemlere paylaştırılır ve
            müşteri belgesinde birim fiyatlar gizlenir; müşteri kalemleri ve genel toplamı görür.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={hedefMetin}
                onChange={(e) => setHedefMetin(e.target.value)}
                onKeyDown={(e) => {
                  // Enter formu göndermesin, sadece ayarlama yapsın
                  if (e.key === "Enter") {
                    e.preventDefault();
                    toplamaGoreAyarla();
                  }
                }}
                placeholder={formatPara(Math.round(canlıOzet.netToplam))}
                aria-label="Anlaşılan toplam"
                className="focus-ring w-40 border border-hat rounded-md pl-3 pr-7 py-1.5 text-sm bg-white text-right font-mono font-semibold"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-metin/50">{sembol}</span>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-metin/70 cursor-pointer select-none">
              <input type="checkbox" checked={tamSayi} onChange={(e) => setTamSayi(e.target.checked)} />
              Birim fiyatları kuruşsuz yap
            </label>
            <button
              type="button"
              onClick={toplamaGoreAyarla}
              className="focus-ring text-sm bg-soguk text-white px-4 py-1.5 rounded-md font-medium hover:bg-soguk-dim transition-colors"
            >
              Toplamı Ayarla
            </button>
            {dagitimOncesi && (
              <button
                type="button"
                onClick={dagitimiGeriAl}
                className="focus-ring text-xs bg-white border border-hat text-metin/80 px-3 py-1.5 rounded-md hover:bg-slate-50"
              >
                ↶ Geri Al
              </button>
            )}
          </div>
          {dagitimMesaji && (
            <p
              role="status"
              className={`mt-2 text-xs rounded-md px-3 py-2 border ${
                dagitimMesaji.tip === "ok"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : dagitimMesaji.tip === "uyari"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {dagitimMesaji.metin}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => satirEkle("Genel Kalemler")}
        className="focus-ring text-sm text-soguk-dim font-medium hover:underline block pt-1"
      >
        + Genel Kalem ekle
      </button>
    </div>
  );
}