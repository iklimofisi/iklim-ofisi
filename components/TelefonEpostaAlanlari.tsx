"use client";

import { useState } from "react";
import type { Dil } from "@/lib/dil";

const YAZI: Record<Dil, { telefon: string; eposta: string; telOrnek: string; epostaOrnek: string; not: string }> = {
  tr: { telefon: "Telefon", eposta: "E-posta", telOrnek: "05xx xxx xx xx", epostaOrnek: "ornek@sirket.com", not: "Size dönebilmemiz için telefon veya e-postadan en az birini yazın." },
  en: { telefon: "Phone", eposta: "E-mail", telOrnek: "+90 5xx xxx xx xx", epostaOrnek: "name@company.com", not: "Please enter at least a phone number or an e-mail address so that we can get back to you." },
  de: { telefon: "Telefon", eposta: "E-Mail", telOrnek: "+49 1xx xxxxxxx", epostaOrnek: "name@firma.de", not: "Bitte geben Sie mindestens eine Telefonnummer oder eine E-Mail-Adresse an, damit wir uns bei Ihnen melden können." },
};

// İletişim formu: telefon veya e-postadan EN AZ BİRİ zorunlu.
// Biri doldurulunca diğerinin zorunluluğu kalkar (tarayıcı, göndermeden önce uyarır).
export default function TelefonEpostaAlanlari({ dil = "tr" }: { dil?: Dil }) {
  const y = YAZI[dil];
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-metin mb-1" htmlFor="telefon">
            {y.telefon}
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
            placeholder={y.telOrnek}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-metin mb-1" htmlFor="email">
            {y.eposta}
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
            placeholder={y.epostaOrnek}
          />
        </div>
      </div>
      <p className="text-xs text-metin/40 mt-1">{y.not}</p>
    </div>
  );
}
