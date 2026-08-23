import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@iklimofisi.com";
  const adminSifre = process.env.ADMIN_SIFRE ?? "degistir123";
  const sifreHash = await bcrypt.hash(adminSifre, 10);

  await prisma.kullanici.create({
    data: { ad: "Yönetici", email: adminEmail, sifreHash, rol: "ADMIN" },
  });

  const deniz = await prisma.musteri.create({
    data: {
      ad: "Deniz İnşaat A.Ş.",
      telefon: "0532 000 00 01",
      email: "info@denizinsaat.example.com",
      muhasebeEmail: "muhasebe@denizinsaat.example.com",
      vergiNo: "1234567890",
      faturaAdresi: "Organize Sanayi Bölgesi 5. Cadde No:12, İzmir",
      sevkAdresi: "Şantiye Şefliği, Bornova Şantiyesi, İzmir",
    },
  });
  const aksoy = await prisma.musteri.create({
    data: {
      ad: "Aksoy Rezidans Yönetimi",
      telefon: "0533 000 00 02",
      email: "yonetim@aksoyrezidans.example.com",
    },
  });
  const ege = await prisma.musteri.create({
    data: {
      ad: "Ege Soğuk Hava Deposu Ltd.",
      telefon: "0534 000 00 03",
      email: "info@egesoguk.example.com",
      vergiNo: "9876543210",
    },
  });

  await prisma.teklif.create({
    data: {
      baslik: "Şantiye Ofis Klima Montajı",
      musteriId: deniz.id,
      durum: "ONAYLANDI",
      olusturanAdi: "Yönetici",
      kalemler: {
        create: [
          { aciklama: "12.000 BTU Split Klima Montajı", adet: 6, birimFiyat: 18500, iskontoYuzde: 5 },
          { aciklama: "Bakır Boru Tesisatı (metre)", adet: 40, birimFiyat: 620, iskontoYuzde: 0 },
        ],
      },
    },
  });

  await prisma.teklif.create({
    data: {
      baslik: "Yıllık Bakım Anlaşması",
      musteriId: aksoy.id,
      durum: "BEKLEMEDE",
      olusturanAdi: "Yönetici",
      kalemler: { create: [{ aciklama: "Yıllık Bakım Anlaşması", adet: 1, birimFiyat: 42000, iskontoYuzde: 0 }] },
    },
  });

  await prisma.cariHareket.createMany({
    data: [
      { musteriId: deniz.id, aciklama: "Teklif - Fatura", tur: "BORC", tutar: 135000 },
      { musteriId: deniz.id, aciklama: "Kısmi Ödeme", tur: "ALACAK", tutar: 60000 },
      { musteriId: ege.id, aciklama: "Soğutma Ünitesi Bakımı", tur: "BORC", tutar: 28500 },
    ],
  });

  await prisma.teklifSablon.createMany({
    data: [
      {
        baslik: "Ödeme Koşulları",
        icerik: "Bu alanı gerçek ödeme planınla değiştir (örn. %50 peşin, teslimde kalan / banka havalesi / IBAN bilgisi).",
        sira: 0,
      },
      {
        baslik: "Ürün Teslimi",
        icerik: "Bu alanı gerçek teslim/kurulum süreciyle değiştir (örn. sipariş onayından itibaren X iş günü içinde teslim ve montaj).",
        sira: 1,
      },
    ],
  });

  const xyzKlima = await prisma.tedarikci.create({
    data: { ad: "XYZ Klima Toptan Ltd.", telefon: "0212 000 00 00", vergiNo: "1122334455" },
  });

  await prisma.tedarikciHareket.createMany({
    data: [
      { tedarikciId: xyzKlima.id, aciklama: "Ocak ayı VRF ünite alımı", tur: "BORC", tutar: 210000 },
      { tedarikciId: xyzKlima.id, aciklama: "Kısmi ödeme", tur: "ODEME", tutar: 100000 },
    ],
  });

  await prisma.satinalmaTeklifi.create({
    data: {
      tedarikciId: xyzKlima.id,
      baslik: "VRF Dış Ünite Teklifi",
      kalemler: {
        create: [
          { aciklama: "VRF Dış Ünite 24HP", adet: 1, birimFiyat: 145000 },
          { aciklama: "VRF İç Ünite 4 Yön Kaset", adet: 8, birimFiyat: 9800 },
        ],
      },
    },
  });

  await prisma.kesifFormu.create({
    data: {
      musteriAdi: "Yılmaz Tekstil San. Tic. Ltd.",
      telefon: "0532 111 22 33",
      adres: "İkitelli OSB, İstanbul",
      alanM2: 850,
      mevcutSistem: "Mevcut sistem yok, yeni kurulum",
      notlar: "Üretim alanı 850 m², tavan yüksekliği 6 metre. VRF sistem önerildi, 3 iç ünite gerekebilir.",
      olusturanAdi: "Yönetici",
    },
  });

  const daikin = await prisma.marka.create({ data: { ad: "Daikin" } });
  const mitsubishi = await prisma.marka.create({ data: { ad: "Mitsubishi Electric" } });

  await prisma.urun.createMany({
    data: [
      { kod: "RXYQ8T", ad: "VRF Dış Ünite 8HP", markaId: daikin.id, birim: "Adet", listeFiyati: 185000, paraBirimi: "TRY" },
      { kod: "RXYQ12T", ad: "VRF Dış Ünite 12HP", markaId: daikin.id, birim: "Adet", listeFiyati: 265000, paraBirimi: "TRY" },
      { kod: "FXFQ50", ad: "VRF İç Ünite 4 Yön Kaset 50", markaId: daikin.id, birim: "Adet", listeFiyati: 24500, paraBirimi: "TRY" },
      { kod: "PUHY-P400", ad: "VRF Dış Ünite 14HP", markaId: mitsubishi.id, birim: "Adet", listeFiyati: 298000, paraBirimi: "TRY" },
    ],
  });

  const santiyeTeklifi = await prisma.teklif.findFirst({
    where: { musteriId: deniz.id },
    include: { kalemler: true },
  });

  if (santiyeTeklifi?.kalemler[0]) {
    await prisma.teklifKalem.update({
      where: { id: santiyeTeklifi.kalemler[0].id },
      data: { markaId: daikin.id },
    });
  }

  if (santiyeTeklifi) {
    const siparis = await prisma.siparis.create({
      data: {
        teklifId: santiyeTeklifi.id,
        musteriId: deniz.id,
        durum: "HAZIRLANIYOR",
        ekNot: "Deniz İnşaat A.Ş. ile Şantiye Ofis Klima Montajı teklifi üzerinde anlaşılmıştır. (Demo veri — gerçek sözleşme PDF'i yüklenmedi.)",
        sevkAdresi: "Şantiye Şefliği, Bornova Şantiyesi, İzmir",
        olusturanAdi: "Yönetici",
        onaylayanAdi: "Yönetici",
        onayTarihi: new Date(),
      },
    });

    const ilkKalem = santiyeTeklifi.kalemler[0];
    if (ilkKalem) {
      await prisma.sevkiyatKaydi.create({
        data: { siparisId: siparis.id, teklifKalemId: ilkKalem.id, adet: 2, not: "İlk parti gönderildi" },
      });
    }
  }

  const ornekProje = await prisma.proje.create({
    data: {
      ad: "Sancaktepe AVM İklimlendirme İhalesi",
      konum: "Sancaktepe, İstanbul",
      musteriId: deniz.id,
      kaynak: "İnşaat firması tavsiyesi",
      ihaleDurumu: "TEKLIF_VERILDI",
      tahminiDeger: 850000,
      paraBirimi: "TRY",
      notlar: "AVM ortak alan iklimlendirmesi, 3 katlı yapı.",
      olusturanAdi: "Yönetici",
    },
  });

  await prisma.ziyaret.create({
    data: {
      musteriId: deniz.id,
      projeId: ornekProje.id,
      tarih: new Date(),
      not: "Şantiye şefiyle görüşüldü, teklif detayları konuşuldu. Fiyat konusunda rakip firmayla karşılaştırma yapacaklar.",
      hatirlatmaTarihi: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      hatirlatmaNotu: "Teklif sonucu için ara",
      olusturanAdi: "Yönetici",
    },
  });

  console.log("Demo veriler yüklendi.");
  console.log(`İlk giriş: ${adminEmail} / ${adminSifre}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
