"use server";

export type AyiklananKalem = {
  aciklama: string;
  adet: number;
  birimFiyat: number;
};

export type AyiklamaSonucu = {
  basarili: boolean;
  hata?: string;
  paraBirimi?: "TRY" | "USD" | "EUR";
  kalemler?: AyiklananKalem[];
};

export async function satinalmaPdfAyikla(formData: FormData): Promise<AyiklamaSonucu> {
  const dosya = formData.get("pdf") as File | null;
  if (!dosya || dosya.size === 0) {
    return { basarili: false, hata: "Önce bir PDF dosyası seç." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      basarili: false,
      hata:
        "ANTHROPIC_API_KEY tanımlı değil. .env dosyana ANTHROPIC_API_KEY=\"...\" eklemen gerekiyor (bkz. README).",
    };
  }

  let metin: string;
  try {
    const arrayBuffer = await dosya.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfParse = (await import("pdf-parse")).default;
    const veri = await pdfParse(buffer);
    metin = veri.text?.trim() ?? "";
    if (!metin) {
      return { basarili: false, hata: "PDF'den metin okunamadı (taranmış görüntü olabilir)." };
    }
  } catch (e) {
    return { basarili: false, hata: "PDF okunurken hata oluştu: " + (e instanceof Error ? e.message : "bilinmeyen hata") };
  }

  const prompt = `Aşağıda bir tedarikçi fiyat teklifi PDF'inden çıkarılmış ham metin var. Bu metni analiz et ve SADECE aşağıdaki JSON formatında, başka hiçbir açıklama eklemeden, markdown code fence kullanmadan cevap ver:

{"paraBirimi": "TRY" | "USD" | "EUR", "kalemler": [{"aciklama": string, "adet": number, "birimFiyat": number}]}

Kurallar:
- Para birimini metinden anla (₺/TL = TRY, $/USD/Dolar = USD, €/EUR/Euro = EUR). Belirsizse TRY varsay.
- Her ürün/hizmet kalemi için açıklama, adet ve birim fiyatı çıkar.
- Eğer bir kalemde birim fiyat değil sadece toplam fiyat verilmişse, birimFiyat = toplam / adet olarak hesapla (adet belirtilmemişse adet=1, birimFiyat=toplam).
- Başlık, toplam, KDV gibi kalem olmayan satırları listeye ekleme.
- Sadece geçerli JSON döndür.

Metin:
${metin.slice(0, 15000)}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const hataMetni = await response.text();
      return { basarili: false, hata: `Anthropic API hatası (${response.status}): ${hataMetni.slice(0, 300)}` };
    }

    const data = await response.json();
    const metinCevap: string = data?.content?.[0]?.text ?? "";
    const temiz = metinCevap.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(temiz);

    if (!parsed.kalemler || !Array.isArray(parsed.kalemler)) {
      return { basarili: false, hata: "Yapay zekadan beklenen formatta cevap alınamadı." };
    }

    return {
      basarili: true,
      paraBirimi: ["TRY", "USD", "EUR"].includes(parsed.paraBirimi) ? parsed.paraBirimi : "TRY",
      kalemler: parsed.kalemler.map((k: { aciklama?: string; adet?: number; birimFiyat?: number }) => ({
        aciklama: String(k.aciklama ?? ""),
        adet: Number(k.adet) || 1,
        birimFiyat: Number(k.birimFiyat) || 0,
      })),
    };
  } catch (e) {
    return {
      basarili: false,
      hata: "Ayıklama sırasında hata oluştu: " + (e instanceof Error ? e.message : "bilinmeyen hata"),
    };
  }
}
