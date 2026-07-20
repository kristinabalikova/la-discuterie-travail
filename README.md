# La Discuterie Travail

Petite web app « machine à sous » qui tire une affirmation sur le travail
(une seule bobine, pleine largeur) pour lancer une discussion. C'est la
sœur de « La Discuterie Emoji » : même architecture, même grammaire
visuelle, mais avec des phrases longues au lieu d'emojis.

## Stack

- React 19 + TypeScript strict + Vite 6 (`@vitejs/plugin-react`)
- `lucide-react` pour les icônes
- Aucun framework CSS : un seul fichier `src/index.css` écrit à la main
- npm comme gestionnaire de paquets

## Lancer le projet

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # tsc --noEmit puis build de production dans dist/
npm run preview   # sert le build de dist/ sur http://localhost:4173
```

## Couleur d'accent

L'accent est un « bleu de travail » profond (`#2358c4`), en référence à la
veste de travail bleue emblématique en France. Il se distingue du magenta
de La Discuterie Emoji, évoque le sérieux et la fiabilité sans être terne,
et offre un contraste AA (~6,4:1) avec le texte blanc des boutons.

## Intégration en iframe

Le sous-domaine Netlify du site est `ladiscuterietravail.netlify.app`. Il
reste un seul placeholder à renseigner : `TON-DOMAINE.com` dans
`netlify.toml` (en-tête CSP `frame-ancestors`), à remplacer par le domaine
du site qui embarque l'iframe.

```html
<iframe
  src="https://ladiscuterietravail.netlify.app/"
  title="La Discuterie Travail"
  style="width:100%;border:0;min-height:900px"
  loading="lazy"
></iframe>
```

> Note : le contenu avoisine 900 px sur desktop (un peu plus depuis l'ajout
> du sélecteur de mode) et grimpe à ≈ 1000–1040 px en mobile, où la bobine
> est plus grande pour que l'affirmation la plus longue tienne sans
> troncature. `min-height:900px` est un plancher : montez-le si besoin ou
> branchez un script d'auto-redimensionnement côté page hôte si vous voulez
> que le bouton « Lancer » soit visible sans défilement interne.
