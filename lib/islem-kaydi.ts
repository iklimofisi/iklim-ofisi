// -----------------------------------------------------------------------------
// İŞLEM KAYDI (kim, ne zaman, neyi değiştirdi)
//
// Bu dosya bilerek "use server" DEĞİLDİR: buradaki fonksiyonlar dışarıdan
// çağrılabilen sunucu işlemi olmaz, yalnızca sunucu kodunun içinden kullanılır.
//
// Kayıt yazılamazsa (örn. IslemKaydi tablosu henüz oluşturulmadıysa) asıl işlem
// ASLA engellenmez; hata yalnızca sunucu günlüğüne yazılır.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";

type Kisi = { id: string; ad: string } | null | undefined;

const GIZLI_ALAN = /sifre|parola|password|token/i;
const METIN_SINIRI = 1000; // tek bir alan için en fazla karakter
const TOPLAM_SINIR = 20000; // bir kaydın veri kısmı için en fazla karakter

// Silinmeden önce kaydın bir kopyası saklanır; bu tablo hangi işlemde hangi
// kaydın saklanacağını belirtir.
const SILME_KAYNAKLARI: Record<string, { model: string; include?: Record<string, unknown> }> = {
  musteriSil: { model: "musteri", include: { yetkililer: true } },
  musteriYetkiliSil: { model: "musteriYetkili" },
  teklifSil: { model: "teklif", include: { kalemler: true, revizyonlar: true } },
  cariHareketSil: { model: "cariHareket" },
  tedarikciHareketSil: { model: "tedarikciHareket" },
  sablonSil: { model: "teklifSablon" },
  kullaniciSil: { model: "kullanici" },
  siparisSil: { model: "siparis", include: { sevkiyatlar: true, teslimler: true } },
  sevkiyatSil: { model: "sevkiyatKaydi" },
  teslimKaydiSil: { model: "teslimKaydi" },
  satinalmaTeklifiSil: { model: "satinalmaTeklifi", include: { kalemler: true } },
  kesifSil: { model: "kesifFormu" },
  webTalebiSil: { model: "webTalebi" },
  markaSil: { model: "marka" },
  urunSil: { model: "urun" },
  projeSil: { model: "proje" },
  ziyaretSil: { model: "ziyaret" },
};

// Dosya içeriklerini (PDF, Excel, logo...) kayda koymaz; yalnızca boyutunu yazar.
// Şifre gibi gizli alanları hiç yazmaz.
function jsonYap(deger: unknown): string {
  const metin = JSON.stringify(deger, function (anahtar, v) {
    const orj = (this as Record<string, unknown>)[anahtar];
    if (anahtar && GIZLI_ALAN.test(anahtar)) return "[gizli]";
    if (orj instanceof Uint8Array) return `[dosya · ${orj.length} bayt]`;
    if (typeof v === "string" && v.length > METIN_SINIRI) return v.slice(0, METIN_SINIRI) + "…";
    return v;
  });
  if (!metin) return "";
  return metin.length > TOPLAM_SINIR ? metin.slice(0, TOPLAM_SINIR) + "…" : metin;
}

function formVerisiOzeti(fd: FormData) {
  const sonuc: Record<string, unknown> = {};
  fd.forEach((deger, anahtar) => {
    // Next.js'in kendi gizli alanları ($ACTION_...) kayda girmez
    if (anahtar.startsWith("$")) return;
    let yazilacak: unknown;
    if (typeof deger === "string") yazilacak = deger;
    else {
      const dosya = deger as File;
      if (!dosya || dosya.size === 0) return;
      yazilacak = `[dosya · ${dosya.name} · ${dosya.size} bayt]`;
    }
    // Aynı isimli birden çok alan (ör. teklif kalemleri) liste olarak saklanır
    if (anahtar in sonuc) {
      const onceki = sonuc[anahtar];
      sonuc[anahtar] = Array.isArray(onceki) ? [...onceki, yazilacak] : [onceki, yazilacak];
    } else {
      sonuc[anahtar] = yazilacak;
    }
  });
  return sonuc;
}

const HEDEF_ANAHTARLARI = [
  "teklifId",
  "siparisId",
  "musteriId",
  "projeId",
  "yetkiliId",
  "tedarikciId",
  "satinalmaTeklifiId",
  "kesifId",
  "urunId",
  "hareketId",
  "id",
];

function hedefBul(veri: Record<string, unknown>): string | null {
  for (const a of HEDEF_ANAHTARLARI) {
    const v = veri[a];
    if (typeof v === "string" && v) return v;
  }
  return null;
}

export async function islemKaydet(
  kisi: Kisi,
  islem: string,
  girdi?: FormData | Record<string, unknown> | null
) {
  try {
    const veri: Record<string, unknown> =
      girdi instanceof FormData ? formVerisiOzeti(girdi) : { ...(girdi ?? {}) };

    const hedefId = hedefBul(veri);

    // Silme işlemlerinde, silinecek kaydın o anki hâlini de sakla
    const kaynak = SILME_KAYNAKLARI[islem];
    if (kaynak && hedefId) {
      const temsilci = (prisma as unknown as Record<string, { findUnique: (a: unknown) => Promise<unknown> }>)[
        kaynak.model
      ];
      const silinecek = await temsilci
        ?.findUnique({ where: { id: hedefId }, ...(kaynak.include ? { include: kaynak.include } : {}) })
        .catch(() => null);
      if (silinecek) veri.silinenKayit = silinecek;
    }

    await prisma.islemKaydi.create({
      data: {
        kullaniciId: kisi?.id ?? null,
        kullaniciAd: kisi?.ad ?? null,
        islem,
        hedefId,
        veri: jsonYap(veri) || null,
      },
    });
  } catch (hata) {
    console.warn("[islem-kaydi] kayıt yazılamadı:", islem, hata instanceof Error ? hata.message : hata);
  }
}

// Giriş denemeleri (başarılı / başarısız) için
export async function girisKaydet(kisi: Kisi, email: string, basarili: boolean) {
  try {
    await prisma.islemKaydi.create({
      data: {
        kullaniciId: kisi?.id ?? null,
        kullaniciAd: kisi?.ad ?? null,
        islem: basarili ? "girisBasarili" : "girisBasarisiz",
        hedefId: null,
        veri: jsonYap({ email }),
      },
    });
  } catch (hata) {
    console.warn("[islem-kaydi] giriş kaydı yazılamadı:", hata instanceof Error ? hata.message : hata);
  }
}
