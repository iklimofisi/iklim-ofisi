"use client";

export default function YazdirButon() {
  return (
    <button
      onClick={() => window.print()}
      className="focus-ring print:hidden bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
    >
      Yazdır / PDF Olarak Kaydet
    </button>
  );
}
