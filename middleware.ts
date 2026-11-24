import { NextRequest, NextResponse } from "next/server";

// Site dili: /en/... ve /de/... adresleri Türkçe sayfaya yönlendirilir (rewrite: adres
// çubuğu değişmez), sayfa dili "x-site-dil" başlığından okur (lib/dil-sunucu.ts).
// Dışarıdan gelen "x-site-dil" başlığı her istekte silinir (yalnız buradan konur).
const DIL_BASLIGI = "x-site-dil";
const DIL_YOLU = /^\/(en|de)(\/.*)?$/;
// Yalnız Türkçe olan bölümler: /en/panel gibi adresler Türkçe karşılığına gider
const DILSIZ = /^\/(panel|api|t|f)(\/|$)/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // YÖNETİM PANELİ: oturum kontrolü (değişmedi)
  if (pathname === "/panel" || pathname.startsWith("/panel/")) {
    if (pathname === "/panel/giris") {
      return NextResponse.next();
    }

    const oturumVar = Boolean(req.cookies.get("oturum")?.value);
    if (!oturumVar) {
      const url = req.nextUrl.clone();
      url.pathname = "/panel/giris";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const basliklar = new Headers(req.headers);
  basliklar.delete(DIL_BASLIGI);

  const m = pathname.match(DIL_YOLU);
  if (m) {
    const hedef = m[2] || "/";
    const url = req.nextUrl.clone();
    url.pathname = hedef;
    if (DILSIZ.test(hedef)) return NextResponse.redirect(url);
    basliklar.set(DIL_BASLIGI, m[1]);
    return NextResponse.rewrite(url, { request: { headers: basliklar } });
  }

  return NextResponse.next({ request: { headers: basliklar } });
}

export const config = {
  // Next.js iç dosyaları, API ve uzantılı dosyalar (görseller, sitemap.xml, robots.txt) hariç
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
