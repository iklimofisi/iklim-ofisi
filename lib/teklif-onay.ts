"use server";

// -----------------------------------------------------------------------------
// MÜŞTERİNİN TEKLİF LİNKİNDEN ONAY VERMESİ (giriş GEREKTİRMEZ)
// Yalnızca geçerli gizli link anahtarıyla çalışır ve yalnızca "Beklemede" olan
// teklifi "Onaylandı" yapar. Onaylayanın adı, notu, tarihi, o anki revizyon ve
// tutar teklife yazılır; işlem geçmişine, görüşme notlarına ve hazırlayana
// e-posta olarak düşer. Panelden durum her zaman elle değiştirilebilir.
// -----------------------------------------------------------------------------
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { paylasilanTeklif, hazirlayanaBildir, htmlGuvenli, teklifKodu } from "@/lib/teklif-paylasim";
import { musteriToplami } from "@/lib/teklif-hesap";

const paraYaz = (n: number, pb: string) =>
  `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb === "EUR" ? "€" : pb === "USD" ? "$" : "TL"}`;

export async function teklifLinktenOnayla(formData: FormData) {
  const anahtar = String(formData.get("anahtar") ?? "");
  const ad = String(formData.get("onaylayan") ?? "").trim().slice(0, 120);
  const not = String(formData.get("onayNotu") ?? "").trim().slice(0, 1000);
  const kabul = formData.get("kabul") === "evet";
  // Bot tuzağı: görünmeyen alan doluysa işlem yapılmaz
  if (String(formData.get("web") ?? "")) redirect(`/t/${anahtar}`);

  const sonuc = await paylasilanTeklif(anahtar);
  if (!sonuc) redirect(`/t/${anahtar}`);
  if (ad.length < 3 || !kabul) redirect(`/t/${anahtar}?onay=eksik#onay`);

  const { teklif } = sonuc;
  const toplam = musteriToplami(teklif);
  const tutarMetni = `${paraYaz(toplam.tutar, teklif.paraBirimi)} ${toplam.ek}`;
  const ip = (headers().get("x-forwarded-for") ?? "").split(",")[0].trim().slice(0, 60) || null;
  const simdi = new Date();

  // Yalnızca "Beklemede" iken onaylanır (aynı anda iki kez basılsa da tek kayıt)
  const guncel = await prisma.teklif.updateMany({
    where: { id: teklif.id, durum: "BEKLEMEDE" },
    data: {
      durum: "ONAYLANDI",
      musteriOnayAdi: ad,
      musteriOnayNotu: not || null,
      musteriOnayTarihi: simdi,
      musteriOnayRevizyon: teklif.revizyonNo,
      musteriOnayTutar: tutarMetni,
      musteriOnayIp: ip,
    },
  });
  if (!guncel.count) redirect(`/t/${anahtar}?onay=durum#onay`);

  const kod = teklifKodu(teklif.teklifNo);

  // İşlem geçmişi
  await prisma.islemKaydi
    .create({
      data: {
        kullaniciId: null,
        kullaniciAd: `Müşteri (link): ${ad}`,
        islem: "teklifMusteriOnayi",
        hedefId: teklif.id,
        veri: JSON.stringify({ teklifId: teklif.id, teklifNo: teklif.teklifNo, onaylayan: ad, not, revizyon: teklif.revizyonNo, tutar: tutarMetni, ip }),
      },
    })
    .catch(() => null);

  // Görüşme notu (müşteri kartında ve teklif sayfasında görünür)
  await prisma.ziyaret
    .create({
      data: {
        musteriId: teklif.musteriId,
        projeId: teklif.projeId,
        teklifId: teklif.id,
        tur: "DIGER",
        tarih: simdi,
        not: `✅ Müşteri teklifi link üzerinden ONAYLADI.\nOnaylayan: ${ad}\nRev. ${teklif.revizyonNo} · ${tutarMetni}${not ? `\nMüşteri notu: ${not}` : ""}`,
        olusturanAdi: "Müşteri (link)",
      },
    })
    .catch(() => null);

  await hazirlayanaBildir(
    teklif,
    `✅ ${kod} müşteri tarafından ONAYLANDI · ${teklif.musteri.ad}`,
    `<p style="font-size:15px"><b>${htmlGuvenli(ad)}</b> teklifi link üzerinden onayladı.</p>
     <p>Tutar: <b>${htmlGuvenli(tutarMetni)}</b> · Rev. ${teklif.revizyonNo}</p>
     ${not ? `<p style="background:#f1f5f9;padding:10px;border-left:3px solid #0f766e"><b>Müşteri notu:</b> ${htmlGuvenli(not).replace(/\n/g, "<br/>")}</p>` : ""}
     <p style="font-size:12px;color:#64748b">Teklif panelde otomatik olarak "Onaylandı" yapıldı.</p>`
  );

  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklif.id}`);
  revalidatePath(`/panel/musteriler/${teklif.musteriId}`);
  revalidatePath("/panel");
  redirect(`/t/${anahtar}?onay=tamam#onay`);
}
