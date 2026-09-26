// Sağ altta sabit duran "WhatsApp" ve "Ara" butonları (kurumsal sayfalarda).
// Numaralar panelde Ayarlar → Şirket Bilgileri'nden gelir:
//   * WhatsApp numarası girilmemişse WhatsApp butonu çıkmaz.
//   * Telefon boşsa (ya da hâlâ örnek numara duruyorsa) Ara butonu çıkmaz.

const ORNEK_TELEFON = "+90 (216) 450 00 00";

// "0532 123 45 67", "+90 532 123 45 67", "5321234567" → "905321234567"
export function whatsappNumarasi(ham: string | null | undefined): string | null {
  if (!ham) return null;
  let r = ham.replace(/\D/g, "");
  if (r.startsWith("00")) r = r.slice(2);
  if (r.length === 11 && r.startsWith("0")) r = "90" + r.slice(1);
  if (r.length === 10 && r.startsWith("5")) r = "90" + r;
  return r.length >= 11 && r.length <= 15 ? r : null;
}

function telefonLinki(ham: string | null | undefined): string | null {
  if (!ham || ham.trim() === ORNEK_TELEFON) return null;
  const temiz = ham.replace(/[^\d+]/g, "");
  return temiz.replace(/\D/g, "").length >= 10 ? `tel:${temiz}` : null;
}

export default function IletisimButonlari({
  telefon,
  whatsapp,
}: {
  telefon?: string | null;
  whatsapp?: string | null;
}) {
  const wa = whatsappNumarasi(whatsapp);
  const tel = telefonLinki(telefon);
  if (!wa && !tel) return null;

  const mesaj = encodeURIComponent("Merhaba, iklimofisi.com üzerinden ulaşıyorum. Bilgi almak istiyorum.");

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3 print:hidden">
      {tel && (
        <a
          href={tel}
          aria-label="Bizi arayın"
          className="group flex items-center gap-2 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-teal-700 transition-colors h-12 pl-3.5 pr-3.5 sm:pr-5 focus-ring"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h2.3a1 1 0 01.95.68l1.2 3.6a1 1 0 01-.25 1.02L7.6 9.9a14 14 0 006.5 6.5l1.6-1.6a1 1 0 011.02-.25l3.6 1.2a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
            />
          </svg>
          <span className="hidden sm:inline text-sm font-bold">Hemen Arayın</span>
        </a>
      )}
      {wa && (
        <a
          href={`https://wa.me/${wa}?text=${mesaj}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile yazın"
          className="flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-lg shadow-green-900/20 hover:bg-[#1ebe5b] transition-colors h-12 pl-3 pr-3 sm:pr-5 focus-ring"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.01a8.23 8.23 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.22-8.24 8.22zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
          </svg>
          <span className="hidden sm:inline text-sm font-bold">WhatsApp</span>
        </a>
      )}
    </div>
  );
}
