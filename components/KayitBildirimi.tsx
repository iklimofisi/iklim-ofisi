"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BILDIRIM_OLAYI } from "@/lib/bildirim";

// Panelde kaydet/sil sonrası sağ üstte görünen kısa bildirim.
// Sunucu işlemi "?mesaj=..." ile yönlendirir; bildirim birkaç saniye görünür,
// sonra adres çubuğundaki mesaj temizlenir (sayfa yenilenince tekrar çıkmaz).
const MESAJLAR: Record<string, string> = {
  "sablon-eklendi": "Teklif notu eklendi.",
  "sablon-guncellendi": "Teklif notu kaydedildi.",
  "sablon-silindi": "Teklif notu silindi.",
  "sirket-kaydedildi": "Şirket bilgileri kaydedildi.",
  kaydedildi: "Kaydedildi.",
  "eposta-gonderildi": "E-posta gönderildi.",
  "teklif-olusturuldu": "Teklif kaydedildi.",
  "teklif-guncellendi": "Teklif güncellendi.",
  "sozlesme-olusturuldu": "Sözleşme taslağı oluşturuldu.",
  "sozlesme-kaydedildi": "Sözleşme kaydedildi.",
  "sozlesme-kalemler": "Kalemler tekliften yeniden alındı.",
  "sozlesme-silindi": "Sözleşme taslağı silindi.",
  "paylasim-olusturuldu": "Teklif linki oluşturuldu. Şimdi WhatsApp ile gönderebilirsiniz.",
  "fiyat-listesi-kaydedildi": "Fiyat listesi kaydedildi.",
  "fiyat-listesi-kopyalandi": "Fiyat listesi kopyalandı. Şu an kopyayı düzenliyorsunuz.",
  "isi-hesap-kopyalandi": "Hesap kopyalandı. Şu an kopyayı düzenliyorsunuz.",
  "isi-hesap-teklif": "Isı pompası hesabından teklif taslağı oluşturuldu. Fiyatları girip kaydedin.",
  "paylasim-iptal": "Teklif linki iptal edildi; eski link artık açılmaz.",
  "eposta-test-ok": "Deneme e-postası gönderildi. Gelen kutunuzu (ve Spam klasörünü) kontrol edin.",
};

// Hata bildirimleri kırmızı görünür ve daha uzun kalır
const HATALAR: Record<string, string> = {
  "eposta-hatasi": "E-posta GÖNDERİLEMEDİ. Tekrar deneyin; sürerse nedeni Ayarlar → E-posta Durumu bölümünde görünür.",
  "eposta-test-hata": "Deneme e-postası GÖNDERİLEMEDİ. Nedeni aşağıdaki listede yazıyor.",
  "fiyat-listesi-eksik": "Fiyat listesi KAYDEDİLMEDİ: liste adı boş olamaz.",
  "isi-hesap-eksik": "Hesap OLUŞTURULMADI: hesap adı boş olamaz.",
  "isi-hesap-teklif-eksik": "Teklif OLUŞTURULMADI: müşteri ve teklif başlığı seçilmeli, hesapta en az bir oda olmalı.",
  "isi-modeli-eksik": "Model KAYDEDİLMEDİ: marka, model ve üç kapasite değeri (A7/W35, A-7/W35, A-7/W55) zorunludur.",
  "teklif-eksik": "Teklif KAYDEDİLMEDİ: müşteri, başlık veya en az bir açıklamalı kalem eksik.",
  "teklif-kayit-hatasi": "Teklif KAYDEDİLEMEDİ. Nedeni İşlem Geçmişi'nde \"Teklif kaydı BAŞARISIZ\" satırında yazıyor.",
};

export default function KayitBildirimi() {
  const params = useSearchParams();
  const router = useRouter();
  const yol = usePathname();
  const kod = params.get("mesaj");
  const [metin, setMetin] = useState<string | null>(null);
  const [hata, setHata] = useState(false);

  useEffect(() => {
    if (!kod) return;
    const hataMi = Object.prototype.hasOwnProperty.call(HATALAR, kod);
    setHata(hataMi);
    setMetin(hataMi ? HATALAR[kod] : Object.prototype.hasOwnProperty.call(MESAJLAR, kod) ? MESAJLAR[kod] : MESAJLAR.kaydedildi);
    // Adres çubuğundan mesajı kaldır (diğer parametreler kalır)
    const kalan = new URLSearchParams(params.toString());
    kalan.delete("mesaj");
    const q = kalan.toString();
    router.replace(`${yol}${q ? `?${q}` : ""}${typeof window !== "undefined" ? window.location.hash : ""}`, { scroll: false });
  }, [kod, params, router, yol]);

  // Formlar ve butonlar da bildirim gönderebilir (bildirimGoster)
  useEffect(() => {
    const dinle = (e: Event) => {
      const m = (e as CustomEvent<string>).detail;
      if (m) {
        setHata(false);
        setMetin(m);
      }
    };
    window.addEventListener(BILDIRIM_OLAYI, dinle);
    return () => window.removeEventListener(BILDIRIM_OLAYI, dinle);
  }, []);

  // Bildirim 3,5 saniye sonra kendiliğinden kapanır
  useEffect(() => {
    if (!metin) return;
    const t = setTimeout(() => setMetin(null), hata ? 9000 : 3500);
    return () => clearTimeout(t);
  }, [metin, hata]);

  if (!metin) return null;
  return (
    <div
      role={hata ? "alert" : "status"}
      aria-live={hata ? "assertive" : "polite"}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 max-w-md text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg print:hidden ${
        hata ? "bg-red-700" : "bg-soguk"
      }`}
    >
      <span aria-hidden>{hata ? "✕" : "✓"}</span>
      {metin}
      <button type="button" onClick={() => setMetin(null)} className="ml-2 text-white/70 hover:text-white" aria-label="Kapat">
        ×
      </button>
    </div>
  );
}
