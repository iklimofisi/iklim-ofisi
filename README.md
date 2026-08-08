# İklim Ofisi

Kurumsal web sitesi + basit ERP paneli (teklif, müşteri, cari hesap).

## Kurulum (VS Code'da)

1. Bu klasörü VS Code'da aç.
2. Terminali aç (Terminal > New Terminal) ve şunu çalıştır:
   ```
   npm install
   ```
3. Geliştirme sunucusunu başlat:
   ```
   npm run dev
   ```
4. Tarayıcıda `http://localhost:3000` adresine git.

## Sayfalar

- `/` , `/hizmetler`, `/hakkimizda`, `/iletisim` → herkese açık kurumsal site
- `/panel`, `/panel/musteriler`, `/panel/teklifler`, `/panel/cari` → yönetim paneli

**Önemli:** Panel şu an giriş/şifre koruması olmadan herkese açık ve veriler
tarayıcı hafızasında (sayfa yenilenince sıfırlanıyor, örnek verilerle
başlıyor). Bu, tasarımı ve akışı hızlıca görüp onaylaman için bilinçli bir
tercih. Sıradaki adımlar:

1. **Gerçek veritabanı bağlama** — `prisma/schema.prisma` hazır. Ücretsiz bir
   PostgreSQL (örn. [neon.tech](https://neon.tech) veya
   [supabase.com](https://supabase.com)) alıp `.env` dosyasına
   `DATABASE_URL` olarak ekle, sonra:
   ```
   npx prisma migrate dev --name init
   ```
2. **Giriş/şifre koruması** — panel route'una kimlik doğrulama eklemek
   (örn. NextAuth ile).
3. **Yayına alma** — [vercel.com](https://vercel.com) üzerinden GitHub
   reposunu bağlayıp deploy etmek, sonra kendi alan adını (iklimofisi.com)
   bağlamak.
4. **İleride e-ticaret** — ürün/hizmet kataloğu ve ödeme entegrasyonu ayrı
   bir aşama olarak eklenebilir.

## Tasarım notları

- Renkler ve fontlar `tailwind.config.ts` ve `app/layout.tsx` içinde
  tanımlı: soğuk (`#0E7C86`) ve sıcak (`#E8734A`) vurgu renkleri, iklim
  aralığını simgeliyor.
- Anasayfadaki "sıcaklık göstergesi" (`components/TemperatureGauge.tsx`)
  markanın imza görsel öğesi.
