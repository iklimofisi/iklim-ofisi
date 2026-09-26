"use client";

import { createContext, useContext, useState } from "react";
import { useFormStatus } from "react-dom";
import { webTalebiDonustur } from "@/lib/actions";

// Müşteri listesi sayfaya BİR KEZ gönderilir; her talep kartı buradan okur.
const MusteriListesi = createContext<{ id: string; ad: string }[]>([]);
export function MusteriListesiSaglayici({
  musteriler,
  children,
}: {
  musteriler: { id: string; ad: string }[];
  children: React.ReactNode;
}) {
  return <MusteriListesi.Provider value={musteriler}>{children}</MusteriListesi.Provider>;
}

// Kart üzerindeki "dönüştür" bölümü: form yalnızca açıldığında oluşturulur (sayfa hafif kalır)
export function TalepDonustur({ talep, onerilenMusteriId }: { talep: Talep; onerilenMusteriId: string | null }) {
  const [acik, setAcik] = useState(false);
  return (
    <details className="mt-3 pt-3 border-t border-hat" onToggle={(e) => setAcik((e.currentTarget as HTMLDetailsElement).open)}>
      <summary className="cursor-pointer text-sm font-medium text-soguk-dim hover:underline list-none">
        ➜ Müşteri / Projeye dönüştür
        {onerilenMusteriId && <span className="ml-2 text-[11px] font-normal text-metin/50">(kayıtlı müşteri bulundu)</span>}
      </summary>
      {acik && <TalepDonusturFormu talep={talep} onerilenMusteriId={onerilenMusteriId} />}
    </details>
  );
}

function GonderButonu({ etiket }: { etiket: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors disabled:opacity-60 disabled:cursor-wait"
    >
      {pending ? "Oluşturuluyor…" : etiket}
    </button>
  );
}

type Talep = { id: string; ad: string; telefon: string | null; email: string | null };

// Web talebini tek adımda müşteri (+ istenirse proje) kaydına çevirir.
// Aynı telefon/e-posta ile kayıtlı bir müşteri bulunursa o müşteri önerilir.
function TalepDonusturFormu({ talep, onerilenMusteriId }: { talep: Talep; onerilenMusteriId: string | null }) {
  const musteriler = useContext(MusteriListesi);
  const [musteriId, setMusteriId] = useState(onerilenMusteriId ?? "");
  const [projeOlustur, setProjeOlustur] = useState(true);
  const yeni = musteriId === "";
  const girdi = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  const etiket = "block text-xs font-medium text-metin/60 mb-1";

  return (
    <form action={webTalebiDonustur} className="space-y-4 pt-3">
      <input type="hidden" name="talepId" value={talep.id} />

      <div>
        <label className={etiket}>Müşteri</label>
        <select name="musteriId" value={musteriId} onChange={(e) => setMusteriId(e.target.value)} className={girdi}>
          <option value="">➕ Yeni müşteri oluştur</option>
          {musteriler.map((m) => (
            <option key={m.id} value={m.id}>
              {m.ad}
              {m.id === onerilenMusteriId ? "  (aynı telefon/e-posta — önerilen)" : ""}
            </option>
          ))}
        </select>
        {!yeni && (
          <p className="text-[11px] text-metin/50 mt-1">
            Talep sahibi bu müşterinin yetkilileri arasında yoksa &quot;ek yetkili&quot; olarak eklenir.
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {yeni && (
          <div className="sm:col-span-2">
            <label className={etiket}>Firma / Müşteri Adı *</label>
            <input name="firmaAdi" required defaultValue={talep.ad} className={girdi} />
            <p className="text-[11px] text-metin/50 mt-1">Talep formunda firma adı sorulmuyor; biliyorsanız firma unvanını yazın.</p>
          </div>
        )}
        <div>
          <label className={etiket}>Yetkili Adı Soyadı</label>
          <input name="yetkiliAdi" defaultValue={talep.ad} className={girdi} />
        </div>
        <div>
          <label className={etiket}>Yetkili Telefonu</label>
          <input name="yetkiliTelefon" defaultValue={talep.telefon ?? ""} className={girdi} />
        </div>
        <div className="sm:col-span-2">
          <label className={etiket}>Yetkili E-postası</label>
          <input name="yetkiliEmail" type="email" defaultValue={talep.email ?? ""} className={girdi} />
        </div>
      </div>

      <div className="border-t border-hat pt-3">
        <label className="flex items-center gap-2 text-sm text-metin/80">
          <input
            type="checkbox"
            name="projeOlustur"
            checked={projeOlustur}
            onChange={(e) => setProjeOlustur(e.target.checked)}
            className="accent-soguk"
          />
          Proje de oluştur (talep mesajı projenin notlarına eklenir)
        </label>
        {projeOlustur && (
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className={etiket}>Proje Adı *</label>
              <input name="projeAdi" required defaultValue={`Web talebi – ${talep.ad}`} className={girdi} />
            </div>
            <div>
              <label className={etiket}>Konum</label>
              <input name="konum" placeholder="örn. Kadıköy / İstanbul" className={girdi} />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <GonderButonu etiket={projeOlustur ? "Müşteri + Proje Oluştur" : yeni ? "Müşteri Oluştur" : "Müşteriye Bağla"} />
      </div>
    </form>
  );
}
