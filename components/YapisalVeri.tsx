// -----------------------------------------------------------------------------
// YAPISAL VERİ (schema.org JSON-LD)
// Google'a "bu sayfa kimin, hangi ürün, hangi makale" bilgisini makinenin
// okuyacağı biçimde verir. Görünmez; sayfanın görünüşünü değiştirmez.
// Firma adı, adres, telefon ve e-posta PANELDEKİ şirket bilgilerinden gelir.
// -----------------------------------------------------------------------------

export const SITE = "https://iklimofisi.com";

// Metin içinde "</script>" geçse bile sayfayı bozmasın diye "<" kaçırılır
export function JsonLd({ veri }: { veri: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(veri).replace(/</g, "\\u003c") }}
    />
  );
}

// "0541 921 92 23 / 0533 ..." → ["+905419219223", "+905333157264"]
export function telefonlariAyir(ham: string | null | undefined): string[] {
  if (!ham) return [];
  const sade = ham.replace(/[\s().]/g, "");
  let parcalar = sade.split(/[^\d+]+/).filter((p) => p.replace(/\D/g, "").length >= 10);
  if (parcalar.length === 0) {
    const r = ham.replace(/\D/g, "");
    parcalar = r.length >= 10 && r.length <= 13 ? [r] : [];
  }
  return parcalar.map((p) => {
    let r = p.replace(/\D/g, "");
    if (p.startsWith("+")) return `+${r}`;
    if (r.startsWith("00")) r = r.slice(2);
    if (r.length === 11 && r.startsWith("0")) r = "90" + r.slice(1);
    if (r.length === 10) r = "90" + r;
    return `+${r}`;
  });
}

// "Şair Arşi Cad. ... No:6 Kadıköy/İstanbul" → sokak + ilçe + il
export function adresAyir(adres: string | null | undefined) {
  const a = (adres ?? "").trim();
  const m = a.match(/^(.*?)[,\s]*([A-Za-zÇĞİÖŞÜçğıöşü.\- ]+?)\s*\/\s*([A-Za-zÇĞİÖŞÜçğıöşü.\- ]+)\s*$/);
  if (m && m[1].trim()) return { sokak: m[1].trim(), ilce: m[2].trim(), il: m[3].trim() };
  return { sokak: a, ilce: undefined as string | undefined, il: undefined as string | undefined };
}

type Sirket = {
  unvan: string;
  slogan: string | null;
  adres: string | null;
  telefon: string | null;
  email: string | null;
};

export function IsletmeYapisalVerisi({ sirket }: { sirket: Sirket }) {
  const telefonlar = telefonlariAyir(sirket.telefon);
  const adres = adresAyir(sirket.adres);
  const veri: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": `${SITE}/#isletme`,
    name: sirket.unvan,
    url: SITE,
    logo: `${SITE}/logo-icon.png`,
    image: `${SITE}/og-image.png`,
    description:
      sirket.slogan ||
      "VRF merkezi iklimlendirme, klima ve multi klima, ısı pompası, yerden ısıtma, kazan dairesi yenileme, havalandırma ve mekanik tesisat çözümleri.",
    ...(telefonlar[0] ? { telephone: telefonlar[0] } : {}),
    ...(sirket.email ? { email: sirket.email } : {}),
    ...(sirket.adres
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: adres.sokak,
            ...(adres.ilce ? { addressLocality: adres.ilce } : {}),
            ...(adres.il ? { addressRegion: adres.il } : {}),
            addressCountry: "TR",
          },
        }
      : {}),
    areaServed: adres.il ? [adres.il, "Türkiye"] : ["İstanbul", "Türkiye"],
    ...(telefonlar.length
      ? {
          contactPoint: telefonlar.map((t) => ({
            "@type": "ContactPoint",
            telephone: t,
            contactType: "customer service",
            areaServed: "TR",
            availableLanguage: "Turkish",
          })),
        }
      : {}),
  };
  return <JsonLd veri={veri} />;
}
