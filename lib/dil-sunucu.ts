import { headers } from "next/headers";
import { DIL_BASLIGI, dilMi, type Dil } from "@/lib/dil";

// Sunucu tarafında isteğin dili (middleware "x-site-dil" başlığını koyar; yoksa Türkçe).
// headers() sayfayı dinamik yapar; hata yakalanmaz ki Next.js sayfayı statik önbelleğe almasın.
export function dilAl(): Dil {
  const d = headers().get(DIL_BASLIGI);
  return dilMi(d) ? d : "tr";
}
