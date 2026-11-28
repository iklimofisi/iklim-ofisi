import { prisma } from "@/lib/prisma";
import { GERCEK_MUSTERI } from "@/lib/musterisiz";
import { cariHareketIptal, cariHareketSil, tedarikciHareketIptal, tedarikciHareketSil } from "@/lib/actions";
import CariFiltre from "@/components/CariFiltre";
import KayitIslemButonu from "@/components/KayitIslemButonu";
import { suankiKullanici, sayfaYetkisi } from "@/lib/oturum";
import { finansYetkilisiMi, yazabilir } from "@/lib/roller";
import CariHareketFormu, { type HareketVarsayilan } from "@/components/CariHareketFormu";
import { getTcmbKurlari } from "@/lib/kur";
import { acikHesap, tutarYazisi } from "@/lib/acik-hesap";
import { odemeYontemiEtiket, VADELI_YONTEMLER, vadeliMi } from "@/lib/odeme-yontemi";
import Link from "next/link";
import { sasNo } from "@/lib/satinalma-siparis";

export const dynamic = "force-dynamic";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default async function CariSayfasi({
  searchParams,
}: {
  searchParams: { musteri?: string; taraf?: string; ode?: string; tahsil?: string; yeni?: string };
}) {
  await sayfaYetkisi("finans");
  const seciliMusteri = searchParams?.musteri ?? "hepsi";
  const odeId = searchParams?.ode ?? ""; // tedarikçi faturası ödemesi (form dolu açılır)
  const tahsilId = searchParams?.tahsil ?? ""; // müşteri borcu tahsilatı (form dolu açılır)
  // GENEL CARİ: müşteri hareketleri + tedarikçi (satınalma) hareketleri tek listede.
  // Bir müşteri seçiliyse yalnız o müşteri; "taraf" ile yalnız müşteri ya da yalnız tedarikçi gösterilir.
  // Tedarikçi hareketleri burada yalnız görünür; ekleme / iptal Tedarikçi Cari sayfasından yapılır.
  const taraf = seciliMusteri !== "hepsi" ? "musteri" : searchParams?.taraf === "musteri" || searchParams?.taraf === "tedarikci" ? searchParams.taraf : "tum";

  const gun = (d: Date) => new Date(d.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
  const bugunBasi = new Date(`${gun(new Date())}T00:00:00+03:00`);
  const onBesGunSonra = new Date(bugunBasi.getTime() + 16 * 24 * 3600 * 1000);

  const [musteriler, hareketler, tedarikciHareketleri, tedarikciToplam, musteriToplam, yaklasanCekler, giren, kurlar, tedarikciler, musteriAcik, tedarikciAcik, verilenCekler] = await Promise.all([
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
            odemeYontemi: true,
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
    // Müşteriden aldığımız çek / senetler: vadesi önümüzdeki 15 gün içinde olanlar
    prisma.cariHareket.findMany({
      where: { tur: "ALACAK", iptalTarihi: null, odemeYontemi: { in: VADELI_YONTEMLER }, vadeTarihi: { gte: bugunBasi, lt: onBesGunSonra } },
      include: { musteri: true },
      orderBy: { vadeTarihi: "asc" },
    }),
    suankiKullanici(),
    getTcmbKurlari(),
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    // Açık hesap (borç bazında kalan) için geçerli hareketler
    prisma.cariHareket.findMany({ where: { iptalTarihi: null }, select: { id: true, musteriId: true, tur: true, tutar: true, tarih: true, vadeTarihi: true } }),
    prisma.tedarikciHareket.findMany({ where: { iptalTarihi: null }, select: { id: true, tedarikciId: true, tur: true, tutar: true, tarih: true, vadeTarihi: true, faturaNo: true } }),
    // Tedarikçiye verdiğimiz çek / senetler: vadesi önümüzdeki 15 gün içinde olanlar
    prisma.tedarikciHareket.findMany({
      where: { tur: "ODEME", iptalTarihi: null, odemeYontemi: { in: VADELI_YONTEMLER }, vadeTarihi: { gte: bugunBasi, lt: onBesGunSonra } },
      select: { id: true, tutar: true, vadeTarihi: true, banka: true, cekNo: true, odemeYontemi: true, tedarikci: { select: { ad: true } } },
      orderBy: { vadeTarihi: "asc" },
    }),
  ]);
  const bugunIso = gun(new Date());
  const girebilir = yazabilir(giren?.rol, "finans"); // tahsilat / ödeme / borç girişi

  // Borç kayıtlarının kalanı: müşteri borcu tahsilatla, tedarikçi faturası ödemeyle kapanır
  const musteriKalan = acikHesap(musteriAcik.map((h) => ({ id: h.id, cari: h.musteriId, borc: h.tur === "BORC", tutar: h.tutar, tarih: h.tarih, vadeTarihi: h.vadeTarihi })));
  const tedarikciKalan = acikHesap(
    tedarikciAcik.map((h) => ({ id: h.id, cari: h.tedarikciId, borc: h.tur === "BORC", tutar: h.tutar, tarih: h.tarih, vadeTarihi: h.vadeTarihi, belgeNo: h.faturaNo }))
  );

  // Form ön doldurma: "Öde" (tedarikçi faturası) / "Tahsil et" (müşteri borcu) bağlantıları ve üstteki düğmeler
  const odenecek = odeId ? tedarikciAcik.find((h) => h.id === odeId && h.tur === "BORC") : undefined;
  const tahsilEdilecek = tahsilId ? musteriAcik.find((h) => h.id === tahsilId && h.tur === "BORC") : undefined;
  const varsayilan: HareketVarsayilan = odenecek
    ? { taraf: "tedarikci", kisiId: odenecek.tedarikciId, islem: "odeme", tutar: tutarYazisi(tedarikciKalan.get(odenecek.id) ?? odenecek.tutar), faturaNo: odenecek.faturaNo ?? "" }
    : tahsilEdilecek
      ? { taraf: "musteri", kisiId: tahsilEdilecek.musteriId, islem: "odeme", tutar: tutarYazisi(musteriKalan.get(tahsilEdilecek.id) ?? tahsilEdilecek.tutar) }
      : searchParams?.yeni === "odeme"
        ? { taraf: "tedarikci", islem: "odeme" }
        : { taraf: "musteri", islem: "odeme", kisiId: seciliMusteri !== "hepsi" ? seciliMusteri : "" };
  const formAnahtari = `${odeId}|${tahsilId}|${searchParams?.yeni ?? ""}|${seciliMusteri}`;

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
  const silebilir = giren?.rol === "ADMIN"; // hareket silme (deneme / hatalı kayıt): yalnız satış müdürü

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Cari Hesap</h1>
      <p className="text-sm text-metin/60 mb-4">
        Müşteri ve tedarikçi hareketleri tek listede. Müşteriden tahsilatı da tedarikçiye ödemeyi de buradan girebilirsiniz; ödenmemiş faturada{" "}
        <b>Öde</b>, müşteri borcunda <b>Tahsil et</b> formu tutarıyla doldurur. Yalnız tedarikçiler için{" "}
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

      {/* ÇEK / SENET VADE UYARISI: yalnız çek ya da senetle yapılan tahsilat / ödemeler */}
      {(yaklasanCekler.length > 0 || verilenCekler.length > 0) && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 shadow-sm space-y-2">
          <h3 className="font-bold text-amber-900 text-xs">📅 15 gün içinde vadesi gelen çek / senetler</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {yaklasanCekler.map((c) => (
              <div key={c.id} className="bg-white p-2.5 rounded border border-emerald-200 text-xs space-y-1">
                <p className="text-[10px] font-bold text-emerald-700">📥 ALDIĞIMIZ {odemeYontemiEtiket(c.odemeYontemi).toLocaleUpperCase("tr-TR")}</p>
                <div className="flex justify-between font-bold text-metin gap-2">
                  <span>{c.musteri.ad}</span>
                  <span className="text-emerald-800 font-mono">{paraFormat(c.tutar)}</span>
                </div>
                <p className="text-metin/60">
                  {c.banka || "Banka yazılmadı"}
                  {c.cekNo ? ` · No ${c.cekNo}` : ""}
                </p>
                <p className="font-semibold text-amber-800">Vade {c.vadeTarihi ? gun(c.vadeTarihi) : "—"}</p>
              </div>
            ))}
            {verilenCekler.map((c) => (
              <div key={c.id} className="bg-white p-2.5 rounded border border-rose-200 text-xs space-y-1">
                <p className="text-[10px] font-bold text-rose-700">📤 VERDİĞİMİZ {odemeYontemiEtiket(c.odemeYontemi).toLocaleUpperCase("tr-TR")}</p>
                <div className="flex justify-between font-bold text-metin gap-2">
                  <span>{c.tedarikci.ad}</span>
                  <span className="text-rose-800 font-mono">{paraFormat(c.tutar)}</span>
                </div>
                <p className="text-metin/60">
                  {c.banka || "Banka yazılmadı"}
                  {c.cekNo ? ` · No ${c.cekNo}` : ""}
                </p>
                <p className="font-semibold text-amber-800">Vade {c.vadeTarihi ? gun(c.vadeTarihi) : "—"}</p>
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
          {girebilir && (
            <>
              <Link href={`/panel/cari?${seciliMusteri !== "hepsi" ? `musteri=${seciliMusteri}&` : ""}yeni=tahsilat#hareket-formu`} className="focus-ring bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim">
                💰 Tahsilat gir
              </Link>
              <Link href="/panel/cari?yeni=odeme#hareket-formu" className="focus-ring bg-white border border-soguk text-soguk-dim px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-light/40">
                💸 Tedarikçiye ödeme
              </Link>
            </>
          )}
        </div>
      </div>

      {/* TAHSİLAT / ÖDEME / BORÇ GİRİŞİ: müşteri ya da tedarikçi */}
      <div id="hareket-formu" className="bg-yuzey border border-hat rounded-lg p-5 mb-8 scroll-mt-4">
        <h2 className="font-display font-medium text-metin">
          {odenecek ? `Tedarikçi faturası ${odenecek.faturaNo ?? ""} ödemesi` : tahsilEdilecek ? "Müşteri borcu tahsilatı" : "Tahsilat, ödeme ya da borç gir"}
        </h2>
        <p className="text-xs text-metin/50 mt-0.5 mb-4">
          Önce müşteri mi tedarikçi mi olduğunu, sonra ne yapıldığını seçin. Ödeme şekli havale/EFT, nakit, kredi kartı, çek ya da senet olabilir; vade ve çek numarası
          yalnız çek / senette sorulur. Sipariş onayının borcu ve satınalma siparişinden işlenen faturalar kendiliğinden yazılır; onları burada tekrar girmeyin.
        </p>
        {girebilir ? (
          <CariHareketFormu
            key={formAnahtari}
            taraflar={["musteri", "tedarikci"]}
            musteriler={musteriler.map((m) => ({ id: m.id, ad: m.ad }))}
            tedarikciler={tedarikciler}
            kurlar={kurlar}
            bugunIso={bugunIso}
            varsayilan={varsayilan}
          />
        ) : (
          <p className="text-sm text-metin/50">Tahsilat, ödeme ve borç girişi muhasebe ile satış müdüründedir.</p>
        )}
      </div>

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
                      <span className="block text-[10px] font-bold text-rose-700">
                        {t.tur === "BORC" ? `Alış faturası (borcumuz)${t.faturaNo ? ` · ${t.faturaNo}` : ""}` : `Tedarikçiye ödeme${t.faturaNo ? ` · fatura ${t.faturaNo}` : ""}`}
                      </span>
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
                      {t.tur === "ODEME" ? (
                        <div>
                          <span className="font-semibold text-metin">{t.odemeYontemi ? odemeYontemiEtiket(t.odemeYontemi) : "—"}</span>
                          {vadeliMi(t.odemeYontemi) && t.vadeTarihi && <span className="block font-bold text-amber-700">Vade {gun(t.vadeTarihi)}</span>}
                          {(t.banka || t.cekNo) && (
                            <span className="block text-[10px] text-metin/50">
                              {t.banka ?? ""}
                              {t.cekNo ? ` · No ${t.cekNo}` : ""}
                            </span>
                          )}
                        </div>
                      ) : t.vadeTarihi ? (
                        <span className="text-metin/70">Son ödeme {gun(t.vadeTarihi)}</span>
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
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] text-metin/40">İptal edildi</span>
                          {silebilir && (
                            <KayitIslemButonu
                              id={t.id}
                              action={tedarikciHareketSil}
                              etiket="Sil"
                              nedenIste
                              nedenEtiketi="Silme nedeni"
                              onayMesaji="Kayıt tamamen silinir; kopyası İşlem Geçmişi'nde kalır."
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          {t.tur === "BORC" &&
                            ((tedarikciKalan.get(t.id) ?? t.tutar) <= 0 ? (
                              <span className="text-[11px] font-semibold text-emerald-700">✓ Ödendi</span>
                            ) : (
                              <>
                                <span className="text-[11px] font-semibold text-rose-700">
                                  {(tedarikciKalan.get(t.id) ?? t.tutar) < t.tutar ? `Kalan ${paraFormat(tedarikciKalan.get(t.id) ?? 0)}` : "Ödenmedi"}
                                </span>
                                {girebilir && (
                                  <Link href={`/panel/cari?ode=${t.id}#hareket-formu`} className="text-[11px] font-semibold text-soguk-dim hover:underline">
                                    Öde →
                                  </Link>
                                )}
                              </>
                            ))}
                          {yonetici && (
                            <KayitIslemButonu
                              id={t.id}
                              action={tedarikciHareketIptal}
                              etiket="İptal et"
                              nedenIste
                              onayMesaji="Hareket silinmez; iptal edilir ve bakiyeden düşer. Kayıt üstü çizili olarak kalır."
                            />
                          )}
                          {silebilir && (
                            <KayitIslemButonu
                              id={t.id}
                              action={tedarikciHareketSil}
                              etiket="Sil"
                              nedenIste
                              nedenEtiketi="Silme nedeni"
                              onayMesaji="Kayıt tamamen silinir; kopyası İşlem Geçmişi'nde kalır."
                            />
                          )}
                        </div>
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
                  {c.odemeYontemi && <span className="block text-[10px] font-bold text-soguk-dim">{odemeYontemiEtiket(c.odemeYontemi)}</span>}
                  {c.odemeDetay && <span className="block text-[10px] text-metin/50">{c.odemeDetay}</span>}
                </td>

                {/* ÇEK VADE BİLGİSİ */}
                <td className="px-4 py-3 text-xs">
                  {c.tur === "ALACAK" ? (
                    <div>
                      <span className="font-semibold text-metin">{c.odemeYontemi ? odemeYontemiEtiket(c.odemeYontemi) : "—"}</span>
                      {vadeliMi(c.odemeYontemi) && c.vadeTarihi && <span className="block font-bold text-amber-700">Vade {gun(c.vadeTarihi)}</span>}
                      {(c.banka || c.cekNo) && (
                        <span className="block text-[10px] text-metin/50">
                          {c.banka ?? ""}
                          {c.cekNo ? ` · No ${c.cekNo}` : ""}
                        </span>
                      )}
                    </div>
                  ) : c.vadeTarihi ? (
                    <span className="text-metin/70">Son ödeme {gun(c.vadeTarihi)}</span>
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
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] text-metin/40">İptal edildi</span>
                      {silebilir && (
                        <KayitIslemButonu
                          id={c.id}
                          action={cariHareketSil}
                          etiket="Sil"
                          nedenIste
                          nedenEtiketi="Silme nedeni"
                          onayMesaji="Kayıt tamamen silinir; kopyası İşlem Geçmişi'nde kalır."
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      {c.tur === "BORC" &&
                        ((musteriKalan.get(c.id) ?? c.tutar) <= 0 ? (
                          <span className="text-[11px] font-semibold text-emerald-700">✓ Tahsil edildi</span>
                        ) : (
                          <>
                            <span className="text-[11px] font-semibold text-sicak-dim">
                              {(musteriKalan.get(c.id) ?? c.tutar) < c.tutar ? `Kalan ${paraFormat(musteriKalan.get(c.id) ?? 0)}` : "Tahsil edilmedi"}
                            </span>
                            {girebilir && (
                              <Link href={`/panel/cari?tahsil=${c.id}#hareket-formu`} className="text-[11px] font-semibold text-soguk-dim hover:underline">
                                Tahsil et →
                              </Link>
                            )}
                          </>
                        ))}
                      {yonetici && (
                        <KayitIslemButonu
                          id={c.id}
                          action={cariHareketIptal}
                          etiket="İptal et"
                          nedenIste
                          onayMesaji="Hareket silinmez; iptal edilir ve bakiyeden düşer. Kayıt üstü çizili olarak kalır."
                        />
                      )}
                      {silebilir && (
                        <KayitIslemButonu
                          id={c.id}
                          action={cariHareketSil}
                          etiket="Sil"
                          nedenIste
                          nedenEtiketi="Silme nedeni"
                          onayMesaji="Kayıt tamamen silinir; kopyası İşlem Geçmişi'nde kalır."
                        />
                      )}
                    </div>
                  )}
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