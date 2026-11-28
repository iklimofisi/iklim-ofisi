import { prisma } from "@/lib/prisma";
import { tedarikciHareketIptal, tedarikciHareketSil } from "@/lib/actions";
import KayitIslemButonu from "@/components/KayitIslemButonu";
import { suankiKullanici, sayfaYetkisi } from "@/lib/oturum";
import { finansYetkilisiMi, yazabilir } from "@/lib/roller";
import TedarikciFiltre from "@/components/TedarikciFiltre";
import CariHareketFormu, { type HareketVarsayilan } from "@/components/CariHareketFormu";
import { getTcmbKurlari } from "@/lib/kur";
import { acikHesap, tutarYazisi } from "@/lib/acik-hesap";
import { odemeYontemiEtiket, VADELI_YONTEMLER, vadeliMi } from "@/lib/odeme-yontemi";
import { sasNo } from "@/lib/satinalma-siparis";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}
const gun = (d: Date) => new Date(d.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);

export default async function TedarikciCariSayfasi({
  searchParams,
}: {
  searchParams: { tedarikci?: string; ode?: string };
}) {
  await sayfaYetkisi("tedarikci");
  const secili = searchParams?.tedarikci ?? "hepsi";
  const odeId = searchParams?.ode ?? "";

  const bugunBasi = new Date(`${gun(new Date())}T00:00:00+03:00`);
  const onBesGunSonra = new Date(bugunBasi.getTime() + 16 * 24 * 3600 * 1000);

  const [tedarikciler, hareketler, tumHareketler, verilenCekler, giren, kurlar] = await Promise.all([
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    prisma.tedarikciHareket.findMany({
      where: secili === "hepsi" ? {} : { tedarikciId: secili },
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
    // Açık hesap (fatura bazında kalan) için tüm tedarikçilerin geçerli hareketleri
    prisma.tedarikciHareket.findMany({
      where: { iptalTarihi: null },
      select: { id: true, tedarikciId: true, tur: true, tutar: true, tarih: true, vadeTarihi: true, faturaNo: true, tedarikci: { select: { ad: true } } },
    }),
    // Verdiğimiz çek / senetler: vadesi önümüzdeki 15 gün içinde olanlar
    prisma.tedarikciHareket.findMany({
      where: { tur: "ODEME", iptalTarihi: null, odemeYontemi: { in: VADELI_YONTEMLER }, vadeTarihi: { gte: bugunBasi, lt: onBesGunSonra } },
      select: { id: true, tutar: true, vadeTarihi: true, banka: true, cekNo: true, odemeYontemi: true, tedarikci: { select: { ad: true } } },
      orderBy: { vadeTarihi: "asc" },
    }),
    suankiKullanici(),
    getTcmbKurlari(),
  ]);
  const bugunIso = gun(new Date());

  const kalanlar = acikHesap(
    tumHareketler.map((h) => ({ id: h.id, cari: h.tedarikciId, borc: h.tur === "BORC", tutar: h.tutar, tarih: h.tarih, vadeTarihi: h.vadeTarihi, belgeNo: h.faturaNo }))
  );
  // Ödenmemiş (ya da kısmen ödenmiş) faturalar: vadesi geçmiş ya da 15 gün içinde olanlar
  const vadesiGelenFaturalar = tumHareketler
    .filter((h) => h.tur === "BORC" && h.vadeTarihi && h.vadeTarihi < onBesGunSonra && (kalanlar.get(h.id) ?? 0) > 0)
    .sort((a, b) => a.vadeTarihi!.getTime() - b.vadeTarihi!.getTime());

  // İptal edilen hareketler listede (üstü çizili) görünür ama bakiyeye girmez
  const bakiye = hareketler.reduce((a, h) => (h.iptalTarihi ? a : a + (h.tur === "BORC" ? h.tutar : -h.tutar)), 0);
  const yonetici = finansYetkilisiMi(giren?.rol); // finansal kayıt iptali: satış müdürü ya da muhasebe
  const girebilir = yazabilir(giren?.rol, "finans"); // ödeme / fatura girişi
  const silebilir = giren?.rol === "ADMIN"; // hareket silme (deneme / hatalı kayıt): yalnız satış müdürü

  // "Öde" bağlantısından gelindiyse form o faturanın kalanıyla dolu açılır
  const odenecek = odeId ? tumHareketler.find((h) => h.id === odeId && h.tur === "BORC") : undefined;
  const varsayilan: HareketVarsayilan = odenecek
    ? {
        taraf: "tedarikci",
        kisiId: odenecek.tedarikciId,
        islem: "odeme",
        tutar: tutarYazisi(kalanlar.get(odenecek.id) ?? odenecek.tutar),
        faturaNo: odenecek.faturaNo ?? "",
      }
    : { taraf: "tedarikci", kisiId: secili !== "hepsi" ? secili : "" };
  const odeLinki = (id: string, tedarikciId: string) => `/panel/satinalma/cari?tedarikci=${tedarikciId}&ode=${id}#hareket-formu`;

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Satınalma</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Tedarikçi Cari</h1>
      <p className="text-sm text-metin/60 mb-6">
        Alış faturaları borcumuzu artırır, ödemelerimiz (havale/EFT, nakit, kredi kartı, çek, senet) düşürür. Satınalma siparişinden işlenen faturalar buraya kendiliğinden
        gelir. Tüm cariler (müşteri + tedarikçi) için{" "}
        <Link href="/panel/cari" className="text-soguk-dim hover:underline">
          Cari Hesap
        </Link>
        .
      </p>

      {/* UYARILAR: ödenmemiş faturaların vadesi ve verdiğimiz çek / senetlerin vadesi */}
      {(vadesiGelenFaturalar.length > 0 || verilenCekler.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {vadesiGelenFaturalar.length > 0 && (
            <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 space-y-2">
              <h3 className="font-bold text-rose-900 text-xs">🧾 Ödenmemiş faturalar: vadesi geçen ya da 15 gün içinde dolan ({vadesiGelenFaturalar.length})</h3>
              {vadesiGelenFaturalar.map((f) => {
                const gecikti = f.vadeTarihi! < bugunBasi;
                return (
                  <div key={f.id} className="bg-white p-2.5 rounded border border-rose-200 text-xs flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-metin">{f.tedarikci.ad}</p>
                      <p className="text-metin/60">Fatura {f.faturaNo ?? "—"}</p>
                      <p className={`font-semibold ${gecikti ? "text-red-700" : "text-rose-700"}`}>
                        Vade {gun(f.vadeTarihi!)}
                        {gecikti ? " · GECİKTİ" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-rose-800">{paraFormat(kalanlar.get(f.id) ?? 0)}</p>
                      {girebilir && (
                        <Link href={odeLinki(f.id, f.tedarikciId)} className="text-[11px] text-soguk-dim font-semibold hover:underline">
                          Öde →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {verilenCekler.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-2">
              <h3 className="font-bold text-amber-900 text-xs">📤 Verdiğimiz çek / senetler: 15 gün içinde vadesi gelenler ({verilenCekler.length})</h3>
              {verilenCekler.map((c) => (
                <div key={c.id} className="bg-white p-2.5 rounded border border-amber-200 text-xs flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-metin">{c.tedarikci.ad}</p>
                    <p className="text-metin/60">
                      {odemeYontemiEtiket(c.odemeYontemi)}
                      {c.banka ? ` · ${c.banka}` : ""}
                      {c.cekNo ? ` · No ${c.cekNo}` : ""}
                    </p>
                    <p className="font-semibold text-amber-800">Vade {gun(c.vadeTarihi!)}</p>
                  </div>
                  <p className="font-mono font-bold text-amber-800">{paraFormat(c.tutar)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <TedarikciFiltre tedarikciler={tedarikciler} secili={secili} />
        <div className="bg-yuzey border border-hat rounded-lg px-5 py-3">
          <span className="text-xs text-metin/50 mr-3">{secili === "hepsi" ? "Tüm tedarikçilere borcumuz" : "Bu tedarikçiye borcumuz"}</span>
          <span className={`font-mono text-lg ${bakiye > 0 ? "text-sicak-dim" : "text-soguk-dim"}`}>{paraFormat(bakiye)}</span>
        </div>
      </div>

      {/* ÖDEME / FATURA GİRİŞİ */}
      <div id="hareket-formu" className="bg-yuzey border border-hat rounded-lg p-5 mb-8 scroll-mt-4">
        <h2 className="font-display font-medium text-metin">{odenecek ? `Fatura ${odenecek.faturaNo ?? ""} ödemesi` : "Ödeme ya da fatura gir"}</h2>
        <p className="text-xs text-metin/50 mt-0.5 mb-4">
          Ödemede ödeme şeklini seçin; vade ve çek numarası yalnız çek / senette sorulur. Satınalma siparişine bağlı faturayı siparişin sayfasından işleyin; burada sipariş dışı
          faturalar (kira, nakliye, hizmet, eski bakiye) girilir. Aynı fatura numarası bir tedarikçiye iki kez işlenmez.
        </p>
        {girebilir ? (
          <CariHareketFormu key={odeId || secili} taraflar={["tedarikci"]} tedarikciler={tedarikciler} kurlar={kurlar} bugunIso={bugunIso} varsayilan={varsayilan} />
        ) : (
          <p className="text-sm text-metin/50">Ödeme ve fatura girişi muhasebe ile satış müdüründedir.</p>
        )}
      </div>

      {/* TEDARİKÇİ CARİ HAREKETLERİ */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat bg-soguk-light/20">
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Tedarikçi</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
              <th className="px-4 py-3 font-medium">Ödeme şekli / vade</th>
              <th className="px-4 py-3 font-medium text-center">Evrak</th>
              <th className="px-4 py-3 font-medium text-right">Tutar</th>
              <th className="px-4 py-3 font-medium text-right">Durum / işlem</th>
            </tr>
          </thead>
          <tbody>
            {hareketler.map((h) => {
              const kalan = h.tur === "BORC" && !h.iptalTarihi ? kalanlar.get(h.id) ?? h.tutar : null;
              return (
                <tr key={h.id} className={`border-b border-hat last:border-0 hover:bg-slate-50/50 ${h.iptalTarihi ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 font-mono text-metin/60 text-xs whitespace-nowrap">{gun(h.tarih)}</td>
                  <td className="px-4 py-3 text-metin font-semibold">{h.tedarikci.ad}</td>
                  <td className="px-4 py-3 text-metin/70 text-xs">
                    <span className={h.iptalTarihi ? "line-through" : ""}>{h.aciklama}</span>
                    <span className={`block text-[10px] font-bold ${h.tur === "BORC" ? "text-rose-700" : "text-emerald-700"}`}>
                      {h.tur === "BORC" ? `FATURA (BORÇ)${h.faturaNo ? ` · ${h.faturaNo}` : ""}` : `ÖDEME${h.faturaNo ? ` · fatura ${h.faturaNo}` : ""}`}
                    </span>
                    {h.satinalmaSiparisi && (
                      <Link href={`/panel/satinalma/siparisler/${h.satinalmaSiparisi.id}`} className="block text-[10px] text-soguk-dim hover:underline">
                        {sasNo(h.satinalmaSiparisi.no)}
                      </Link>
                    )}
                    {h.iptalTarihi && (
                      <span className="block text-[10px] font-bold text-sicak-dim">
                        İPTAL · {gun(h.iptalTarihi)} · {h.iptalEdenAdi} · {h.iptalNedeni}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {h.tur === "ODEME" ? (
                      <div>
                        <span className="font-semibold text-metin">{h.odemeYontemi ? odemeYontemiEtiket(h.odemeYontemi) : "—"}</span>
                        {vadeliMi(h.odemeYontemi) && h.vadeTarihi && <span className="block font-bold text-amber-700">Vade {gun(h.vadeTarihi)}</span>}
                        {(h.banka || h.cekNo) && (
                          <span className="block text-[10px] text-metin/50">
                            {h.banka ?? ""}
                            {h.cekNo ? ` · No ${h.cekNo}` : ""}
                          </span>
                        )}
                      </div>
                    ) : h.vadeTarihi ? (
                      <span className="text-metin/70">Son ödeme {gun(h.vadeTarihi)}</span>
                    ) : (
                      <span className="text-metin/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {h.evrakDosyaAdi ? (
                      <a
                        href={`/api/cari-evrak/${h.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 font-semibold hover:bg-blue-100"
                      >
                        📄 Gör
                      </a>
                    ) : (
                      <span className="text-metin/30">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-bold whitespace-nowrap ${h.tur === "BORC" ? "text-sicak-dim" : "text-soguk-dim"} ${h.iptalTarihi ? "line-through" : ""}`}>
                    {h.tur === "BORC" ? "+" : "-"}
                    {paraFormat(h.tutar)}
                    {h.paraBirimi && h.dovizTutar != null && (
                      <span className="block text-[10px] font-normal text-metin/50">
                        {h.dovizTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {h.paraBirimi}
                        {h.kur ? ` · kur ${String(h.kur).replace(".", ",")}` : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    {h.iptalTarihi ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] text-metin/40">İptal edildi</span>
                          {silebilir && (
                            <KayitIslemButonu
                              id={h.id}
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
                        {kalan !== null &&
                          (kalan <= 0 ? (
                            <span className="text-[11px] font-semibold text-emerald-700">✓ Ödendi</span>
                          ) : (
                            <>
                              <span className="text-[11px] font-semibold text-rose-700">
                                {kalan < h.tutar ? `Kalan ${paraFormat(kalan)}` : "Ödenmedi"}
                              </span>
                              {girebilir && (
                                <Link href={odeLinki(h.id, h.tedarikci.id)} className="text-[11px] font-semibold text-soguk-dim hover:underline">
                                  Öde →
                                </Link>
                              )}
                            </>
                          ))}
                        {yonetici && (
                          <KayitIslemButonu
                            id={h.id}
                            action={tedarikciHareketIptal}
                            etiket="İptal et"
                            nedenIste
                            onayMesaji="Hareket silinmez; iptal edilir ve bakiyeden düşer. Kayıt üstü çizili olarak kalır."
                          />
                        )}
                          {silebilir && (
                            <KayitIslemButonu
                              id={h.id}
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
            })}
            {hareketler.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-metin/50">
                  Tedarikçi cari hareketi bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
