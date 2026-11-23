---
name: illustrations-article
description: Dessine l'illustration d'un article de blog Hermez (portfolio hermez.dev, Ponos, React Resource View, Leadz) en SVG, la vérifie et la rasterise en AVIF, WebP et JPEG de partage. À utiliser quand un article a besoin d'une image d'ouverture ; remplace les images générées par FLUX/OpenRouter.
---

# Illustrations d'articles Hermez

Une illustration = un SVG 16:9 écrit à la main, plat, géométrique, **sans texte, sans logo, sans personnage**, aux couleurs de la marque du blog. Les quatre blogs partagent la même grammaire ; seule la palette change. Référence détaillée : page « Illustrations d'articles » du site (`https://hermez.dev/brand-assets/?view=guides-illustrations`). Les palettes et l'outil vivent dans `brand-assets/site` : ne les recopie pas.

Prérequis : un clone de `hermez-agency/brand-assets` et `cd site && pnpm install` (une fois). Toutes les commandes se lancent depuis `brand-assets/site`, avec des **chemins absolus** pour les fichiers de l'autre dépôt.

## 1. Du sujet à la composition

1. Résume l'article en une phrase : *qu'est-ce qui change pour le lecteur ?* (ex. « une tâche répétitive devient automatique »).
2. Cherche **une métaphore, deux au plus**, parmi des formes abstraites : un avant/après (formes éparpillées → rangées), un flux (rail, points reliés), un contenant (cadre, écran, grille), une cible, un empilement. Pas d'objet reconnaissable (pas d'ampoule, de fusée, de cadenas).
3. Place l'avant à gauche, l'après à droite : la lecture se fait de gauche à droite et le recadrage de partage garde le centre.
4. Choisis le foyer : **une ou deux formes** en `accent`, le reste en `surface`, `line`, `ink`, `mute`.
5. Compte : 5 à 12 formes visibles, au moins la moitié du cadre vide.

## 2. Les règles

- `viewBox="0 0 1600 900"`, fond `<rect width="1600" height="900" fill="var(--ill-bg)"/>`.
- **Zone sûre** : x 120–1480, y 90–810. Le JPEG 1200 × 630 rogne 30 unités en haut et en bas.
- Grille de 100 (sous-grille de 20) ; rotations entre −20° et 20°.
- Formes : rectangles à coins arrondis (`rx` 24 ; 40 pour un grand cadre), cercles, lignes, arcs. Traits de **4, 8 ou 12** seulement, `stroke-linecap="round"`.
- Couleurs **uniquement** par `var(--ill-bg|surface|line|ink|mute|accent|soft)`. Jamais de `#hex`, de dégradé, de filtre, d'ombre ; pas d'opacité (utilise `soft`).
- Interdits : `<text>`, `<image>`, logo, mascotte, personnage, visage.
- `aria-label` : une phrase qui décrit la composition (texte alternatif de l'image).

## 3. La palette à prendre

| Blog | `data-brand` | Thème des rasters |
| --- | --- | --- |
| hermez.dev (portfolio) | `hermez` | clair |
| Ponos | `ponos` | sombre (orange sur écran sombre) |
| React Resource View | `react-resource-view` | clair (crème, encre) |
| Leadz | `leadz` | clair |

Pars du gabarit, il contient déjà `viewBox`, la palette clair/sombre et le fond :

```sh
pnpm illustrations template ponos > /tmp/mon-article.svg
```

Complète-le entre le fond et `</svg>`, sans toucher au bloc `<style>`.

## 4. Relire le rendu

```sh
pnpm illustrations check /tmp/mon-article.svg       # grammaire : viewBox, interdits, couleurs, zone sûre
pnpm illustrations rasterize /tmp/mon-article.svg --out /tmp/ill --themes light,dark
```

Puis **regarde** `-960.webp` dans les deux thèmes et `-share.jpg` (outil Read sur une image, ou `sharp(...).png()` si le format n'est pas lu). Relis avec ces questions :

- La forme d'accent se voit-elle en moins d'une seconde ? Y en a-t-il plus de deux ?
- Le sujet se comprend-il sans le titre ? Si non, simplifie la métaphore plutôt que d'ajouter des formes.
- Le vide est-il généreux ? Rien ne touche-t-il le bord du JPEG de partage ?
- Le thème sombre garde-t-il le contraste des tuiles `surface` sur `bg` ?
- Une forme évoque-t-elle un logo, une lettre ou un visage ? Change-la.

## 5. Livrer

Le blog commite le SVG (source) et les rasters produits, sous son dossier d'images d'articles :

```sh
pnpm illustrations rasterize /chemin/absolu/mon-article.svg --out /chemin/du/blog/public/articles --name mon-article
```

Sortie : `mon-article-480.avif|webp`, `mon-article-960.avif|webp`, `mon-article-share.jpg` (1200 × 630, thème par défaut de la marque ; `--themes light,dark` ajoute les fichiers `-dark`). Depuis Python : `subprocess.run(["pnpm", "--dir", "<brand-assets>/site", "illustrations", "rasterize", svg, "--out", out, "--name", slug], check=True)`.

Balise : `<picture>` avec les `<source type="image/avif">` puis `webp`, `srcset="…-480.avif 480w, …-960.avif 960w"` ; `og:image` pointe le JPEG de partage.

## 6. Exemples commentés

Les quatre SVG complets sont dans `site/src/illustrations/examples/`. Sujet : « automatiser un travail répétitif » (du désordre au résultat).

**Hermez — `hermez-ordre.svg`.** Avant : cinq tuiles `surface` jetées à gauche, deux points `mute`. Flux : un rail `line` de 8. Après : un cercle `ink` (trait 12) dans un halo `soft`, avec un seul point `accent` au centre. Métaphore unique (désordre → centre), neuf formes, foyer net : le modèle de base.

**Ponos — `ponos-ordre.svg`.** Même avant et même rail ; l'après est un « écran » (rect `rx` 40, trait `ink` 8) qui contient deux lignes `line` rangées et une barre `accent`, plus une pastille `soft` cerclée d'`accent`. Une seule métaphore (le contenant), pensée pour le fond sombre de la marque, sans reprendre le logo « Écran ».

**React Resource View — `react-resource-view-ordre.svg`.** L'après est une grille 3 × 3 de tuiles à trait `ink` 8 dont la case centrale est `accent` : la ressource tirée d'un tableau. Le rail s'arrête à la grille : le flux entre dans le tableau. Deux métaphores combinées (grille + sélection), à ne pas dépasser.

**Leadz — `leadz-cible.svg`.** L'après est une cible : un cercle `line` de 4, un disque `soft` à contour `ink` 8, un centre `accent` ; le rail se prolonge en un trait `accent` qui vise le centre. La précision (trouver le bon lead) est dite par la forme, sans pictogramme.

## Pièges

- `<text>` ou une image incrustée : l'outil refuse. Le titre est dans la page, pas dans l'image.
- Une couleur en dur ne suit pas le thème et le `check` la signale.
- Un SVG en `<img>` suit `prefers-color-scheme`, pas la classe `.dark` du blog : pour suivre un sélecteur de thème, l'inclure en ligne ou fournir les rasters `-dark`.
- Ne pas modifier les palettes d'un blog dans son dépôt : elles se changent dans `site/src/illustrations/palettes.ts`.
