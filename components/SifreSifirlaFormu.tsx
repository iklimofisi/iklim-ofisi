"use client";

import { useState } from "react";
import { kullaniciSifreSifirla } from "@/lib/actions";

export default function SifreSifirlaFormu({ kullaniciId }: { kullaniciId: string }) {
  const [acik, setAcik] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);

  if (gonderildi) {
    return <span className="text-xs text-soguk-dim">Şifre güncellendi</span>;
  }

  if (!acik) {
    return (
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="focus-ring text-xs text-metin/50 hover:text-soguk-dim"
      >
        Şifre Sıfırla
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await kullaniciSifreSifirla(formData);
        setGonderildi(true);
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="kullaniciId" value={kullaniciId} />
      <input
        name="yeniSifre"
        type="password"
        required
        minLength={6}
        placeholder="yeni şifre"
        className="focus-ring border border-hat rounded-md px-2 py-1 text-xs w-32"
      />
      <button type="submit" className="focus-ring text-xs text-soguk-dim font-medium hover:underline">
        Kaydet
      </button>
      <button type="button" onClick={() => setAcik(false)} className="focus-ring text-xs text-metin/40">
        Vazgeç
      </button>
    </form>
  );
}
