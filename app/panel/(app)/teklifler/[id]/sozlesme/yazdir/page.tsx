import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSirketAyarlari } from "@/lib/sirket";
import { ISTIRAK_METNI } from "@/lib/kurumsal";
import YazdirButon from "@/components/YazdirButon";
import { kalemleriOku, maddeleriOku, sozlesmeHesap, paraYaz, tutariYaziyla, sayiyiYaziyla, sozlesmeNo } from "@/lib/sozlesme";

export const dynamic = "force-dynamic";

const trTarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(d);

// İmzalatılacak sözleşme belgesi (A4, yazdır / PDF olarak kaydet)
export default async function SozlesmeYazdir({ params }: { params: { id: string } }) {
  const [teklif, sozlesme, sirket] = await Promise.all([
    prisma.teklif.findUnique({
      where: { id: params.id },
      select: { id: true, teklifNo: true, olusturanKullanici: { select: { ad: true } }, olusturanAdi: true },
    }),
    prisma.sozlesme.findUnique({ where: { teklifId: params.id } }),
    getSirketAyarlari(),
  ]);
  if (!teklif) notFound();
  if (!sozlesme) redirect(`/panel/teklifler/${params.id}/sozlesme`);

  const pb = sozlesme.paraBirimi;
  const h = sozlesmeHesap({
    kalemler: kalemleriOku(sozlesme.kalemler),
    kur: sozlesme.kur,
    kdvOrani: sozlesme.kdvOrani,
    kdvDahil: sozlesme.kdvDahil,
  });
  const maddeler = maddeleriOku(sozlesme.maddeler);
  const fiyatli = sozlesme.birimFiyatGoster;
  const cokBolum = h.bolumler.length > 1;
  const yukleniciVergi = [sirket.vergiDairesi && `${sirket.vergiDairesi} VD`, sirket.vergiNo && `VN: ${sirket.vergiNo}`]
    .filter(Boolean)
    .join(" / ");

  const Madde = ({ no, baslik, children }: { no: number; baslik: string; children: React.ReactNode }) => (
    <section className="mb-5 break-inside-avoid">
      <h2 className="text-[13px] font-bold text-metin mb-1.5 break-after-avoid">
        MADDE {no} – {baslik.toLocaleUpperCase("tr-TR")}
      </h2>
      <div className="text-[12.5px] leading-relaxed text-metin/90">{children}</div>
    </section>
  );

  const Taraf = ({ baslik, satirlar }: { baslik: string; satirlar: [string, string | null | undefined][] }) => (
    <div className="border border-hat rounded p-3 break-inside-avoid">
      <p className="text-[11px] font-bold tracking-wider text-soguk-dim mb-1.5">{baslik}</p>
      <table className="w-full text-[12px]">
        <tbody>
          {satirlar
            .filter(([, v]) => v)
            .map(([a, v]) => (
              <tr key={a} className="align-top">
                <td className="pr-2 py-0.5 text-metin/60 whitespace-nowrap w-24">{a}</td>
                <td className="py-0.5 text-metin">{v}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href={`/panel/teklifler/${teklif.id}/sozlesme`} className="focus-ring text-sm text-metin/60 hover:text-metin">
          ← Sözleşmeyi düzenle
        </Link>
        <YazdirButon />
      </div>

      <article className="bg-white border border-hat rounded-lg p-8 sm:p-12 print:border-0 print:p-0 max-w-[210mm] mx-auto text-metin">
        {/* ÜST BİLGİ */}
        <header className="flex items-start justify-between gap-6 pb-4 mb-6 border-b-2 border-metin/80">
          <div className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt={sirket.unvan} width={40} height={40} />
            <div>
              <p className="font-display font-bold text-base">{sirket.unvan}</p>
              <p className="text-[10.5px] text-metin/60">{ISTIRAK_METNI}</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-metin/70 whitespace-nowrap">
            <p>
              Sözleşme No: <span className="font-semibold text-metin">{sozlesmeNo(teklif.teklifNo, sozlesme.createdAt)}</span>
            </p>
            <p>
              Tarih: <span className="font-semibold text-metin">{trTarih(sozlesme.sozlesmeTarihi)}</span>
            </p>
            <p>Teklif No: TKL-{String(teklif.teklifNo).padStart(4, "0")}</p>
          </div>
        </header>

        <h1 className="text-center text-lg font-bold tracking-wide mb-6">{sozlesme.baslik}</h1>

        {/* MADDE 1 – TARAFLAR */}
        <Madde no={1} baslik="Taraflar">
          <p className="mb-3">
            İşbu sözleşme, aşağıda bilgileri yazılı taraflar arasında, aşağıdaki şartlarla akdedilmiştir. Sözleşmede
            &quot;İşveren&quot; ve &quot;Yüklenici&quot; birlikte &quot;Taraflar&quot; olarak anılacaktır.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Taraf
              baslik="İŞVEREN"
              satirlar={[
                ["Unvan", sozlesme.isverenUnvan],
                ["Adres", sozlesme.isverenAdres],
                ["Vergi", sozlesme.isverenVergi],
                ["Telefon", sozlesme.isverenTelefon],
                ["Yetkili", sozlesme.isverenYetkili],
              ]}
            />
            <Taraf
              baslik="YÜKLENİCİ"
              satirlar={[
                ["Unvan", sirket.unvan],
                ["Adres", sirket.adres],
                ["Vergi", yukleniciVergi || null],
                ["Telefon", sirket.telefon],
                ["E-posta", sirket.email],
              ]}
            />
          </div>
        </Madde>

        {/* MADDE 2 – KONU */}
        <Madde no={2} baslik="Sözleşmenin Konusu">
          <p className="whitespace-pre-line">{sozlesme.isinKonusu}</p>
          {sozlesme.isYeri && (
            <p className="mt-1.5">
              <span className="font-semibold">İşin yapılacağı yer:</span> {sozlesme.isYeri}
            </p>
          )}
        </Madde>

        {/* MADDE 3 – KAPSAM VE BEDEL */}
        <section className="mb-5">
          <h2 className="text-[13px] font-bold mb-1.5 break-after-avoid">MADDE 3 – SÖZLEŞME KAPSAMI VE BEDELİ</h2>
          <p className="text-[12.5px] leading-relaxed mb-2 break-after-avoid">
            Sözleşme kapsamındaki ürün ve hizmetler ile bedelleri aşağıda gösterilmiştir.
          </p>
          <table className="w-full table-fixed text-[11.5px] tabular-nums border-collapse">
            <colgroup>
              <col className="w-7" />
              <col />
              <col className="w-12" />
              {fiyatli && <col className="w-28" />}
              <col className="w-28" />
            </colgroup>
            <thead>
              <tr className="bg-zemin border-y border-metin/40 text-metin/70">
                <th className="py-1.5 px-1 text-left font-semibold">#</th>
                <th className="py-1.5 px-1 text-left font-semibold">Açıklama</th>
                <th className="py-1.5 px-1 text-right font-semibold">Adet</th>
                {fiyatli && <th className="py-1.5 px-1 text-right font-semibold whitespace-nowrap">Birim Fiyat</th>}
                <th className="py-1.5 px-1 text-right font-semibold">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let sira = 0;
                return h.bolumler.map((b) => [
                  cokBolum && (
                    <tr key={`b-${b.ad}`} className="break-inside-avoid">
                      <td colSpan={fiyatli ? 5 : 4} className="pt-2.5 pb-1 px-1 font-bold text-soguk-dim text-[11px] uppercase tracking-wide border-b border-hat">
                        {b.ad}
                      </td>
                    </tr>
                  ),
                  ...b.satirlar.map((k) => {
                    sira++;
                    return (
                      <tr key={`k-${sira}`} className="border-b border-hat align-top break-inside-avoid">
                        <td className="py-1.5 px-1 text-metin/50">{sira}</td>
                        <td className="py-1.5 px-1 break-words">{k.aciklama}</td>
                        <td className="py-1.5 px-1 text-right">{k.adet}</td>
                        {fiyatli && <td className="py-1.5 px-1 text-right whitespace-nowrap">{paraYaz(k.birim, pb)}</td>}
                        <td className="py-1.5 px-1 text-right whitespace-nowrap">{paraYaz(k.tutar, pb)}</td>
                      </tr>
                    );
                  }),
                  cokBolum && b.satirlar.length > 1 && (
                    <tr key={`t-${b.ad}`} className="break-inside-avoid">
                      <td colSpan={fiyatli ? 4 : 3} className="py-1 px-1 text-right text-[11px] text-metin/60">
                        {b.ad} toplamı
                      </td>
                      <td className="py-1 px-1 text-right font-semibold whitespace-nowrap">{paraYaz(b.toplam, pb)}</td>
                    </tr>
                  ),
                ]);
              })()}
            </tbody>
          </table>

          <div className="flex justify-end mt-3 break-inside-avoid">
            <table className="text-[12px] tabular-nums">
              <tbody>
                <tr>
                  <td className="pr-6 py-0.5 text-metin/70">Toplam (KDV hariç)</td>
                  <td className="py-0.5 text-right whitespace-nowrap">{paraYaz(h.araToplam, pb)}</td>
                </tr>
                <tr>
                  <td className="pr-6 py-0.5 text-metin/70">KDV (%{sozlesme.kdvOrani.toLocaleString("tr-TR")})</td>
                  <td className="py-0.5 text-right whitespace-nowrap">{paraYaz(h.kdv, pb)}</td>
                </tr>
                <tr className="border-t-2 border-metin/80">
                  <td className="pr-6 pt-1 font-bold">Sözleşme Bedeli (KDV dahil)</td>
                  <td className="pt-1 text-right font-bold whitespace-nowrap">{paraYaz(h.genelToplam, pb)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[12.5px] leading-relaxed mt-3 break-inside-avoid">
            Sözleşmenin toplam bedeli KDV dahil <strong>{paraYaz(h.genelToplam, pb)}</strong>{" "}
            <span className="italic">(yalnız {tutariYaziyla(h.genelToplam, pb)})</span>&apos;dır. Bu bedel, aşağıdaki şartlarda aksi
            belirtilmedikçe sözleşme süresince sabittir.
          </p>
        </section>

        {/* MADDE 4+ – ŞARTLAR */}
        {maddeler.map((m, i) => (
          <Madde key={i} no={i + 4} baslik={m.baslik || "Diğer Hükümler"}>
            <p className="whitespace-pre-line">{m.icerik}</p>
          </Madde>
        ))}

        <p className="text-[12.5px] leading-relaxed mt-6 mb-8 break-inside-avoid">
          İşbu sözleşme {maddeler.length + 3} ({sayiyiYaziyla(maddeler.length + 3)}) maddeden ibaret olup{" "}
          {trTarih(sozlesme.sozlesmeTarihi)} tarihinde taraflarca okunarak imza altına alınmıştır.
        </p>

        {/* İMZA */}
        <div className="grid grid-cols-2 gap-10 pt-2 break-inside-avoid">
          {[
            { baslik: "İŞVEREN", unvan: sozlesme.isverenUnvan, yetkili: sozlesme.isverenYetkili },
            {
              baslik: "YÜKLENİCİ",
              unvan: sirket.unvan,
              yetkili: teklif.olusturanKullanici?.ad || teklif.olusturanAdi || null,
            },
          ].map((t) => (
            <div key={t.baslik} className="text-[12px]">
              <p className="text-[11px] font-bold tracking-wider text-soguk-dim">{t.baslik}</p>
              <p className="font-bold mt-1">{t.unvan}</p>
              {t.yetkili && <p className="text-metin/70">Yetkili: {t.yetkili}</p>}
              <div className="mt-16 border-t border-metin/50 pt-1 text-metin/50 text-[11px]">Kaşe / İmza</div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
