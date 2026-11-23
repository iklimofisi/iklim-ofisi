@AGENTS.md

# İklim Ofisi — proje kuralları (Claude için)

Bu depo iki şeydir: **iklimofisi.com kurumsal sitesi** ve **/panel yönetim yazılımı**
(teklif, sipariş, satınalma, cari, stok, yatırımcı raporu). İkisi de **yayında**; gerçek
müşteri, cari ve yatırımcı verisi var. Kullanıcı Türkçe konuşur; yanıtlar Türkçe ve kısa olmalı.

## 1. Değişmez kurallar

1. **Veri asla silinmez.** Finansal kayıt, sipariş, satınalma siparişi, mal kabul **iptal edilir**
   (iptalTarihi / iptalEdenAdi / iptalNedeni); teklif **arşivlenir**. Kaydı olan müşteri, proje,
   ürün, tedarikçi teklifi silinmez. Yeni özellikte de bu mantık korunur.
2. **Veritabanı:** `prisma migrate`, `prisma db push`, `migrate reset`, `npm run prisma:seed`
   **ASLA** çalıştırılmaz ve kullanıcıya önerilmez (README'deki eski adım geçersiz).
   Şema değişikliği = `prisma/schema.prisma` + `prisma/manuel/YYYY-MM-DD_konu.sql`:
   - Yalnız **ekleyici** SQL (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`,
     yabancı anahtar `DO $$ … IF NOT EXISTS (pg_constraint) …`), tekrar çalıştırılabilir.
   - CRLF satır sonu. Kullanıcı bunu **git push'tan ÖNCE** Neon SQL Editor'da çalıştırır;
     yanıtta bunu açıkça ve dosya adıyla söyle.
   - Yeni tablo/sütun okuyan sorgu, SQL çalışmadan önce sayfayı çökertmesin (`.catch(() => …)`).
3. **Satır sonlarını koru:** her dosya kendi biçiminde kalır (CRLF ise CRLF). Yeni dosyalar CRLF.
4. **Yayın:** kullanıcıya her seferinde şu komutlar verilir:
   ```
   git add .
   git commit -m "…"
   git push
   ```
   Vercel otomatik yayınlar. Commit/push'u Claude yapmaz.
5. **Şifre, kart, API anahtarı** hiçbir alana girilmez; `.env` okunmaz, değiştirilmez.

## 2. Çalışma biçimi (dosyalar kullanıcının bilgisayarında)

- Düzenlemeden önce dosyanın **cihazdaki son hâli** alınır; yerel kopya ile birebir aynı mı
  kontrol edilir. Yazdıktan sonra dosya **geri okunup karşılaştırılır** (`cmp`).
- Bir sayfayı değiştirirken o dosyayı kullanan diğer dosyalar da kontrol edilir (grep).
- Tip denetimi: `prisma generate` ile güncel tipler üretilip `tsc --noEmit` çalıştırılır;
  yeni hata bırakılmaz.
- SQL, yerel bir Postgres'te **iki kez** çalıştırılarak denenir (tekrar çalıştırılabilirlik).
- Emin olunmayan şey kullanıcıya "denendi" diye söylenmez; canlıda denenmesi gerekeni belirt.

## 3. Mimari kısa notlar

- Next.js 14 (app router), Prisma 5.17, Neon Postgres, Tailwind, Vercel. Vercel cron: `vercel.json`.
- Sunucu işlemleri: `lib/actions.ts` (ana), `lib/*-actions.ts`. Her işlem `islemZorunlu()`
  ile başlar (giriş + yatırımcı salt okunur) ve `islemKaydet()` ile **İşlem Geçmişi**'ne yazılır.
  Silme/iptal öncesi kaydın eski hâli `lib/islem-kaydi.ts` → `SILME_KAYNAKLARI` ile saklanır.
- Roller (`lib/roller.ts`): ADMIN, SATIS, SATINALMA, MUHASEBE (finans iptali + ay kapanışı),
  YATIRIMCI (salt okunur). Onay/iptal yetkileri sunucu tarafında kontrol edilir.
- Sipariş tutarı onayda dondurulur (`lib/siparis-tutari.ts`); ciro/rapor bu tutardan hesaplanır.
- Satınalma zinciri: tedarikçi teklifi → satınalma siparişi (SAS-0001, onay eşiği) → mal kabul
  (stok hareketi) → alış faturası (tedarikçi cari) → satış siparişinde maliyet/brüt kâr.
- Finans: `lib/finans.ts` (aylık özet, alacak yaşlandırma, dönem kilidi). Kapalı aya tarihli
  cari/tedarikçi hareketi eklenmez, iptal edilmez.
- Tedarikçi teklif PDF'leri: `lib/tcl-teklif-actions.ts` biçimi tanır (TCL, Viessmann, Bosch/Netisa
  — OCR dahil, Form MHI). Yeni biçim = yeni `lib/<firma>-teklif-ayikla.ts` + tanıma sırası.
- Müşteriye giden belgelerde (teklif PDF'i, WhatsApp linki, tedarikçiye giden sipariş PDF'i)
  **iç bilgi yok**: maliyet, kâr, tedarikçi, müşteri (tedarikçiye) yazılmaz. Panel-içi bilgiler
  `print:hidden`.
- Site dili: TR / EN (/en) / DE (/de), `middleware.ts` + `lib/dil.ts`. Marka adı:
  **"İklim Ofisi Mekanik Mühendislik"** (başlık, og:site_name). SEO meta: `app/layout.tsx`,
  `app/sitemap.ts`, `app/robots.ts`, yapısal veri `components/YapisalVeri.tsx`.
