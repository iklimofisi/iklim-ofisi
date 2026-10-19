// -----------------------------------------------------------------------------
// NOT HATIRLATMA MAİLLERİ (sunucu)
// Her sabah 08:00'deki otomatik görev (api/cron/hatirlatmalar) ve not kaydedilirken
// çağrılır. Günü gelmiş, gönderilmemiş, tamamlanmamış hatırlatmalar seçilen
// kişilere mail olarak gider. Aynı hatırlatma iki kez gönderilmez.
// Bu dosya "use server" DEĞİLDİR; yalnız sunucu kodundan çağrılır.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { epostaGonder } from "@/lib/eposta";
import { trSimdi, hatirlatmaVakti, alicilariOku, hatirlatmaYaz } from "@/lib/notlar";

const PANEL_ADRESI = "https://iklimofisi.com/panel/notlar";
const html = (m: string) => m.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type NotGonderimSonucu = { hatirlatma: number; mail: number; hata: number };

export async function notHatirlatmalariniGonder(opt: { id?: string } = {}): Promise<NotGonderimSonucu> {
  const simdi = trSimdi();
  const adaylar = await prisma.panelNotu.findMany({
    where: {
      ...(opt.id ? { id: opt.id } : {}),
      tamamlandi: false,
      hatirlatmaGonderildi: null,
      hatirlatmaGunu: { not: null, lte: simdi.gun },
    },
    orderBy: { hatirlatmaGunu: "asc" },
    take: 200,
  });
  const sonuc: NotGonderimSonucu = { hatirlatma: 0, mail: 0, hata: 0 };

  for (const n of adaylar) {
    if (!hatirlatmaVakti(n.hatirlatmaGunu, simdi)) continue;
    // Önce "gönderildi" işaretlenir: aynı anda iki çalışma olursa ikincisi atlar
    const al = await prisma.panelNotu.updateMany({ where: { id: n.id, hatirlatmaGonderildi: null }, data: { hatirlatmaGonderildi: new Date() } });
    if (al.count !== 1) continue;
    sonuc.hatirlatma++;

    // Gizli notun hatırlatması yalnız yazan kişiye gider
    const idler = n.gizli ? [n.olusturanId] : alicilariOku(n.hatirlatmaAlicilar);
    const kisiler = await prisma.kullanici.findMany({
      where: { id: { in: idler.length ? idler : [n.olusturanId] } },
      select: { email: true, ad: true },
    });

    const zaman = n.hatirlatmaGunu ? hatirlatmaYaz(n.hatirlatmaGunu, n.hatirlatmaSaati) : "";
    const baslik = n.baslik?.trim() || "Not";
    // Gizli notun başlığı konu satırına yazılmaz (mail kayıtları İşlem Geçmişi'nde yöneticiye görünür)
    const konu = n.gizli ? `🔔 Kişisel hatırlatmanız — ${zaman}` : `🔔 Hatırlatma: ${baslik.slice(0, 120)}`;
    const icerikHtml = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:16px;color:#334155">
      <p style="margin:0 0 4px;font-size:12px;color:#0f766e;font-weight:bold;letter-spacing:.04em">HATIRLATMA · ${html(zaman)}</p>
      <h2 style="color:#0f172a;margin:0 0 12px;font-size:18px">${html(baslik)}</h2>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.5;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px">${html(n.icerik)}</div>
      <p style="font-size:12px;color:#64748b;margin:12px 0 0">Notu yazan: ${html(n.olusturanAdi || "-")}${n.gizli ? " · kişisel not (yalnız siz görürsünüz)" : ""}</p>
      <p style="margin-top:18px"><a href="${PANEL_ADRESI}" style="background:#0f766e;color:#fff;padding:9px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold">Notlar sayfasını aç</a></p>
    </div>`;

    let basarili = 0;
    for (const k of kisiler) {
      const r = await epostaGonder({ konu, icerikHtml, aliciEmail: k.email }).catch(() => ({ basarili: false }));
      if (r.basarili) {
        basarili++;
        sonuc.mail++;
      } else sonuc.hata++;
    }
    // Hiçbir mail gidemediyse işaret geri alınır; bir sonraki çalışmada yeniden denenir
    if (!basarili) await prisma.panelNotu.update({ where: { id: n.id }, data: { hatirlatmaGonderildi: null } }).catch(() => null);
  }
  return sonuc;
}
