import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cikisYap } from "@/lib/auth-actions";
import { suankiKullanici } from "@/lib/oturum";
import { prisma } from "@/lib/prisma";
import PanelMobilMenu from "@/components/PanelMobilMenu";
import PanelYanMenu, { type MenuGrubu } from "@/components/PanelYanMenu";
import KayitBildirimi from "@/components/KayitBildirimi";
import KurGostergesi from "@/components/KurGostergesi";
import { Suspense } from "react";
import { trSimdi } from "@/lib/notlar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// MENÜ GRUPLARI — sol menü açılır gruplar hâlinde gösterilir (bulunulan sayfanın grubu açık durur).
// Sayfa adresleri değişmedi; yalnızca menüdeki yerleri gruplandı.
const menuGruplari: MenuGrubu[] = [
  {
    baslik: null,
    ogeler: [
      { href: "/panel", label: "Özet" },
      { href: "/panel/notlar", label: "📝 Notlar & Hatırlatmalar" },
    ],
  },
  {
    baslik: "Satış & Müşteri",
    ogeler: [
      { href: "/panel/talepler", label: "Web Talepleri" },
      { href: "/panel/musteriler", label: "Müşteriler" },
      { href: "/panel/ziyaretler", label: "Görüşmeler & Ziyaretler" },
      { href: "/panel/projeler", label: "Projeler" },
      { href: "/panel/proje-takip", label: "📊 Proje Takip (Excel)" },
      { href: "/panel/kesif", label: "Keşif" },
      { href: "/panel/teklifler", label: "Teklifler" },
      { href: "/panel/fiyat-listeleri", label: "Fiyat Listeleri" },
    ],
  },
  {
    baslik: "Mühendislik Hesapları",
    ogeler: [
      { href: "/panel/isi-hesabi", label: "Isı Pompası Hesabı" },
      { href: "/panel/klima-hesabi", label: "Klima & VRF Hesabı" },
      { href: "/panel/havalandirma-hesabi", label: "Havalandırma Hesabı" },
    ],
  },
  {
    baslik: "Operasyon",
    ogeler: [
      { href: "/panel/siparisler", label: "Siparişler" },
      { href: "/panel/satinalma", label: "Satınalma" },
      { href: "/panel/stok", label: "Stok & Envanter" },
    ],
  },
  {
    baslik: "Finans",
    ogeler: [
      { href: "/panel/cari", label: "Cari Hesap" },
      { href: "/panel/genel-cari", label: "Genel Finans & Çekler" },
    ],
  },
];
const yonetimTemel = [
  { href: "/panel/ayarlar", label: "Ayarlar" },
  { href: "/panel/profil", label: "Profilim & Şifre" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const kullanici = await suankiKullanici();
  if (!kullanici) redirect("/panel/giris");

  const bugun = new Date();
  bugun.setHours(23, 59, 59, 999);

  // CANLI UYARI ROZET SAYILARI
  const [okunmamisTalep, bekleyenHatirlatma, yeniKesifSayisi, takiptekiProjeSayisi, gunuGelenNot] = await Promise.all([
    prisma.webTalebi.count({ where: { okundu: false } }),
    prisma.ziyaret.count({ where: { hatirlatmaTamam: false, hatirlatmaTarihi: { lte: bugun, not: null } } }),
    prisma.kesifFormu.count({ where: { olusturulanTeklifId: null } }),
    prisma.proje.count({ where: { ihaleDurumu: "TAKIPTE" } }),
    // Günü gelen notlar: benim yazdıklarım ya da (herkese açık olup) bana gidenler.
    // Tablo henüz yoksa (SQL çalıştırılmadıysa) panel bozulmasın diye 0 sayılır.
    prisma.panelNotu
      .count({
        where: {
          tamamlandi: false,
          hatirlatmaGunu: { not: null, lte: trSimdi().gun },
          OR: [{ olusturanId: kullanici.id }, { gizli: false, hatirlatmaAlicilar: { contains: kullanici.id } }],
        },
      })
      .catch(() => 0),
  ]);

  const rozetler: Record<string, number> = {
    "/panel/talepler": okunmamisTalep,
    "/panel/ziyaretler": bekleyenHatirlatma,
    "/panel/kesif": yeniKesifSayisi,
    "/panel/projeler": takiptekiProjeSayisi,
    "/panel/notlar": gunuGelenNot,
  };

  const gruplar: MenuGrubu[] = [
    ...menuGruplari,
    {
      baslik: "Yönetim",
      ogeler:
        kullanici.rol === "ADMIN"
          ? [...yonetimTemel, { href: "/panel/kullanicilar", label: "Kullanıcılar" }, { href: "/panel/islem-gecmisi", label: "İşlem Geçmişi" }]
          : yonetimTemel,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-zemin">
      <Suspense fallback={null}>
        <KayitBildirimi />
      </Suspense>
      <PanelMobilMenu gruplar={gruplar} rozetler={rozetler} />
      <aside className="w-56 shrink-0 border-r border-hat bg-yuzey hidden sm:flex flex-col print:hidden">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-hat">
          <Link href="/" className="flex items-center gap-2 focus-ring">
            <Image src="/logo-icon.png" alt="İklim Ofisi" width={24} height={24} />
            <span className="font-display font-semibold text-metin">
              İklim <span className="text-soguk">Ofisi</span>
            </span>
          </Link>
        </div>
        {/* DÖVİZ KURLARI (üzerine gelince açılır) */}
        <div className="px-3 pt-4">
          <KurGostergesi />
        </div>
        <PanelYanMenu gruplar={gruplar} rozetler={rozetler} />

        {/* SOL EN ALT KULLANICI BİLGİSİ VE PROFİLİM LİNKİ */}
        <div className="p-4 border-t border-hat space-y-2">
          <Link href="/panel/profil" className="block group">
            <p className="text-xs font-bold text-metin group-hover:text-soguk-dim transition-colors">
              {kullanici.ad} <span className="text-metin/30">· {kullanici.rol === "ADMIN" ? "Yönetici" : "Satış"}</span>
            </p>
            <p className="text-[10px] text-soguk-dim font-semibold group-hover:underline">⚙️ Profilim & Şifre Değiştir</p>
          </Link>

          <Link href="/" className="block text-xs text-metin/50 hover:text-metin focus-ring pt-1">
            ← Siteye dön
          </Link>
          <form action={cikisYap}>
            <button type="submit" className="text-xs text-metin/50 hover:text-sicak-dim focus-ring">
              Çıkış yap
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-6 sm:px-10 py-10 max-w-5xl print:p-0 print:max-w-none">{children}</main>
    </div>
  );
}