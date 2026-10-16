import { NextRequest, NextResponse } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { kayaListesiniGuncelle } from "@/lib/kaya-fiyat-sunucu";

// -----------------------------------------------------------------------------
// KAYA İKLİMLENDİRME FİYAT LİSTESİ — GÜNLÜK KONTROL
// Vercel her sabah bu adresi çağırır (vercel.json → crons). Kaya yeni liste
// yayınladıysa (PDF dosyası değiştiyse) fiyat listemiz yenilenir ve e-posta gider;
// değişmediyse yalnız "son kontrol" zamanı yazılır.
// Güvenlik: yalnızca Vercel'in gizli anahtarıyla (CRON_SECRET) ya da panele
// yönetici olarak giriş yapmış biri çalıştırabilir.
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const gizli = process.env.CRON_SECRET;
  const cronIstegi = Boolean(gizli) && req.headers.get("authorization") === `Bearer ${gizli}`;
  if (!cronIstegi) {
    const k = await suankiKullanici();
    if (k?.rol !== "ADMIN") return new NextResponse("Yetkisiz", { status: 401 });
  }
  const sonuc = await kayaListesiniGuncelle({ zorla: false, tetikleyen: cronIstegi ? "Otomatik (günlük kontrol)" : "Yönetici (cron adresi)" });
  return NextResponse.json(sonuc, { status: sonuc.durum === "HATA" ? 500 : 200 });
}
