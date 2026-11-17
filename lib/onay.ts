// -----------------------------------------------------------------------------
// PANEL ONAY PENCERESİ
// Tarayıcının kendi "iklimofisi.com web sitesinin mesajı" kutusu (window.confirm /
// alert) yerine panelin tasarımında bir pencere açar. Pencereyi panel yerleşimindeki
// <OnayPenceresi /> gösterir. Panel dışında (pencere yoksa) tarayıcının kutusuna düşer.
//
//   if (!(await onayIste("Bu talep silinsin mi?", { tehlikeli: true, onayMetni: "Sil" }))) return;
//   await uyariGoster("Excel dosyası okunamadı.");
// -----------------------------------------------------------------------------
export const ONAY_OLAYI = "panel-onay";

export type OnaySecenekleri = {
  baslik?: string; // pencere başlığı (varsayılan: "Onay" / uyarıda "Bilgi")
  onayMetni?: string; // onay düğmesi (varsayılan: "Tamam")
  iptalMetni?: string; // vazgeç düğmesi (varsayılan: "Vazgeç")
  tehlikeli?: boolean; // silme gibi geri alınamaz işlem: kırmızı düğme, odak "Vazgeç"te
  kutuMetni?: string; // seçilip kopyalanabilen metin (ör. link)
};

export type OnayIstegi = Required<Pick<OnaySecenekleri, "baslik" | "onayMetni" | "tehlikeli">> & {
  mesaj: string;
  iptalMetni: string | null; // null: yalnız "Tamam" (uyarı)
  kutuMetni?: string;
  coz: (sonuc: boolean) => void;
  alindi?: boolean; // pencere isteği aldıysa true olur
  bitti?: boolean; // cevaplandı (çift tıklamada ikinci kez işlenmesin)
};

function iste(istek: Omit<OnayIstegi, "coz">, yedek: () => boolean): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise<boolean>((coz) => {
    const d: OnayIstegi = { ...istek, coz };
    window.dispatchEvent(new CustomEvent<OnayIstegi>(ONAY_OLAYI, { detail: d }));
    if (!d.alindi) coz(yedek()); // pencere yok (panel dışı): tarayıcının kutusu
  });
}

export function onayIste(mesaj: string, s: OnaySecenekleri = {}): Promise<boolean> {
  return iste(
    {
      mesaj,
      baslik: s.baslik ?? "Onay",
      onayMetni: s.onayMetni ?? "Tamam",
      iptalMetni: s.iptalMetni ?? "Vazgeç",
      tehlikeli: s.tehlikeli ?? false,
      kutuMetni: s.kutuMetni,
    },
    () => window.confirm(mesaj)
  );
}

export async function uyariGoster(mesaj: string, s: Omit<OnaySecenekleri, "iptalMetni" | "tehlikeli"> = {}): Promise<void> {
  await iste(
    { mesaj, baslik: s.baslik ?? "Bilgi", onayMetni: s.onayMetni ?? "Tamam", iptalMetni: null, tehlikeli: false, kutuMetni: s.kutuMetni },
    () => {
      window.alert(s.kutuMetni ? `${mesaj}\n\n${s.kutuMetni}` : mesaj);
      return true;
    }
  );
}
