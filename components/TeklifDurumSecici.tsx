"use client";

import { useTransition } from "react";
import { teklifDurumGuncelle } from "@/lib/actions";

const durumlar = [
  { deger: "BEKLEMEDE", etiket: "Beklemede" },
  { deger: "ONAYLANDI", etiket: "Onaylandı" },
  { deger: "REDDEDILDI", etiket: "Reddedildi" },
] as const;

export default function TeklifDurumSecici({
  teklifId,
  mevcutDurum,
}: {
  teklifId: string;
  mevcutDurum: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={mevcutDurum}
      disabled={pending}
      onChange={(e) => {
        const yeni = e.target.value as "BEKLEMEDE" | "ONAYLANDI" | "REDDEDILDI";
        startTransition(() => teklifDurumGuncelle(teklifId, yeni));
      }}
      className="focus-ring text-xs border border-hat rounded-md px-2 py-1 bg-white text-metin/70"
    >
      {durumlar.map((d) => (
        <option key={d.deger} value={d.deger}>
          {d.etiket}
        </option>
      ))}
    </select>
  );
}
