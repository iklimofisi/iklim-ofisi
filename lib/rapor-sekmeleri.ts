// Raporlar bölümünün sekmeleri (Finans → Raporlar). Yönetim raporu PDF'i yalnız Satış müdürü ve Yönetici içindir.
export function raporSekmeleri(rol: string | null | undefined) {
  return [
    { anahtar: "aylik", href: "/panel/rapor", ad: "Aylık rapor & ay kapanışı" },
    { anahtar: "ciro", href: "/panel/siparisler/raporlar", ad: "Ciro & personel (firma sorumlusu)" },
    ...(rol === "ADMIN" || rol === "YATIRIMCI" ? [{ anahtar: "pdf", href: "/api/rapor/yonetim", ad: "Yönetim raporu PDF", disari: true }] : []),
  ];
}
