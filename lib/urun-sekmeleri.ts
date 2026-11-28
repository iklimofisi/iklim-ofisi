import { gorebilir } from "@/lib/roller";

// Ürün kartı tektir: Ürün Kataloğu (kod, ad, marka, liste fiyatı) ve Stok & Maliyet (stok, alış maliyeti,
// hedef marj) aynı ürün kaydının iki görünümüdür. Sekmeler rolün görebildiğine göre gösterilir.
export function urunSekmeleri(rol: string | null | undefined) {
  return [
    ...(gorebilir(rol, "urun") ? [{ anahtar: "katalog", href: "/panel/ayarlar/urunler", ad: "Ürün kataloğu (liste fiyatı)" }] : []),
    ...(gorebilir(rol, "stok") ? [{ anahtar: "stok", href: "/panel/stok", ad: "Stok & maliyet" }] : []),
    ...(gorebilir(rol, "fiyat") ? [{ anahtar: "fiyat", href: "/panel/fiyat-listeleri", ad: "Fiyat listeleri" }] : []),
  ];
}
