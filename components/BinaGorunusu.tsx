"use client";

import { useMemo, useRef, useState } from "react";
import { binaGorunusu, yerlesim, geometri, GW, GH, type GorunusAyari, type GorunusGirdisi } from "@/lib/bina-gorunus";
import { cizimSvg } from "@/lib/isi-hesap/svg";

// -----------------------------------------------------------------------------
// ÖN GÖRÜNÜŞ (panel): evin önden görünüşü ve cihazlar. Cihazlar fareyle (telefonda
// parmakla) sürüklenir; bırakınca konum hesap verisine yazılır (hesabı kaydedince
// kalıcı olur ve PDF raporunda aynı yerde çıkar).
// -----------------------------------------------------------------------------
export default function BinaGorunusu({
  ayar,
  girdi,
  onChange,
}: {
  ayar: GorunusAyari;
  girdi: GorunusGirdisi;
  onChange: (a: GorunusAyari) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  // Sürükleme sırasında konum yalnız burada tutulur; bırakınca üst bileşene yazılır
  const [surukle, setSurukle] = useState<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null);
  const [secili, setSecili] = useState<string | null>(null);

  const etkin: GorunusAyari = useMemo(
    () => (surukle ? { ...ayar, konumlar: { ...ayar.konumlar, [surukle.id]: [surukle.x, surukle.y] } } : ayar),
    [ayar, surukle]
  );
  const svg = useMemo(() => cizimSvg(binaGorunusu(etkin, girdi), "Ön görünüş ve cihaz yerleşimi"), [etkin, girdi]);
  const yerler = useMemo(() => yerlesim(etkin, girdi), [etkin, girdi]);
  const G = geometri(etkin, girdi);
  const adlar = useMemo(() => new Map(girdi.cihazlar.map((c) => [c.id, c.ad])), [girdi.cihazlar]);

  const nokta = (e: React.PointerEvent) => {
    const s = svgRef.current;
    const m = s?.getScreenCTM();
    if (!s || !m) return null;
    const p = s.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  };
  const yuvarla = (n: number) => Math.round(n * 2) / 2;

  const birak = () => {
    if (!surukle) return;
    onChange({ ...ayar, konumlar: { ...ayar.konumlar, [surukle.id]: [yuvarla(surukle.x), yuvarla(surukle.y)] } });
    setSurukle(null);
  };

  // Seçili cihazı klavye okuyla 1 birim kaydırma (Shift ile 5)
  const tus = (e: React.KeyboardEvent, id: string) => {
    const adim = e.shiftKey ? 5 : 1;
    const d = e.key === "ArrowLeft" ? [-adim, 0] : e.key === "ArrowRight" ? [adim, 0] : e.key === "ArrowUp" ? [0, -adim] : e.key === "ArrowDown" ? [0, adim] : null;
    if (!d) return;
    e.preventDefault();
    const y = yerler.find((x) => x.id === id);
    if (!y) return;
    onChange({ ...ayar, konumlar: { ...ayar.konumlar, [id]: [yuvarla(y.x + d[0]), yuvarla(y.y + d[1])] } });
  };

  const sec = "focus-ring border border-hat rounded-md px-2 py-1.5 text-sm bg-white";
  const elleKonum = Object.keys(ayar.konumlar).filter((id) => adlar.has(id)).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3 bg-yuzey border border-hat rounded-lg p-3">
        <label className="text-xs text-metin/60">
          Kat sayısı
          <select
            value={ayar.katSayisi}
            onChange={(e) => onChange({ ...ayar, katSayisi: Number(e.target.value) })}
            className={`${sec} block mt-1`}
          >
            <option value={0}>Otomatik ({G.katSayisi})</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "Tek katlı" : `${n} katlı`}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-metin/60">
          Bodrum
          <select
            value={ayar.bodrum === null ? "OTO" : ayar.bodrum ? "VAR" : "YOK"}
            onChange={(e) => onChange({ ...ayar, bodrum: e.target.value === "OTO" ? null : e.target.value === "VAR" })}
            className={`${sec} block mt-1`}
          >
            <option value="OTO">Otomatik ({G.bodrum ? "var" : "yok"})</option>
            <option value="VAR">Var</option>
            <option value="YOK">Yok</option>
          </select>
        </label>
        <label className="text-xs text-metin/60">
          Çatı
          <select value={ayar.cati} onChange={(e) => onChange({ ...ayar, cati: e.target.value === "DUZ" ? "DUZ" : "BESIK" })} className={`${sec} block mt-1`}>
            <option value="BESIK">Beşik (kiremit)</option>
            <option value="DUZ">Düz / teras</option>
          </select>
        </label>
        <button
          type="button"
          disabled={!elleKonum}
          onClick={() => onChange({ ...ayar, konumlar: {} })}
          className="focus-ring text-xs border border-hat bg-white px-3 py-2 rounded-md hover:border-soguk disabled:opacity-40"
        >
          ↺ Cihaz yerlerini sıfırla
        </button>
        <p className="text-[11px] text-metin/55 basis-full">
          Cihazları fareyle (telefonda parmakla) sürükleyin; bir cihaza tıklayıp klavye oklarıyla da kaydırabilirsiniz (Shift ile hızlı). Borular kendiliğinden
          yeniden çizilir. Hesabı kaydedince yerler saklanır ve PDF raporunda aynen çıkar.
        </p>
      </div>

      <div className="bg-white border border-hat rounded-lg p-2 overflow-x-auto">
        <div className="relative min-w-[44rem] select-none">
          <div className="[&>svg]:block" dangerouslySetInnerHTML={{ __html: svg }} />
          <svg
            ref={svgRef}
            viewBox={`0 0 ${GW} ${GH}`}
            className="absolute inset-0 w-full h-full"
            onPointerMove={(e) => {
              if (!surukle) return;
              const p = nokta(e);
              if (p) setSurukle({ ...surukle, x: Math.min(GW, Math.max(0, p.x - surukle.dx)), y: Math.min(GH, Math.max(0, p.y - surukle.dy)) });
            }}
            onPointerUp={birak}
            onPointerCancel={birak}
          >
            {yerler.map((y) => {
              const aktif = surukle?.id === y.id || secili === y.id;
              return (
                <rect
                  key={y.id}
                  x={y.x - y.w / 2 - 1.5}
                  y={y.y - y.h / 2 - 1.5}
                  width={y.w + 3}
                  height={y.h + 3}
                  rx={1}
                  tabIndex={0}
                  role="button"
                  aria-label={`${adlar.get(y.id) ?? "Cihaz"} — sürükleyerek taşıyın`}
                  fill={aktif ? "rgba(12,133,153,0.10)" : "transparent"}
                  stroke={aktif ? "#0c8599" : "transparent"}
                  strokeWidth={0.5}
                  strokeDasharray="1.5 1"
                  className="cursor-move hover:stroke-[#0c8599] outline-none"
                  style={{ touchAction: "none" }}
                  onFocus={() => setSecili(y.id)}
                  onBlur={() => setSecili((s) => (s === y.id ? null : s))}
                  onKeyDown={(e) => tus(e, y.id)}
                  onPointerDown={(e) => {
                    const p = nokta(e);
                    if (!p) return;
                    e.preventDefault();
                    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
                    (e.currentTarget as SVGRectElement).focus();
                    setSurukle({ id: y.id, dx: p.x - y.x, dy: p.y - y.y, x: y.x, y: y.y });
                  }}
                >
                  <title>{adlar.get(y.id)}</title>
                </rect>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
