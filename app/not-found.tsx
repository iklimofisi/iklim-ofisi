import Link from "next/link";
import { LogoTam } from "@/components/Logo";
import { yol } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";
import { SITE_METNI } from "@/lib/site-metin";

export default function NotFound() {
  const dil = dilAl();
  const t = SITE_METNI[dil].bulunamadi;
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex justify-center">
          <LogoTam boyut={44} altYaziMetni={SITE_METNI[dil].logoAltYazi} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-teal-700 font-mono bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t.etiket}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 pt-2">{t.baslik}</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t.metin}
          </p>
        </div>

        <div>
          <Link
            href={yol(dil, "/")}
            className="inline-block w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            {t.don}
          </Link>
        </div>
      </div>
    </div>
  );
}