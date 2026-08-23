import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import YazdirButon from "@/components/YazdirButon";
import TeklifDurumSecici from "@/components/TeklifDurumSecici";
import { getSirketAyarlari } from "@/lib/sirket"; // ŞİRKET AYARLARI EKLENDİ

export const dynamic = "force-dynamic";

function paraFormat(n: number, paraBirimi: string) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

// Kurumsal ERP Teklif Kodlama Formatı: IKL-2026-00019
function kurumsalTeklifKodu(teklifNo: number, tarih: Date) {
  const yil = new Date(tarih).getFullYear();
  const siraNo = String(teklifNo).padStart(5, "0");
  return `IKL-${yil}-${siraNo}`;
}

export default async function TeklifDetay({ params }: { params: { id: string } }) {
  // TEKLİF VE ŞİRKET BİLGİLERİ DİNAMİK ÇEKİLİYOR
  const [teklif, sirket] = await Promise.all([
    prisma.teklif.findUnique({
      where: { id: params.id },
      include: {
        musteri: true,
        proje: true,
        olusturanKullanici: true,
        kalemler: { include: { marka: true } },
        sablonlar: { orderBy: { sira: "asc" } },
        revizyonlar: { orderBy: { revizyonNo: "desc" } },
        siparis: true,
      },
    }),
    getSirketAyarlari(), // <-- PANELDEN GİRDİĞİN ŞİRKET ADRESİ VE BİLGİLERİNİ ÇEKER
  ]);

  if (!teklif) notFound();

  const pb = teklif.paraBirimi;
  const girilenToplam = teklif.kalemler.reduce(
    (a, k) => a + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100),
    0
  );

  let araToplam: number;
  let kdvTutari: number;
  let genelToplam: number;

  if (teklif.kdvDahil) {
    genelToplam = girilenToplam;
    araToplam = girilenToplam / (1 + teklif.kdvOrani / 100);
    kdvTutari = genelToplam - araToplam;
  } else {
    araToplam = girilenToplam;
    kdvTutari = araToplam * (teklif.kdvOrani / 100);
    genelToplam = araToplam + kdvTutari;
  }

  const gecerlilikTarihi = new Date(teklif.tarih);
  gecerlilikTarihi.setDate(gecerlilikTarihi.getDate() + teklif.gecerlilikGunu);

  // Kalemleri Bölümlerine Göre Grupla (VRF, DX, Split vb.)
  const gruplanmisKalemler = teklif.kalemler.reduce((acc, k) => {
    const b = (k as any).bolum || "Genel Kalemler";
    if (!acc[b]) acc[b] = [];
    acc[b].push(k);
    return acc;
  }, {} as Record<string, typeof teklif.kalemler>);

  // Hazırlayan Kullanıcı Bilgileri
  const hazirlayanAd = teklif.olusturanKullanici?.ad || teklif.olusturanAdi || "Firma Yetkilisi";
  const hazirlayanEmail = teklif.olusturanKullanici?.email || sirket.email || "info@iklimofisi.com";
  const hazirlayanTelefon = teklif.olusturanKullanici?.telefon || sirket.telefon || "+90 (216) 450 00 00";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/panel/teklifler" className="focus-ring text-sm text-metin/60 hover:text-metin">
          ← Tekliflere dön
        </Link>
        <div className="flex items-center gap-3">
          <TeklifDurumSecici teklifId={teklif.id} mevcutDurum={teklif.durum} />
          <Link
            href={`/panel/teklifler/${teklif.id}/duzenle`}
            className="focus-ring text-sm font-medium text-metin/70 border border-hat px-4 py-2 rounded-md hover:border-soguk hover:text-soguk-dim transition-colors"
          >
            Düzenle
          </Link>
          <YazdirButon />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 print:hidden">
        <p className="text-xs text-metin/50">
          Rev. {teklif.revizyonNo} · Hazırlayan: {hazirlayanAd}
        </p>
        {teklif.durum === "ONAYLANDI" && !teklif.siparis && (
          <Link
            href={`/panel/teklifler/${teklif.id}/siparis-talebi`}
            className="focus-ring text-sm bg-metin text-zemin px-4 py-2 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            Siparişe Dönüştür
          </Link>
        )}
        {teklif.siparis && (
          <Link
            href={`/panel/siparisler/${teklif.siparis.id}`}
            className="focus-ring text-sm text-soguk-dim font-medium hover:underline"
          >
            {teklif.siparis.durum === "ONAY_BEKLIYOR" ? "Sipariş talebini görüntüle (onay bekliyor)" : "Siparişi görüntüle"} →
          </Link>
        )}
      </div>

      <div className="bg-yuzey border border-hat rounded-lg p-8 sm:p-12 print:border-0 print:p-0">
        {/* ŞİRKET BİLGİLERİ VE ADRESİ (PANELDEN GİRDİĞİN AYARLARDAN DİNAMİK GELİR) */}
        <div className="flex items-start justify-between mb-10 pb-6 border-b border-hat">
          <div className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt={sirket.unvan} width={48} height={48} />
            <div>
              <p className="font-display font-bold text-lg text-metin">{sirket.unvan}</p>
              {sirket.slogan && <p className="text-xs text-metin/60 font-medium">{sirket.slogan}</p>}
              {sirket.adres && <p className="text-xs text-metin/50 mt-1">{sirket.adres}</p>}
              <p className="text-xs text-metin/50">
                {sirket.email} {sirket.telefon && `· ${sirket.telefon}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-metin">TEKLİF</p>
            <p className="text-sm font-mono font-bold text-soguk-dim mt-1">
              {kurumsalTeklifKodu(teklif.teklifNo, teklif.tarih)}
            </p>
          </div>
        </div>

        {teklif.baslik && (
          <p className="font-display text-xl font-semibold text-metin mb-1">{teklif.baslik}</p>
        )}
        {teklif.proje && (
          <p className="text-xs text-metin/50 mb-8">
            Proje:{" "}
            <Link href={`/panel/projeler/${teklif.proje.id}`} className="text-soguk-dim hover:underline print:no-underline print:text-metin">
              {teklif.proje.ad}
            </Link>
            {teklif.proje.konum && ` · ${teklif.proje.konum}`}
          </p>
        )}
        {!teklif.proje && <div className="mb-8" />}

        {/* MÜŞTERİ VE YETKİLİ BİLGİLERİ */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-metin/50 uppercase tracking-wider font-semibold">Müşteri / Firma</p>
            <p className="font-bold text-metin text-base">{teklif.musteri.ad}</p>
            
            {teklif.musteri.yetkiliAdi && (
              <p className="text-xs font-semibold text-soguk-dim pt-1">
                👤 Yetkili: {teklif.musteri.yetkiliAdi}
                {teklif.musteri.yetkiliTelefon && ` (${teklif.musteri.yetkiliTelefon})`}
              </p>
            )}
            
            {teklif.musteri.telefon && <p className="text-metin/60 text-xs">Santral: {teklif.musteri.telefon}</p>}
            {teklif.musteri.vergiNo && <p className="text-metin/60 text-xs">VN: {teklif.musteri.vergiNo}</p>}
            {teklif.musteri.faturaAdresi && <p className="text-metin/60 text-xs">{teklif.musteri.faturaAdresi}</p>}
          </div>
          
          <div className="sm:text-right space-y-1">
            <p className="text-xs text-metin/50 uppercase tracking-wider font-semibold">Teklif Tarihi</p>
            <p className="text-metin font-mono">{teklif.tarih.toISOString().slice(0, 10)}</p>
            <p className="text-xs text-metin/50 uppercase tracking-wider font-semibold pt-2">Geçerlilik Tarihi</p>
            <p className="text-metin font-mono">{gecerlilikTarihi.toISOString().slice(0, 10)}</p>
          </div>
        </div>

        {/* KALEMLER TABLOSU */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="py-2 font-medium">Açıklama</th>
              <th className="py-2 font-medium text-right">Adet</th>
              {teklif.birimFiyatGoster && (
                <>
                  <th className="py-2 font-medium text-right">Birim Fiyat</th>
                  <th className="py-2 font-medium text-right">Tutar</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.entries(gruplanmisKalemler).map(([bolumAdi, kalemler]) => (
              <React.Fragment key={bolumAdi}>
                <tr className="bg-soguk-light/30 border-b border-hat font-semibold text-xs text-soguk-dim">
                  <td colSpan={teklif.birimFiyatGoster ? 4 : 2} className="py-2 px-1">
                    📂 {bolumAdi}
                  </td>
                </tr>

                {kalemler.map((k) => {
                  const netBirimFiyat = k.birimFiyat * (1 - k.iskontoYuzde / 100);
                  const satirTutar = k.adet * netBirimFiyat;

                  return (
                    <tr key={k.id} className="border-b border-hat last:border-0">
                      <td className="py-3 text-metin">
                        <div className="flex items-center gap-2 pl-2">
                          {k.marka?.logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/marka/${k.marka.id}/logo`}
                              alt={k.marka.ad}
                              className="h-6 w-auto max-w-[60px] object-contain shrink-0"
                            />
                          )}
                          <span>{k.aciklama}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-metin/70">{k.adet}</td>
                      
                      {teklif.birimFiyatGoster && (
                        <>
                          <td className="py-3 text-right font-mono text-metin/70">
                            {paraFormat(netBirimFiyat, pb)}
                          </td>
                          <td className="py-3 text-right font-mono text-metin">
                            {paraFormat(satirTutar, pb)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* DİP TOPLAM */}
        <div className="flex justify-end mb-12">
          <div className="w-full sm:w-64 space-y-2 text-sm">
            <div className="flex justify-between text-metin/60">
              <span>Ara Toplam</span>
              <span className="font-mono">{paraFormat(araToplam, pb)}</span>
            </div>
            <div className="flex justify-between text-metin/60">
              <span>KDV (%{teklif.kdvOrani})</span>
              <span className="font-mono">{paraFormat(kdvTutari, pb)}</span>
            </div>
            <div className="flex justify-between text-metin font-semibold text-lg border-t border-hat pt-2">
              <span>Genel Toplam</span>
              <span className="font-mono">{paraFormat(genelToplam, pb)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-metin/60 mb-10">
          Fiyatlara {teklif.kdvDahil ? "KDV dahildir." : "KDV dahil değildir."} Bu teklif,
          geçerlilik tarihine kadar geçerlidir.
        </p>

        {teklif.sablonlar.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 mb-12 text-sm">
            {teklif.sablonlar.map((s) => (
              <div key={s.id}>
                <p className="font-medium text-metin mb-2">{s.baslik}</p>
                <p className="text-metin/60 leading-relaxed whitespace-pre-line">{s.icerik}</p>
              </div>
            ))}
          </div>
        )}

        {/* İMZA / KAŞE ALANI VE TEKLİFİ HAZIRLAYAN & MÜŞTERİ ONAYI */}
        <div className="grid sm:grid-cols-2 gap-10 pt-10 border-t border-hat text-sm">
          {/* TEKLİFİ HAZIRLAYAN */}
          <div>
            <p className="text-xs font-semibold text-metin/50 uppercase tracking-wider mb-2">
              Teklifi Hazırlayan / Firma Yetkilisi
            </p>
            <p className="font-bold text-metin text-base">{hazirlayanAd}</p>
            <p className="text-xs text-metin/70">{hazirlayanEmail}</p>
            <p className="text-xs text-metin/70">{hazirlayanTelefon}</p>
            <div className="border-t border-hat mt-10 pt-2 text-metin/40 text-xs">İmza / Kaşe</div>
          </div>
          
          {/* MÜŞTERİ ONAYI */}
          <div>
            <p className="text-xs font-semibold text-metin/50 uppercase tracking-wider mb-2">
              Müşteri Onayı
            </p>
            <p className="font-bold text-metin text-base">{teklif.musteri.ad}</p>
            {teklif.musteri.yetkiliAdi && (
              <p className="text-xs text-metin/70 mt-0.5">Yetkili: {teklif.musteri.yetkiliAdi}</p>
            )}
            <div className="border-t border-hat mt-10 pt-2 text-metin/40 text-xs">İmza / Kaşe</div>
          </div>
        </div>
      </div>
    </div>
  );
}