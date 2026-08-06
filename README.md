# Portfolio — Clément Jannaire

Landing page personnelle : développeur web & designer UX/UI.
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
index.html              contenu de la page (les projets sont écrits ici, en dur)
assets/css/style.css    thème, mise en page et primitives d'animation
assets/js/main.js       moteur d'animation (un bloc = une fonction autonome)
assets/favicon.svg
robots.txt
```

## Animations et effets

| Effet | Où |
|---|---|
| Écran de chargement (compteur + rideau) | `initLoader` |
| Aurore animée sur canvas, réactive au pointeur | `initAurora` |
| Boutons magnétiques | `initMagnetic` |
| Cartes projet : inclinaison 3D, projecteur, parallaxe du contenu | `initTilt` |
| Grille de points révélée par un projecteur | `initHeroSpotlight` |
| Titres révélés ligne par ligne / mot par mot | `splitLines`, `splitWords` |
| Texte « décodé » en boucle | `initScramble` |
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
  sans JavaScript et indexable par les moteurs de recherche.
- Navigation au clavier : lien d'évitement, styles `:focus-visible`.
- Thème mémorisé dans `localStorage`, appliqué avant le premier rendu
  (pas de flash de thème).
- Boucles `requestAnimationFrame` mises en pause quand l'onglet est masqué.

## Modifier le contenu

- **Projets** — les six cartes `<article class="card">` dans `index.html`.
  Copier un bloc, changer titre, description, `href`, puces `.chips` et
  l'index affiché.
- **Compétences** — les colonnes `.skills__col` dans la section « À propos ».
- **Rôles défilants** — l'attribut `data-words` de `#scramble`, séparés par `|`.
- **Couleurs** — les variables de `:root` et `:root[data-theme='dark']`
  en haut de `style.css`.

## Déploiement

Aucune étape de build. Le dépôt se déploie tel quel :

- **Vercel** — importer le dépôt, framework « Other », répertoire racine.
- **GitHub Pages** — Settings › Pages › Deploy from a branch › `/ (root)`.
- **Netlify** — glisser-déposer le dossier.

## Note sur les dépôts

Cinq des six projets présentés sont dans des dépôts privés ; leurs cartes
affichent « Dépôt privé » plutôt qu'un lien mort. Rendre un dépôt public
suffit à le remplacer par un lien : reprendre le balisage `.card__repo`
de la carte « To-Do gamifiée ».
