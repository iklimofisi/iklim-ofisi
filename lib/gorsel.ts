// -----------------------------------------------------------------------------
// FOTOĞRAFLAR (ürün ve fiyat listesi satırları)
// Fotoğraflar tarayıcıda küçültülüp (en fazla 1200 px) JPEG'e çevrilerek yüklenir;
// veritabanında "Gorsel" tablosunda saklanır. Bu dosya yalnızca sunucuda kullanılır.
// -----------------------------------------------------------------------------

export const GORSEL_EN_FAZLA_BAYT = 3 * 1024 * 1024; // 3 MB (küçültülmüş fotoğraf genelde 100-300 KB)

// JPEG dosyasının piksel boyutunu okur (SOF işaretinden). Geçersizse null.
export function jpegBoyutu(b: Uint8Array): { genislik: number; yukseklik: number } | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const isaret = b[i + 1];
    if (isaret === 0xd8 || isaret === 0x01 || (isaret >= 0xd0 && isaret <= 0xd7)) {
      i += 2;
      continue;
    }
    const uzunluk = (b[i + 2] << 8) | b[i + 3];
    // SOF0..SOF15 (DHT=C4, JPG=C8, DAC=CC hariç)
    if (isaret >= 0xc0 && isaret <= 0xcf && isaret !== 0xc4 && isaret !== 0xc8 && isaret !== 0xcc) {
      const yukseklik = (b[i + 5] << 8) | b[i + 6];
      const genislik = (b[i + 7] << 8) | b[i + 8];
      return genislik > 0 && yukseklik > 0 ? { genislik, yukseklik } : null;
    }
    if (uzunluk < 2) return null;
    i += 2 + uzunluk;
  }
  return null;
}
