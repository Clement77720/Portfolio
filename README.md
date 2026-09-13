# Portfolio — Clément Jannaire

Landing page personnelle : développeur web & designer UX/UI, fondateur de
[JNR Studio](https://jnr-studio.vercel.app/).
Site statique, **sans build ni dépendance** — HTML, CSS et JavaScript natifs.

## Lancer en local

Ouvrir `index.html` suffit, mais un petit serveur évite les restrictions
d'origine sur certaines API (presse-papiers, polices) :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Structure

```
index.html              contenu de la page (les réalisations sont écrites ici, en dur)
assets/css/style.css    thème, mise en page et primitives d'animation
assets/js/main.js       moteur d'animation (un bloc = une fonction autonome)
assets/favicon.svg
robots.txt
```

## Lien avec JNR Studio

Le portfolio et [jnr-studio.vercel.app](https://jnr-studio.vercel.app/)
partagent la même source de vérité :

- **Réalisations** — les 20 cartes réunissent les projets React/Next.js et le
  portfolio client du studio (Klark.app, landing pages, articles). Les
  descriptions et les URL sont reprises de `lib/data.js` du dépôt JnrStudio.
- **E-mail** — `clement.jannaire@outlook.com`, la même adresse que la page
  contact du studio.
- **Section Studio** — reprend le titre, la tagline et les six services
  définis dans `lib/data.js` (`SERVICES`).
- **Aiguillage du contact** — recruteur → e-mail direct ; client → formulaire
  de devis du studio.

Si une de ces valeurs change côté studio, il faut la répercuter ici : les deux
sites ne partagent pas de code.

## Animations et effets

| Effet | Où |
|---|---|
| Écran de chargement (compteur + rideau) | `initLoader` |
| Aurore animée sur canvas, réactive au pointeur | `initAurora` |
| Boutons magnétiques | `initMagnetic` |
| Cartes : inclinaison 3D, projecteur, parallaxe du contenu | `initTilt` |
| Grille de points révélée par un projecteur | `initHeroSpotlight` |
| Titres révélés ligne par ligne / mot par mot | `splitLines`, `splitWords` |
| Texte « décodé » en boucle | `initScramble` |
| Filtres de catégorie avec repli animé | `initFilters` |
| Compteurs animés à l'apparition | `initCounters` |
| Bandeau défilant accéléré par le scroll | `initMarquee` |
| Barre de progression, nav qui s'inverse sur le bloc sombre | `initScrollUI` |
| Bascule clair/sombre en cercle (View Transitions) | `initTheme` |
| Copie de l'e-mail + notification | `initCopy` |
| Horloge de Paris en pied de page | `initClock` |

Chaque bloc est indépendant : si l'un échoue, les autres continuent de tourner.

## Accessibilité et performances

- `prefers-reduced-motion` est respecté : animations, aurore, grain et bandeau
  défilant sont désactivés, le contenu reste visible.
- Le contenu est écrit dans le HTML (pas injecté en JS) : il reste lisible
  sans JavaScript et indexable par les moteurs de recherche. Sans JS, les
  filtres disparaissent et les 20 réalisations s'affichent toutes.
- Navigation au clavier : lien d'évitement, styles `:focus-visible`, filtres
  en vrais `<button>` avec `aria-pressed`.
- Thème mémorisé dans `localStorage`, appliqué avant le premier rendu
  (pas de flash de thème).
- Boucles `requestAnimationFrame` mises en pause quand l'onglet est masqué.
- Vérifié sans débordement horizontal de 320 px à 1440 px.

## Modifier le contenu

- **Réalisations** — les blocs `<article class="card" data-cat="…">` dans
  `index.html`. Copier un bloc, changer titre, description, `href`, puces
  `.chips`, l'index affiché et `data-cat`.
  Catégories : `app`, `vitrine`, `ecommerce`, `landing`, `article`.
- **Compteurs des filtres** — les `<b>` dans `.filters` sont écrits en dur ;
  les mettre à jour en ajoutant ou retirant une carte.
- **Compétences / formation** — les `.skills__col` et `.timeline` dans
  « À propos ».
- **Services du studio** — la liste `.studio__services`.
- **Rôles défilants** — l'attribut `data-words` de `#scramble`, séparés par `|`.
- **Couleurs** — les variables de `:root` et `:root[data-theme='dark']`
  en haut de `style.css`.

## Déploiement

Aucune étape de build. Le dépôt se déploie tel quel :

- **Vercel** — importer le dépôt, framework « Other », répertoire racine.
- **GitHub Pages** — Settings › Pages › Deploy from a branch › `/ (root)`.
- **Netlify** — glisser-déposer le dossier.

## Note sur les dépôts

La plupart des projets présentés sont dans des dépôts privés ; leurs cartes
affichent « Dépôt privé » plutôt qu'un lien mort. Rendre un dépôt public
suffit à le remplacer par un lien : reprendre le balisage `.card__repo`
de la carte « To-Do gamifiée ».
