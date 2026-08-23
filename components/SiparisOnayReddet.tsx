"use client";

import { useState, useTransition } from "react";
import { siparisOnayla, siparisReddet } from "@/lib/actions";

export default function SiparisOnayReddet({ siparisId }: { siparisId: string }) {
  const [pending, startTransition] = useTransition();
  const [redFormuAcik, setRedFormuAcik] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("Bu siparişi onaylıyor musun? Onaylandığında müşteri cari hesabına borç olarak işlenecek.")) {
              startTransition(() => siparisOnayla(siparisId));
            }
          }}
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors disabled:opacity-50"
        >
          {pending ? "İşleniyor…" : "Onayla"}
        </button>
        <button
          type="button"
          onClick={() => setRedFormuAcik((v) => !v)}
          className="focus-ring border border-hat px-5 py-2 rounded-md text-sm font-medium text-metin/70 hover:border-sicak hover:text-sicak-dim transition-colors"
        >
          Reddet
        </button>
      </div>

      {redFormuAcik && (
        <form action={siparisReddet} className="flex flex-wrap gap-3 items-start">
          <input type="hidden" name="siparisId" value={siparisId} />
          <input
            name="redSebebi"
            required
            placeholder="Red sebebi (örn. bütçe uygun değil)"
            className="focus-ring flex-1 min-w-[220px] border border-hat rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="focus-ring bg-sicak text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-sicak-dim transition-colors"
          >
            Reddi Onayla
          </button>
        </form>
      )}
    </div>
  );
}
