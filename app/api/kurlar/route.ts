import { NextResponse } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { getTcmbKurlari } from "@/lib/kur";

// Panel kenar çubuğundaki "Döviz Kurları" kutusu için TCMB efektif satış kurları.
// Sayfa açılınca tarayıcı ayrıca ister; TCMB yavaşsa sayfanın açılması beklemez.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await suankiKullanici())) return NextResponse.json({ hata: "Yetkisiz" }, { status: 401 });
  const kurlar = await getTcmbKurlari();
  return NextResponse.json({ kurlar }, { headers: { "Cache-Control": "private, max-age=300" } });
}
