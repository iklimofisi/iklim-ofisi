"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// PANEL SOL MENÜSÜ — açılır gruplar
// Bulunulan sayfanın grubu her zaman açıktır; diğer grupların açık / kapalı
// durumu tarayıcıda hatırlanır. Kapalı grubun başlığında içindeki rozetlerin
// toplamı görünür (ör. okunmamış web talepleri).
// -----------------------------------------------------------------------------

export type MenuOgesi = { href: string; label: string };
export type MenuGrubu = { baslik: string | null; ogeler: MenuOgesi[] };

const ANAHTAR = "panel-menu-gruplari";

export function aktifMi(pathname: string, href: string) {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(href + "/");
}

export function useMenuDurumu(gruplar: MenuGrubu[]) {
  const pathname = usePathname() ?? "";
  const [acik, setAcik] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const k = window.localStorage.getItem(ANAHTAR);
      if (k) setAcik(JSON.parse(k));
    } catch {
      /* tarayıcı depolaması kapalı olabilir */
    }
  }, []);
  const degistir = (baslik: string, deger: boolean) => {
    setAcik((a) => {
      const yeni = { ...a, [baslik]: deger };
      try {
        window.localStorage.setItem(ANAHTAR, JSON.stringify(yeni));
      } catch {
        /* yok say */
      }
      return yeni;
    });
  };
  const grupAcikMi = (g: MenuGrubu) => {
    if (!g.baslik) return true;
    if (g.ogeler.some((o) => aktifMi(pathname, o.href))) return true;
    return acik[g.baslik] ?? false;
  };
  return { pathname, grupAcikMi, degistir };
}

function Rozet({ n }: { n: number }) {
  if (!n) return null;
  return <span className="text-xs bg-sicak text-white rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center font-bold">{n}</span>;
}

export default function PanelYanMenu({ gruplar, rozetler }: { gruplar: MenuGrubu[]; rozetler: Record<string, number> }) {
  const { pathname, grupAcikMi, degistir } = useMenuDurumu(gruplar);
  return (
    <nav className="flex-1 px-3 pt-4 pb-6 space-y-1" aria-label="Panel menüsü">
      {gruplar.map((g, gi) => {
        const acik = grupAcikMi(g);
        const toplam = g.ogeler.reduce((t, o) => t + (rozetler[o.href] ?? 0), 0);
        const aktifGrup = g.ogeler.some((o) => aktifMi(pathname, o.href));
        return (
          <div key={g.baslik ?? `g${gi}`} className={g.baslik ? "pt-1" : ""}>
            {g.baslik && (
              <button
                type="button"
                onClick={() => degistir(g.baslik!, !acik)}
                aria-expanded={acik}
                disabled={aktifGrup}
                className="focus-ring w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider text-metin/45 hover:text-metin disabled:cursor-default"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block transition-transform ${acik ? "rotate-90" : ""}`}>›</span>
                  {g.baslik}
                </span>
                {!acik && <Rozet n={toplam} />}
              </button>
            )}
            {acik && (
              <div className={g.baslik ? "space-y-0.5 mb-1" : "space-y-0.5"}>
                {g.ogeler.map((m) => {
                  const aktif = aktifMi(pathname, m.href);
                  return (
                    <Link
                      key={m.href}
                      href={m.href}
                      aria-current={aktif ? "page" : undefined}
                      className={`focus-ring flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        g.baslik ? "pl-6" : ""
                      } ${aktif ? "bg-soguk-light text-soguk-dim" : "text-metin/75 hover:bg-soguk-light hover:text-soguk-dim"}`}
                    >
                      {m.label}
                      <Rozet n={rozetler[m.href] ?? 0} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
