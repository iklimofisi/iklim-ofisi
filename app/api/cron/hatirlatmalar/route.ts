import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";
import { epostaGonder } from "@/lib/eposta";
import { gorusmeTuru, teklifNoYaz } from "@/lib/gorusme";

// -----------------------------------------------------------------------------
// ZİYARET HATIRLATMALARI — HER SABAH E-POSTA
//
// Vercel her sabah bu adresi otomatik çağırır (vercel.json → crons).
// Güvenlik: yalnızca Vercel'in gizli anahtarıyla (CRON_SECRET) ya da panele
// yönetici olarak giriş yapmış biri çalıştırabilir.
//
// Kime gider: hatırlatmayı içeren görüşmeyi / ziyareti "yapan" kişiye (panel kullanıcısının
// adıyla eşleşirse onun e-postasına). Eşleşmezse şirket bildirim adresine.
// Aynı gün ikinci kez çalışırsa (Vercel bazen tekrar dener) yeniden göndermez.
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PANEL_ADRESI = "https://iklimofisi.com";

function trBugun(): string {
  // YYYY-MM-DD (Türkiye saatiyle bugün)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function htmlGuvenli(m: string) {
  return m.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const trTarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(d);

const normalAd = (s: string | null | undefined) => (s ?? "").trim().toLocaleLowerCase("tr-TR");

export async function GET(req: NextRequest) {
  // --- Yetki ---
  const gizli = process.env.CRON_SECRET;
  const cronIstegi = Boolean(gizli) && req.headers.get("authorization") === `Bearer ${gizli}`;
  let yonetici = false;
  if (!cronIstegi) {
    const k = await suankiKullanici();
    yonetici = k?.rol === "ADMIN";
    if (!yonetici) return new NextResponse("Yetkisiz", { status: 401 });
  }

  const bugun = trBugun();

  // --- Aynı gün iki kez gönderme ---
  const dahaOnce = await prisma.islemKaydi
    .findFirst({ where: { islem: "hatirlatmaEpostasi", hedefId: bugun }, select: { id: true } })
    .catch(() => null);
  if (dahaOnce) return NextResponse.json({ durum: "bugün zaten gönderildi", tarih: bugun });

  // Hatırlatma tarihleri gün olarak (UTC gece yarısı) saklanır
  const bugunSinir = new Date(`${bugun}T00:00:00.000Z`);

  const [hatirlatmalar, kullanicilar] = await Promise.all([
    prisma.ziyaret.findMany({
      where: { hatirlatmaTamam: false, hatirlatmaTarihi: { lte: bugunSinir, not: null } },
      include: {
        musteri: { select: { id: true, ad: true } },
        proje: { select: { id: true, ad: true } },
        teklif: { select: { id: true, teklifNo: true, baslik: true } },
      },
      orderBy: { hatirlatmaTarihi: "asc" },
    }),
    prisma.kullanici.findMany({ select: { ad: true, email: true } }),
  ]);

  if (hatirlatmalar.length === 0) {
    return NextResponse.json({ durum: "hatırlatma yok", tarih: bugun });
  }

  // Kişiye göre grupla ("" = eşleşmeyenler → bildirim adresi)
  const gruplar = new Map<string, { ad: string; email: string | null; liste: typeof hatirlatmalar }>();
  for (const h of hatirlatmalar) {
    const kul = kullanicilar.find((k) => normalAd(k.ad) === normalAd(h.olusturanAdi));
    const anahtar = kul?.email ?? "";
    if (!gruplar.has(anahtar)) gruplar.set(anahtar, { ad: kul?.ad ?? "Ekip", email: kul?.email ?? null, liste: [] });
    gruplar.get(anahtar)!.liste.push(h);
  }

  const sonuc: { alici: string; adet: number; basarili: boolean; hata?: string }[] = [];

  for (const g of gruplar.values()) {
    const satirlar = g.liste
      .map((h) => {
        const gecikti = h.hatirlatmaTarihi! < bugunSinir;
        const kimle = [h.musteri?.ad, h.proje?.ad].filter(Boolean).map((x) => htmlGuvenli(x!)).join(" · ") || "—";
        const tur = gorusmeTuru(h.tur);
        const teklifSatiri = h.teklif
          ? `<br/><span style="color:#64748b;font-size:12px">Teklif: ${teklifNoYaz(h.teklif.teklifNo)}${h.teklif.baslik ? ` — ${htmlGuvenli(h.teklif.baslik)}` : ""}</span>`
          : "";
        const link = h.teklif
          ? `${PANEL_ADRESI}/panel/teklifler/${h.teklif.id}#gorusmeler`
          : h.musteri
          ? `${PANEL_ADRESI}/panel/musteriler/${h.musteri.id}#gorusmeler`
          : h.proje
          ? `${PANEL_ADRESI}/panel/projeler/${h.proje.id}`
          : `${PANEL_ADRESI}/panel/ziyaretler`;
        const kimYapti = g.email ? "" : ` <span style="color:#94a3b8">(${htmlGuvenli(h.olusturanAdi || "—")})</span>`;
        return `
          <tr>
            <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;white-space:nowrap;font-family:monospace;color:${gecikti ? "#b45309" : "#0f766e"}">
              ${trTarih(h.hatirlatmaTarihi!)}${gecikti ? "<br/><small>gecikti</small>" : ""}
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0">
              <b>${kimle}</b>${kimYapti}${teklifSatiri}<br/>
              ${htmlGuvenli(h.hatirlatmaNotu || h.not).replace(/\n/g, "<br/>")}
              ${h.hatirlatmaNotu && h.hatirlatmaNotu !== h.not ? `<br/><span style="color:#64748b;font-size:12px">${tur.ad} notu: ${htmlGuvenli(h.not).replace(/\n/g, "<br/>")}</span>` : ""}
              <br/><a href="${link}" style="color:#0f766e;font-size:12px">Panelde aç →</a>
            </td>
          </tr>`;
      })
      .join("");

    const icerikHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; color:#334155">
        <h2 style="color:#0f766e;margin-top:0">⏰ Bugünkü hatırlatmalarınız (${g.liste.length})</h2>
        <p>Merhaba ${htmlGuvenli(g.ad)}, bugün veya daha önce için kurduğunuz ve henüz tamamlanmamış hatırlatmalar:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${satirlar}</table>
        <p style="margin-top:20px">
          <a href="${PANEL_ADRESI}/panel/ziyaretler" style="background:#0f766e;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px">Görüşmeler sayfasını aç</a>
        </p>
        <p style="font-size:11px;color:#94a3b8">Hatırlatmayı panelde “Tamamlandı” olarak işaretlediğinizde bu listeden çıkar.</p>
      </div>`;

    const s = await epostaGonder({
      konu: `⏰ ${g.liste.length} hatırlatma · ${trTarih(bugunSinir)}`,
      icerikHtml,
      aliciEmail: g.email ?? undefined,
    });
    sonuc.push({ alici: g.email ?? "bildirim adresi", adet: g.liste.length, basarili: s.basarili, hata: s.hata });
  }

  // Gönderildiğini kaydet (aynı gün tekrar gönderilmesin)
  if (sonuc.some((r) => r.basarili)) {
    await prisma.islemKaydi
      .create({
        data: {
          islem: "hatirlatmaEpostasi",
          hedefId: bugun,
          kullaniciAd: cronIstegi ? "Otomatik (her sabah)" : "Yönetici (elle)",
          veri: JSON.stringify(sonuc),
        },
      })
      .catch(() => null);
  }

  return NextResponse.json({ durum: "tamam", tarih: bugun, sonuc });
}
