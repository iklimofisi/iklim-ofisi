"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cikisYap } from "@/lib/auth-actions";

export default function PanelMobilMenu({
  menu,
  rozetler,
}: {
  menu: { href: string; label: string }[];
  rozetler: Record<string, number>;
}) {
  const [acik, setAcik] = useState(false);

  return (
    <div className="sm:hidden border-b border-hat bg-yuzey p-4 flex justify-between items-center print:hidden">
      <Link href="/panel" className="flex items-center gap-2 font-display font-bold text-metin text-base">
        <Image src="/logo-icon.png" alt="İklim Ofisi" width={24} height={24} />
        <span>İklim <span className="text-soguk">Ofisi</span></span>
      </Link>

      <button
        type="button"
        onClick={() => setAcik(!acik)}
        className="p-2 text-metin/70 hover:text-metin focus-ring rounded-md border border-hat text-xs font-semibold"
      >
        {acik ? "✕ Kapat" : "☰ Menü"}
      </button>

      {acik && (
        <div className="fixed inset-0 top-16 bg-yuzey z-50 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
          <nav className="space-y-2">
            {menu.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setAcik(false)}
                className="flex items-center justify-between p-3 rounded-lg text-sm font-semibold text-metin border border-hat/50 hover:bg-slate-50"
              >
                <span>{m.label}</span>
                {rozetler[m.href] > 0 && (
                  <span className="text-xs bg-sicak text-white rounded-full px-2 py-0.5 font-bold">
                    {rozetler[m.href]}
                  </span>
                )}
              </Link>
            ))}
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