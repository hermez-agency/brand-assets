import type { ReactNode } from "react"
import { PenLine } from "lucide-react"
import { CodeBlock, definePage, Example, Section } from "@/lib/doc"
import { Badge } from "@/ui/badge"

/*
 * Le guide de blogging : pratique, mobile d'abord. Les captures et les grilles
 * sont dessinées en HTML avec les tokens du système, pas en images : elles
 * suivent le thème et ne vieillissent pas.
 */

/** Une liste à puces sobre, pour les consignes. */
function Rules({ items }: { items: ReactNode[] }) {
  return (
    <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-sm">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

/** Un tableau simple pour les repères chiffrés. */
function Facts({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-96 text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Une pastille numérotée posée sur une capture, reliée à sa légende. */
function Pin({ n }: { n: number }) {
  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {n}
    </span>
  )
}

/** Une image fictive : un aplat avec son format, pour montrer la place prise. */
function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border border-dashed border-border bg-muted text-xs text-muted-foreground ${className}`}
    >
      {label}
    </div>
  )
}

const steps = [
  ["Accroche", "Deux phrases : le lecteur se reconnaît et sait ce qu'il gagne à lire.", "Vous perdez du temps à retaper ce que vous venez de dire ?"],
  ["Problème", "Le coût concret de la situation actuelle, avec un chiffre ou une scène vécue.", "Taper à la main : 40 mots par minute. Parler : 150."],
  ["Solution", "Ce que fait le produit, en une idée, puis comment l'essayer.", "Whisper Desk écrit dans n'importe quel champ, au raccourci clavier."],
  ["Exemples", "Un cas réel tiré d'un produit Hermez : capture, extrait de code ou chiffre.", "Une note de réunion dictée, ponctuée toute seule."],
  ["Conclusion", "Un résumé en une phrase et une seule action à faire ensuite.", "Essayez Whisper Desk, c'est gratuit pendant 14 jours."],
]

/** La capture annotée : un article tel qu'il doit se lire sur mobile, avec ses repères. */
function AnnotatedArticle() {
  const notes = [
    "Titre h1 : une seule fois, la promesse en moins de 65 caractères.",
    "Chapeau : deux phrases, le problème et la promesse.",
    "Image d'ouverture pleine largeur, ratio 16:9, avec texte alternatif.",
    "Intertitre h2 : une idée par section, lisible en survol.",
    "Paragraphe court : 3 à 4 lignes sur mobile.",
    "Image flottante : à droite dès 768 px, pleine largeur en dessous.",
    "Call-to-action : un seul par article, après la solution.",
  ]
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,22rem)_1fr]">
      <div className="mx-auto w-full max-w-88 overflow-hidden rounded-3xl border-4 border-foreground/80 bg-background">
        <div className="space-y-3 p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Produit</Badge> 5 min de lecture
          </p>
          <h3 className="relative text-xl leading-tight">
            Dicter ses notes de réunion sans les retaper
            <span className="absolute -left-1 -top-3"><Pin n={1} /></span>
          </h3>
          <p className="relative text-sm text-muted-foreground">
            Retaper une réunion prend plus de temps que la réunion elle-même. Voici comment le clavier cesse d'être le goulot.
            <span className="absolute -right-1 -top-3"><Pin n={2} /></span>
          </p>
          <div className="relative">
            <Placeholder label="1536 × 864 · pleine largeur" className="aspect-video" />
            <span className="absolute -top-2 right-1"><Pin n={3} /></span>
          </div>
          <h4 className="relative text-base">
            Parler plutôt que taper
            <span className="absolute -right-1 -top-3"><Pin n={4} /></span>
          </h4>
          <div className="relative space-y-2 text-sm">
            <p>Le raccourci global écrit dans le champ actif. Pas de fenêtre à ouvrir, pas de copier-coller.</p>
            <span className="absolute -right-1 -top-3"><Pin n={5} /></span>
          </div>
          <div className="relative flex gap-3">
            <Placeholder label="1:1" className="size-20 shrink-0" />
            <p className="text-sm text-muted-foreground">La ponctuation arrive d'elle-même, comme sur la capture ci-contre.</p>
            <span className="absolute -top-2 left-16"><Pin n={6} /></span>
          </div>
          <div className="relative rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground">
            Essayer Whisper Desk
            <span className="absolute -top-2 right-1"><Pin n={7} /></span>
          </div>
        </div>
      </div>
      <ol className="space-y-3 text-sm">
        {notes.map((note, i) => (
          <li key={note} className="flex items-start gap-3">
            <Pin n={i + 1} />
            <span>{note}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** La grille d'images : pleine largeur contre flottante, à l'échelle du mobile puis du bureau. */
function ImageGrid() {
  const line = <div className="h-1.5 rounded-full bg-border" />
  const lines = (
    <div className="space-y-1.5">
      {line}
      {line}
      {line}
    </div>
  )
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Example label="Pleine largeur : ouverture, capture d'écran, schéma large" className="space-y-3">
        {lines}
        <Placeholder label="100 % de la colonne · 16:9" className="aspect-video" />
        <p className="text-xs text-muted-foreground">Légende sous l'image, crédit à la suite.</p>
        {lines}
      </Example>
      <Example label="Flottante : portrait, logo, détail d'interface" className="space-y-3">
        <div className="flex gap-3">
          <Placeholder label="1:1" className="size-24 shrink-0" />
          <div className="flex-1">{lines}</div>
        </div>
        {lines}
        {lines}
      </Example>
    </div>
  )
}

const frontmatter = `---
title: "Dicter ses notes de réunion sans les retaper"
description: "Whisper Desk écrit dans n'importe quel champ, au raccourci clavier. Un cas concret, en 5 minutes de lecture."
slug: dicter-notes-reunion
date: 2026-11-06
author: Hermez
product: whisper-desk
tags: [dictée, productivité]
cover: /blog/dicter-notes-reunion/cover.png
coverAlt: "Une note de réunion dictée dans un éditeur de texte"
---`

const seoHead = `<title>Dicter ses notes de réunion sans les retaper · Whisper Desk</title>
<meta name="description" content="Whisper Desk écrit dans n'importe quel champ, au raccourci clavier. Un cas concret, en 5 minutes de lecture.">
<link rel="canonical" href="https://hermez.dev/blog/dicter-notes-reunion">
<meta property="og:type" content="article">
<meta property="og:title" content="Dicter ses notes de réunion sans les retaper">
<meta property="og:description" content="Un cas concret, en 5 minutes de lecture.">
<meta property="og:image" content="https://hermez.dev/blog/dicter-notes-reunion/og.png">
<meta property="og:url" content="https://hermez.dev/blog/dicter-notes-reunion">
<meta name="twitter:card" content="summary_large_image">
<meta property="article:published_time" content="2026-11-06">`

const template = `---
title: ""            # 65 caractères au plus
description: ""      # 150 à 160 caractères
slug: ""
date: AAAA-MM-JJ
author: Hermez
product: ""
tags: []
cover: ""
coverAlt: ""
---

Accroche en deux phrases : le lecteur se reconnaît, il sait ce qu'il gagne.

## Le problème

Le coût concret de la situation actuelle.

## La solution

Ce que fait le produit, en une idée.

![Texte alternatif](./image.png)
*Légende. Crédit : auteur, source.*

## Un exemple

Un cas réel : capture, extrait, chiffre.

## Pour finir

Une phrase de résumé, puis une seule action.

[Essayer le produit](https://hermez.dev/…)`

function BloggingView() {
  return (
    <>
      <Section
        title="Introduction"
        intro="Un article de blog est la façon la moins chère de faire connaître un produit : il se lit sur mobile, se partage et se retrouve par la recherche. Ce guide donne une méthode unique pour tous les produits Hermez."
      >
        <Rules
          items={[
            <><strong>Pour qui :</strong> les équipes de Ponos, Leadz, Whisper Desk, Resource View, Opoil, et le site Hermez.</>,
            <><strong>Principe :</strong> écrire pour une personne, un problème, une action. Si l'article ne tient pas dans cette phrase, il en faut deux.</>,
            <><strong>Mobile d'abord :</strong> on rédige, on met en page et on relit sur un écran de 390 px de large, puis on élargit.</>,
          ]}
        />
      </Section>

      <Section title="Planification" intro="Avant la première ligne : un sujet, un angle, un lecteur.">
        <Facts
          head={["Décision", "Question à trancher", "Exemple"]}
          rows={[
            ["Sujet", "Quel problème du lecteur le produit résout-il ?", "Retaper ses notes de réunion (Whisper Desk)"],
            ["Angle", "Tutoriel, retour d'expérience, comparatif ou annonce ?", "Retour d'expérience : une semaine sans clavier"],
            ["Audience", "Qui lit, que sait-il déjà, que veut-il faire ensuite ?", "Indépendant, connaît la dictée, veut gagner du temps"],
            ["Mot-clé", "Que tape cette personne dans un moteur de recherche ?", "« dicter notes de réunion »"],
          ]}
        />
        <Rules
          items={[
            "Un article, un angle. Deux angles font deux articles.",
            "Partir d'un cas réel d'un produit : un ticket fermé, une version publiée, une question reçue.",
            "Écrire la phrase « après cet article, le lecteur pourra… » avant de commencer.",
          ]}
        />
      </Section>

      <Section
        title="Structure d'article"
        intro="Cinq temps, dans cet ordre. Chacun tient en un titre et quelques paragraphes."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([name, rule, example], i) => (
            <div key={name} className="rounded-xl border border-border bg-card p-4">
              <p className="flex items-center gap-2 font-medium">
                <Pin n={i + 1} /> {name}
              </p>
              <p className="mt-2 text-sm">{rule}</p>
              <p className="mt-2 text-sm text-muted-foreground">« {example} »</p>
            </div>
          ))}
        </div>
        <Rules items={["Longueur visée : 800 à 1 500 mots, soit 4 à 7 minutes de lecture.", "Paragraphes de 3 à 4 lignes sur mobile, une idée chacun."]} />
      </Section>

      <Section
        title="Mise en forme"
        intro="Voici un article bien formaté, tel qu'il s'affiche sur un téléphone, avec ses repères."
      >
        <Example label="Capture annotée : article sur mobile (390 px)">
          <AnnotatedArticle />
        </Example>
        <Rules
          items={[
            "Un seul h1 ; les h2 découpent l'article ; les h3 ne servent qu'à subdiviser un h2.",
            "Ne jamais sauter un niveau de titre (h2 puis h4).",
            "Un call-to-action unique, un verbe à l'infinitif (« Essayer », « Télécharger »), placé après la solution et répété en conclusion.",
          ]}
        />
      </Section>

      <Section title="Optimisation SEO" intro="Le référencement se prépare à l'écriture, pas après.">
        <Rules
          items={[
            "Un mot-clé principal : dans le titre, le premier paragraphe, un h2 et le slug.",
            "Titre de page sous 65 caractères, description entre 150 et 160.",
            "Au moins 2 liens internes (autre article, page produit) et 1 lien externe fiable, avec un texte de lien qui dit où il mène.",
            "Une URL courte, en minuscules, sans accent ni date : /blog/dicter-notes-reunion.",
          ]}
        />
        <Example label="Métadonnées complètes : en-tête de l'article (Markdown)">
          <CodeBlock>{frontmatter}</CodeBlock>
        </Example>
        <Example label="Métadonnées complètes : balises rendues dans le <head>">
          <CodeBlock>{seoHead}</CodeBlock>
        </Example>
      </Section>

      <Section title="Images et médias">
        <ImageGrid />
        <Facts
          head={["Usage", "Taille", "Format"]}
          rows={[
            ["Image d'ouverture", "1536 × 864 (16:9)", "PNG ou WebP, moins de 200 Ko"],
            ["Image de partage (og:image)", "1200 × 630", "PNG ou JPEG"],
            ["Image flottante", "480 × 480 (1:1)", "PNG ou WebP"],
            ["Capture d'écran", "1280 px de large au plus", "PNG, sans données personnelles"],
          ]}
        />
        <Rules
          items={[
            <><strong>Texte alternatif :</strong> décrit ce qu'on voit et pourquoi c'est là, en une phrase, sans « image de ». Vide si l'image est purement décorative.</>,
            <><strong>Crédits :</strong> sous la légende, « Crédit : auteur, source ». Une image sans licence claire ne se publie pas.</>,
            <><strong>Mobile :</strong> l'image flottante passe pleine largeur sous 768 px ; jamais de texte important dans l'image seule.</>,
          ]}
        />
      </Section>

      <Section title="Publication">
        <Facts
          head={["Quoi", "Règle"]}
          rows={[
            ["Fréquence", "Un article toutes les deux semaines par produit actif ; mieux vaut peu et régulier."],
            ["Jour et heure", "Mardi ou jeudi, entre 8 h et 10 h, heure de Paris."],
            ["Réseaux sociaux", "Le jour même sur LinkedIn et X : une phrase d'accroche, l'image de partage, le lien. Reprise à J+7 avec un autre angle."],
            ["Suivi", "Relever les visites à J+7 dans Umami et noter ce qui a marché."],
          ]}
        />
      </Section>

      <Section title="Template Markdown" intro="À copier pour chaque nouvel article.">
        <CodeBlock>{template}</CodeBlock>
      </Section>

      <Section title="Checklist de relecture">
        <Rules
          items={[
            "Le titre tient en 65 caractères et promet ce que l'article tient.",
            "La description fait 150 à 160 caractères.",
            "Un seul h1, aucun niveau de titre sauté.",
            "Chaque image a un texte alternatif, un crédit et un poids raisonnable.",
            "L'article se lit sans accroc sur 390 px de large.",
            "Un seul call-to-action, le lien fonctionne.",
            "Au moins 2 liens internes et 1 lien externe.",
            "Signature « Un produit Hermez » ; pas de nom de personne.",
          ]}
        />
      </Section>

      <Section title="Ton et voix">
        <Facts
          head={["On écrit", "On évite"]}
          rows={[
            ["« Vous » : clair, direct, sans jargon", "« On », « nous les experts », le tutoiement"],
            ["Des verbes concrets et des chiffres", "« Révolutionnaire », « innovant », « solution tout-en-un »"],
            ["L'agence Hermez et ses produits", "Un nom de personne en avant"],
            ["Des titres en casse de phrase", "Les titres en capitales, les points d'exclamation"],
          ]}
        />
      </Section>
    </>
  )
}

export default definePage({
  id: "blogging",
  name: "Blogging",
  icon: PenLine,
  intro: "Rédiger et mettre en forme des articles de blog efficaces",
  view: BloggingView,
})
