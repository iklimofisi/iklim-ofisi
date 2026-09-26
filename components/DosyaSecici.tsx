"use client";

// İletişim formundaki dosya alanı: çok büyük ya da desteklenmeyen dosyayı
// göndermeden önce uyarır (sunucu tarafında da aynı kontrol yapılır).
const EN_FAZLA_MB = 4;
const IZINLI = [".pdf", ".dwg", ".dxf", ".jpg", ".jpeg", ".png"];

export default function DosyaSecici() {
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
          if (!IZINLI.includes(uzanti)) hata = "Yalnızca PDF, DWG, DXF, JPG veya PNG dosyası ekleyebilirsiniz.";
          else if (dosya.size > EN_FAZLA_MB * 1024 * 1024)
            hata = `Dosya ${EN_FAZLA_MB} MB'tan büyük. Daha küçük bir dosya seçin ya da dosyayı e-posta ile gönderin.`;
        }
        girdi.setCustomValidity(hata);
        if (hata) girdi.reportValidity();
      }}
      className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey text-sm"
    />
  );
}
