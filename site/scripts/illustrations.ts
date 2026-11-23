/*
 * L'outil des illustrations d'articles (voir la page « Illustrations d'articles »
 * du site et la skill `skills/illustrations-article/SKILL.md`).
 *
 *   node scripts/illustrations.ts template <marque>
 *       Imprime un SVG vierge de la marque : viewBox, palette, fond.
 *   node scripts/illustrations.ts check <fichier.svg>
 *       Vérifie la grammaire : viewBox, pas de texte ni d'image ni de dégradé,
 *       couleurs par variables, formes dans la zone sûre.
 *   node scripts/illustrations.ts rasterize <fichier.svg> --out <dossier>
 *       [--name <nom>] [--themes light,dark]
 *       Écrit <nom>-480.avif/.webp, <nom>-960.avif/.webp et <nom>-share.jpg
 *       (1200 × 630, recadré au centre). Les variables CSS sont remplacées par
 *       la palette de la marque (celle de `data-brand`), dans son thème par
 *       défaut ; avec deux thèmes, les fichiers du sombre portent « -dark ».
 *
 * Il se lance depuis ce dossier (`pnpm illustrations …`), avec des chemins
 * absolus pour les fichiers des autres dépôts.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"
import sharp from "sharp"
import { brands, resolve, template, type Theme } from "../src/illustrations/palettes.ts"

const viewBox = "0 0 1600 900"
/** Zone sûre : ce que le recadrage 1200 × 630 laisse, moins une marge. */
const safe = { x1: 120, y1: 90, x2: 1480, y2: 810 }
const widths = [480, 960]
const share = { width: 1200, height: 630 }

const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}

const findBrand = (id: string) => brands.find((b) => b.id === id) ?? fail(`Marque inconnue : ${id} (${brands.map((b) => b.id).join(", ")})`)

const brandOf = (svg: string) => findBrand(/data-brand="([^"]+)"/.exec(svg)?.[1] ?? fail("Pas d'attribut data-brand sur le <svg>."))

/** Les problèmes d'un SVG, un par ligne. */
function check(svg: string): string[] {
  const problems: string[] = []
  if (!new RegExp(`<svg[^>]*viewBox="${viewBox}"`).test(svg)) problems.push(`viewBox attendu : "${viewBox}".`)
  if (!/data-brand="/.test(svg)) problems.push("data-brand manquant.")
  if (!/aria-label="[^"]+"/.test(svg) || /aria-label="DESCRIPTION"/.test(svg)) problems.push("aria-label à renseigner (le texte alternatif).")
  for (const tag of ["text", "tspan", "image", "foreignObject", "script", "linearGradient", "radialGradient", "filter"]) {
    if (new RegExp(`<${tag}[\\s>/]`).test(svg)) problems.push(`<${tag}> interdit (ni texte, ni image, ni dégradé, ni filtre).`)
  }
  const body = svg.replace(/<style>[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "")
  for (const m of body.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g)) problems.push(`Couleur en dur « ${m[0]} » : utiliser var(--ill-…).`)
  const shapes = body.match(/<(rect|circle|ellipse|path|line|polyline|polygon)\b/g)?.length ?? 0
  if (shapes > 41) problems.push(`${shapes} formes : 40 au plus, fond compris.`)
  if (shapes < 4) problems.push(`${shapes} formes : trop peu.`)
  for (const m of body.matchAll(/stroke-width="([\d.]+)"/g)) {
    if (![4, 8, 12].includes(Number(m[1]))) problems.push(`stroke-width ${m[1]} : 4, 8 ou 12 seulement.`)
  }
  const num = (tag: string, name: string) => Number(new RegExp(`\\b${name}="(-?[\\d.]+)"`).exec(tag)?.[1] ?? 0)
  const out = (what: string, x1: number, y1: number, x2: number, y2: number) => {
    if (x1 < safe.x1 || y1 < safe.y1 || x2 > safe.x2 || y2 > safe.y2) problems.push(`${what} sort de la zone sûre (x ${safe.x1}–${safe.x2}, y ${safe.y1}–${safe.y2}).`)
  }
  for (const [tag] of body.matchAll(/<rect\b[^>]*>/g)) {
    const [x, y, w, h] = [num(tag, "x"), num(tag, "y"), num(tag, "width"), num(tag, "height")]
    if (w >= 1600 && h >= 900) continue
    out(`<rect x="${x}" y="${y}">`, x, y, x + w, y + h)
  }
  for (const [tag] of body.matchAll(/<circle\b[^>]*>/g)) {
    const [cx, cy, r] = [num(tag, "cx"), num(tag, "cy"), num(tag, "r")]
    out(`<circle cx="${cx}" cy="${cy}">`, cx - r, cy - r, cx + r, cy + r)
  }
  return problems
}

async function rasterize(file: string, out: string, name: string, themes: Theme[]) {
  const svg = readFileSync(file, "utf8")
  const brand = brandOf(svg)
  mkdirSync(out, { recursive: true })
  const written: string[] = []
  for (const theme of themes) {
    const suffix = themes.length > 1 && theme === "dark" ? "-dark" : ""
    const source = Buffer.from(resolve(svg, brand, theme))
    // Le SVG est dessiné à 3200 px : les rasters en descendent, sans flou.
    const base = () => sharp(source, { density: 288 }).resize(3200, 1800)
    for (const width of widths) {
      const resized = () => base().resize(width, Math.round((width * 9) / 16))
      const avif = join(out, `${name}${suffix}-${width}.avif`)
      const webp = join(out, `${name}${suffix}-${width}.webp`)
      await resized().avif({ quality: 60, effort: 6 }).toFile(avif)
      await resized().webp({ quality: 82 }).toFile(webp)
      written.push(avif, webp)
    }
    // Le partage n'existe que dans le thème par défaut de la marque (ou le seul demandé).
    if (theme === (themes.length > 1 ? brand.defaultTheme : theme)) {
      const jpg = join(out, `${name}-share.jpg`)
      await base()
        .resize(share.width, share.height, { fit: "cover", position: "centre" })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(jpg)
      written.push(jpg)
    }
  }
  return written
}

const [command, target, ...rest] = process.argv.slice(2)
const option = (flag: string) => {
  const i = rest.indexOf(flag)
  return i < 0 ? undefined : rest[i + 1]
}

if (command === "template" && target) {
  process.stdout.write(template(findBrand(target)))
} else if (command === "check" && target) {
  const problems = check(readFileSync(target, "utf8"))
  if (problems.length) fail(problems.map((p) => `✗ ${p}`).join("\n"))
  console.log("✓ grammaire respectée")
} else if (command === "rasterize" && target) {
  const out = option("--out") ?? fail("--out <dossier> manquant.")
  const themes = (option("--themes")?.split(",") ?? []) as Theme[]
  const svg = readFileSync(target, "utf8")
  const brand = brandOf(svg)
  const problems = check(svg)
  if (problems.length) fail(problems.map((p) => `✗ ${p}`).join("\n"))
  const files = await rasterize(target, out, option("--name") ?? basename(target, ".svg"), themes.length ? themes : [brand.defaultTheme])
  for (const f of files) console.log(f)
} else {
  fail(readFileSync(new URL(import.meta.url), "utf8").split("*/")[0].replace(/^\/\*\n?/, ""))
}
