type HizmetTuru = "iklimlendirme" | "isitma" | "radyator" | "havalandirma" | "tesisat";

export default function HizmetIkon({ tur }: { tur: HizmetTuru }) {
  return (
    <div className="w-14 h-14 rounded-xl bg-soguk-light flex items-center justify-center shrink-0">
      <svg width="30" height="30" viewBox="0 0 48 48" fill="none" stroke="#0B646C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {tur === "iklimlendirme" && (
          <>
            <rect x="6" y="10" width="36" height="12" rx="3" />
            <circle cx="13" cy="16" r="1.6" fill="#0B646C" stroke="none" />
            <path d="M12 26c0 4-3 5-3 9M20 26c0 5-3 6-3 11M28 26c0 4 3 5 3 9M36 26c0 5 3 6 3 11" />
          </>
        )}
        {tur === "isitma" && (
          <>
            <path d="M24 6c4 5 6 8 6 12a6 6 0 1 1-12 0c0-2 1-3 2-4 0 2 1 3 2 3 1-3-1-5 2-11z" fill="#E8734A" stroke="#E8734A" />
            <path d="M10 40h28M14 34c1 2 2 3 4 3M20 34c1 2 2 3 4 3M26 34c1 2 2 3 4 3M32 34c1 2 2 3 4 3" />
          </>
        )}
        {tur === "radyator" && (
          <>
            <rect x="8" y="10" width="32" height="24" rx="2" />
            <path d="M14 10v24M20 10v24M26 10v24M32 10v24" />
            <path d="M10 40h4M34 40h4" />
          </>
        )}
        {tur === "havalandirma" && (
          <>
            <circle cx="24" cy="24" r="16" />
            <path d="M24 24c0-6 4-9 4-13a4 4 0 1 0-8 0c0 2 1 3 4 4" />
            <path d="M24 24c6 0 9 4 13 4a4 4 0 1 0 0-8c-2 0-3 1-4 4" />
            <path d="M24 24c0 6-4 9-4 13a4 4 0 1 0 8 0c0-2-1-3-4-4" />
            <circle cx="24" cy="24" r="2" fill="#0B646C" stroke="none" />
          </>
        )}
        {tur === "tesisat" && (
          <>
            <path d="M8 16h12v8h12" />
            <rect x="6" y="12" width="8" height="8" rx="1.5" />
            <rect x="30" y="20" width="8" height="8" rx="1.5" />
            <path d="M18 32l4-4 4 4-4 4z" fill="#E8734A" stroke="#E8734A" />
          </>
        )}
      </svg>
    </div>
  );
}
