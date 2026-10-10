// Çizim listesini SVG metnine çevirir (panelde gösterim için).
// Metinler kaçışlanır; çizim yalnızca hesap motorunun ürettiği şekillerden oluşur.
import type { Cizim } from "./cizim";

const kac = (m: string) => m.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const s = (x: number) => (Math.round(x * 100) / 100).toString();

export function cizimSvg(c: Cizim, baslik = "Çizim"): string {
  const p: string[] = [];
  for (const o of c.ogeler) {
    const dash = (k: boolean | undefined) => (k ? ` stroke-dasharray="2 1.5"` : "");
    if (o.t === "cizgi") {
      p.push(`<line x1="${s(o.x1)}" y1="${s(o.y1)}" x2="${s(o.x2)}" y2="${s(o.y2)}" stroke="${o.renk}" stroke-width="${o.k}"${dash(o.kesik)} stroke-linecap="round"/>`);
    } else if (o.t === "yol") {
      const n = o.n.map(([x, y]) => `${s(x)},${s(y)}`).join(" ");
      const el = o.kapali ? "polygon" : "polyline";
      p.push(`<${el} points="${n}" fill="${o.dolgu ?? "none"}" stroke="${o.renk}" stroke-width="${o.k}"${dash(o.kesik)} stroke-linejoin="round" stroke-linecap="round"/>`);
    } else if (o.t === "dortgen") {
      p.push(
        `<rect x="${s(o.x)}" y="${s(o.y)}" width="${s(o.w)}" height="${s(o.h)}" rx="${s(o.r ?? 0)}" fill="${o.dolgu ?? "none"}" stroke="${o.renk}" stroke-width="${o.k}"${dash(o.kesik)}/>`
      );
    } else if (o.t === "daire") {
      p.push(`<circle cx="${s(o.x)}" cy="${s(o.y)}" r="${s(o.r)}" fill="${o.dolgu ?? "none"}" stroke="${o.renk}" stroke-width="${o.k}"/>`);
    } else {
      const anchor = o.hiza === "orta" ? "middle" : o.hiza === "sag" ? "end" : "start";
      p.push(
        `<text x="${s(o.x)}" y="${s(o.y)}" font-size="${o.b}" fill="${o.renk}" text-anchor="${anchor}"${o.kalin ? ` font-weight="700"` : ""}>${kac(o.m)}</text>`
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" role="img" aria-label="${kac(baslik)}" font-family="Arial, Helvetica, sans-serif" style="width:100%;height:auto;background:#fff">${p.join("")}</svg>`;
}
