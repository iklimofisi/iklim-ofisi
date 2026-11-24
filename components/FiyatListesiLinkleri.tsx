"use client";

import { useRef } from "react";
import { fiyatListesiLinkOlustur, fiyatListesiLinkIptal } from "@/lib/fiyat-paylasim-actions";
import KaydetButonu from "@/components/KaydetButonu";
import { bildirimGoster } from "@/lib/bildirim";
import { onayIste, uyariGoster } from "@/lib/onay";
import { whatsappLinki } from "@/lib/gorusme";

// Fiyat listesi sayfasında "Müşteri linkleri" bölümü.
// Her kişiye ayrı link: kim kaç kez açtı görülür, istenen kişinin linki tek başına iptal edilir.
// Link listenin O ANKİ hâlini gösterir: fiyat kaydedildiği an müşteri de yeni fiyatı görür.
export type FiyatLinki = {
  id: string;
  alici: string;
  link: string;
  olusturma: string;
  olusturanAdi: string;
  goruntulenme: number;
  sonGoruntulenme: string | null;
};

function LinkSatiri({ l, baslik, firma }: { l: FiyatLinki; baslik: string; firma: string }) {
  const iptalOnaylandi = useRef(false);
  const mesaj = `Merhaba${l.alici ? ` ${l.alici}` : ""},\n\n${firma} güncel "${baslik}" fiyat listemizi aşağıdaki bağlantıdan inceleyebilirsiniz. Bu link her zaman güncel fiyatları gösterir:\n${l.link}\n\nİyi çalışmalar dileriz.`;
  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(l.link);
      bildirimGoster("Link kopyalandı.");
    } catch {
      await uyariGoster("Link otomatik kopyalanamadı. Aşağıdaki linki seçip kopyalayın (Ctrl+C).", { baslik: "Fiyat listesi linki", kutuMetni: l.link });
    }
  };
  return (
    <li className="py-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-metin">{l.alici || "(isimsiz link)"}</p>
        <p className="text-[11px] text-metin/50">
          {l.olusturma}
          {l.olusturanAdi && ` · ${l.olusturanAdi}`} ·{" "}
          {l.goruntulenme > 0 ? (
            <span className="text-emerald-700 font-medium">
              👁 {l.goruntulenme} kez açıldı{l.sonGoruntulenme && ` (son: ${l.sonGoruntulenme})`}
            </span>
          ) : (
            "henüz açılmadı"
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input readOnly value={l.link} onFocus={(e) => e.target.select()} className="focus-ring flex-1 min-w-[200px] border border-hat rounded-md px-3 py-1.5 text-xs font-mono bg-zemin" />
        <button type="button" onClick={kopyala} className="focus-ring text-xs border border-hat bg-white px-3 py-1.5 rounded-md hover:border-soguk">
          Kopyala
        </button>
        <a href={l.link} target="_blank" rel="noopener" className="focus-ring text-xs border border-hat bg-white px-3 py-1.5 rounded-md hover:border-soguk">
          Önizle
        </a>
        <a
          href={whatsappLinki("", mesaj)}
          target="_blank"
          rel="noopener"
          className="focus-ring text-xs bg-[#1fa855] text-white px-3 py-1.5 rounded-md font-medium hover:bg-[#178a45]"
        >
          💬 WhatsApp
        </a>
        <form
          action={fiyatListesiLinkIptal}
          onSubmit={async (e) => {
            if (iptalOnaylandi.current) {
              iptalOnaylandi.current = false;
              return;
            }
            e.preventDefault();
            const form = e.currentTarget;
            if (
              await onayIste(`${l.alici || "Bu kişi"} listeyi artık açamaz. Gerekirse yeni link oluşturabilirsiniz.`, {
                baslik: "Link iptal edilsin mi?",
                onayMetni: "Linki iptal et",
                tehlikeli: true,
              })
            ) {
              iptalOnaylandi.current = true;
              form.requestSubmit();
            }
          }}
        >
          <input type="hidden" name="id" value={l.id} />
          <KaydetButonu basari={null} bekleme="İptal ediliyor…" className="focus-ring text-xs text-red-700 px-2 py-1.5 hover:underline">
            İptal et
          </KaydetButonu>
        </form>
      </div>
    </li>
  );
}

export default function FiyatListesiLinkleri({
  listeId,
  baslik,
  firma,
  linkler,
  izin,
}: {
  listeId: string;
  baslik: string;
  firma: string;
  linkler: FiyatLinki[];
  izin: boolean; // link oluşturma / iptal yetkisi
}) {
  return (
    <details id="musteri-linkleri" open={linkler.length > 0} className="mb-6 bg-yuzey border border-hat rounded-lg scroll-mt-6 print:hidden">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-metin">
        🔗 Müşteri linkleri{linkler.length > 0 && <span className="font-normal text-metin/60"> · {linkler.length} aktif link</span>}
      </summary>
      <div className="px-4 pb-4">
        <p className="text-xs text-metin/60 mb-3">
          Müşteriye bu listenin linkini gönderin. Link her açıldığında listenin <b>son kaydedilen</b> fiyatlarıyla PDF açılır; burada fiyatı
          değiştirip kaydettiğiniz an müşteri de yeni fiyatı görür. Alış fiyatı ve kâr linkte yoktur. Her kişiye ayrı link verin: kimin
          açtığını görür, istediğiniz kişinin linkini tek başına iptal edersiniz.
        </p>
        {izin && (
          <form action={fiyatListesiLinkOlustur} className="flex flex-wrap items-end gap-2 mb-2">
            <input type="hidden" name="listeId" value={listeId} />
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Kime gönderilecek?</label>
              <input name="alici" maxLength={120} placeholder="örn. ABC Yapı · Ahmet Bey" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
            </div>
            <KaydetButonu
              basari={null}
              bekleme="Oluşturuluyor…"
              className="focus-ring bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
            >
              + Link oluştur
            </KaydetButonu>
          </form>
        )}
        {linkler.length > 0 ? (
          <ul className="divide-y divide-hat">
            {linkler.map((l) => (
              <LinkSatiri key={l.id} l={l} baslik={baslik} firma={firma} />
            ))}
          </ul>
        ) : (
          <p className="text-xs text-metin/45">Bu liste için henüz link yok.</p>
        )}
      </div>
    </details>
  );
}
