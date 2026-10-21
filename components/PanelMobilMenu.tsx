"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoTam } from "@/components/Logo";
import { cikisYap } from "@/lib/auth-actions";
import KurGostergesi from "@/components/KurGostergesi";
import { aktifMi, useMenuDurumu, type MenuGrubu } from "@/components/PanelYanMenu";

export default function PanelMobilMenu({ gruplar, rozetler }: { gruplar: MenuGrubu[]; rozetler: Record<string, number> }) {
  const [acik, setAcik] = useState(false);
  const { pathname, grupAcikMi, degistir } = useMenuDurumu(gruplar);

  return (
    <div className="sm:hidden border-b border-hat bg-yuzey p-4 flex justify-between items-center print:hidden">
      <Link href="/panel" className="flex items-center gap-2 font-display font-bold text-metin text-base">
        <LogoTam boyut={26} altYazi={false} />
      </Link>

      <div className="ml-auto mr-2">
        <KurGostergesi yon="alt" />
      </div>

      <button
        type="button"
        onClick={() => setAcik(!acik)}
        className="p-2 text-metin/70 hover:text-metin focus-ring rounded-md border border-hat text-xs font-semibold"
      >
        {acik ? "✕ Kapat" : "☰ Menü"}
      </button>

      {acik && (
        <div className="fixed inset-0 top-16 bg-yuzey z-50 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
          <nav className="space-y-3">
            {gruplar.map((g, gi) => {
              const grupAcik = grupAcikMi(g);
              const toplam = g.ogeler.reduce((t, o) => t + (rozetler[o.href] ?? 0), 0);
              return (
                <div key={g.baslik ?? `g${gi}`} className="space-y-2">
                  {g.baslik && (
                    <button
                      type="button"
                      onClick={() => degistir(g.baslik!, !grupAcik)}
                      aria-expanded={grupAcik}
                      className="w-full flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-metin/50"
                    >
                      <span>
                        {grupAcik ? "▾" : "▸"} {g.baslik}
                      </span>
                      {!grupAcik && toplam > 0 && <span className="text-xs bg-sicak text-white rounded-full px-2 py-0.5 font-bold">{toplam}</span>}
                    </button>
                  )}
                  {grupAcik &&
                    g.ogeler.map((m) => (
                      <Link
                        key={m.href}
                        href={m.href}
                        onClick={() => setAcik(false)}
                        className={`flex items-center justify-between p-3 rounded-lg text-sm font-semibold border border-hat/50 hover:bg-slate-50 ${
                          aktifMi(pathname, m.href) ? "bg-soguk-light text-soguk-dim" : "text-metin"
                        }`}
                      >
                        <span>{m.label}</span>
                        {rozetler[m.href] > 0 && <span className="text-xs bg-sicak text-white rounded-full px-2 py-0.5 font-bold">{rozetler[m.href]}</span>}
                      </Link>
                    ))}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-hat pt-4 space-y-3">
            <Link
              href="/panel/profil"
              onClick={() => setAcik(false)}
              className="block p-3 rounded-lg bg-soguk-light/30 border border-soguk/20 text-xs font-bold text-soguk-dim"
            >
              ⚙️ Profilim & Şifre Değiştir
            </Link>

            <Link
              href="/"
              onClick={() => setAcik(false)}
              className="block p-3 rounded-lg border border-hat text-xs font-semibold text-metin/70 text-center"
            >
              ← Kurumsal Siteye Dön
            </Link>

            <form action={cikisYap}>
              <button
                type="submit"
                className="w-full p-3 rounded-lg bg-sicak-dim/10 text-sicak-dim text-xs font-bold text-center border border-sicak-dim/20"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}