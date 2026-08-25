import { prisma } from "@/lib/prisma";
import { musteriEkle, musteriSil } from "@/lib/actions"; // DÜZELTİLDİ: musteriEkle eklendi
import SilButon from "@/components/SilButon";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MusterilerPage() {
  const musteriler = await prisma.musteri.findMany({
    orderBy: { ad: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-metin mb-6">Müşteriler</h1>

      {/* YENİ MÜŞTERİ EKLEME FORMU */}
      <form action={musteriEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-metin/60 mb-4">
          + Yeni Müşteri Ekle
        </h2>

        {/* 1. SATIR: FİRMA ADI VE YETKİLİ BİLGİLERİ */}
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Firma / Müşteri Adı *</label>
            <input
              name="ad"
              required
              placeholder="Firma veya Kişi unvanı"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri Yetkilisi Ad Soyad</label>
            <input
              name="yetkiliAdi"
              placeholder="Örn: Ahmet Yılmaz"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium text-soguk-dim"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Yetkili Telefon</label>
            <input
              name="yetkiliTelefon"
              placeholder="05xx xxx xx xx"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        {/* 2. SATIR: İLETİŞİM BİLGİLERİ */}
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Yetkili E-posta</label>
            <input
              name="yetkiliEmail"
              type="email"
              placeholder="ahmet@firma.com"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Firma Santral Tel</label>
            <input
              name="telefon"
              placeholder="0216 xxx xx xx"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Vergi No / TC</label>
            <input
              name="vergiNo"
              placeholder="Opsiyonel"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        {/* 3. SATIR: E-POSTALAR */}
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Firma E-posta</label>
            <input
              name="email"
              type="email"
              placeholder="info@firma.com"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Muhasebe E-postası</label>
            <input
              name="muhasebeEmail"
              type="email"
              placeholder="muhasebe@firma.com (opsiyonel)"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        {/* 4. SATIR: ADRESLER */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Fatura Adresi</label>
            <input
              name="faturaAdresi"
              placeholder="Fatura kesilecek adres"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Sevk Adresi</label>
            <input
              name="sevkAdresi"
              placeholder="Ürünün gönderileceği adres"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          Müşteri Ekle
        </button>
      </form>

      {/* MÜŞTERİ LİSTESİ TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hat text-xs text-metin/50 bg-soguk-light/20 font-semibold">
              <th className="py-3 px-4">Firma / Müşteri Adı</th>
              <th className="py-3 px-4">Müşteri Yetkilisi</th>
              <th className="py-3 px-4">Telefon</th>
              <th className="py-3 px-4">E-posta</th>
              <th className="py-3 px-4">Vergi No</th>
              <th className="py-3 px-4 text-right">Detay</th>
              <th className="py-3 px-4 text-center">Sil</th> {/* DÜZELTİLDİ: Sütun başlığı eklendi */}
            </tr>
          </thead>
          <tbody className="divide-y divide-hat">
            {musteriler.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-metin">
                  <Link href={`/panel/musteriler/${m.id}`} className="hover:text-soguk-dim">
                    {m.ad}
                  </Link>
                </td>
                
                {/* MÜŞTERİ YETKİLİSİ BİLGİSİ */}
                <td className="py-3 px-4 text-metin font-medium">
                  {m.yetkiliAdi ? (
                    <div>
                      <div>{m.yetkiliAdi}</div>
                      {m.yetkiliTelefon && (
                        <div className="text-xs text-metin/50 font-normal">{m.yetkiliTelefon}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-metin/30">—</span>
                  )}
                </td>

                <td className="py-3 px-4 text-metin/70">{m.telefon || m.yetkiliTelefon || "—"}</td>
                <td className="py-3 px-4 text-metin/70">{m.email || m.yetkiliEmail || "—"}</td>
                <td className="py-3 px-4 text-metin/50">{m.vergiNo || "—"}</td>
                
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/panel/musteriler/${m.id}`}
                    className="text-xs font-medium text-soguk-dim hover:underline"
                  >
                    Görüntüle →
                  </Link>
                </td>

                {/* MÜŞTERİ SİL BUTONU */}
                <td className="py-3 px-4 text-center">
                  <SilButon
                    id={m.id}
                    action={musteriSil}
                    onayMesaji="Bu müşteriyi ve tüm ilişkili kayıtlarını silmek istediğinizden emin misiniz?"
                  />
                </td>
              </tr>
            ))}
            {musteriler.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-metin/50 text-sm">
                  Henüz kayıtlı müşteri yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}