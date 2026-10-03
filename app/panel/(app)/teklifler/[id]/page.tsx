import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import YazdirButon from "@/components/YazdirButon";
import TeklifDurumSecici from "@/components/TeklifDurumSecici";
import { getSirketAyarlari } from "@/lib/sirket";
import TeklifEpostaGonderModal from "@/components/TeklifEpostaGonderModal"; // MODAL İMPORT EDİLDİ
import { musteriToplami, ilkHazirlanmaTarihi, musteriTeklifTarihi, kosulCumlesi, tarihYaz, bolumToplamlari } from "@/lib/teklif-hesap";
import { sablonlariGrupla } from "@/lib/sablon";
import { ISTIRAK_METNI } from "@/lib/kurumsal";

export const dynamic = "force-dynamic";

// Teklif belgesinde tutarlar "10.250,00 €" biçiminde yazılır (PDF ile aynı)
function paraFormat(n: number, paraBirimi: string) {
  const sembol = paraBirimi === "EUR" ? "€" : paraBirimi === "USD" ? "$" : paraBirimi === "TRY" ? "TL" : paraBirimi;
  return `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sembol}`;
}

// Teklif belgesindeki tarihler: 20.08.2026 (Türkiye saati, PDF ile aynı)
const belgeTarihi = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(
    new Date(d)
  );

// Kurumsal ERP Teklif Kodlama Formatı: IKL-2026-00019
function kurumsalTeklifKodu(teklifNo: number, tarih: Date) {
  const yil = new Date(tarih).getFullYear();
  const siraNo = String(teklifNo).padStart(5, "0");
  return `IKL-${yil}-${siraNo}`;
}

export default async function TeklifDetay({ params }: { params: { id: string } }) {
  const [teklif, sirket, sozlesme, kopyalar] = await Promise.all([
    prisma.teklif.findUnique({
      where: { id: params.id },
      include: {
        musteri: true,
        proje: true,
        yetkili: true,
        olusturanKullanici: true,
        kalemler: { include: { marka: true }, orderBy: [{ sira: "asc" }, { id: "asc" }] },
        sablonlar: { orderBy: { sira: "asc" } },
        revizyonlar: { orderBy: { revizyonNo: "desc" } },
        siparis: true,
      },
    }),
    getSirketAyarlari(),
    // Sözleşme taslağı (ayrı sorgu: tablo henüz yoksa teklif sayfası yine açılır)
    prisma.sozlesme.findUnique({ where: { teklifId: params.id }, select: { id: true } }).catch(() => null),
    // Bu tekliften kopyalanarak oluşturulan teklifler (yalnızca panelde gösterilir)
    prisma.teklif.findMany({
      where: { kopyaKaynakTeklifId: params.id },
      select: { id: true, teklifNo: true, baslik: true, musteri: { select: { ad: true } } },
      orderBy: { teklifNo: "asc" },
    }),
  ]);

  if (!teklif) notFound();

  const pb = teklif.paraBirimi;
  // Müşteriye tek satır toplam gösterilir: "10.250,00 € + KDV" (KDV dahil tekliflerde "(KDV dahil)")
  const toplam = musteriToplami(teklif);
  // Birden fazla bölüm varsa her bölümün altında "… Toplamı" satırı ve genel
  // toplamın üstünde bölüm özeti gösterilir (birim fiyatlar gizliyse gösterilmez)
  const bolumler = bolumToplamlari(teklif.kalemler);
  const bolumToplamiGoster = teklif.birimFiyatGoster && bolumler.length > 1;
  const bolumTutari = new Map(bolumler.map((b) => [b.bolum, b.tutar]));
  const ilkTarih = ilkHazirlanmaTarihi(teklif);

  // Teklifin muhatabı: seçilen yetkili, yoksa müşterinin ana yetkilisi
  const yetkiliAd = teklif.yetkili?.ad || teklif.musteri.yetkiliAdi;
  const yetkiliTelefon = teklif.yetkili ? teklif.yetkili.telefon : teklif.musteri.yetkiliTelefon;

  // Müşteriye giden tarih: revize varsa son revizyon tarihi, yoksa ilk hazırlanma tarihi
  const belgeTarih = musteriTeklifTarihi(teklif);

  // Kalemleri Bölümlerine Göre Grupla
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
      {/* ÜST BUTONLAR VE MAİL GÖNDERME MODALI BURAYA YERLEŞTİRİLDİ */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/panel/teklifler" className="focus-ring text-sm text-metin/60 hover:text-metin">
          ← Tekliflere dön
        </Link>
        <div className="flex items-center gap-3">
          <TeklifDurumSecici teklifId={teklif.id} mevcutDurum={teklif.durum} />
          
          {/* ✉️ MÜŞTERİYE E-POSTA İLE TEKLİF GÖNDERME BUTONU */}
          <TeklifEpostaGonderModal
            teklifId={teklif.id}
            aliciEmail={teklif.yetkili?.email || teklif.musteri.yetkiliEmail || teklif.musteri.email || ""}
            hitapAd={teklif.yetkili?.ad || teklif.musteri.yetkiliAdi || teklif.musteri.ad}
            teklifNo={teklif.teklifNo}
            hazirlayanAd={hazirlayanAd}
            hazirlayanEmail={hazirlayanEmail}
          />

          <Link
            href={`/panel/teklifler/${teklif.id}/duzenle`}
            className="focus-ring text-sm font-medium text-metin/70 border border-hat px-4 py-2 rounded-md hover:border-soguk hover:text-soguk-dim transition-colors"
          >
            Düzenle
          </Link>
          <Link
            href={`/panel/teklifler/${teklif.id}/kopyala`}
            className="focus-ring text-sm font-medium text-metin/70 border border-hat px-4 py-2 rounded-md hover:border-soguk hover:text-soguk-dim transition-colors"
          >
            Kopyala
          </Link>
          <YazdirButon />
        </div>
      </div>

      {kopyalar.length > 0 && (
        <div className="mb-3 text-xs text-metin/60 bg-soguk-light/40 border border-hat rounded-md px-3 py-2 print:hidden">
          <span className="font-semibold text-metin/70">Bu tekliften kopyalananlar:</span>{" "}
          {kopyalar.map((k, i) => (
            <span key={k.id}>
              {i > 0 && " · "}
              <Link href={`/panel/teklifler/${k.id}`} className="text-soguk-dim hover:underline">
                TKL-{String(k.teklifNo).padStart(4, "0")} {k.baslik} ({k.musteri.ad})
              </Link>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
        <p className="text-xs text-metin/50">
          Rev. {teklif.revizyonNo} · Hazırlayan: {hazirlayanAd} · İlk hazırlanma: {tarihYaz(ilkTarih)}
          {teklif.revizyonNo > 1 && ` · Son revizyon: ${tarihYaz(teklif.tarih)}`}
          {/* Kopya notu yalnızca panelde görünür (yazdırmada gizli, PDF/e-postada yok) */}
          {teklif.kopyaKaynakTeklifNo && (
            <>
              {" · "}
              {teklif.kopyaKaynakTeklifId ? (
                <Link href={`/panel/teklifler/${teklif.kopyaKaynakTeklifId}`} className="text-soguk-dim hover:underline">
                  TKL-{String(teklif.kopyaKaynakTeklifNo).padStart(4, "0")} teklifinin kopyası
                </Link>
              ) : (
                <>TKL-{String(teklif.kopyaKaynakTeklifNo).padStart(4, "0")} teklifinin kopyası</>
              )}
            </>
          )}
        </p>
        <div className="flex items-center gap-3 ml-auto">
        {(teklif.durum === "ONAYLANDI" || sozlesme) && (
          <Link
            href={`/panel/teklifler/${teklif.id}/sozlesme`}
            className="focus-ring text-sm bg-soguk text-white px-4 py-2 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            📄 {sozlesme ? "Sözleşme Taslağı" : "Sözleşme Taslağı Hazırla"}
          </Link>
        )}
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
      </div>

      <div className="bg-yuzey border border-hat rounded-lg p-8 sm:p-12 print:border-0 print:p-0">
        {/* ŞİRKET BİLGİLERİ VE ADRESİ */}
        <div className="flex items-start justify-between mb-10 pb-6 border-b border-hat">
          <div className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt={sirket.unvan} width={48} height={48} />
            <div>
              <p className="font-display font-bold text-lg text-metin">{sirket.unvan}</p>
              <p className="text-[11px] text-metin/60 font-medium">{ISTIRAK_METNI}</p>
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
              {kurumsalTeklifKodu(teklif.teklifNo, ilkTarih)}
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

        {/* MÜŞTERİ BİLGİLERİ */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-metin/50 uppercase tracking-wider font-semibold">Müşteri / Firma</p>
            <p className="font-bold text-metin text-base">{teklif.musteri.ad}</p>
            
            {yetkiliAd && (
              <p className="text-xs font-semibold text-soguk-dim pt-1">
                👤 Yetkili: {yetkiliAd}
                {teklif.yetkili?.unvan && ` · ${teklif.yetkili.unvan}`}
                {yetkiliTelefon && ` (${yetkiliTelefon})`}
              </p>
            )}
            
            {teklif.musteri.telefon && <p className="text-metin/60 text-xs">Santral: {teklif.musteri.telefon}</p>}
            {teklif.musteri.vergiNo && <p className="text-metin/60 text-xs">VN: {teklif.musteri.vergiNo}</p>}
            {teklif.musteri.faturaAdresi && <p className="text-metin/60 text-xs">{teklif.musteri.faturaAdresi}</p>}
          </div>
          
          <div className="sm:text-right space-y-1">
            {/* Revize edilmişse son revizyon tarihi, edilmemişse ilk hazırlanma tarihi.
                Revizyon numarası müşteriye yazılmaz (yalnızca üst şeritte, yazdırılmaz). */}
            <p className="text-xs text-metin/50 uppercase tracking-wider font-semibold">Teklif Tarihi</p>
            <p className="text-metin font-mono">{belgeTarihi(belgeTarih)}</p>
          </div>
        </div>

        {/* KALEMLER TABLOSU
            Sabit sütun genişlikleri: tutarlar tek satırda kalır, sağa hizalı ve
            alt alta düzgün okunur. Rakamlar açıklamanın ilk satırıyla aynı hizada. */}
        <table className="w-full table-fixed text-sm mb-8 tabular-nums">
          <colgroup>
            <col />
            <col className="w-14" />
            {teklif.birimFiyatGoster && (
              <>
                <col className="w-32" />
                <col className="w-32" />
              </>
            )}
          </colgroup>
          <thead>
            <tr className="text-xs text-metin/50 border-b-2 border-metin/20">
              <th className="py-2 pr-4 font-medium text-left">Açıklama</th>
              <th className="py-2 font-medium text-right whitespace-nowrap">Adet</th>
              {teklif.birimFiyatGoster && (
                <>
                  <th className="py-2 font-medium text-right whitespace-nowrap">Birim Fiyat</th>
                  <th className="py-2 font-medium text-right whitespace-nowrap">Tutar</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.entries(gruplanmisKalemler).map(([bolumAdi, kalemler]) => (
              <React.Fragment key={bolumAdi}>
                <tr className="break-inside-avoid">
                  <td
                    colSpan={teklif.birimFiyatGoster ? 4 : 2}
                    className="pt-5 pb-1.5 text-xs font-bold uppercase tracking-wider text-soguk-dim border-b border-soguk/40"
                  >
                    {bolumAdi}
                  </td>
                </tr>

                {kalemler.map((k) => {
                  const netBirimFiyat = k.birimFiyat * (1 - k.iskontoYuzde / 100);
                  const satirTutar = k.adet * netBirimFiyat;

                  return (
                    <tr key={k.id} className="border-b border-hat align-top break-inside-avoid">
                      <td className="py-2 pr-4 text-metin leading-snug">
                        <div className="flex items-start gap-2">
                          {k.marka?.logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/marka/${k.marka.id}/logo`}
                              alt={k.marka.ad}
                              className="h-5 w-auto max-w-[56px] object-contain shrink-0 mt-px"
                            />
                          )}
                          <span className="break-words min-w-0">{k.aciklama}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-metin/70 whitespace-nowrap">{k.adet}</td>
                      {teklif.birimFiyatGoster && (
                        <>
                          <td className="py-2 text-right text-metin/70 whitespace-nowrap">{paraFormat(netBirimFiyat, pb)}</td>
                          <td className="py-2 text-right text-metin whitespace-nowrap">{paraFormat(satirTutar, pb)}</td>
                        </>
                      )}
                    </tr>
                  );
                })}

                {/* Bölüm toplamı: yalnızca birden fazla kalemli bölümlerde
                    (tek kalemde satır tutarıyla aynı olacağı için tekrar yazılmaz) */}
                {bolumToplamiGoster && kalemler.length > 1 && (
                  <tr className="break-inside-avoid">
                    <td colSpan={3} className="pt-1.5 pb-1 pr-4 text-right text-xs text-metin/60">
                      {bolumAdi} toplamı
                    </td>
                    <td className="pt-1.5 pb-1 text-right font-semibold text-metin whitespace-nowrap">
                      {paraFormat(bolumTutari.get(bolumAdi) ?? 0, pb)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* DİP TOPLAM */}
        <div className="flex justify-end mb-12">
          <div className="w-full sm:w-auto sm:min-w-[18rem] text-sm">
            {bolumToplamiGoster && (
              <div className="mb-2 space-y-1">
                {bolumler.map((b) => (
                  <div key={b.bolum} className="flex justify-between gap-6 text-metin/70 text-xs tabular-nums">
                    <span>{b.bolum}</span>
                    <span className="whitespace-nowrap">{paraFormat(b.tutar, pb)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between gap-6 text-metin font-semibold text-lg border-t-2 border-metin/80 pt-2">
              <span>Genel Toplam</span>
              <span className="font-mono whitespace-nowrap">
                {paraFormat(toplam.tutar, pb)} {toplam.ek}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-metin/60 mb-10">
          {kosulCumlesi(teklif)}
        </p>

        {teklif.sablonlar.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 mb-12 text-sm">
            {/* Müşteriye yalnızca grup başlığı gider ("Ödeme Koşulları"); not adı/kodu ("Ç-9") gösterilmez */}
            {sablonlariGrupla(teklif.sablonlar).map((g) => (
              // Yazdırırken başlık ile açıklaması ayrı sayfalara bölünmesin
              <div key={g.grup} className="break-inside-avoid">
                <p className="font-medium text-metin mb-2 break-after-avoid">{g.grup}</p>
                {g.notlar.map((s) => (
                  <p key={s.id} className="text-metin/60 leading-relaxed whitespace-pre-line [&+p]:mt-2">
                    {s.icerik}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* İMZA / KAŞE ALANI VE TEKLİFİ HAZIRLAYAN & MÜŞTERİ ONAYI */}
        {/* Yazdırırken imza alanı bütün olarak aynı sayfada kalır */}
        <div className="grid sm:grid-cols-2 gap-10 pt-10 border-t border-hat text-sm break-inside-avoid">
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
            {yetkiliAd && (
              <p className="text-xs text-metin/70 mt-0.5">Yetkili: {yetkiliAd}</p>
            )}
            <div className="border-t border-hat mt-10 pt-2 text-metin/40 text-xs">İmza / Kaşe</div>
          </div>
        </div>
      </div>
    </div>
  );
}