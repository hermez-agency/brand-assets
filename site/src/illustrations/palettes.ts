/*
 * Les palettes des illustrations d'articles : une par marque, deux thèmes.
 * Seule source : le site (page « Illustrations d'articles »), l'outil
 * `scripts/illustrations.ts` et la skill la relisent ici. Pas d'import : le
 * fichier se charge aussi bien par Vite que par Node (`node scripts/…ts`).
 *
 * Les orange et les gris viennent de `styles.css` (orange `#e8611a`, `#f2803f`
 * sur sombre, pierre `stone`). Les rôles sont les mêmes pour toutes les
 * marques : seule la valeur change.
 */

export type Theme = "light" | "dark"

/** Les sept rôles de couleur d'une illustration. */
export const roles = ["bg", "surface", "line", "ink", "mute", "accent", "soft"] as const
export type Role = (typeof roles)[number]
export type Palette = Record<Role, string>

export const roleHelp: Record<Role, string> = {
  bg: "Fond plein cadre (le seul aplat qui dépasse la zone sûre).",
  surface: "Aplat des formes secondaires : cartes, tuiles, socles.",
  line: "Trait fin et structure : rails, contours, repères.",
  ink: "Forme forte, la deuxième en importance après l'accent.",
  mute: "Éléments en retrait : points, tuiles « avant », traits discrets.",
  accent: "Le foyer de l'image : une ou deux formes, jamais plus de 15 % de la surface.",
  soft: "Teinte claire de l'accent : halo, fond d'une forme accentuée.",
}

export interface Brand {
  id: "hermez" | "ponos" | "react-resource-view" | "leadz"
  name: string
  /** Le thème de l'image de partage et des rasters sans préférence. */
  defaultTheme: Theme
  note: string
  themes: Record<Theme, Palette>
}

export const brands: Brand[] = [
  {
    id: "hermez",
    name: "Hermez",
    defaultTheme: "light",
    note: "Le portfolio de l'agence : gris stone, orange #e8611a.",
    themes: {
      light: { bg: "#fafaf9", surface: "#f0eeec", line: "#d6d3d1", ink: "#1c1917", mute: "#a8a29e", accent: "#e8611a", soft: "#fbdcc8" },
      dark: { bg: "#141414", surface: "#201d1b", line: "#3a3633", ink: "#fafaf9", mute: "#78716c", accent: "#f2803f", soft: "#43271a" },
    },
  },
  {
    id: "ponos",
    name: "Ponos",
    defaultTheme: "dark",
    note: "L'orange sur l'écran sombre du logo « Écran ». Le thème sombre est celui de la marque.",
    themes: {
      light: { bg: "#f5f2ef", surface: "#e9e4df", line: "#cdc6bf", ink: "#1c1917", mute: "#9a928a", accent: "#e8611a", soft: "#f8d5bf" },
      dark: { bg: "#17140f", surface: "#26211c", line: "#413a33", ink: "#f5f2ef", mute: "#7d746a", accent: "#f2803f", soft: "#4a2a16" },
    },
  },
  {
    id: "react-resource-view",
    name: "React Resource View",
    defaultTheme: "light",
    note: "Orange #e8611a, papier crème, encre chaude.",
    themes: {
      light: { bg: "#fbf3e4", surface: "#f3e6cf", line: "#dccaa8", ink: "#231a10", mute: "#b09c7e", accent: "#e8611a", soft: "#f9d2b0" },
      dark: { bg: "#18130c", surface: "#251d12", line: "#44371f", ink: "#fbf3e4", mute: "#8a7757", accent: "#f2803f", soft: "#4d2c13" },
    },
  },
  {
    id: "leadz",
    name: "Leadz",
    defaultTheme: "light",
    note: "Orange Hermez sur gris zinc, encre du ninja.",
    themes: {
      light: { bg: "#f6f6f7", surface: "#ebebed", line: "#d1d1d6", ink: "#18181b", mute: "#a1a1aa", accent: "#e8611a", soft: "#fcd9c4" },
      dark: { bg: "#0f0f12", surface: "#1b1b20", line: "#34343c", ink: "#f4f4f5", mute: "#71717a", accent: "#f2803f", soft: "#41261a" },
    },
  },
]

/** Le nom de la variable CSS d'un rôle. */
export const cssVar = (role: Role) => `--ill-${role}`

const declarations = (p: Palette) => roles.map((r) => `${cssVar(r)}:${p[r]}`).join(";")

/**
 * Le bloc `<style>` à mettre en tête de chaque SVG. Le clair est la base, le
 * sombre suit `prefers-color-scheme` (SVG en `<img>`) ou une classe `.dark`
 * sur un ancêtre (SVG en ligne) ; `.light` force le clair. Les sélecteurs
 * portent `data-brand` : plusieurs marques cohabitent dans une même page.
 */
export function paletteStyle(brand: Brand): string {
  const s = `svg[data-brand="${brand.id}"]`
  const { light, dark } = brand.themes
  return [
    `<style>`,
    `${s}{${declarations(light)}}`,
    `@media (prefers-color-scheme:dark){${s}{${declarations(dark)}}}`,
    `.dark ${s}{${declarations(dark)}}`,
    `.light ${s}{${declarations(light)}}`,
    `</style>`,
  ].join("\n")
}

/** Le début d'un SVG vierge de la marque : viewBox, palette, fond, zone sûre en repère. */
export function template(brand: Brand): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="DESCRIPTION" data-brand="${brand.id}" stroke-linecap="round" stroke-linejoin="round">
${paletteStyle(brand)}
<rect width="1600" height="900" fill="var(--ill-bg)"/>
<!-- Zone sûre : x 120 à 1480, y 90 à 810. Tout le contenu y reste. -->
</svg>
`
}

/**
 * Remplace les `var(--ill-…)` par les valeurs de la palette et retire le bloc
 * de variables : les rasteriseurs (librsvg, etc.) ne lisent pas les variables CSS.
 */
export function resolve(svg: string, brand: Brand, theme: Theme): string {
  const palette = brand.themes[theme]
  return svg
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/var\(--ill-([a-z]+)\)/g, (_, role: Role) => {
      if (!(role in palette)) throw new Error(`Rôle inconnu : --ill-${role}`)
      return palette[role]
    })
}
