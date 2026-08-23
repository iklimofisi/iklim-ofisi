"use client";

import { useRouter } from "next/navigation";

export default function CariFiltre({
  musteriler,
  secili,
}: {
  musteriler: { id: string; ad: string }[];
  secili: string;
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={secili}
      onChange={(e) => {
        const deger = e.target.value;
        router.push(deger === "hepsi" ? "/panel/cari" : `/panel/cari?musteri=${deger}`);
      }}
      className="focus-ring border border-hat rounded-md px-3 py-2 text-sm"
    >
      <option value="hepsi">Tüm Müşteriler</option>
      {musteriler.map((m) => (
        <option key={m.id} value={m.id}>
          {m.ad}
        </option>
      ))}
    </select>
  );
}
