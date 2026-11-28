import { redirect } from "next/navigation";

// Şirket bilgileri tek yerde: Ayarlar sayfasının "Şirket bilgileri" bölümü (eski adres oraya yönlenir)
export default function SirketAyarlariPage() {
  redirect("/panel/ayarlar#sirket");
}
