// -----------------------------------------------------------------------------
// CİRO TANIMI (tüm raporlar bunu kullanır: Yönetim Paneli, Yönetim Raporu / ay kapanışı, Ciro & Personel)
// - Ciro: satış müdürü onayı almış, iptal / red olmayan satış siparişlerinin siparişte sabitlenen KDV HARİÇ tutarı.
// - Tarih: onay tarihi (eski kayıtlarda onay tarihi yoksa açılış tarihi).
// - TL: dövizli siparişte faturada kur yazıldıysa fatura kuru, yoksa onay kuru; kuru hiç olmayan eski
//   dövizli kayıtta bugünkü TCMB döviz satış kuru (yaklaşık) kullanılır.
// - Personel: müşterinin FİRMA SORUMLUSU (siparişi kim açarsa açsın ciro firmanın sorumlusuna yazılır).
// Sunucu tarafı yardımcıdır ("use server" DEĞİLDİR).
// -----------------------------------------------------------------------------
import { siparisNetTutari } from "@/lib/siparis-tutari";
import { tcmbKuru, type TcmbKurlari } from "@/lib/kur";

export const CIRO_DURUM_HARIC = ["IPTAL", "REDDEDILDI", "ONAY_BEKLIYOR"] as const;

export type CiroSiparisi = {
  paraBirimi: string | null;
  kur: number;
  faturaKur?: number | null;
  tutarNet: number | null;
  teklif: { paraBirimi: string; kalemler: { adet: number; birimFiyat: number; iskontoYuzde: number }[] };
};

export function siparisSatisTl(s: CiroSiparisi, kurlar: TcmbKurlari | null): { tl: number; pb: string; net: number; yaklasik: boolean } {
  const pb = s.paraBirimi ?? s.teklif.paraBirimi;
  const net = siparisNetTutari({ tutarNet: s.tutarNet, teklif: { kalemler: s.teklif.kalemler } });
  if (pb === "TRY") return { tl: net, pb, net, yaklasik: false };
  const kayitli = s.faturaKur ?? s.kur;
  if (kayitli && kayitli !== 1) return { tl: net * kayitli, pb, net, yaklasik: false };
  const bugun = tcmbKuru(kurlar, pb, "TCMB_DOVIZ");
  return { tl: bugun ? net * bugun : 0, pb, net, yaklasik: true };
}

export const ciroTarihi = (s: { onayTarihi: Date | null; olusturmaTarihi: Date }) => s.onayTarihi ?? s.olusturmaTarihi;

export const SORUMLUSUZ = "Sorumlu atanmamış";
