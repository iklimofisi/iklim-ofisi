"use client";

import { useRouter } from "next/navigation";

export default function TedarikciFiltre({
  tedarikciler,
  secili,
}: {
  tedarikciler: { id: string; ad: string }[];
  secili: string;
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={secili}
      onChange={(e) => {
        const deger = e.target.value;
        router.push(deger === "hepsi" ? "/panel/satinalma/cari" : `/panel/satinalma/cari?tedarikci=${deger}`);
      }}
      className="focus-ring border border-hat rounded-md px-3 py-2 text-sm"
    >
      <option value="hepsi">Tüm Tedarikçiler</option>
      {tedarikciler.map((t) => (
        <option key={t.id} value={t.id}>
          {t.ad}
        </option>
      ))}
    </select>
  );
}
