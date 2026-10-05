"use client";

import { useState } from "react";
import { ziyaretEkle } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";
import HatirlatmaSecici from "@/components/HatirlatmaSecici";
import { GORUSME_TURLERI } from "@/lib/gorusme";

type Musteri = { id: string; ad: string };
type Proje = { id: string; ad: string; musteriId: string | null };

// Ziyaretler sayfasındaki kayıt formu.
// Müşteri seçilince yalnızca o müşterinin projeleri listelenir; müşteri seçmeden
// proje seçilirse projenin müşterisi otomatik seçilir. Böylece kayıtlar birbirine bağlı kalır.
export default function ZiyaretKayitFormu({
  musteriler,
  projeler,
  kisiler,
  varsayilanYapan,
  varsayilanMusteriId = "",
  varsayilanProjeId = "",
  bugun,
}: {
  musteriler: Musteri[];
  projeler: Proje[];
  kisiler: string[];
  varsayilanYapan: string;
  varsayilanMusteriId?: string;
  varsayilanProjeId?: string;
  bugun: string; // YYYY-MM-DD (Türkiye saatine göre, sunucuda hesaplanır)
}) {
  const [musteriId, setMusteriId] = useState(varsayilanMusteriId);
  const [projeId, setProjeId] = useState(varsayilanProjeId);
  const [tur, setTur] = useState("ZIYARET");

  const gorunenProjeler = musteriId ? projeler.filter((p) => p.musteriId === musteriId) : projeler;
  const musteriAd = (id: string | null) => musteriler.find((m) => m.id === id)?.ad;

  return (
    <form action={ziyaretEkle} className="p-5 pt-2 space-y-3">
      <input type="hidden" name="donus" value="ziyaretler" />
      <input type="hidden" name="tur" value={tur} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-metin/60 mr-1">Görüşme Türü:</span>
        {GORUSME_TURLERI.map((t) => (
          <button
            key={t.kod}
            type="button"
            onClick={() => setTur(t.kod)}
            aria-pressed={tur === t.kod}
            className={`focus-ring text-xs px-3 py-1.5 rounded-full border transition-colors ${
              tur === t.kod ? "bg-soguk text-white border-soguk" : "bg-white border-hat text-metin/70 hover:border-soguk"
            }`}
          >
            {t.simge} {t.ad}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Tarih *</label>
          <input
            name="tarih"
            type="date"
            required
            defaultValue={bugun}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Görüşen</label>
          <select
            name="ziyaretiYapan"
            defaultValue={varsayilanYapan}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          >
            {kisiler.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri *</label>
          <select
            name="musteriId"
            value={musteriId}
            onChange={(e) => {
              const yeni = e.target.value;
              setMusteriId(yeni);
              // Seçili proje başka bir müşteriye aitse proje seçimini kaldır
              const p = projeler.find((x) => x.id === projeId);
              if (p && yeni && p.musteriId !== yeni) setProjeId("");
            }}
            required={!projeId}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium"
          >
            <option value="">— Müşteri seçin —</option>
            {musteriler.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ad}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">
            Proje {musteriId ? `(${gorunenProjeler.length} proje)` : "(opsiyonel)"}
          </label>
          <select
            name="projeId"
            value={projeId}
            onChange={(e) => {
              const yeni = e.target.value;
              setProjeId(yeni);
              // Proje seçilince müşterisi otomatik gelsin
              const p = projeler.find((x) => x.id === yeni);
              if (p?.musteriId) setMusteriId(p.musteriId);
            }}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">— Proje yok —</option>
            {gorunenProjeler.map((p) => (
              <option key={p.id} value={p.id}>
                {p.ad}
                {!musteriId && p.musteriId ? ` · ${musteriAd(p.musteriId) ?? ""}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-metin/60 mb-1">Görüşme Notu *</label>
        <textarea
          name="not"
          required
          rows={3}
          placeholder="Görüşme özeti, konuşulanlar, izlenimler..."
          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
        />
      </div>

      <HatirlatmaSecici />

      <div className="flex justify-end">
        <KaydetButonu basari="Görüşme kaydedildi."
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          Kaydet
        </KaydetButonu>
      </div>
    </form>
  );
}
