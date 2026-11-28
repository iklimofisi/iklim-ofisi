// KAPALI SİPARİŞ: iptal edilmiş sipariş ya da reddedilmiş sipariş talebi.
// Kapalı sipariş teklifi bağlamaz: teklif yeniden siparişe dönüştürülebilir, durumu değiştirilebilir, arşivlenebilir;
// satış müdürü kapalı siparişi kalıcı silebilir (kopyası İşlem Geçmişi'nde kalır).
export const KAPALI_SIPARIS_DURUMLARI = ["IPTAL", "REDDEDILDI"] as const;

export const siparisKapaliMi = (durum?: string | null) => durum === "IPTAL" || durum === "REDDEDILDI";
