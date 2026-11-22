"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bildirimGoster } from "@/lib/bildirim";
import { whatsappLinki, whatsappNumarasi } from "@/lib/gorusme";
import { satinalmaSiparisiEpostaGonder, satinalmaSiparisiWhatsappLinki, satinalmaSiparisiWhatsappKaydet } from "@/lib/satinalma-siparis-actions";
import SonucluForm from "@/components/SonucluForm";

// -----------------------------------------------------------------------------
// SATINALMA SİPARİŞİNİ TEDARİKÇİYE GÖNDER — kanalı kullanıcı seçer:
//  ✉️ E-posta: sipariş PDF'i ekte gider (yanıtlar gönderen personele döner).
//  💬 WhatsApp: PDF'e giden link mesaja eklenir, WhatsApp hazır mesajla açılır; gönder'e kullanıcı basar.
// İstenirse yazılan e-posta / telefon tedarikçi kartına kaydedilir.
// -----------------------------------------------------------------------------
export default function SatinalmaGonder({
  id,
  no,
  tedarikciAd,
  email,
  telefon,
  firma,
  gonderenAd,
  mevcutLink,
}: {
  id: string;
  no: string; // "SAS-0001"
  tedarikciAd: string;
  email: string;
  telefon: string;
  firma: string;
  gonderenAd: string;
  mevcutLink: string | null;
}) {
  const router = useRouter();
  const [kanal, setKanal] = useState<"" | "EPOSTA" | "WHATSAPP">("");
  const [tel, setTel] = useState(telefon);
  const [link, setLink] = useState(mevcutLink);
  const [hazirlaniyor, setHazirlaniyor] = useState(false);
  const [waKaydet, setWaKaydet] = useState(!telefon);

  const varsayilanMesaj = (l: string) =>
    `Merhaba,\n\n${firma} olarak ${no} numaralı satınalma siparişimizi iletiyoruz. Sipariş belgesi (PDF):\n${l}\n\nSiparişi teyit edip teslim tarihini bildirmenizi rica ederiz. Faturada sipariş numarasının yazılmasını rica ederiz.\n\nİyi çalışmalar.\n${gonderenAd}`;
  const [waMesaj, setWaMesaj] = useState(mevcutLink ? varsayilanMesaj(mevcutLink) : "");

  const epostaMesaji = `Merhaba,\n\n${firma} olarak ${no} numaralı satınalma siparişimiz ekteki PDF'tedir.\n\nSiparişi teyit edip teslim tarihini bildirmenizi, faturada sipariş numarasını belirtmenizi rica ederiz.\n\nİyi çalışmalar.\n${gonderenAd}\n${firma}`;

  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  const secimDugmesi = (k: "EPOSTA" | "WHATSAPP", yazi: string, renk: string) => (
    <button
      type="button"
      onClick={() => setKanal(kanal === k ? "" : k)}
      className={`focus-ring text-sm font-medium px-4 py-2 rounded-md border transition-colors ${kanal === k ? `${renk} text-white border-transparent` : "border-hat bg-white hover:bg-hat"}`}
    >
      {yazi}
    </button>
  );

  const linkHazirla = async () => {
    setHazirlaniyor(true);
    try {
      const r = await satinalmaSiparisiWhatsappLinki(id);
      if (r.hata || !r.link) {
        bildirimGoster(r.hata ?? "Link oluşturulamadı.", { hata: true });
        return;
      }
      setLink(r.link);
      setWaMesaj(varsayilanMesaj(r.link));
    } catch {
      bildirimGoster("Link oluşturulamadı; sayfayı yenileyip tekrar deneyin.", { hata: true });
    } finally {
      setHazirlaniyor(false);
    }
  };

  const waKayit = () => {
    const fd = new FormData();
    fd.set("satinalmaSiparisiId", id);
    fd.set("telefon", tel.trim());
    if (waKaydet) fd.set("kartaKaydet", "1");
    satinalmaSiparisiWhatsappKaydet(fd)
      .then(() => router.refresh())
      .catch(() => undefined);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-metin/70 mr-1">Nasıl gönderilsin?</span>
        {secimDugmesi("EPOSTA", "✉️ E-posta ile", "bg-soguk")}
        {secimDugmesi("WHATSAPP", "💬 WhatsApp ile", "bg-[#1fa855]")}
        <a href={`/api/satinalma-siparis/${id}/pdf`} target="_blank" rel="noreferrer" className="focus-ring text-sm text-soguk-dim hover:underline ml-1">
          📄 PDF&apos;i gör
        </a>
      </div>

      {kanal === "EPOSTA" && (
        <SonucluForm action={satinalmaSiparisiEpostaGonder} className="mt-4 space-y-3">
          <input type="hidden" name="satinalmaSiparisiId" value={id} />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Alıcı e-posta ({tedarikciAd})</label>
              <input name="alici" type="email" required defaultValue={email} placeholder="siparis@tedarikci.com" className={kutu} />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Konu</label>
              <input name="konu" required maxLength={200} defaultValue={`Satınalma Siparişi ${no} · ${firma}`} className={kutu} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Mesaj (sipariş PDF&apos;i ekte gider)</label>
            <textarea name="mesaj" rows={7} maxLength={5000} defaultValue={epostaMesaji} className={kutu} />
          </div>
          <label className="flex items-center gap-2 text-xs text-metin/70">
            <input type="checkbox" name="kartaKaydet" value="1" defaultChecked={!email} />
            Bu adresi tedarikçi kartına kaydet (sonraki siparişlerde hazır gelsin)
          </label>
          <p className="text-[11px] text-metin/50">Tedarikçi yanıtladığında yanıt sizin e-posta adresinize gelir.</p>
          <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-60">
            Gönder
          </button>
        </SonucluForm>
      )}

      {kanal === "WHATSAPP" && (
        <div className="mt-4 space-y-3">
          {!link ? (
            <div>
              <p className="text-sm text-metin/70 mb-3">
                Tedarikçiye siparişin PDF&apos;ine giden özel bir link oluşturulur (tahmin edilemez; sipariş iptal edilirse çalışmaz). Belgede müşteri ve satış
                bilgisi yoktur.
              </p>
              <button
                type="button"
                onClick={linkHazirla}
                disabled={hazirlaniyor}
                className="focus-ring bg-[#1fa855] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#178a45] disabled:opacity-60"
              >
                {hazirlaniyor ? "Hazırlanıyor…" : "Mesajı hazırla"}
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçinin WhatsApp numarası</label>
                <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="0532 123 45 67" className={`${kutu} max-w-xs`} />
                {tel.trim() && !whatsappNumarasi(tel) && <p className="text-[11px] text-amber-700 mt-1">Numara anlaşılamadı; WhatsApp açılınca kişiyi kendiniz seçersiniz.</p>}
                {!tel.trim() && <p className="text-[11px] text-metin/50 mt-1">Boş bırakırsanız WhatsApp açılınca kişiyi kendiniz seçersiniz.</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Mesaj</label>
                <textarea value={waMesaj} onChange={(e) => setWaMesaj(e.target.value)} rows={8} className={kutu} />
              </div>
              {tel.trim() && tel.trim() !== telefon && (
                <label className="flex items-center gap-2 text-xs text-metin/70">
                  <input type="checkbox" checked={waKaydet} onChange={(e) => setWaKaydet(e.target.checked)} />
                  Bu numarayı tedarikçi kartına kaydet
                </label>
              )}
              <a
                href={whatsappLinki(tel, waMesaj)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={waKayit}
                className="focus-ring inline-block bg-[#1fa855] text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-[#178a45]"
              >
                💬 WhatsApp&apos;ta aç
              </a>
              <p className="text-[11px] text-metin/50">WhatsApp mesaj hazır açılır; göndermek için WhatsApp&apos;ta gönder tuşuna basın.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
