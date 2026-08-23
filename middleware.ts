import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

export const config = {
  matcher: ["/panel/:path*"],
};
