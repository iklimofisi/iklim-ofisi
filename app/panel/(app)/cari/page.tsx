import { prisma } from "@/lib/prisma";
import { GERCEK_MUSTERI } from "@/lib/musterisiz";
import { cariHareketEkle, cariHareketIptal } from "@/lib/actions";
import CariFiltre from "@/components/CariFiltre";
import KayitIslemButonu from "@/components/KayitIslemButonu";
import { suankiKullanici, sayfaYetkisi } from "@/lib/oturum";
import { finansYetkilisiMi } from "@/lib/roller";
import OdemeAlModal from "@/components/OdemeAlModal";
import SonucluForm from "@/components/SonucluForm";
import HareketTutarAlani from "@/components/HareketTutarAlani";
import { getTcmbKurlari } from "@/lib/kur";
import Link from "next/link";
import { sasNo } from "@/lib/satinalma-siparis";

export const dynamic = "force-dynamic";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default async function CariSayfasi({
  searchParams,
}: {
  searchParams: { musteri?: string; taraf?: string };
}) {
  await sayfaYetkisi("finans");
  const seciliMusteri = searchParams?.musteri ?? "hepsi";
  // GENEL CARİ: müşteri hareketleri + tedarikçi (satınalma) hareketleri tek listede.
  // Bir müşteri seçiliyse yalnız o müşteri; "taraf" ile yalnız müşteri ya da yalnız tedarikçi gösterilir.
  // Tedarikçi hareketleri burada yalnız görünür; ekleme / iptal Tedarikçi Cari sayfasından yapılır.
  const taraf = seciliMusteri !== "hepsi" ? "musteri" : searchParams?.taraf === "musteri" || searchParams?.taraf === "tedarikci" ? searchParams.taraf : "tum";

  const bugun = new Date();
  const onBesGunSonra = new Date();
  onBesGunSonra.setDate(bugun.getDate() + 15);

  const [musteriler, hareketler, tedarikciHareketleri, tedarikciToplam, musteriToplam, yaklasanCekler, giren, kurlar] = await Promise.all([
    prisma.musteri.findMany({ where: GERCEK_MUSTERI, orderBy: { ad: "asc" } }),
    // Gösterilmeyen taraf için sorgu hiçbir kayıt döndürmez (id hiçbir zaman boş değildir)
    prisma.cariHareket.findMany({
      where: taraf === "tedarikci" ? { id: "" } : seciliMusteri === "hepsi" ? {} : { musteriId: seciliMusteri },
      include: { musteri: true },
      orderBy: { tarih: "desc" },
    }),
    prisma.tedarikciHareket.findMany({
          where: taraf === "musteri" ? { id: "" } : {},
          select: {
            id: true,
            tarih: true,
            tur: true,
            tutar: true,
            aciklama: true,
            faturaNo: true,
            vadeTarihi: true,
            cekNo: true,
            banka: true,
            evrakDosyaAdi: true,
            iptalTarihi: true,
            iptalEdenAdi: true,
            iptalNedeni: true,
            paraBirimi: true,
            dovizTutar: true,
            kur: true,
            tedarikci: { select: { id: true, ad: true } },
            satinalmaSiparisi: { select: { id: true, no: true } },
          },
          orderBy: { tarih: "desc" },
    }),
    prisma.tedarikciHareket.groupBy({ by: ["tur"], _sum: { tutar: true }, where: { iptalTarihi: null } }),
    prisma.cariHareket.groupBy({ by: ["tur"], _sum: { tutar: true }, where: { iptalTarihi: null } }),
    // Vadesi önümüzdeki 15 gün içinde olan Çekler
    prisma.cariHareket.findMany({
      where: {
        vadeTarihi: { gte: bugun, lte: onBesGunSonra },
        iptalTarihi: null,
      },
      include: { musteri: true },
      orderBy: { vadeTarihi: "asc" },
    }),
    suankiKullanici(),
    getTcmbKurlari(),
  ]);
  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  const bugunIso = new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

  // İptal edilen hareketler listede (üstü çizili) görünür ama bakiyeye girmez
  const bakiye = hareketler.reduce((a, c) => (c.iptalTarihi ? a : a + (c.tur === "BORC" ? c.tutar : -c.tutar)), 0);
  // Özet kartı: müşteri seçiliyse o müşterinin bakiyesi, değilse tüm müşterilerin
  const musteriAlacagi =
    seciliMusteri !== "hepsi"
      ? bakiye
      : (musteriToplam.find((x) => x.tur === "BORC")?._sum.tutar ?? 0) - (musteriToplam.find((x) => x.tur === "ALACAK")?._sum.tutar ?? 0);
  const tedarikciBorcu = (tedarikciToplam.find((x) => x.tur === "BORC")?._sum.tutar ?? 0) - (tedarikciToplam.find((x) => x.tur === "ODEME")?._sum.tutar ?? 0);
  // Tek liste: tarihe göre (yeniden eskiye)
  type Satir = { tip: "musteri"; h: (typeof hareketler)[number] } | { tip: "tedarikci"; h: (typeof tedarikciHareketleri)[number] };
  const satirlar: Satir[] = [
    ...hareketler.map((h) => ({ tip: "musteri" as const, h })),
    ...tedarikciHareketleri.map((h) => ({ tip: "tedarikci" as const, h })),
  ].sort((a, b) => b.h.tarih.getTime() - a.h.tarih.getTime());
  const sekme = (t: string, ad: string) => (
    <Link
      key={t}
      href={t === "tum" ? "/panel/cari" : `/panel/cari?taraf=${t}`}
      className={`focus-ring text-xs px-3 py-1.5 rounded-full border ${taraf === t && seciliMusteri === "hepsi" ? "bg-soguk text-white border-soguk" : "border-hat text-metin/70 hover:bg-hat"}`}
    >
      {ad}
    </Link>
  );
  const yonetici = finansYetkilisiMi(giren?.rol); // finansal kayıt iptali: satış müdürü ya da muhasebe

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Cari Hesap</h1>
      <p className="text-sm text-metin/60 mb-4">
        Genel cari: müşteri hareketleri ve tedarikçi (satınalma) hareketleri tek listede. Tedarikçi hareketlerini eklemek / iptal etmek için{" "}
        <Link href="/panel/satinalma/cari" className="text-soguk-dim hover:underline">
          Tedarikçi Cari
        </Link>
        .
      </p>

      {/* GENEL ÖZET */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-yuzey border border-hat rounded-lg p-4" style={{ borderTopColor: "#E8734A", borderTopWidth: 4 }}>
          <p className="text-[11px] text-metin/60">Müşterilerden alacak</p>
          <p className="font-mono text-lg font-semibold text-sicak-dim">{paraFormat(musteriAlacagi)}</p>
          <p className="text-[10px] text-metin/40">{seciliMusteri === "hepsi" ? "Tüm müşteriler" : "Seçili müşteri"}</p>
        </div>
        <Link href="/panel/satinalma/cari" className="focus-ring bg-yuzey border border-hat rounded-lg p-4 hover:shadow-sm" style={{ borderTopColor: "#B91C1C", borderTopWidth: 4 }}>
          <p className="text-[11px] text-metin/60">Tedarikçilere borç</p>
          <p className="font-mono text-lg font-semibold text-red-700">{paraFormat(tedarikciBorcu)}</p>
          <p className="text-[10px] text-metin/40">Alış faturaları − ödemeler · Tedarikçi Cari →</p>
        </Link>
        {seciliMusteri === "hepsi" ? (
          <div className="bg-yuzey border border-hat rounded-lg p-4" style={{ borderTopColor: musteriAlacagi - tedarikciBorcu < 0 ? "#B91C1C" : "#16A34A", borderTopWidth: 4 }}>
            <p className="text-[11px] text-metin/60">Net: alacak − borç</p>
            <p className={`font-mono text-lg font-semibold ${musteriAlacagi - tedarikciBorcu < 0 ? "text-red-700" : "text-emerald-700"}`}>{paraFormat(musteriAlacagi - tedarikciBorcu)}</p>
            <p className="text-[10px] text-metin/40">Müşteri alacağı − tedarikçi borcu</p>
          </div>
        ) : (
          <div className="bg-yuzey border border-hat rounded-lg p-4 text-xs text-metin/50 flex items-center">Net pozisyon tüm müşteriler seçiliyken görünür.</div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {sekme("tum", "Tümü (müşteri + tedarikçi)")}
        {sekme("musteri", "Yalnız müşteriler")}
        {sekme("tedarikci", "Yalnız tedarikçiler (satınalma)")}
      </div>

      {/* 🔔 YAKLAŞAN ÇEK VE VADE UYARISI (Sadece Yaklaşan Çek Varsa Görünür) */}
      {yaklasanCekler.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 shadow-sm space-y-2">
          <h3 className="font-bold text-amber-900 text-xs flex items-center gap-2">
            🚨 Akıllı Muhasebe Uyarısı: Önümüzdeki 15 Gün İçinde Vadesi Gelen Çekler ({yaklasanCekler.length} Adet)
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {yaklasanCekler.map((c) => (
              <div key={c.id} className="bg-white p-2.5 rounded border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-metin">
                  <span>{c.musteri.ad}</span>
                  <span className="text-amber-800">{paraFormat(c.tutar)}</span>
                </div>
                <p className="text-metin/60">{c.banka || "Banka Belirtilmedi"} - Çek No: {c.cekNo || "—"}</p>
                <p className="font-semibold text-rose-700">📅 Vade: {c.vadeTarihi?.toISOString().slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÜST BİLGİ VE FİLTRELER (ORİJİNAL KODUN) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <CariFiltre
          musteriler={musteriler.map((m) => ({ id: m.id, ad: m.ad }))}
          secili={seciliMusteri}
        />
        <div className="flex items-center gap-3">
          <div className="bg-yuzey border border-hat rounded-lg px-5 py-3">
            <span className="text-xs text-metin/50 mr-3">Müşteri bakiyesi</span>
            <span className={`font-mono text-lg ${musteriAlacagi > 0 ? "text-sicak-dim" : "text-soguk-dim"}`}>
              {paraFormat(musteriAlacagi)}
            </span>
          </div>
          <OdemeAlModal
            musteriler={musteriler.map((m) => ({ id: m.id, ad: m.ad }))}
            seciliMusteriId={seciliMusteri !== "hepsi" ? seciliMusteri : undefined}
          />
        </div>
      </div>

      {/* ELLE CARİ HAREKET: tahsilat, çek, sipariş dışı borç (TL ya da döviz) */}
      <SonucluForm action={cariHareketEkle} temizle className="bg-yuzey border border-hat rounded-lg p-5 mb-8 space-y-4">
        <div>
          <h2 className="font-display font-medium text-metin">Elle hareket ekle</h2>
          <p className="text-xs text-metin/50 mt-0.5">
            Sipariş onayının borcu ve kur farkı otomatik yazılır; burada tahsilatları ve sipariş dışı borçları (montaj, servis, eski bakiye vb.) girin.
            Aynı satışın borcunu ikinci kez girmeyin.
          </p>
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri *</label>
            <select name="musteriId" required defaultValue={seciliMusteri !== "hepsi" ? seciliMusteri : ""} className={kutu}>
              <option value="" disabled>
                Seçin…
              </option>
              {musteriler.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İşlem türü *</label>
            <select name="tur" required className={kutu}>
              <option value="ALACAK">Tahsilat (ödeme / çek alındı)</option>
              <option value="BORC">Borç (sipariş dışı fatura vb.)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Ödeme yöntemi</label>
            <select name="odemeYontemi" className={kutu}>
              <option value="EFT/Havale">EFT / Havale</option>
              <option value="Çek">Çek</option>
              <option value="Senet">Senet</option>
              <option value="Nakit">Nakit</option>
              <option value="Kredi Kartı">Kredi Kartı</option>
              <option value="">— (borç kaydı)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İşlem tarihi</label>
            <input name="tarih" type="date" defaultValue={bugunIso} max={bugunIso} className={kutu} />
          </div>
          <HareketTutarAlani kurlar={kurlar} kutu={kutu} />
        </div>

        {/* ÇEK / SENET VE EVRAK */}
        <div className="grid sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-md border border-hat">
          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1">Çek / senet vade tarihi</label>
            <input name="vadeTarihi" type="date" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Banka adı</label>
            <input name="banka" placeholder="Örn: Garanti BBVA" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Çek no / seri no</label>
            <input name="cekNo" placeholder="Örn: 987456" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-800 mb-1">📷 Fatura / dekont / çek görseli</label>
            <input name="evrak" type="file" accept=".pdf,.jpg,.jpeg,.png" className="focus-ring w-full text-xs border border-hat rounded-md p-1 bg-white" />
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-metin/60 mb-1">Açıklama *</label>
            <input name="aciklama" required maxLength={300} className={kutu} placeholder="Fatura no, çek detayları vb." />
          </div>
          <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors shrink-0">
            Ekle
          </button>
        </div>
      </SonucluForm>

      {/* CARİ HAREKETLER TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat bg-soguk-light/20">
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Taraf</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
              <th className="px-4 py-3 font-medium">Vade / Çek Bilgisi</th>
              <th className="px-4 py-3 font-medium text-center">Evrak / Çek</th>
              <th className="px-4 py-3 font-medium text-right">Tutar</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.map((s) => {
              if (s.tip === "tedarikci") {
                const t = s.h;
                return (
                  <tr key={`t-${t.id}`} className={`border-b border-hat last:border-0 bg-rose-50/30 hover:bg-rose-50/60 ${t.iptalTarihi ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3 font-mono text-metin/60 text-xs">{t.tarih.toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <span className="block text-[10px] font-bold text-rose-700">TEDARİKÇİ</span>
                      <Link href={`/panel/satinalma/cari?tedarikci=${t.tedarikci.id}`} className="text-metin font-semibold hover:underline">
                        {t.tedarikci.ad}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-metin/70 text-xs">
                      <span className={t.iptalTarihi ? "line-through" : ""}>{t.aciklama}</span>
                      <span className="block text-[10px] font-bold text-rose-700">{t.tur === "BORC" ? "Alış faturası (borcumuz)" : "Tedarikçiye ödeme"}</span>
                      {t.satinalmaSiparisi && (
                        <Link href={`/panel/satinalma/siparisler/${t.satinalmaSiparisi.id}`} className="block text-[10px] text-soguk-dim hover:underline">
                          {sasNo(t.satinalmaSiparisi.no)}
                        </Link>
                      )}
                      {t.iptalTarihi && (
                        <span className="block text-[10px] font-bold text-sicak-dim">
                          İPTAL · {t.iptalTarihi.toISOString().slice(0, 10)} · {t.iptalEdenAdi} · {t.iptalNedeni}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {t.vadeTarihi ? (
                        <div>
                          <span className="font-bold text-rose-700">Vade: {t.vadeTarihi.toISOString().slice(0, 10)}</span>
                          {t.cekNo && (
                            <div className="text-[10px] text-metin/50">
                              {t.banka} - No: {t.cekNo}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-metin/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.evrakDosyaAdi ? (
                        <a
                          href={`/api/cari-evrak/${t.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 font-semibold hover:bg-blue-100"
                        >
                          📄 Evrak Gör
                        </a>
                      ) : (
                        <span className="text-metin/30">—</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${t.tur === "BORC" ? "text-red-700" : "text-emerald-700"} ${t.iptalTarihi ? "line-through" : ""}`}>
                      {t.tur === "BORC" ? "−" : "+"}
                      {paraFormat(t.tutar)}
                      {t.paraBirimi && t.dovizTutar != null && (
                        <span className="block text-[10px] font-normal text-metin/50">
                          {t.dovizTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t.paraBirimi}
                          {t.kur ? ` · kur ${String(t.kur).replace(".", ",")}` : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.iptalTarihi ? (
                        <span className="text-[11px] text-metin/40">İptal edildi</span>
                      ) : (
                        <Link href={`/panel/satinalma/cari?tedarikci=${t.tedarikci.id}`} className="text-[11px] text-soguk-dim hover:underline">
                          Tedarikçi carisi →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              }
              const c = s.h;
              return (
              <tr key={c.id} className={`border-b border-hat last:border-0 hover:bg-slate-50/50 ${c.iptalTarihi ? "opacity-60" : ""}`}>
                <td className="px-4 py-3 font-mono text-metin/60 text-xs">{c.tarih.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <span className="block text-[10px] font-bold text-soguk-dim">MÜŞTERİ</span>
                  <span className="text-metin font-semibold">{c.musteri.ad}</span>
                </td>
                <td className="px-4 py-3 text-metin/70 text-xs">
                  <span className={c.iptalTarihi ? "line-through" : ""}>{c.aciklama}</span>
                  {c.iptalTarihi && (
                    <span className="block text-[10px] font-bold text-sicak-dim">
                      İPTAL · {c.iptalTarihi.toISOString().slice(0, 10)} · {c.iptalEdenAdi} · {c.iptalNedeni}
                    </span>
                  )}
                  {c.odemeYontemi && <span className="block text-[10px] font-bold text-soguk-dim">Yöntem: {c.odemeYontemi}</span>}
                  {c.odemeDetay && <span className="block text-[10px] text-metin/50">{c.odemeDetay}</span>}
                </td>

                {/* ÇEK VADE BİLGİSİ */}
                <td className="px-4 py-3 text-xs">
                  {(c as any).vadeTarihi ? (
                    <div>
                      <span className="font-bold text-rose-700">Vade: {(c as any).vadeTarihi.toISOString().slice(0, 10)}</span>
                      {(c as any).cekNo && <div className="text-[10px] text-metin/50">{(c as any).banka} - No: {(c as any).cekNo}</div>}
                    </div>
                  ) : (
                    <span className="text-metin/30">—</span>
                  )}
                </td>

                {/* YÜKLENEN EVRAK / ÇEK GÖRSELİ LİNKİ */}
                <td className="px-4 py-3 text-center">
                  {(c as any).evrakDosyaAdi ? (
                    <a
                      href={`/api/cari-evrak/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 font-semibold hover:bg-blue-100"
                    >
                      📄 Çek / Evrak Gör
                    </a>
                  ) : (
                    <span className="text-metin/30">—</span>
                  )}
                </td>

                <td className={`px-4 py-3 text-right font-mono font-bold ${c.tur === "BORC" ? "text-sicak-dim" : "text-soguk-dim"} ${c.iptalTarihi ? "line-through" : ""}`}>
                  {c.tur === "BORC" ? "+" : "-"}
                  {paraFormat(c.tutar)}
                  {c.paraBirimi && c.dovizTutar != null && (
                    <span className="block text-[10px] font-normal text-metin/50">
                      {c.dovizTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {c.paraBirimi}
                      {c.kur ? ` · kur ${String(c.kur).replace(".", ",")}` : ""}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  {c.iptalTarihi ? (
                    <span className="text-[11px] text-metin/40">İptal edildi</span>
                  ) : yonetici ? (
                    <KayitIslemButonu
                      id={c.id}
                      action={cariHareketIptal}
                      etiket="İptal et"
                      nedenIste
                      onayMesaji="Hareket silinmez; iptal edilir ve bakiyeden düşer. Kayıt üstü çizili olarak kalır."
                    />
                  ) : null}
                </td>
              </tr>
              );
            })}
            {satirlar.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-metin/50">
                  Hareket bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}