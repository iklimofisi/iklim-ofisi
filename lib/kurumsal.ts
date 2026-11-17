// İklim Ofisi'nin bağlı olduğu şirket. Site (Hakkımızda, alt bilgi), teklif
// sayfası/yazdırma ve e-postayla giden teklif PDF'i bu metni kullanır.
// Değişirse yalnızca burayı güncellemek yeterlidir.
// BOŞ ("") bırakılırsa hiçbir yerde gösterilmez (09.10.2026: şimdilik kaldırıldı).
// Tekrar göstermek için: "Yekatek Isıtma Soğutma Havalandırma Sistemleri San. ve Tic. Ltd. Şti. iştirakidir."
export const ISTIRAK_METNI: string = "";

// Sosyal medya hesapları: sitenin alt bilgisinde (her sayfada) simge olarak görünür ve
// Google'a "bu hesaplar bu firmanındır" bilgisi olarak verilir. Yeni hesap eklemek için
// listeye satır eklemek yeterlidir.
export const SOSYAL_MEDYA = [
  { ad: "Instagram", url: "https://www.instagram.com/iklimofisi/" },
  { ad: "LinkedIn", url: "https://www.linkedin.com/company/i%CC%87klim-ofisi-mekanik-m%C3%BChendislik/" },
] as const;
