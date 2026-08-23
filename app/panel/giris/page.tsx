import Image from "next/image";
import { girisYap } from "@/lib/auth-actions";

export default function GirisSayfasi({
  searchParams,
}: {
  searchParams: { hata?: string };
}) {
  return (
    <div className="min-h-screen bg-zemin flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo-icon.png" alt="İklim Ofisi" width={56} height={56} priority />
          <p className="font-display font-semibold text-lg mt-3">
            İklim <span className="text-soguk">Ofisi</span>
          </p>
        </div>
        <form
          action={girisYap}
          className="bg-yuzey border border-hat rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="sifre">
              Şifre
            </label>
            <input
              id="sifre"
              name="sifre"
              type="password"
              required
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-white"
            />
          </div>
          {searchParams?.hata && (
            <p className="text-sm text-sicak-dim">E-posta veya şifre hatalı.</p>
          )}
          <button
            type="submit"
            className="focus-ring w-full bg-soguk text-white px-4 py-2.5 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
