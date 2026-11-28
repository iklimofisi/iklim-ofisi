"use client";

import { useState } from "react";
import SonucluForm from "@/components/SonucluForm";
import HareketTutarAlani from "@/components/HareketTutarAlani";
import { cariHareketEkle, tedarikciHareketEkle } from "@/lib/actions";
import { ODEME_YONTEMLERI, type OdemeYontemi } from "@/lib/odeme-yontemi";
import type { TcmbKurlari } from "@/lib/kur";

// -----------------------------------------------------------------------------
// ELLE CARİ HAREKETİ (müşteri ya da tedarikçi): önce ne yapıldığı seçilir
// (tahsilat / ödeme ya da sipariş dışı borç), ödemede ödeme şekli seçilir:
// havale/EFT, nakit, kredi kartı, çek, senet. Vade ve çek no yalnız çek / senette istenir;
// böylece çek seçilmeyen ödeme çek takibine ve vade uyarısına girmez.
// -----------------------------------------------------------------------------
export type Taraf = "musteri" | "tedarikci";
export type HareketVarsayilan = {
  taraf?: Taraf;
  kisiId?: string;
  islem?: "odeme" | "borc";
  tutar?: string; // TL, örn. 48.000,00
  faturaNo?: string;
  aciklama?: string;
};

type Kisi = { id: string; ad: string };

export default function CariHareketFormu({
  taraflar,
  musteriler = [],
  tedarikciler = [],
  kurlar,
  bugunIso,
  varsayilan,
}: {
  taraflar: Taraf[];
  musteriler?: Kisi[];
  tedarikciler?: Kisi[];
  kurlar: TcmbKurlari | null;
  bugunIso: string;
  varsayilan?: HareketVarsayilan;
}) {
  const [taraf, setTaraf] = useState<Taraf>(varsayilan?.taraf && taraflar.includes(varsayilan.taraf) ? varsayilan.taraf : taraflar[0]);
  const [islem, setIslem] = useState<"odeme" | "borc">(varsayilan?.islem ?? "odeme");
  const [yontem, setYontem] = useState<OdemeYontemi>("HAVALE");
  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  const tedarikci = taraf === "tedarikci";
  const kisiler = tedarikci ? tedarikciler : musteriler;
  const vadeli = islem === "odeme" && (yontem === "CEK" || yontem === "SENET");
  const tur = islem === "borc" ? "BORC" : tedarikci ? "ODEME" : "ALACAK";
  const varsayilanKisi = varsayilan?.taraf === taraf ? varsayilan?.kisiId ?? "" : "";

  const secim = (aktif: boolean) =>
    `focus-ring text-left rounded-md border px-3 py-2 text-sm transition-colors ${
      aktif ? "border-soguk bg-soguk-light/40 text-metin font-medium ring-1 ring-soguk" : "border-hat bg-white text-metin/70 hover:bg-slate-50"
    }`;

  return (
    <SonucluForm key={taraf} action={tedarikci ? tedarikciHareketEkle : cariHareketEkle} temizle className="space-y-4">
      <input type="hidden" name="tur" value={tur} />
      {islem === "odeme" && <input type="hidden" name="odemeYontemi" value={yontem} />}

      {taraflar.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {taraflar.map((t) => (
            <button key={t} type="button" onClick={() => setTaraf(t)} className={`focus-ring text-xs px-3 py-1.5 rounded-full border ${taraf === t ? "bg-soguk text-white border-soguk" : "border-hat text-metin/70 hover:bg-hat"}`}>
              {t === "musteri" ? "Müşteri (tahsilat / borç)" : "Tedarikçi (ödeme / fatura)"}
            </button>
          ))}
        </div>
      )}

      {/* 1. Ne yapıldı */}
      <div className="grid sm:grid-cols-2 gap-2">
        <button type="button" onClick={() => setIslem("odeme")} className={secim(islem === "odeme")}>
          {tedarikci ? "💸 Ödeme yaptık" : "💰 Tahsilat yaptık"}
          <span className="block text-[11px] font-normal text-metin/50">
            {tedarikci ? "Tedarikçiye havale, nakit, kart, çek ya da senetle ödeme" : "Müşteriden havale, nakit, kart, çek ya da senetle alınan"}
          </span>
        </button>
        <button type="button" onClick={() => setIslem("borc")} className={secim(islem === "borc")}>
          {tedarikci ? "🧾 Fatura / borç girişi" : "🧾 Borç girişi"}
          <span className="block text-[11px] font-normal text-metin/50">
            {tedarikci ? "Satınalma siparişi dışı fatura (kira, nakliye, hizmet, eski bakiye…)" : "Sipariş dışı borç (montaj, servis, eski bakiye…)"}
          </span>
        </button>
      </div>

      {/* 2. Ödeme şekli */}
      {islem === "odeme" && (
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Ödeme şekli *</label>
          <div className="flex flex-wrap gap-2">
            {ODEME_YONTEMLERI.map((y) => (
              <button
                key={y.deger}
                type="button"
                onClick={() => setYontem(y.deger)}
                className={`focus-ring px-4 py-2 rounded-md border text-sm ${yontem === y.deger ? "bg-soguk text-white border-soguk font-medium" : "bg-white border-hat text-metin/70 hover:bg-slate-50"}`}
              >
                {y.etiket}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Kim, ne zaman, ne kadar */}
      <div className="grid sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-metin/60 mb-1">{tedarikci ? "Tedarikçi *" : "Müşteri *"}</label>
          <select name={tedarikci ? "tedarikciId" : "musteriId"} required defaultValue={varsayilanKisi} className={kutu}>
            <option value="" disabled>
              Seçin…
            </option>
            {kisiler.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">{islem === "odeme" ? (tedarikci ? "Ödeme tarihi" : "Tahsilat tarihi") : "Fatura / işlem tarihi"}</label>
          <input name="tarih" type="date" defaultValue={bugunIso} max={bugunIso} className={kutu} />
        </div>
        {tedarikci ? (
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">{islem === "odeme" ? "Ödenen fatura no (varsa)" : "Fatura no"}</label>
            <input name="faturaNo" maxLength={100} defaultValue={varsayilan?.faturaNo ?? ""} className={kutu} />
          </div>
        ) : (
          <div />
        )}
        <HareketTutarAlani kurlar={kurlar} kutu={kutu} baslangicTutar={varsayilan?.tutar} />
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-metin/60 mb-1">📷 {islem === "odeme" ? (vadeli ? "Çek / senet görseli" : "Dekont / makbuz") : "Fatura"} (ops.)</label>
          <input name="evrak" type="file" accept=".pdf,.jpg,.jpeg,.png" className="focus-ring w-full text-xs border border-hat rounded-md p-1.5 bg-white" />
        </div>
      </div>

      {/* 4. Ödeme şekline göre ayrıntı */}
      {islem === "odeme" && yontem !== "NAKIT" && (
        <div className="grid sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-md border border-hat">
          {vadeli && (
            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">{yontem === "CEK" ? "Çek vade tarihi *" : "Senet vade tarihi *"}</label>
              <input name="vadeTarihi" type="date" required className={kutu} />
            </div>
          )}
          {yontem !== "SENET" && (
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">
                {yontem === "CEK" ? "Çekin bankası" : yontem === "KART" ? "Kart / POS (ops.)" : tedarikci ? "Hangi hesabımızdan (ops.)" : "Hangi hesabımıza (ops.)"}
              </label>
              <input name="banka" maxLength={100} placeholder={yontem === "KART" ? "örn. Garanti şirket kartı" : "örn. Garanti BBVA"} className={kutu} />
            </div>
          )}
          {vadeli && (
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">{yontem === "CEK" ? "Çek no / seri no" : "Senet no"}</label>
              <input name="cekNo" maxLength={100} placeholder="örn. 456789" className={kutu} />
            </div>
          )}
        </div>
      )}
      {islem === "borc" && (
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Son ödeme (vade) tarihi (ops.)</label>
            <input name="vadeTarihi" type="date" className={kutu} />
          </div>
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-metin/60 mb-1">Açıklama (boş bırakılırsa otomatik yazılır)</label>
          <input
            name="aciklama"
            maxLength={300}
            defaultValue={varsayilan?.aciklama ?? ""}
            className={kutu}
            placeholder={islem === "odeme" ? (tedarikci ? "örn. Kasım ödemesi" : "örn. Kasım tahsilatı") : "örn. Nakliye faturası"}
          />
        </div>
        <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors shrink-0">
          {islem === "odeme" ? (tedarikci ? "Ödemeyi kaydet" : "Tahsilatı kaydet") : "Borcu kaydet"}
        </button>
      </div>
    </SonucluForm>
  );
}
