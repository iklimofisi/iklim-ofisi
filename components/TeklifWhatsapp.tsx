"use client";

import { useState } from "react";
import { teklifPaylasimOlustur, teklifPaylasimIptal } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";
import { bildirimGoster } from "@/lib/bildirim";
import { whatsappLinki, whatsappNumarasi } from "@/lib/gorusme";

// Teklif sayfasında "WhatsApp ile Gönder" bölümü.
// 1) Gizli link oluşturulur (bir kez). 2) Telefon ve mesaj kontrol edilir.
// 3) "WhatsApp'ta Aç" → WhatsApp hazır mesajla açılır, gönder'e basmak yeterli.
export default function TeklifWhatsapp({
  teklifId,
  link,
  telefon,
  hitapAd,
  teklifKodu,
  firma,
  goruntulenme,
  sonGoruntulenme,
  olusturma,
}: {
  teklifId: string;
  link: string | null;
  telefon: string;
  hitapAd: string;
  teklifKodu: string;
  firma: string;
  goruntulenme: number;
  sonGoruntulenme: string | null; // biçimlenmiş tarih
  olusturma: string | null;
}) {
  const [tel, setTel] = useState(telefon);
  const [mesaj, setMesaj] = useState(
    `Merhaba ${hitapAd},\n\n${firma} olarak hazırladığımız ${teklifKodu} numaralı fiyat teklifimizi aşağıdaki bağlantıdan inceleyebilir, uygun bulursanız aynı sayfadan onaylayabilirsiniz:\n${link ?? "[link]"}\n\nSorularınız için bize her zaman ulaşabilirsiniz.\nİyi çalışmalar dileriz.`
  );

  if (!link) {
    return (
      <form action={teklifPaylasimOlustur} className="space-y-3">
        <input type="hidden" name="teklifId" value={teklifId} />
        <p className="text-sm text-metin/70">
          Müşteriye özel, tahmin edilemez bir link oluşturulur. Müşteri linke tıklayınca teklifin özetini görür ve PDF&apos;ini
          açar / indirir. Linki istediğiniz an iptal edebilirsiniz.
        </p>
        <KaydetButonu
          basari={null}
          bekleme="Oluşturuluyor…"
          className="focus-ring bg-[#1fa855] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#178a45] transition-colors"
        >
          🔗 Müşteri linki oluştur
        </KaydetButonu>
      </form>
    );
  }

  const numara = whatsappNumarasi(tel);
  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(link);
      bildirimGoster("Link kopyalandı.");
    } catch {
      window.prompt("Linki kopyalayın:", link);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-metin/60 mb-1">Teklif linki</label>
        <div className="flex gap-2">
          <input readOnly value={link} onFocus={(e) => e.target.select()} className="focus-ring flex-1 min-w-0 border border-hat rounded-md px-3 py-2 text-xs font-mono bg-zemin" />
          <button type="button" onClick={kopyala} className="focus-ring shrink-0 text-xs border border-hat bg-white px-3 rounded-md hover:border-soguk">
            Kopyala
          </button>
          <a href={link} target="_blank" rel="noopener" className="focus-ring shrink-0 text-xs border border-hat bg-white px-3 rounded-md hover:border-soguk flex items-center">
            Önizle
          </a>
        </div>
        <p className="text-[11px] text-metin/50 mt-1">
          {olusturma && `Oluşturuldu: ${olusturma} · `}
          {goruntulenme > 0 ? (
            <span className="text-emerald-700 font-medium">
              👁 Müşteri {goruntulenme} kez açtı{sonGoruntulenme && ` (son: ${sonGoruntulenme})`}
            </span>
          ) : (
            "Müşteri henüz açmadı"
          )}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">WhatsApp numarası</label>
          <input
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="0532 123 45 67"
            inputMode="tel"
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
          <p className={`text-[11px] mt-1 ${numara ? "text-metin/50" : "text-sicak-dim"}`}>
            {numara ? `+${numara}` : tel.trim() ? "Numara tanınmadı" : "Boş bırakırsanız WhatsApp'ta kişiyi siz seçersiniz"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-metin/60 mb-1">Mesaj</label>
          <textarea
            value={mesaj}
            onChange={(e) => setMesaj(e.target.value)}
            rows={8}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href={whatsappLinki(tel, mesaj)}
          target="_blank"
          rel="noopener"
          className="focus-ring inline-flex items-center gap-2 bg-[#1fa855] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#178a45] transition-colors"
        >
          💬 WhatsApp&apos;ta Aç ve Gönder
        </a>
        <form
          action={teklifPaylasimIptal}
          onSubmit={(e) => {
            if (!window.confirm("Link iptal edilsin mi? Müşteriye gönderdiğiniz eski link artık açılmaz.")) e.preventDefault();
          }}
        >
          <input type="hidden" name="teklifId" value={teklifId} />
          <KaydetButonu basari={null} bekleme="İptal ediliyor…" className="focus-ring text-xs text-red-700 hover:underline">
            Linki iptal et
          </KaydetButonu>
        </form>
      </div>
    </div>
  );
}
