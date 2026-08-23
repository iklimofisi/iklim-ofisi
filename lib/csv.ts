export function csvAlan(deger: unknown): string {
  const s = deger === null || deger === undefined ? "" : String(deger);
  if (s.includes(";") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function csvOlustur(basliklar: string[], satirlar: unknown[][]): string {
  const satirMetinleri = [basliklar, ...satirlar].map((satir) => satir.map(csvAlan).join(";"));
  return "\uFEFF" + satirMetinleri.join("\r\n");
}

export function csvYaniti(dosyaAdi: string, icerik: string): Response {
  return new Response(icerik, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dosyaAdi}"`,
    },
  });
}
