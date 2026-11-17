"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { yol, type Dil } from "@/lib/dil";

type Kategori = null | "bireysel" | "ticari" | "vrf" | "isi-pompasi";
type VrfTab = "projem-var" | "kesif-istiyorum";

// HESAPLAYICI METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  soru: "Hangi Ürün İçin Hesaplama Yapmak İstiyorsunuz?",
  soruAlt: "Devam etmek için aşağıdaki seçeneklerden birini seçin.",
  bireysel: "Bireysel Klima",
  bireyselAlt: "Duvar tipi ve multi-split klimalar için pratik BTU hesabı.",
  ticari: "Ticari Klima",
  ticariAlt: "Mağaza, ofis ve salon tipi klimalar için kapasite hesabı.",
  vrf: "VRF Sistemleri",
  vrfAlt: "Proje, otel ve plaza iklimlendirme & keşif talebi.",
  isiPompasi: "Isı Pompası",
  isiPompasiAlt: "Villa ve konutlar için yerden ısıtma / güç hesabı.",
  geri: "← Geri Dön",
  vrfBaslik: "VRF Sistem Projelendirme",
  projemVar: "Mevcut Projem Var",
  projemYok: "Projem Yok / Keşif İstiyorum",
  projeMetin: "Mimari veya mekanik projenizi (DWG / PDF / Görsel) ekibimizin incelemesi için lütfen teknik mailimize iletiniz.",
  mailHatti: "Teknik Mail Hattımız:",
  mailKonu: "VRF%20Proje%20Dosyası%20İnceleme%20Talebi",
  mailDugme: "Mail Programını Aç & Dosya Ekle",
  kesifMetin: "Uzman mühendislerimiz binanızı veya şantiyenizi yerinde inceleyerek VRF kapasite hesabını ve borulama şemasını ücretsiz hazırlasın.",
  kesifDugme: "Ücretsiz Keşif Formu Doldurun →",
  ticariEtiket: "TİCARİ İKLİMLENDİRME",
  bireyselEtiket: "BİREYSEL KLİMA",
  kapasiteBaslik: "Kapasite Hesabı Yapın",
  alan: "Mekan / Oda Alanı",
  katKonumu: "Kat Konumu",
  araKat: "Ara Kat",
  zeminKat: "Zemin Kat",
  catiKati: "Çatı Katı / Teras",
  yalitim: "Yalıtım Durumu",
  iyi: "İyi (Mantolamalı)",
  orta: "Orta Standart",
  zayif: "Zayıf / Yalıtımsız",
  gunes: "Güneş Alma",
  gunesOrta: "Orta Güneş Alıyor",
  gunesCok: "Güney / Çok Güneş Alıyor",
  gunesAz: "Kuzey / Az Güneş Alıyor",
  tahmini: "Tahmini Kapasite İhtiyacınız",
  onerilen: "Önerilen Standart Cihaz Kapasitesi:",
  klimaTeklif: "Bu Kapasitede Fiyat Teklifi İsteyin →",
  ipEtiket: "YENİLENEBİLİR ENERJİ & ISITMA",
  ipBaslik: "Isı Pompası Güç Hesabı",
  ipAlan: "Isıtılacak Net Alan",
  ipYalitim: "Yalıtım & Cam Durumu",
  ipIyi: "İyi (Isı Yalıtımlı / Çift Cam)",
  ipOrta: "Orta Yalıtımlı",
  ipZayif: "Eski / Yalıtımsız Bina",
  katTipi: "Kat Tipi",
  mustakil: "Müstakil / Ara Kat Villa",
  teras: "Çatı Katı / Teraslı Villa",
  gerekli: "Gerekli Isı Pompası Kapasitesi",
  onerilenGuc: "Önerilen Cihaz Gücü:",
  ipBirim: "kW Isı Pompası",
  ipTeklif: "Isı Pompası Fiyat Teklifi İsteyin →",
  sayiDili: "tr-TR",
};

type Metin = typeof tr;

const en: Metin = {
  soru: "Which Product Would You Like to Calculate For?",
  soruAlt: "Choose one of the options below to continue.",
  bireysel: "Residential AC",
  bireyselAlt: "Practical BTU calculation for wall-mounted and multi-split air conditioners.",
  ticari: "Commercial AC",
  ticariAlt: "Capacity calculation for shop, office and floor-standing air conditioners.",
  vrf: "VRF Systems",
  vrfAlt: "Project, hotel and office tower air conditioning & site survey request.",
  isiPompasi: "Heat Pump",
  isiPompasiAlt: "Underfloor heating / output calculation for villas and homes.",
  geri: "← Go Back",
  vrfBaslik: "VRF System Design",
  projemVar: "I Have a Project",
  projemYok: "No Project / I Need a Site Survey",
  projeMetin: "Please send your architectural or mechanical drawings (DWG / PDF / image) to our technical e-mail address for our team to review.",
  mailHatti: "Our Technical E-mail:",
  mailKonu: "VRF%20Project%20File%20Review%20Request",
  mailDugme: "Open E-mail & Attach File",
  kesifMetin: "Our expert engineers will inspect your building or site and prepare the VRF capacity calculation and piping diagram free of charge.",
  kesifDugme: "Fill In the Free Site Survey Form →",
  ticariEtiket: "COMMERCIAL AIR CONDITIONING",
  bireyselEtiket: "RESIDENTIAL AIR CONDITIONING",
  kapasiteBaslik: "Calculate the Capacity",
  alan: "Space / Room Area",
  katKonumu: "Floor Position",
  araKat: "Intermediate Floor",
  zeminKat: "Ground Floor",
  catiKati: "Top Floor / Terrace",
  yalitim: "Insulation",
  iyi: "Good (External Insulation)",
  orta: "Average",
  zayif: "Poor / Uninsulated",
  gunes: "Sun Exposure",
  gunesOrta: "Moderate Sun",
  gunesCok: "South-Facing / Lots of Sun",
  gunesAz: "North-Facing / Little Sun",
  tahmini: "Your Estimated Capacity Requirement",
  onerilen: "Recommended Standard Unit Capacity:",
  klimaTeklif: "Request a Quote for This Capacity →",
  ipEtiket: "RENEWABLE ENERGY & HEATING",
  ipBaslik: "Heat Pump Output Calculation",
  ipAlan: "Net Heated Area",
  ipYalitim: "Insulation & Glazing",
  ipIyi: "Good (Insulated / Double Glazing)",
  ipOrta: "Moderately Insulated",
  ipZayif: "Old / Uninsulated Building",
  katTipi: "Building Type",
  mustakil: "Detached / Mid-Floor Villa",
  teras: "Top Floor / Villa with Terrace",
  gerekli: "Required Heat Pump Capacity",
  onerilenGuc: "Recommended Unit Output:",
  ipBirim: "kW Heat Pump",
  ipTeklif: "Request a Heat Pump Quote →",
  sayiDili: "en-US",
};

const de: Metin = {
  soru: "Für welches Produkt möchten Sie rechnen?",
  soruAlt: "Wählen Sie eine der folgenden Optionen, um fortzufahren.",
  bireysel: "Wohnraum-Klima",
  bireyselAlt: "Praktische BTU-Berechnung für Wand- und Multisplit-Klimageräte.",
  ticari: "Gewerbe-Klima",
  ticariAlt: "Leistungsberechnung für Klimageräte in Geschäften, Büros und Sälen.",
  vrf: "VRF-Systeme",
  vrfAlt: "Klimatisierung von Projekten, Hotels und Bürogebäuden & Besichtigungsanfrage.",
  isiPompasi: "Wärmepumpe",
  isiPompasiAlt: "Fußbodenheizungs- / Leistungsberechnung für Villen und Wohnhäuser.",
  geri: "← Zurück",
  vrfBaslik: "VRF-Systemplanung",
  projemVar: "Ich habe Pläne",
  projemYok: "Keine Pläne / Besichtigung gewünscht",
  projeMetin: "Bitte senden Sie Ihre Architektur- oder TGA-Pläne (DWG / PDF / Bild) zur Prüfung durch unser Team an unsere technische E-Mail-Adresse.",
  mailHatti: "Unsere technische E-Mail:",
  mailKonu: "Anfrage%20zur%20Pr%C3%BCfung%20einer%20VRF-Projektdatei",
  mailDugme: "E-Mail öffnen & Datei anhängen",
  kesifMetin: "Unsere Fachingenieure besichtigen Ihr Gebäude oder Ihre Baustelle und erstellen kostenlos die VRF-Leistungsberechnung und das Rohrleitungsschema.",
  kesifDugme: "Formular für kostenlose Besichtigung ausfüllen →",
  ticariEtiket: "GEWERBLICHE KLIMATISIERUNG",
  bireyselEtiket: "WOHNRAUM-KLIMA",
  kapasiteBaslik: "Leistung berechnen",
  alan: "Raum- / Zimmerfläche",
  katKonumu: "Geschosslage",
  araKat: "Zwischengeschoss",
  zeminKat: "Erdgeschoss",
  catiKati: "Dachgeschoss / Terrasse",
  yalitim: "Dämmung",
  iyi: "Gut (Außendämmung)",
  orta: "Durchschnittlich",
  zayif: "Schwach / ungedämmt",
  gunes: "Sonneneinstrahlung",
  gunesOrta: "Mittlere Sonne",
  gunesCok: "Südlage / viel Sonne",
  gunesAz: "Nordlage / wenig Sonne",
  tahmini: "Ihr geschätzter Leistungsbedarf",
  onerilen: "Empfohlene Standard-Geräteleistung:",
  klimaTeklif: "Angebot für diese Leistung anfordern →",
  ipEtiket: "ERNEUERBARE ENERGIE & HEIZUNG",
  ipBaslik: "Wärmepumpen-Leistungsberechnung",
  ipAlan: "Beheizte Nettofläche",
  ipYalitim: "Dämmung & Verglasung",
  ipIyi: "Gut (gedämmt / Doppelverglasung)",
  ipOrta: "Mittel gedämmt",
  ipZayif: "Altbau / ungedämmt",
  katTipi: "Gebäudetyp",
  mustakil: "Freistehend / Villa im Zwischengeschoss",
  teras: "Dachgeschoss / Villa mit Terrasse",
  gerekli: "Erforderliche Wärmepumpenleistung",
  onerilenGuc: "Empfohlene Geräteleistung:",
  ipBirim: "kW Wärmepumpe",
  ipTeklif: "Wärmepumpen-Angebot anfordern →",
  sayiDili: "de-DE",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export default function KapasiteHesaplayici({ dil = "tr" }: { dil?: Dil }) {
  const t = METIN[dil];
  const [seciliKategori, setSeciliKategori] = useState<Kategori>(null);
  const [vrfTab, setVrfTab] = useState<VrfTab>("projem-var");

  // Klima & Isı Pompası Hesaplama State'leri
  const [m2, setM2] = useState<number>(30);
  const [kat, setKat] = useState<string>("ara");
  const [yalitim, setYalitim] = useState<string>("orta");
  const [gunes, setGunes] = useState<string>("orta");

  // KLİMA BTU HESAPLAMA MOTORU
  const klimaSonuc = useMemo(() => {
    let katsayi = seciliKategori === "ticari" ? 500 : 400;

    if (kat === "cati") katsayi += 50;
    if (yalitim === "zayif") katsayi += 60;
    if (gunes === "cok") katsayi += 40;

    const hesaplanan = m2 * katsayi;
    const standartlar = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];
    const enYakin = standartlar.find((b) => b >= hesaplanan) || 60000;

    return { hesaplanan, enYakin };
  }, [m2, kat, yalitim, gunes, seciliKategori]);

  // ISI POMPASI kW HESAPLAMA MOTORU
  const isiPompasiSonuc = useMemo(() => {
    let wattPerM2 = 80;
    if (yalitim === "iyi") wattPerM2 = 60;
    if (yalitim === "zayif") wattPerM2 = 110;
    if (kat === "cati") wattPerM2 += 15;

    const toplamWatt = m2 * wattPerM2;
    const kw = (toplamWatt / 1000).toFixed(1);
    const standartKwList = [6, 8, 10, 12, 14, 16, 20, 24];
    const enYakinKw = standartKwList.find((k) => k >= parseFloat(kw)) || 24;

    return { kw, enYakinKw };
  }, [m2, kat, yalitim]);

  return (
    <div>
      {/* ========================================================= */}
      {/* ADIM 1: ANA KATEGORİ SEÇİM EKRANI (İLK FOTOĞRAFTAKİ GİBİ) */}
      {/* ========================================================= */}
      {seciliKategori === null && (
        <div className="space-y-10 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {t.soru}
            </h1>
            <p className="text-sm text-slate-500">
              {t.soruAlt}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* 1. Bireysel Klima */}
            <button
              onClick={() => setSeciliKategori("bireysel")}
              className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:border-teal-500 hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 h3m10-11l2 2m-2-2v10a1 1 h-3m-6 0a1 1 h3m-6 0a1 1 h-3" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">
                  {t.bireysel}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {t.bireyselAlt}
                </p>
              </div>
            </button>

            {/* 2. Ticari Klima */}
            <button
              onClick={() => setSeciliKategori("ticari")}
              className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:border-teal-500 hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">
                  {t.ticari}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {t.ticariAlt}
                </p>
              </div>
            </button>

            {/* 3. VRF Sistemleri */}
            <button
              onClick={() => setSeciliKategori("vrf")}
              className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:border-teal-500 hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 7M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">
                  {t.vrf}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {t.vrfAlt}
                </p>
              </div>
            </button>

            {/* 4. Isı Pompası */}
            <button
              onClick={() => setSeciliKategori("isi-pompasi")}
              className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:border-teal-500 hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">
                  {t.isiPompasi}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {t.isiPompasiAlt}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADIM 2: VRF SİSTEM PROJELENDİRME (ÜÇÜNCÜ FOTOĞRAFTAKİ GİBİ) */}
      {/* ========================================================= */}
      {seciliKategori === "vrf" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={() => setSeciliKategori(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {t.geri}
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {t.vrfBaslik}
            </h2>

            {/* Sekme Butonları */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
              <button
                onClick={() => setVrfTab("projem-var")}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                  vrfTab === "projem-var"
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.projemVar}
              </button>
              <button
                onClick={() => setVrfTab("kesif-istiyorum")}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                  vrfTab === "kesif-istiyorum"
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.projemYok}
              </button>
            </div>

            {/* Tab 1: Mevcut Projem Var */}
            {vrfTab === "projem-var" && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.projeMetin}
                </p>

                <div className="py-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t.mailHatti}</p>
                  <p className="text-lg font-bold text-teal-700 font-mono">info@iklimofisi.com</p>
                </div>

                <a
                  href={`mailto:info@iklimofisi.com?subject=${t.mailKonu}`}
                  className="inline-block px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {t.mailDugme}
                </a>
              </div>
            )}

            {/* Tab 2: Projem Yok / Keşif İstiyorum */}
            {vrfTab === "kesif-istiyorum" && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.kesifMetin}
                </p>

                <Link
                  href={yol(dil, "/iletisim")}
                  className="inline-block px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {t.kesifDugme}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADIM 3: BİREYSEL VEYA TİCARİ KLİMA HESAPLAMA MOTORU */}
      {/* ========================================================= */}
      {(seciliKategori === "bireysel" || seciliKategori === "ticari") && (
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={() => setSeciliKategori(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {t.geri}
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">
                {seciliKategori === "ticari" ? t.ticariEtiket : t.bireyselEtiket}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                {t.kapasiteBaslik}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Oda Alanı Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <label className="text-slate-700">{t.alan}</label>
                  <span className="text-teal-700 font-bold font-mono text-base">{m2} m²</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={180}
                  value={m2}
                  onChange={(e) => setM2(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                />
              </div>

              {/* Detay Seçimler */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.katKonumu}</label>
                  <select
                    value={kat}
                    onChange={(e) => setKat(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="ara">{t.araKat}</option>
                    <option value="zemin">{t.zeminKat}</option>
                    <option value="cati">{t.catiKati}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.yalitim}</label>
                  <select
                    value={yalitim}
                    onChange={(e) => setYalitim(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="iyi">{t.iyi}</option>
                    <option value="orta">{t.orta}</option>
                    <option value="zayif">{t.zayif}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.gunes}</label>
                  <select
                    value={gunes}
                    onChange={(e) => setGunes(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="orta">{t.gunesOrta}</option>
                    <option value="cok">{t.gunesCok}</option>
                    <option value="az">{t.gunesAz}</option>
                  </select>
                </div>
              </div>

              {/* Sonuç Kutusu */}
              <div className="bg-slate-900 text-white p-6 rounded-xl space-y-3">
                <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                  {t.tahmini}
                </p>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-3xl font-extrabold font-mono text-white">
                      {klimaSonuc.hesaplanan.toLocaleString(t.sayiDili)} BTU/h
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {t.onerilen} <strong className="text-teal-300 font-mono">{klimaSonuc.enYakin.toLocaleString(t.sayiDili)} BTU/h</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <Link
                    href={yol(dil, "/iletisim")}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {t.klimaTeklif}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADIM 4: ISI POMPASI GÜÇ HESAPLAMA MOTORU */}
      {/* ========================================================= */}
      {seciliKategori === "isi-pompasi" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={() => setSeciliKategori(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {t.geri}
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">
                {t.ipEtiket}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                {t.ipBaslik}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Isıtılacak Alan Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <label className="text-slate-700">{t.ipAlan}</label>
                  <span className="text-teal-700 font-bold font-mono text-base">{m2} m²</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={400}
                  value={m2}
                  onChange={(e) => setM2(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                />
              </div>

              {/* Yalıtım Seçimi */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.ipYalitim}</label>
                  <select
                    value={yalitim}
                    onChange={(e) => setYalitim(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="iyi">{t.ipIyi}</option>
                    <option value="orta">{t.ipOrta}</option>
                    <option value="zayif">{t.ipZayif}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.katTipi}</label>
                  <select
                    value={kat}
                    onChange={(e) => setKat(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="ara">{t.mustakil}</option>
                    <option value="cati">{t.teras}</option>
                  </select>
                </div>
              </div>

              {/* Isı Pompası Sonuç Kutusu */}
              <div className="bg-slate-900 text-white p-6 rounded-xl space-y-3">
                <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                  {t.gerekli}
                </p>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-3xl font-extrabold font-mono text-white">
                      {isiPompasiSonuc.kw} kW
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {t.onerilenGuc} <strong className="text-teal-300 font-mono">{isiPompasiSonuc.enYakinKw} {t.ipBirim}</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <Link
                    href={yol(dil, "/iletisim")}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {t.ipTeklif}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}