import { NextRequest, NextResponse } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { prisma } from "@/lib/prisma";
import { jpegBoyutu, GORSEL_EN_FAZLA_BAYT } from "@/lib/gorsel";

// Fotoğraf yükleme (panel). Tarayıcı fotoğrafı küçültüp JPEG olarak gönderir.
// Dönüş: { id, genislik, yukseklik }
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const kullanici = await suankiKullanici();
  if (!kullanici) return NextResponse.json({ hata: "Yetkisiz" }, { status: 401 });

  let dosya: File | null = null;
  try {
    dosya = (await req.formData()).get("dosya") as File | null;
  } catch {
    return NextResponse.json({ hata: "Dosya okunamadı" }, { status: 400 });
  }
  if (!dosya || typeof dosya.arrayBuffer !== "function" || dosya.size === 0) {
    return NextResponse.json({ hata: "Dosya yok" }, { status: 400 });
  }
  if (dosya.size > GORSEL_EN_FAZLA_BAYT) return NextResponse.json({ hata: "Fotoğraf çok büyük" }, { status: 413 });

  const veri = new Uint8Array(await dosya.arrayBuffer());
  const boyut = jpegBoyutu(veri);
  if (!boyut) return NextResponse.json({ hata: "Yalnızca JPEG fotoğraf kabul edilir" }, { status: 415 });

  const kayit = await prisma.gorsel.create({
    data: { veri: Buffer.from(veri), tip: "image/jpeg", genislik: boyut.genislik, yukseklik: boyut.yukseklik, boyut: veri.length },
    select: { id: true },
  });
  return NextResponse.json({ id: kayit.id, ...boyut });
}
