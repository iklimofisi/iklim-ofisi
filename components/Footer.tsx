export default function Footer() {
  return (
    <footer className="border-t border-hat mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-metin/60 font-body">
        <p>© {new Date().getFullYear()} İklim Ofisi. Tüm hakları saklıdır.</p>
        <p className="font-mono">0 (5xx) xxx xx xx · info@iklimofisi.com</p>
      </div>
    </footer>
  );
}
