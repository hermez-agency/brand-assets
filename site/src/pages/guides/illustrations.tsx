import { Shapes } from "lucide-react"
import { CodeBlock, definePage, Example, Section } from "@/lib/doc"
import { brands, roleHelp, roles, type Brand, type Theme } from "@/illustrations/palettes"

/*
 * La grammaire visuelle des illustrations d'articles des quatre blogs Hermez.
 * Les palettes viennent de `src/illustrations/palettes.ts`, les exemples sont
 * les vrais SVG de `src/illustrations/examples/`, affichés en ligne : ils
 * suivent le thème comme sur un blog.
 */

const examples = import.meta.glob("../../illustrations/examples/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

const exampleOf = (brand: Brand) => {
  const entry = Object.entries(examples).find(([path]) => path.includes(`/${brand.id}-`))
  return entry?.[1] ?? ""
}

/** Une illustration en ligne, dans le thème demandé (le SVG porte ses variables). */
function Illustration({ svg, theme, className = "" }: { svg: string; theme: Theme; className?: string }) {
  return (
    <div
      className={`${theme} overflow-hidden rounded-lg border border-border [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/** Un tableau simple : une règle par ligne. */
function Rules({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-96 text-left text-sm">
        <tbody>
          {rows.map(([name, rule]) => (
            <tr key={name} className="border-b border-border last:border-0">
              <th className="w-44 px-4 py-2.5 align-top font-medium">{name}</th>
              <td className="px-4 py-2.5">{rule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Le gabarit en plan : le cadre 16:9, la zone sûre, le recadrage de partage et la grille. */
function FormatDiagram() {
  const cols = Array.from({ length: 15 }, (_, i) => (i + 1) * 100)
  const rows = Array.from({ length: 8 }, (_, i) => (i + 1) * 100)
  return (
    <svg viewBox="0 0 1600 900" role="img" aria-label="Le cadre 16:9, la zone de partage 1200 par 630 et la zone sûre" className="w-full rounded-lg border border-border bg-background">
      {cols.map((x) => <line key={x} x1={x} y1={0} x2={x} y2={900} stroke="var(--border)" strokeWidth={2} />)}
      {rows.map((y) => <line key={y} x1={0} y1={y} x2={1600} y2={y} stroke="var(--border)" strokeWidth={2} />)}
      <rect x={0} y={30} width={1600} height={840} fill="none" stroke="var(--muted-foreground)" strokeWidth={4} strokeDasharray="16 12" />
      <rect x={120} y={90} width={1360} height={720} rx={24} fill="var(--accent)" fillOpacity={0.6} stroke="var(--primary)" strokeWidth={6} />
      <circle cx={800} cy={450} r={12} fill="var(--primary)" />
    </svg>
  )
}

const grammar: [string, string][] = [
  ["Cadre", "16:9, viewBox fixe « 0 0 1600 900 ». Un SVG sans cet attribut est refusé par l'outil."],
  ["Zone sûre", "x 120 à 1480, y 90 à 810. Le recadrage de partage 1200 × 630 (centré, ratio 1,9) rogne 30 unités en haut et en bas : toute forme reste dans la zone sûre, seul le fond va jusqu'au bord."],
  ["Grille", "Cases de 100 unités (16 × 9), sous-grille de 20. Les formes se posent sur la grille, les rotations restent entre −20° et 20°."],
  ["Formes permises", "Rectangles à coins arrondis, cercles, lignes, arcs et polylignes. Pas de forme libre, pas de silhouette, pas de pictogramme reconnaissable."],
  ["Trait", "Trois épaisseurs seulement : 4 (contour discret), 8 (structure), 12 (forme forte). Extrémités et jointures toujours arrondies."],
  ["Rayons", "Rectangles : 24 (tuiles et cartes), 40 (grand cadre), 20 pour une pastille à demi-hauteur. Jamais d'angle vif."],
  ["Éléments", "De 5 à 12 formes visibles, 40 au maximum fond compris. Au moins la moitié du cadre reste vide."],
  ["Métaphore", "Une ou deux par article : un avant et un après (désordre → rangé), un flux, un cadre qui contient. La composition se lit en un coup d'œil, de gauche à droite."],
  ["Accent", "Une ou deux formes en « accent », jamais plus de 15 % de la surface : c'est le point où l'œil se pose."],
  ["Aplats", "Pas de dégradé, d'ombre ni de flou. La transparence passe par le rôle « soft », pas par l'opacité."],
  ["Interdits", "Pas de texte (le titre de l'article suffit), pas de logo ni de mascotte, pas de personnage ni de visage, pas de dégradé criard, pas de couleur en dur."],
]

const tool = `# Depuis un clone de brand-assets
cd site && pnpm install   # une fois
pnpm illustrations template ponos > /tmp/mon-article.svg     # SVG vierge
pnpm illustrations check /tmp/mon-article.svg                # grammaire
pnpm illustrations rasterize /tmp/mon-article.svg \\
  --out /chemin/du/blog/public/articles --name mon-article`

const python = `import subprocess
subprocess.run(
    ["pnpm", "--dir", "/chemin/de/brand-assets/site", "illustrations",
     "rasterize", svg_path, "--out", out_dir, "--name", slug],
    check=True,
)`

function Palette({ brand }: { brand: Brand }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-medium">{brand.name}</p>
      <p className="mb-3 text-sm text-muted-foreground">{brand.note}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["light", "dark"] as const).map((theme) => (
          <div key={theme}>
            <p className="mb-1.5 text-xs text-muted-foreground">
              {theme === "light" ? "Clair" : "Sombre"}
              {brand.defaultTheme === theme && " · thème par défaut des rasters"}
            </p>
            <div className="flex overflow-hidden rounded-md border border-border">
              {roles.map((role) => (
                <span key={role} title={`${role} ${brand.themes[theme][role]}`} className="h-10 flex-1" style={{ background: brand.themes[theme][role] }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground uppercase">
        {roles.map((role) => `${role} ${brand.themes.light[role]}`).join(" · ")}
      </p>
    </div>
  )
}

export default definePage({
  id: "guides-illustrations",
  name: "Illustrations d'articles",
  icon: Shapes,
  intro:
    "Une même grammaire visuelle pour les illustrations des quatre blogs Hermez : vectorielle, plate, géométrique, sans texte. Seule la palette change.",
  view: () => (
    <>
      <Section
        title="Le principe"
        intro="Un SVG écrit à la main, avec les couleurs exactes de la marque, qui suit le thème clair et sombre, sans coût ni clé d'API. Les blogs (portfolio hermez.dev, Ponos, React Resource View, Leadz) le reprennent tel quel et le rasterisent avec l'outil de ce dépôt."
      >
        <Example label="Le cadre : 16:9, zone de partage 1200 × 630 (pointillés), zone sûre (orange), grille de 100">
          <FormatDiagram />
        </Example>
      </Section>

      <Section title="La grammaire" intro="Les règles sont les mêmes pour toutes les marques ; l'outil en vérifie une partie (« check »).">
        <Rules rows={grammar} />
      </Section>

      <Section
        title="Les palettes"
        intro="Sept rôles, une valeur par marque et par thème. Le SVG les déclare en variables CSS --ill-* dans un bloc style (sombre via `prefers-color-scheme` ou une classe `.dark` sur un ancêtre) ; les rasters reprennent les valeurs du thème par défaut de la marque."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {brands.map((b) => <Palette key={b.id} brand={b} />)}
        </div>
        <Rules rows={roles.map((r) => [`--ill-${r}`, roleHelp[r]])} />
      </Section>

      <Section
        title="Rasteriser, et comment les autres dépôts s'en servent"
        intro="Un SVG donne en un passage deux largeurs en AVIF et en WebP (480 et 960 px, 16:9) et un JPEG de partage 1200 × 630, recadré au centre, avec les valeurs de repli de la palette (les rasteriseurs ne lisent pas les variables CSS)."
      >
        <CodeBlock>{tool}</CodeBlock>
        <p className="max-w-2xl text-sm">
          <strong>Choix : une commande lancée depuis brand-assets</strong>, pas un script à copier ni un paquet. La palette et la grammaire ne vivent qu'ici, une copie dérive ; un paquet npm demande un registre public et une release pour chaque réglage ; Ponos est en Python et ne peut pas utiliser un paquet npm, alors qu'une commande s'appelle de n'importe quel langage. Le blog commite le SVG et les rasters produits, il ne dépend pas de l'outil à la construction.
        </p>
        <CodeBlock>{python}</CodeBlock>
      </Section>

      <Section
        title="La skill"
        intro="Le fichier skills/illustrations-article/SKILL.md du dépôt explique à Claude comment passer du sujet d'un article à une composition, quelles règles et quelle palette prendre, comment relire le rendu, avec trois exemples commentés. Une session d'un autre projet la lit depuis un clone de brand-assets ou son URL brute sur GitHub."
      />

      <Section
        title="Galerie : un sujet, quatre marques"
        intro="Le sujet : « du désordre au résultat ». Même cadre, même grille, mêmes tuiles à gauche ; la forme d'arrivée et la palette changent."
      >
        <div className="space-y-6">
          {brands.map((b) => (
            <div key={b.id}>
              <p className="mb-2 font-medium">{b.name}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Illustration svg={exampleOf(b)} theme="light" />
                <Illustration svg={exampleOf(b)} theme="dark" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  ),
})
