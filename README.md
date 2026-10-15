# 🏁 LOUBKARTING — World Tour

**Jeu solo de course-combat isométrique**, jouable sur ordinateur et mobile, sans installation ni serveur.

🎮 **Adresse prévue : https://trexdbg.github.io/loubkarting/**

> Si le site retourne une erreur 404, activer GitHub Pages une seule fois dans **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save**. Le dépôt doit rester public pour une publication gratuite classique.

## Version 0.2 — World Tour

### Les courses
- **2 circuits** : **Neon Canyon** (rochers, néons et grandes courbes) et **Coastline Rush** (côte, virages et épingles).
- Choix de la voiture : **Viper GT**, **Phantom**, **Bruiser**, avec des statistiques différentes.
- 4 adversaires IA, 3 difficultés, 3 tours, chronomètre, classement et mini-carte.
- Missiles guidés, dégâts de collisions, blindage, nitro, réparations et caisses de munitions.
- Effets sonores et musique rétro synthétique originale, activables depuis l'interface.
- Course et garage fonctionnent sur **GitHub Pages** en pur HTML/CSS/JavaScript.

### Garage & progression
- Les courses rapportent des **crédits (CR)** : 450 CR en 1re position, 360 en 2e, 290 en 3e, 230 en 4e, 180 en 5e, 75 en cas de destruction.
- Acheter jusqu'à **3 niveaux** d'amélioration pour le **moteur**, le **blindage** et la **nitro**. Les niveaux coûtent successivement **200 CR**, **400 CR** puis **600 CR**.
- Le moteur augmente vitesse maximale et accélération ; le blindage réduit les dégâts ; la nitro augmente la capacité, la recharge et l'autonomie.
- Sauvegarde automatique des crédits, des améliorations et du circuit sélectionné dans le navigateur (`localStorage`).
- **Meilleur temps séparé pour chaque circuit**. L'ancien meilleur temps du prototype v0.1 est conservé pour Neon Canyon.

## Commandes

| Action | Clavier | Tactile |
|---|---|---|
| Accélérer | ↑ / Z / W | GAZ |
| Freiner / marche arrière | ↓ / S | FREIN |
| Tourner | ← / → ou Q / D | ◀ / ▶ |
| Tirer | Espace / J | TIR |
| Nitro | Maj / K | NITRO |
| Pause | P / Échap | Ⅱ |
| Nouvelle course | R | REJOUER |

*Astuce : sur mobile, le mode paysage est conseillé.*

## Structure technique

- `index.html` : écrans, HUD, garage et interface.
- `style.css` : rendu néon, styles et adaptation mobile.
- `game.js` : tracés fermés avec splines, projection isométrique Canvas 2D, physique, IA, collisions, combat et sauvegarde.
- `.nojekyll` : publication de fichiers statiques sur GitHub Pages.

Aucun framework, aucune dépendance JavaScript, aucun compte requis. Le rendu utilise des dessins originaux générés directement par Canvas.

## Développement

```bash
git clone https://github.com/trexdbg/loubkarting.git
cd loubkarting
```

Ouvrir `index.html` dans un navigateur récent. Les fonctionnalités de sauvegarde nécessitent un contexte autorisant `localStorage` ; pour un test reproductible, utiliser un petit serveur local HTTP si besoin.

### Feuille de route

- **0.3 :** dérapages, mines, meilleurs retours de collisions et nouveaux décors.
- **0.4 :** championnat et déblocages, davantage d'adversaires et circuits.
- **0.5 :** graphismes 2.5D plus travaillés, bande-son rock originale, manette.
- **1.0 :** campagne solo équilibrée et optimisée mobile.
- **Ultérieurement :** multijoueur, qui nécessitera une infrastructure serveur dédiée.

## Propriété intellectuelle

Jeu indépendant inspiré du **genre** des courses arcade isométriques des années 1990. Aucun nom de personnage, sprite, texture, piste audio, marque ou autre ressource propriétaire de *Rock N' Roll Racing* / Blizzard n'est utilisé.
