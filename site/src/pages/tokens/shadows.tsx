import { Layers } from "lucide-react"
import { definePage, Section } from "@/lib/doc"

const shadows: [string, string, string][] = [
  ["shadow-sm", "shadow-sm", "Contrôles, éléments posés"],
  ["shadow-md", "shadow-md", "Cartes survolées, menus"],
  ["shadow-lg", "shadow-lg", "Fenêtres, tiroirs"],
]

export default definePage({
  id: "tokens-shadows",
  name: "Ombres",
  icon: Layers,
  intro:
    "Trois élévations, neutres et discrètes : l'ombre sépare les plans, elle ne décore pas.",
  view: () => (
    <Section title="Élévations">
      <ul className="grid gap-6 rounded-xl border border-border bg-background p-6 sm:grid-cols-3">
        {shadows.map(([name, className, role]) => (
          <li key={name}>
            <div className={`h-24 rounded-xl border border-border bg-card ${className}`} />
            <p className="mt-3 font-mono text-xs">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </li>
        ))}
      </ul>
    </Section>
  ),
})
