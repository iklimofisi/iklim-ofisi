import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LogoIsaret } from "@/components/Logo";
import Link from "next/link";
import React from "react";
import YazdirButon from "@/components/YazdirButon";
import OtomatikYazdir from "@/components/OtomatikYazdir";
import TeklifDurumSecici from "@/components/TeklifDurumSecici";
import { getSirketAyarlari } from "@/lib/sirket";
import TeklifEpostaGonderModal from "@/components/TeklifEpostaGonderModal"; // MODAL İMPORT EDİLDİ
import { musteriToplami, ilkHazirlanmaTarihi, musteriTeklifTarihi, kosulCumlesi, tarihYaz, bolumToplamlari, gizliFiyatBolumleri } from "@/lib/teklif-hesap";
import { sablonlariGrupla, notlariUygula } from "@/lib/sablon";
import { ISTIRAK_METNI } from "@/lib/kurumsal";
import TeklifWhatsapp from "@/components/TeklifWhatsapp";
import GorusmeFormu from "@/components/GorusmeFormu";
import ZiyaretListesi from "@/components/ZiyaretListesi";
import { PAYLASIM_TABANI } from "@/lib/teklif-paylasim";
import { redNedeniAdi } from "@/lib/teklif-durum";
import { GERCEK_MUSTERI, MUSTERISIZ_HITAP, musterisizMi, musterisizGoster } from "@/lib/musterisiz";
import { teklifMusteriyeBagla, teklifArsivdenCikar } from "@/lib/actions";
import KayitIslemButonu from "@/components/KayitIslemButonu";
import { satinalmaToplami, satinalmaNetToplami, iskontoGecerli, netAlis } from "@/lib/satinalma-hesap";
import { satirNet } from "@/lib/siparis-tutari";
import KaydetButonu from "@/components/KaydetButonu";
import { miktarYaz } from "@/lib/birimler";

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

// Panel içi bilgi: 05.10.2026 14:32 (Türkiye saati)
// Tedarikçi teklifi bölümündeki tutarlar: "3.528,00 $"
const tutarYaz = (n: number, p: string) =>
  `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${p === "EUR" ? "€" : p === "USD" ? "$" : "₺"}`;
const saatliTarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(d));

// Kurumsal ERP Teklif Kodlama Formatı: IKL-2026-00019
function kurumsalTeklifKodu(teklifNo: number, tarih: Date) {
  const yil = new Date(tarih).getFullYear();
  const siraNo = String(teklifNo).padStart(5, "0");
  return `IKL-${yil}-${siraNo}`;
}

export default async function TeklifDetay({ params }: { params: { id: string } }) {
  const [teklifHam, sirket, sozlesme, kopyalar, paylasim, gorusmeler] = await Promise.all([
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
    // WhatsApp linki ve görüşme notları (ayrı sorgu: tablo/sütun henüz yoksa teklif sayfası yine açılır)
    prisma.teklifPaylasim.findUnique({ where: { teklifId: params.id } }).catch(() => null),
    prisma.ziyaret
      .findMany({
        where: { teklifId: params.id },
        orderBy: { tarih: "desc" },
        include: { proje: { select: { id: true, ad: true } } },
      })
      .catch(() => null),
  ]);

  if (!teklifHam) notFound();

  // TEDARİKÇİ (SATINALMA) TEKLİFLERİ — yalnız panelde görünür, müşteri belgesine girmez:
  // bu teklifin hazırlandığı tedarikçi teklifi + aynı proje / konu başlığıyla girilmiş diğer tedarikçi teklifleri
  const tedarikciKonusu = teklifHam.proje?.ad || teklifHam.baslik || "";
  const tedarikciKosullari = [
    ...(teklifHam.kaynakSatinalmaTeklifiId ? [{ id: teklifHam.kaynakSatinalmaTeklifiId }] : []),
    ...(tedarikciKonusu ? [{ baslik: tedarikciKonusu }] : []),
  ];
  const tedarikciTeklifleri = tedarikciKosullari.length
    ? await prisma.satinalmaTeklifi
        .findMany({
          where: { OR: tedarikciKosullari },
          select: {
            id: true,
            baslik: true,
            tarih: true,
            paraBirimi: true,
            toplamTutar: true,
            alisIskontoYuzde: true,
            maliyetPdfAdi: true,
            maliyetExcelAdi: true,
            tedarikci: { select: { ad: true } },
            kalemler: { select: { id: true, bolum: true, aciklama: true, adet: true, birimFiyat: true } },
          },
          orderBy: { tarih: "desc" },
          take: 20,
        })
        .catch(() => [])
    : [];
  // Kaynak teklif en üstte
  tedarikciTeklifleri.sort((a, b) => Number(b.id === teklifHam.kaynakSatinalmaTeklifiId) - Number(a.id === teklifHam.kaynakSatinalmaTeklifiId));
  const satisNet = teklifHam.kalemler.reduce((a, k) => a + satirNet(k), 0); // bu teklifin KDV hariç, iskontolu toplamı
  // Müşterisiz teklif: belgede müşteri yerine muhatap görünür; sipariş / sözleşme için önce müşteriye bağlanır
  const musterisiz = musterisizMi(teklifHam.musteriId);
  const teklif = musterisizGoster(teklifHam);
  const bagliMusteriler = musterisiz
    ? await prisma.musteri.findMany({ where: GERCEK_MUSTERI, orderBy: { ad: "asc" }, select: { id: true, ad: true } })
    : [];

  const pb = teklif.paraBirimi;
  // Müşteriye tek satır toplam gösterilir: "10.250,00 € + KDV" (KDV dahil tekliflerde "(KDV dahil)")
  const toplam = musteriToplami(teklif);
  // Birden fazla bölüm varsa her bölümün altında "… Toplamı" satırı ve genel
  // toplamın üstünde bölüm özeti gösterilir (birim fiyatlar gizliyse gösterilmez)
  const bolumler = bolumToplamlari(teklif.kalemler);
  const bolumToplamiGoster = teklif.birimFiyatGoster && bolumler.length > 1;
  const bolumTutari = new Map(bolumler.map((b) => [b.bolum, b.tutar]));
  // Birim fiyatı gizlenen bölümler: satırlarda fiyat / tutar yok, yalnız bölüm toplamı (PDF ile aynı)
  const gizliBolumler = gizliFiyatBolumleri(teklif.fiyatGizliBolumler);
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
      <OtomatikYazdir />
      {/* ÜST BUTONLAR VE MAİL GÖNDERME MODALI BURAYA YERLEŞTİRİLDİ */}
      <div className="flex items-center justify-between gap-3 mb-6 print:hidden">
        <Link href="/panel/teklifler" className="focus-ring shrink-0 whitespace-nowrap text-sm text-metin/60 hover:text-metin">
          ← Tekliflere dön
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <TeklifDurumSecici teklifId={teklif.id} mevcutDurum={teklif.durum} />
          <a
            href="#whatsapp"
            className="focus-ring text-sm font-medium text-[#178a45] border border-[#1fa855]/50 px-4 py-2 rounded-md hover:bg-[#1fa855]/10 transition-colors"
          >
            💬 WhatsApp
          </a>
          
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

      {musterisiz && (
        <div className="mb-4 bg-amber-50 border border-amber-300 rounded-lg p-4 print:hidden">
          <p className="text-sm font-semibold text-amber-900">◌ Müşterisiz teklif</p>
          <p className="text-xs text-amber-900/80 mt-1">
            Bu teklif bir müşteriye bağlı değil. PDF&apos;te, müşteri linkinde ve e-postada müşteri yerine{" "}
            <b>&quot;{teklifHam.muhatap?.trim() || MUSTERISIZ_HITAP}&quot;</b> yazar (Düzenle&apos;den değiştirilebilir). Siparişe dönüştürmek ve sözleşme
            hazırlamak için önce müşteriye bağlayın — teklif numarası, kalemler ve revizyon geçmişi aynen kalır.
          </p>
          <form action={teklifMusteriyeBagla} className="mt-3 flex flex-wrap items-end gap-2">
            <input type="hidden" name="teklifId" value={teklif.id} />
            <div className="min-w-[16rem] flex-1 max-w-md">
              <label className="block text-xs font-medium text-amber-900/70 mb-1">Müşteri</label>
              <select name="musteriId" required defaultValue="" className="focus-ring w-full border border-amber-300 rounded-md px-3 py-2 text-sm bg-white">
                <option value="">— Müşteri seçin —</option>
                {bagliMusteriler.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.ad}
                  </option>
                ))}
              </select>
            </div>
            <KaydetButonu className="focus-ring bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-amber-700 disabled:opacity-60" bekleme="Bağlanıyor…" basari={null}>
              Müşteriye bağla
            </KaydetButonu>
            <Link href="/panel/musteriler" target="_blank" className="focus-ring text-xs text-amber-900/70 hover:underline pb-2">
              + Müşteri listede yoksa önce ekleyin
            </Link>
          </form>
        </div>
      )}

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

      {/* ARŞİVDEKİ TEKLİF (silinmedi; listelerde ve raporlarda görünmez) */}
      {teklif.arsivTarihi && (
        <div className="mb-3 text-sm bg-hat text-metin border border-hat rounded-md px-4 py-3 print:hidden flex flex-wrap items-center justify-between gap-2">
          <p>
            🗄 <b>Bu teklif arşivde:</b> {saatliTarih(teklif.arsivTarihi)}
            {teklif.arsivleyenAdi && ` · ${teklif.arsivleyenAdi}`}. Listelerde ve raporlarda görünmez.
          </p>
          <KayitIslemButonu
            id={teklif.id}
            action={teklifArsivdenCikar}
            etiket="Arşivden çıkar"
            onayBasligi="Arşivden çıkar"
            onayMesaji="Teklif yeniden teklif listesinde ve raporlarda görünecek."
            className="focus-ring text-xs font-semibold text-soguk-dim hover:underline disabled:opacity-50"
          />
        </div>
      )}

      {/* MÜŞTERİ LİNKTEN ONAYLADIYSA */}
      {teklif.musteriOnayTarihi && teklif.durum === "ONAYLANDI" && (
        <div className="mb-3 text-sm bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md px-4 py-3 print:hidden">
          <p>
            ✅ <b>Müşteri linkten onayladı:</b> {teklif.musteriOnayAdi} · {saatliTarih(teklif.musteriOnayTarihi)}
            {teklif.musteriOnayRevizyon != null && ` · Rev. ${teklif.musteriOnayRevizyon}`}
            {teklif.musteriOnayTutar && ` · ${teklif.musteriOnayTutar}`}
          </p>
          {teklif.musteriOnayNotu && <p className="mt-1 whitespace-pre-line">Müşteri notu: {teklif.musteriOnayNotu}</p>}
          {teklif.musteriOnayRevizyon != null && teklif.revizyonNo > teklif.musteriOnayRevizyon && (
            <p className="mt-1 font-semibold text-sicak-dim">
              ⚠ Teklif onaydan sonra değiştirildi (şu an Rev. {teklif.revizyonNo}). Müşterinin onayladığı Rev. {teklif.musteriOnayRevizyon}.
            </p>
          )}
        </div>
      )}

      {/* RED NEDENİ */}
      {teklif.durum === "REDDEDILDI" && teklif.redNedeni && (
        <div className="mb-3 text-sm bg-sicak-light text-sicak-dim border border-sicak/30 rounded-md px-4 py-3 print:hidden">
          ❌ <b>Reddedildi:</b> {redNedeniAdi(teklif.redNedeni)}
          {teklif.redRakip && ` · İşi alan: ${teklif.redRakip}`}
          {teklif.redTarihi && ` · ${saatliTarih(teklif.redTarihi)}`}
          {teklif.redAciklama && <p className="mt-1 whitespace-pre-line text-metin/70">{teklif.redAciklama}</p>}
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
        {!musterisiz && (teklif.durum === "ONAYLANDI" || sozlesme) && (
          <Link
            href={`/panel/teklifler/${teklif.id}/sozlesme`}
            className="focus-ring text-sm bg-soguk text-white px-4 py-2 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            📄 {sozlesme ? "Sözleşmeyi Gör / Düzenle" : "Sözleşme Hazırla"}
          </Link>
        )}
        {!musterisiz && teklif.durum === "ONAYLANDI" && !teklif.siparis && (
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

      {/* TEDARİKÇİ TEKLİFİ (MALİYET) — yalnız panelde; yazdırmada ve müşteri PDF'inde yok */}
      <details open={tedarikciTeklifleri.length > 0} className="mb-6 bg-amber-50/40 border border-amber-200 rounded-lg print:hidden">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-metin flex flex-wrap items-center justify-between gap-2">
          <span>
            🚚 Tedarikçi teklifi (maliyet){" "}
            {tedarikciTeklifleri.length > 0 && <span className="font-normal text-metin/60">· {tedarikciTeklifleri.length} teklif</span>}
          </span>
          <span className="flex items-center gap-3 text-xs font-normal">
            {teklif.maliyetPdfAdi && (
              <a href={`/api/maliyet-pdf/${teklif.id}`} target="_blank" rel="noopener noreferrer" className="text-emerald-800 underline">
                📄 Bu teklifin maliyet PDF&apos;i
              </a>
            )}
            {teklif.maliyetExcelAdi && (
              <a href={`/api/maliyet-excel/${teklif.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-800 underline">
                📊 Maliyet Excel&apos;i
              </a>
            )}
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-3">
          {tedarikciTeklifleri.length === 0 && (
            <p className="text-sm text-metin/60">
              Bu teklife bağlı tedarikçi teklifi yok.{" "}
              <Link href="/panel/satinalma/teklifler" className="text-soguk-dim hover:underline">
                Gelen Teklifler
              </Link>{" "}
              sayfasından &quot;{tedarikciKonusu || "proje adı"}&quot; başlığıyla eklerseniz burada görünür.
            </p>
          )}
          {tedarikciTeklifleri.map((st) => {
            const isk = iskontoGecerli(st.alisIskontoYuzde);
            const maliyet = isk > 0 ? satinalmaNetToplami(st) : satinalmaToplami(st);
            const kaynak = st.id === teklifHam.kaynakSatinalmaTeklifiId;
            const ayniPb = st.paraBirimi === teklif.paraBirimi;
            const kar = satisNet - maliyet;
            return (
              <div key={st.id} className="bg-white border border-hat rounded-md">
                <div className="px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    {kaynak && <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded mr-2">BU TEKLİFİN KAYNAĞI</span>}
                    <Link href={`/panel/satinalma/teklifler/${st.id}`} className="font-semibold text-metin hover:underline">
                      {st.tedarikci.ad}
                    </Link>
                    <span className="text-xs text-metin/50">
                      {" "}
                      · {st.tarih.toLocaleDateString("tr-TR")} · {st.kalemler.length} kalem
                    </span>
                    {st.baslik !== tedarikciKonusu && <span className="block text-[11px] text-metin/50">{st.baslik}</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">
                      {maliyet > 0 ? tutarYaz(maliyet, st.paraBirimi) : "—"}
                      {isk > 0 && <span className="text-[11px] font-normal text-metin/50"> (liste −%{isk})</span>}
                    </p>
                    {ayniPb && maliyet > 0 && satisNet > 0 && (
                      <p className={`text-[11px] ${kar < 0 ? "text-red-700" : "text-emerald-700"}`}>
                        Bu teklif {tutarYaz(satisNet, teklif.paraBirimi)} (KDV hariç) · fark {tutarYaz(kar, teklif.paraBirimi)} · %
                        {((kar / satisNet) * 100).toFixed(1).replace(".", ",")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-3 pb-2.5 flex flex-wrap items-center gap-3 text-xs">
                  {st.maliyetPdfAdi && (
                    <a href={`/api/maliyet-pdf/${st.id}`} target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline">
                      📄 Tedarikçi PDF&apos;i
                    </a>
                  )}
                  {st.maliyetExcelAdi && (
                    <a href={`/api/maliyet-excel/${st.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-800 font-semibold underline">
                      📊 Excel
                    </a>
                  )}
                  <Link href={`/panel/satinalma/siparisler?teklif=${st.id}#yeni`} className="text-soguk-dim font-semibold hover:underline">
                    Tedarikçiye sipariş ver →
                  </Link>
                </div>
                {st.kalemler.length > 0 && (
                  <details className="border-t border-hat">
                    <summary className="cursor-pointer px-3 py-2 text-xs text-soguk-dim">Kalemleri göster</summary>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs min-w-[520px]">
                        <thead>
                          <tr className="text-left text-metin/50 border-b border-hat">
                            <th className="px-3 py-1.5 font-medium">Açıklama</th>
                            <th className="px-3 py-1.5 font-medium text-right">Adet</th>
                            <th className="px-3 py-1.5 font-medium text-right">Birim{isk > 0 ? " (liste)" : ""}</th>
                            {isk > 0 && <th className="px-3 py-1.5 font-medium text-right">Net birim</th>}
                            <th className="px-3 py-1.5 font-medium text-right">Tutar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {st.kalemler.map((k) => (
                            <tr key={k.id} className="border-b border-hat last:border-0">
                              <td className="px-3 py-1.5">
                                {k.aciklama}
                                {k.bolum && <span className="block text-[10px] text-metin/40">{k.bolum}</span>}
                              </td>
                              <td className="px-3 py-1.5 text-right font-mono">{k.adet}</td>
                              <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">{k.birimFiyat > 0 ? tutarYaz(k.birimFiyat, st.paraBirimi) : "—"}</td>
                              {isk > 0 && (
                                <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">{k.birimFiyat > 0 ? tutarYaz(netAlis(k.birimFiyat, isk), st.paraBirimi) : "—"}</td>
                              )}
                              <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">
                                {k.birimFiyat > 0 ? tutarYaz(k.adet * (isk > 0 ? netAlis(k.birimFiyat, isk) : k.birimFiyat), st.paraBirimi) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </details>

      <div className="bg-yuzey border border-hat rounded-lg p-8 sm:p-12 print:border-0 print:p-0">
        {/* ŞİRKET BİLGİLERİ VE ADRESİ */}
        <div className="flex items-start justify-between mb-10 pb-6 border-b border-hat">
          <div className="flex items-center gap-3">
            <LogoIsaret boyut={44} baslik={sirket.unvan} className="shrink-0" />
            <div>
              <p className="font-display font-bold text-lg text-metin">{sirket.unvan}</p>
              {ISTIRAK_METNI && <p className="text-[11px] text-metin/60 font-medium">{ISTIRAK_METNI}</p>}
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
            <col className="w-24" />
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
              <th className="py-2 font-medium text-right whitespace-nowrap">Miktar</th>
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
                  const bolumGizli = teklif.birimFiyatGoster && gizliBolumler.has(bolumAdi);
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
                      <td className="py-2 text-right text-metin/70 whitespace-nowrap">{miktarYaz(k.adet, k.birim)}</td>
                      {teklif.birimFiyatGoster &&
                        (bolumGizli ? (
                          <>
                            <td />
                            <td />
                          </>
                        ) : (
                          <>
                            <td className="py-2 text-right text-metin/70 whitespace-nowrap">{paraFormat(netBirimFiyat, pb)}</td>
                            <td className="py-2 text-right text-metin whitespace-nowrap">{paraFormat(satirTutar, pb)}</td>
                          </>
                        ))}
                    </tr>
                  );
                })}

                {/* Bölüm toplamı: yalnızca birden fazla kalemli bölümlerde
                    (tek kalemde satır tutarıyla aynı olacağı için tekrar yazılmaz) */}
                {((bolumToplamiGoster && kalemler.length > 1) || (teklif.birimFiyatGoster && gizliBolumler.has(bolumAdi))) && (
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
            {sablonlariGrupla(notlariUygula(teklif.sablonlar, teklif.ozelNotlar)).map((g) => (
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

      {/* --- YALNIZCA PANELDE (yazdırmada görünmez) --- */}
      <section id="whatsapp" className="mt-8 bg-yuzey border border-hat rounded-lg p-5 scroll-mt-6 print:hidden">
        <h2 className="font-display font-medium text-metin mb-3">💬 WhatsApp ile Müşteriye Gönder</h2>
        <TeklifWhatsapp
          key={paylasim?.anahtar ?? "yok"}
          teklifId={teklif.id}
          link={paylasim ? PAYLASIM_TABANI + paylasim.anahtar : null}
          telefon={yetkiliTelefon || teklif.musteri.telefon || ""}
          hitapAd={yetkiliAd || teklif.musteri.ad}
          teklifKodu={`TKL-${String(teklif.teklifNo).padStart(4, "0")}`}
          firma={sirket.unvan}
          goruntulenme={paylasim?.goruntulenme ?? 0}
          sonGoruntulenme={paylasim?.sonGoruntulenme ? saatliTarih(paylasim.sonGoruntulenme) : null}
          olusturma={paylasim ? saatliTarih(paylasim.createdAt) : null}
        />
      </section>

      <section id="gorusmeler" className="mt-6 scroll-mt-6 print:hidden">
        <h2 className="font-display font-medium text-metin mb-3">
          📞 Bu Teklifle İlgili Görüşmeler{gorusmeler ? ` (${gorusmeler.length})` : ""}
        </h2>
        <div className="mb-4">
          <GorusmeFormu musteriId={teklif.musteriId} projeId={teklif.projeId} teklifId={teklif.id} />
        </div>
        {gorusmeler && <ZiyaretListesi ziyaretler={gorusmeler} bosMetin="Bu teklif için henüz görüşme notu yok." />}
      </section>
    </div>
  );
}