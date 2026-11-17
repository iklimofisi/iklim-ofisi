"use client";

import type { Dil } from "@/lib/dil";

// İletişim formundaki dosya alanı: çok büyük ya da desteklenmeyen dosyayı
// göndermeden önce uyarır (sunucu tarafında da aynı kontrol yapılır).
const EN_FAZLA_MB = 4;
const IZINLI = [".pdf", ".dwg", ".dxf", ".jpg", ".jpeg", ".png"];

const HATA: Record<Dil, { tur: string; boyut: string }> = {
  tr: {
    tur: "Yalnızca PDF, DWG, DXF, JPG veya PNG dosyası ekleyebilirsiniz.",
    boyut: `Dosya ${EN_FAZLA_MB} MB'tan büyük. Daha küçük bir dosya seçin ya da dosyayı e-posta ile gönderin.`,
  },
  en: {
    tur: "You can only attach PDF, DWG, DXF, JPG or PNG files.",
    boyut: `The file is larger than ${EN_FAZLA_MB} MB. Choose a smaller file or send it by e-mail.`,
  },
  de: {
    tur: "Sie können nur PDF-, DWG-, DXF-, JPG- oder PNG-Dateien anhängen.",
    boyut: `Die Datei ist größer als ${EN_FAZLA_MB} MB. Wählen Sie eine kleinere Datei oder senden Sie sie per E-Mail.`,
  },
};

export default function DosyaSecici({ dil = "tr" }: { dil?: Dil }) {
  return (
    <input
      id="dosya"
      name="dosya"
      type="file"
      accept={IZINLI.join(",")}
      onChange={(e) => {
        const girdi = e.currentTarget;
        const dosya = girdi.files?.[0];
        let hata = "";
        if (dosya) {
          const uzanti = dosya.name.toLowerCase().slice(dosya.name.lastIndexOf("."));
          if (!IZINLI.includes(uzanti)) hata = HATA[dil].tur;
          else if (dosya.size > EN_FAZLA_MB * 1024 * 1024) hata = HATA[dil].boyut;
        }
        girdi.setCustomValidity(hata);
        if (hata) girdi.reportValidity();
      }}
      className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey text-sm"
    />
  );
}
