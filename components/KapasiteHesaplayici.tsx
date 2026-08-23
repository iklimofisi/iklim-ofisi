"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Kategori = null | "bireysel" | "ticari" | "vrf" | "isi-pompasi";
type VrfTab = "projem-var" | "kesif-istiyorum";

export default function KapasiteHesaplayici() {
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
              Hangi Ürün İçin Hesaplama Yapmak İstiyorsunuz?
            </h1>
            <p className="text-sm text-slate-500">
              Devam etmek için aşağıdaki seçeneklerden birini seçin.
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
                  Bireysel Klima
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Duvar tipi ve multi-split klimalar için pratik BTU hesabı.
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
                  Ticari Klima
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Mağaza, ofis ve salon tipi klimalar için kapasite hesabı.
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
                  VRF Sistemleri
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Proje, otel ve plaza iklimlendirme & keşif talebi.
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
                  Isı Pompası
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Villa ve konutlar için yerden ısıtma / güç hesabı.
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
            ← Geri Dön
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              VRF Sistem Projelendirme
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
                Mevcut Projem Var
              </button>
              <button
                onClick={() => setVrfTab("kesif-istiyorum")}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                  vrfTab === "kesif-istiyorum"
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Projem Yok / Keşif İstiyorum
              </button>
            </div>

            {/* Tab 1: Mevcut Projem Var */}
            {vrfTab === "projem-var" && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mimari veya mekanik projenizi (DWG / PDF / Görsel) ekibimizin incelemesi için lütfen teknik mailimize iletiniz.
                </p>

                <div className="py-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Teknik Mail Hattımız:</p>
                  <p className="text-lg font-bold text-teal-700 font-mono">proje@iklimofisi.com</p>
                </div>

                <a
                  href="mailto:proje@iklimofisi.com?subject=VRF%20Proje%20Dosyası%20İnceleme%20Talebi"
                  className="inline-block px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Mail Programını Aç & Dosya Ekle
                </a>
              </div>
            )}

            {/* Tab 2: Projem Yok / Keşif İstiyorum */}
            {vrfTab === "kesif-istiyorum" && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uzman mühendislerimiz binanızı veya şantiyenizi yerinde inceleyerek VRF kapasite hesabını ve borulama şemasını ücretsiz hazırlasın.
                </p>

                <Link
                  href="/iletisim"
                  className="inline-block px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Ücretsiz Keşif Formu Doldurun →
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
            ← Geri Dön
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">
                {seciliKategori === "ticari" ? "TİCARİ İKLİMLENDİRME" : "BİREYSEL KLİMA"}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                Kapasite Hesabı Yapın
              </h2>
            </div>

            <div className="space-y-6">
              {/* Oda Alanı Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <label className="text-slate-700">Mekan / Oda Alanı</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Kat Konumu</label>
                  <select
                    value={kat}
                    onChange={(e) => setKat(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="ara">Ara Kat</option>
                    <option value="zemin">Zemin Kat</option>
                    <option value="cati">Çatı Katı / Teras</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Yalıtım Durumu</label>
                  <select
                    value={yalitim}
                    onChange={(e) => setYalitim(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="iyi">İyi (Mantolamalı)</option>
                    <option value="orta">Orta Standart</option>
                    <option value="zayif">Zayıf / Yalıtımsız</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Güneş Alma</label>
                  <select
                    value={gunes}
                    onChange={(e) => setGunes(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="orta">Orta Güneş Alıyor</option>
                    <option value="cok">Güney / Çok Güneş Alıyor</option>
                    <option value="az">Kuzey / Az Güneş Alıyor</option>
                  </select>
                </div>
              </div>

              {/* Sonuç Kutusu */}
              <div className="bg-slate-900 text-white p-6 rounded-xl space-y-3">
                <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                  Tahmini Kapasite İhtiyacınız
                </p>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-3xl font-extrabold font-mono text-white">
                      {klimaSonuc.hesaplanan.toLocaleString("tr-TR")} BTU/h
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Önerilen Standart Cihaz Kapasitesi: <strong className="text-teal-300 font-mono">{klimaSonuc.enYakin.toLocaleString("tr-TR")} BTU/h</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <Link
                    href="/iletisim"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Bu Kapasitede Fiyat Teklifi İsteyin →
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
            ← Geri Dön
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">
                YENİLENEBİLİR ENERJİ & ISITMA
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                Isı Pompası Güç Hesabı
              </h2>
            </div>

            <div className="space-y-6">
              {/* Isıtılacak Alan Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <label className="text-slate-700">Isıtılacak Net Alan</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Yalıtım & Cam Durumu</label>
                  <select
                    value={yalitim}
                    onChange={(e) => setYalitim(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="iyi">İyi (Isı Yalıtımlı / Çift Cam)</option>
                    <option value="orta">Orta Yalıtımlı</option>
                    <option value="zayif">Eski / Yalıtımsız Bina</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kat Tipi</label>
                  <select
                    value={kat}
                    onChange={(e) => setKat(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="ara">Müstakil / Ara Kat Villa</option>
                    <option value="cati">Çatı Katı / Teraslı Villa</option>
                  </select>
                </div>
              </div>

              {/* Isı Pompası Sonuç Kutusu */}
              <div className="bg-slate-900 text-white p-6 rounded-xl space-y-3">
                <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                  Gerekli Isı Pompası Kapasitesi
                </p>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-3xl font-extrabold font-mono text-white">
                      {isiPompasiSonuc.kw} kW
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Önerilen Cihaz Gücü: <strong className="text-teal-300 font-mono">{isiPompasiSonuc.enYakinKw} kW Isı Pompası</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <Link
                    href="/iletisim"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Isı Pompası Fiyat Teklifi İsteyin →
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