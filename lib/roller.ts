// -----------------------------------------------------------------------------
// KULLANICI ROLLERİ
// ADMIN      Yönetici: her şey (onaylar, iptaller, kullanıcılar, dönem açma)
// SATIS      Satış: teklif, müşteri, sipariş, görüşme
// SATINALMA  Satınalma: satış ile aynı yetkiler; satınalma ekranlarının sorumlusu
// MUHASEBE   Muhasebe: satış yetkileri + finansal kayıt iptali ve ay kapanışı
// YATIRIMCI  Yatırımcı: yalnız görüntüler; hiçbir kaydı değiştiremez
// -----------------------------------------------------------------------------
export const ROLLER = ["ADMIN", "SATIS", "SATINALMA", "MUHASEBE", "YATIRIMCI"] as const;
export type Rol = (typeof ROLLER)[number];

export const ROL_ETIKET: Record<string, string> = {
  ADMIN: "Yönetici",
  SATIS: "Satış",
  SATINALMA: "Satınalma",
  MUHASEBE: "Muhasebe",
  YATIRIMCI: "Yatırımcı (salt okunur)",
};

export const gecerliRol = (v: unknown): Rol => (ROLLER as readonly string[]).includes(String(v)) ? (String(v) as Rol) : "SATIS";

// Yalnız görüntüleyebilen rol
export const saltOkunurMu = (rol: string | null | undefined) => rol === "YATIRIMCI";

// Finansal kayıt iptali ve ay kapanışı: yönetici ya da muhasebe
export const finansYetkilisiMi = (rol: string | null | undefined) => rol === "ADMIN" || rol === "MUHASEBE";
