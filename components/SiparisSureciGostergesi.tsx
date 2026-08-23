const adimlar = [
  { deger: "HAZIRLANIYOR", etiket: "Hazırlanıyor" },
  { deger: "FATURALANDI", etiket: "Faturalandı" },
  { deger: "SEVK_EDILDI", etiket: "Sevk Edildi", kismiDeger: "KISMEN_SEVK_EDILDI", kismiEtiket: "Kısmen Sevk Edildi" },
  { deger: "TESLIM_EDILDI", etiket: "Teslim Edildi", kismiDeger: "KISMEN_TESLIM_EDILDI", kismiEtiket: "Kısmen Teslim Edildi" },
] as const;

const siraDegeri: Record<string, number> = {
  HAZIRLANIYOR: 0,
  FATURALANDI: 1,
  KISMEN_SEVK_EDILDI: 2,
  SEVK_EDILDI: 2,
  KISMEN_TESLIM_EDILDI: 3,
  TESLIM_EDILDI: 3,
};

export default function SiparisSureciGostergesi({ durum }: { durum: string }) {
  if (durum === "ONAY_BEKLIYOR" || durum === "REDDEDILDI") return null;

  const suankiSira = durum === "IPTAL" ? -1 : siraDegeri[durum] ?? 0;

  return (
    <div className="flex items-center flex-wrap gap-1 mb-8">
      {adimlar.map((a, i) => {
        const kismiMi = "kismiDeger" in a && durum === a.kismiDeger;
        const aktifMi = durum === a.deger || kismiMi;
        const gecildiMi = durum !== "IPTAL" && i < suankiSira;
        const etiket = kismiMi && "kismiEtiket" in a ? a.kismiEtiket : a.etiket;

        return (
          <div key={a.deger} className="flex items-center">
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                kismiMi
                  ? "bg-sicak-light text-sicak-dim"
                  : aktifMi
                  ? "bg-soguk text-white"
                  : gecildiMi
                  ? "bg-soguk-light text-soguk-dim"
                  : "bg-hat text-metin/40"
              }`}
            >
              {etiket}
            </span>
            {i < adimlar.length - 1 && <span className="w-4 h-px bg-hat mx-1" />}
          </div>
        );
      })}
      {durum === "IPTAL" && (
        <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-sicak-light text-sicak-dim ml-2">
          İptal Edildi
        </span>
      )}
    </div>
  );
}
