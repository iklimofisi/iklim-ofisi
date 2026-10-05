"use client";

import { useState } from "react";

// Görüşme formlarındaki "hatırlatma kur" bölümü.
// Hızlı düğmeler (Yarın / 3 gün / 1 hafta / 2 hafta / 1 ay) tarihi otomatik doldurur;
// istenirse tarih elle de seçilebilir. O sabah 08:00'de e-posta ile hatırlatılır.
const HIZLI = [
  { ad: "Yarın", gun: 1 },
  { ad: "3 gün", gun: 3 },
  { ad: "1 hafta", gun: 7 },
  { ad: "2 hafta", gun: 14 },
  { ad: "1 ay", gun: 30 },
];

// Türkiye saatine göre bugün + n gün (YYYY-MM-DD)
function ileriTarih(n: number) {
  const bugun = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
  const d = new Date(`${bugun}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function HatirlatmaSecici({ sifirla = 0 }: { sifirla?: number }) {
  return <Ic key={sifirla} />;
}

function Ic() {
  const [acik, setAcik] = useState(false);
  const [tarih, setTarih] = useState("");

  const sec = (gun: number) => {
    setAcik(true);
    setTarih(ileriTarih(gun));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-metin/80 mr-1">
          <input
            type="checkbox"
            checked={acik}
            onChange={(e) => {
              setAcik(e.target.checked);
              if (!e.target.checked) setTarih("");
            }}
            className="accent-soguk"
          />
          ⏰ Hatırlat:
        </label>
        {HIZLI.map((h) => {
          const secili = acik && tarih === ileriTarih(h.gun);
          return (
            <button
              key={h.gun}
              type="button"
              onClick={() => sec(h.gun)}
              className={`focus-ring text-xs px-2.5 py-1 rounded-full border transition-colors ${
                secili ? "bg-sicak-dim text-white border-sicak-dim font-medium" : "bg-white border-hat text-metin/70 hover:border-sicak"
              }`}
            >
              {h.ad}
            </button>
          );
        })}
      </div>

      {acik && (
        <div className="grid sm:grid-cols-2 gap-3 bg-sicak-light rounded-md p-3">
          <div>
            <label className="block text-xs font-medium text-sicak-dim mb-1">Hatırlatma Tarihi</label>
            <input
              name="hatirlatmaTarihi"
              type="date"
              required
              value={tarih}
              min={ileriTarih(0)}
              onChange={(e) => setTarih(e.target.value)}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-sicak-dim mb-1">Ne hatırlatılsın? (opsiyonel)</label>
            <input
              name="hatirlatmaNotu"
              maxLength={300}
              placeholder="örn. tekrar ara, teklif sonucunu sor"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <p className="sm:col-span-2 text-[11px] text-sicak-dim">
            O gün sabah 08:00&apos;de e-posta gelir; panelde de hatırlatmalar listesinde görünür.
          </p>
        </div>
      )}
    </div>
  );
}
