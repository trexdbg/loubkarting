# 🏁 LOUBKARTING — Neon Circuit

Un jeu de **course arcade isométrique solo** entièrement jouable dans le navigateur, dans l'esprit des jeux de course-combat des années 1990. Univers, graphismes et code originaux.

## Jouer

Le site est prévu pour être hébergé gratuitement sur GitHub Pages :

**https://trexdbg.github.io/loubkarting/**

> Si l'URL renvoie 404, il faut activer GitHub Pages une seule fois : **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save**. La première mise en ligne peut prendre quelques instants.

En local, ouvrez `index.html` dans votre navigateur. Aucun build ni serveur nécessaire.

## Fonctionnalités de la version 0.1

- Circuit fermé avec **vue isométrique** et caméra qui suit le joueur
- Trois voitures jouables : Viper GT, Phantom, Bruiser
- Quatre adversaires pilotés par une IA de suivi de trajectoire
- Course de trois tours, classement, chronomètre et meilleurs temps
- Collisions, blindage, missiles guidés, dégâts et ralentissements
- Nitro rechargeable, bonus de réparation, munitions et nitro à récupérer
- Trois difficultés et mini-carte
- Commandes clavier et **boutons tactiles** sur téléphone
- Musique synthétique originale activable et effets audio générés (Web Audio)
- Sauvegarde locale du meilleur temps (`localStorage`)

## Commandes

| Action | Clavier | Tactile |
|---|---|---|
| Accélérer | ↑ / Z / W | GAZ |
| Freiner / reculer | ↓ / S | FREIN |
| Tourner | ← → / Q D / A D | ◀ ▶ |
| Tirer | Espace / J | TIR |
| Nitro | Maj / K | NITRO |
| Pause | P / Échap | Ⅱ |
| Relancer | R | REJOUER |

## Technologie

`index.html` (interface), `style.css` (responsive), `game.js` (Canvas 2D, physique, IA, rendu et son).

- Aucun framework et aucune dépendance JavaScript
- Dessin procédural des voitures et des décors sur Canvas
- Exécution 100 % côté client : **GitHub Pages suffit**
- Configuration GitHub Pages : branche `main`, dossier `/ (root)`

## Suite envisagée

Circuits multiples, garage et améliorations, davantage d'armes, nouveaux décors, championnats, adversaires IA plus avancés, vrais sprites 2.5D originaux, bande-son rock originale, puis multijoueur (qui nécessitera une infrastructure serveur).

## Propriété intellectuelle

Projet indépendant. N'utilise ni nom, ni ressources graphiques, ni musiques, ni personnages de *Rock N' Roll Racing* ou de Blizzard. Les mécaniques de course-combat en vue isométrique sont une inspiration de genre, pas une reproduction d'éléments protégés.
