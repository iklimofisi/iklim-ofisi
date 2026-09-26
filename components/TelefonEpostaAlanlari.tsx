"use client";

import { useState } from "react";

// İletişim formu: telefon veya e-postadan EN AZ BİRİ zorunlu.
// Biri doldurulunca diğerinin zorunluluğu kalkar (tarayıcı, göndermeden önce uyarır).
export default function TelefonEpostaAlanlari() {
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-metin mb-1" htmlFor="telefon">
            Telefon
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            autoComplete="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            required={!email.trim()}
            className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
            placeholder="05xx xxx xx xx"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-metin mb-1" htmlFor="email">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={!telefon.trim()}
            className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
            placeholder="ornek@sirket.com"
          />
        </div>
      </div>
      <p className="text-xs text-metin/40 mt-1">Size dönebilmemiz için telefon veya e-postadan en az birini yazın.</p>
    </div>
  );
}
