"use client";

import { useState } from "react";
import { notKaydet } from "@/lib/not-actions";
import KaydetButonu from "@/components/KaydetButonu";

// -----------------------------------------------------------------------------
// NOT / HATIRLATMA FORMU (yeni not ve düzenleme)
// Görünürlük: herkese açık ya da gizli (yalnız yazan görür).
// Hatırlatma: gün + saat; mail "sadece bana" ya da "seçtiğim kişilere" gider.
// Gizli notta hatırlatma yalnız yazana gider.
// -----------------------------------------------------------------------------

export type NotFormVerisi = {
  id?: string;
  baslik?: string | null;
  icerik?: string;
  gizli?: boolean;
  sabit?: boolean;
  hatirlatmaGunu?: string | null;
  hatirlatmaSaati?: string | null;
  alicilar?: string[];
};

export default function NotFormu({
  not,
  kullanicilar,
  benId,
  yarin,
  onIptal,
}: {
  not?: NotFormVerisi;
  kullanicilar: { id: string; ad: string; email: string }[];
  benId: string;
  yarin: string; // YYYY-MM-DD (varsayılan hatırlatma günü)
  onIptal?: () => void;
}) {
  const [gizli, setGizli] = useState(Boolean(not?.gizli));
  const [hatirlatma, setHatirlatma] = useState(Boolean(not?.hatirlatmaGunu));
  const ilkAlicilar = not?.alicilar?.length ? not.alicilar : [benId];
  const herkes = ilkAlicilar.length > 1 || (ilkAlicilar.length === 1 && ilkAlicilar[0] !== benId);
  const [aliciModu, setAliciModu] = useState<"BEN" | "SECILI">(herkes ? "SECILI" : "BEN");
  const [secili, setSecili] = useState<Set<string>>(new Set(herkes ? ilkAlicilar : kullanicilar.map((k) => k.id)));

  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  const etiket = "block text-xs font-medium text-metin/60 mb-1";
  const secim = (aktif: boolean) =>
    `flex-1 cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors ${aktif ? "border-soguk bg-soguk-light text-soguk-dim font-medium" : "border-hat bg-white text-metin/70 hover:border-soguk/50"}`;

  return (
    <form action={notKaydet} className="space-y-4">
      {not?.id && <input type="hidden" name="id" value={not.id} />}
      <div>
        <label className={etiket}>Başlık (opsiyonel)</label>
        <input name="baslik" maxLength={200} defaultValue={not?.baslik ?? ""} placeholder="Ör. ABC İnşaat keşif randevusu" className={kutu} />
      </div>
      <div>
        <label className={etiket}>Not *</label>
        <textarea name="icerik" rows={4} maxLength={20000} defaultValue={not?.icerik ?? ""} placeholder="Notunuzu yazın…" className={kutu} />
      </div>

      {/* GÖRÜNÜRLÜK */}
      <div>
        <p className={etiket}>Kimler görsün?</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className={secim(!gizli)}>
            <input type="radio" name="gorunurluk" value="ACIK" checked={!gizli} onChange={() => setGizli(false)} className="accent-soguk mr-2" />
            👥 Herkese açık <span className="block text-[11px] font-normal text-metin/50 ml-6">Paneldeki bütün kullanıcılar görür</span>
          </label>
          <label className={secim(gizli)}>
            <input type="radio" name="gorunurluk" value="GIZLI" checked={gizli} onChange={() => setGizli(true)} className="accent-soguk mr-2" />
            🔒 Gizli <span className="block text-[11px] font-normal text-metin/50 ml-6">Yalnız siz görürsünüz</span>
          </label>
        </div>
      </div>

      {/* HATIRLATMA */}
      <div className="border border-hat rounded-md p-3 bg-zemin/60 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-metin cursor-pointer">
          <input type="checkbox" name="hatirlatma" value="1" checked={hatirlatma} onChange={(e) => setHatirlatma(e.target.checked)} className="accent-soguk" />
          ⏰ Hatırlatma maili kur
        </label>
        {hatirlatma && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <div>
                <label className={etiket}>Gün *</label>
                <input type="date" name="hatirlatmaGunu" required defaultValue={not?.hatirlatmaGunu ?? yarin} className={kutu} />
              </div>
              <div>
                <label className={etiket}>Saat</label>
                <input type="time" name="hatirlatmaSaati" defaultValue={not?.hatirlatmaSaati ?? "09:00"} className={kutu} />
              </div>
            </div>
            <p className="text-[11px] text-metin/55">
              Mail seçtiğiniz gün <strong>sabah 08:00&apos;de</strong> gider; saat, mailde ve listede &quot;ne zaman&quot; diye yazar. Bugünün tarihini seçerseniz ve
              saat 08:00&apos;i geçtiyse mail kaydettiğiniz anda gider.
            </p>

            {gizli ? (
              <p className="text-xs text-metin/60">🔒 Gizli notun hatırlatması yalnız size gider.</p>
            ) : (
              <div className="space-y-2">
                <p className={etiket}>Mail kime gitsin?</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className={secim(aliciModu === "BEN")}>
                    <input type="radio" name="alicilar" value="BEN" checked={aliciModu === "BEN"} onChange={() => setAliciModu("BEN")} className="accent-soguk mr-2" />
                    Sadece bana
                  </label>
                  <label className={secim(aliciModu === "SECILI")}>
                    <input type="radio" name="alicilar" value="SECILI" checked={aliciModu === "SECILI"} onChange={() => setAliciModu("SECILI")} className="accent-soguk mr-2" />
                    Seçtiğim kişilere
                  </label>
                </div>
                {aliciModu === "SECILI" && (
                  <div className="bg-white border border-hat rounded-md p-3">
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="text-metin/60">
                        {secili.size} / {kullanicilar.length} kişi seçili
                      </span>
                      <span className="space-x-3">
                        <button type="button" onClick={() => setSecili(new Set(kullanicilar.map((k) => k.id)))} className="focus-ring text-soguk-dim hover:underline">
                          Hepsi
                        </button>
                        <button type="button" onClick={() => setSecili(new Set())} className="focus-ring text-metin/60 hover:underline">
                          Hiçbiri
                        </button>
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-1.5">
                      {kullanicilar.map((k) => (
                        <label key={k.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            name="alici"
                            value={k.id}
                            checked={secili.has(k.id)}
                            onChange={(e) =>
                              setSecili((s) => {
                                const y = new Set(s);
                                if (e.target.checked) y.add(k.id);
                                else y.delete(k.id);
                                return y;
                              })
                            }
                            className="accent-soguk"
                          />
                          <span className="truncate">
                            {k.ad}
                            {k.id === benId && <span className="text-metin/45"> (siz)</span>}
                            <span className="block text-[11px] text-metin/45 truncate">{k.email}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {secili.size === 0 && <p className="text-[11px] text-sicak-dim mt-2">Kimse seçilmezse mail yalnız size gider.</p>}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-metin/70 cursor-pointer">
        <input type="checkbox" name="sabit" value="1" defaultChecked={Boolean(not?.sabit)} className="accent-soguk" />
        📌 Listenin başında tut
      </label>

      <div className="flex items-center gap-3">
        <KaydetButonu basari={null}>{not?.id ? "Değişiklikleri Kaydet" : "Notu Kaydet"}</KaydetButonu>
        {onIptal && (
          <button type="button" onClick={onIptal} className="focus-ring text-sm text-metin/60 hover:text-metin">
            Vazgeç
          </button>
        )}
      </div>
    </form>
  );
}
