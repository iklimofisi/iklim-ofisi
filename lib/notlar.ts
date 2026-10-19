// -----------------------------------------------------------------------------
// NOTLAR & HATIRLATMALAR — ortak yardımcılar (sunucu ve tarayıcıda kullanılır)
// Hatırlatma günü/saati Türkiye saatiyle metin olarak saklanır ("2026-10-21", "14:30").
// Mail, seçilen gün sabah 08:00'deki otomatik görevle gider.
// -----------------------------------------------------------------------------

export const HATIRLATMA_SAATI = "08:00"; // otomatik görevin çalıştığı saat (Türkiye)

// Türkiye saatiyle bugün (YYYY-MM-DD) ve şu anki saat (HH:MM)
export function trSimdi(d = new Date()) {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  const saat = g("hour") === "24" ? "00" : g("hour");
  return { gun: `${g("year")}-${g("month")}-${g("day")}`, saat: `${saat}:${g("minute")}` };
}

export const gunGecerli = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : s;
};
export const saatGecerli = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s) ? s : null;
};

// Hatırlatma maili şimdi gönderilmeli mi? (günü geldi ve o günün 08:00'i geçti)
export function hatirlatmaVakti(gun: string | null | undefined, simdi = trSimdi()) {
  if (!gun) return false;
  return gun < simdi.gun || (gun === simdi.gun && simdi.saat >= HATIRLATMA_SAATI);
}

export function alicilariOku(json: string | null | undefined): string[] {
  try {
    const v = JSON.parse(json || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string" && x).slice(0, 200) : [];
  } catch {
    return [];
  }
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
// "21 Ekim 2026 Çarşamba · 14:30"
export function hatirlatmaYaz(gun: string, saat?: string | null) {
  const [y, a, g] = gun.split("-").map(Number);
  const hafta = GUNLER[new Date(Date.UTC(y, a - 1, g)).getUTCDay()];
  return `${g} ${AYLAR[a - 1]} ${y} ${hafta}${saat ? ` · ${saat}` : ""}`;
}
