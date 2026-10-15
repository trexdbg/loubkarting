# 🏁 LOUBKARTING — Earth Tour (v0.3)

Un jeu **solo de course-combat isométrique sur Terre**, avec garage, armes et carrière. Jeu indépendant en HTML/CSS/Canvas JavaScript, hébergeable sur **GitHub Pages**.

🎮 **Jeu (après activation Pages) : https://trexdbg.github.io/loubkarting/**

📖 **[Game Design complet : Earth Tour](docs/GAME_DESIGN.md)**

## Jouable dès maintenant

- **Montagne · Alpes (Europe) : quatre courses** : Col des Brumes, Épingle des Cimes, Crête du Tonnerre et **Ascension Royale (boss : Le Bouquetin)**.
- **Plage · Littoral (Océanie) : quatre courses** : Baie d'Azur, Corniche des Embruns, Cap Solaire et **Couronne des Marées (boss : Sirène du Cap)**.
- **Huit tracés distincts**, deux décors thématiques en version prototype (rochers et conifères ; littoral, océan et palmiers).
- **Cinq voitures originales**, à acheter progressivement :
  1. Citadine 91 — petite française, **gratuite**.
  2. RS Éclipse — sportive compacte, **900 CR**.
  3. Kaze AWD — berline de rallye japonaise, **2 600 CR**.
  4. Vortex V12 — supercar GT, **6 500 CR**.
  5. Apex Formula — monoplace, **13 000 CR**.
- **Trois armes au choix** : Dard ionique (guidé), Onde EMP (de zone), Piège magnétique (mine).
- 4 concurrents IA, missiles, collisions, réparation, nitro, blindage, difficulté, classements et meilleurs temps par épreuve.
- Crédits gagnés en course et **trois améliorations** (moteur, blindage, nitro) jusqu'au niveau 3.
- **Carrière** : podium pour passer à la course suivante, victoire obligatoire sur le boss pour déverrouiller la zone Plage. Après un résultat qualificatif, le bouton « Épreuve suivante » permet de continuer immédiatement.
- Sauvegardes locales du garage, des armes sélectionnées, des crédits et de la progression. Aucun compte requis.

## Prévu, mais pas encore jouable

- **Neige · Grand Nord (Amérique du Nord)** — quatre courses + boss.
- **Désert · Sahara (Afrique)** — quatre courses + boss.
- **Forêt · Amazonie (Amérique du Sud)** — quatre courses + boss.
- **World Grand Prix** : dix GP rappelant *l'esprit* des grands classiques automobiles (Riviera, Ardennes, Lombardia et autres), sur **tracés originaux**. La **Apex Formula** sera nécessaire pour y entrer.

**Objectif final : 5 régions × 4 courses + 10 Grands Prix = 30 courses.**

## Commandes

| Action | Ordinateur | Téléphone |
|---|---|---|
| Accélérer | ↑ / Z / W | GAZ |
| Freiner | ↓ / S | FREIN |
| Diriger | ← / → ou Q / D | ◀ / ▶ |
| Utiliser l'arme choisie | Espace / J | TIR |
| Nitro | Maj / K | NITRO |
| Pause | P / Échap | Ⅱ |
| Relancer | R | REJOUER |

Le mode paysage est recommandé sur téléphone. La musique originale synthétique et les effets sonores sont facultatifs.

## Mettre en ligne sur GitHub Pages

1. Ouvrir **Settings → Pages** dans ce dépôt.
2. Sous **Build and deployment**, sélectionner **Deploy from a branch**.
3. Choisir **main** et **/ (root)**, puis **Save**.
4. Jouer depuis **https://trexdbg.github.io/loubkarting/**.

Ouvrir localement `index.html` permet aussi de tester le jeu dans le navigateur. Si la sauvegarde est bloquée sous `file://`, servir le dossier avec un petit serveur local HTTP.

## Développement & tests

Le jeu est volontairement sans framework ni étape de compilation :
- `index.html` : interface, sélection des zones, épreuves, voitures et armes ;
- `style.css` : rendu responsive, garage, HUD ;
- `game.js` : tracés isométriques, physique, IA, modules d'attaque, progression ;
- `docs/GAME_DESIGN.md` : bible de conception et feuille de route ;
- `tests/smoke.test.cjs` : tests autonomes sans dépendances.

Exécuter avec **Node.js ≥ 20** :

```bash
node --test tests/smoke.test.cjs
```

Les tests sont également configurés dans `.github/workflows/smoke.yml` pour s'exécuter sur GitHub Actions (sous réserve des paramètres Actions du dépôt).

## Indépendance artistique

Ce jeu ne reproduit ni assets, ni marques, ni modèles sous licence, ni musiques, ni tracés officiels de Blizzard, de constructeurs automobiles ou de la Formule 1. Les influences sont des références de genre et d'ambiance seulement. Les noms et créations publiés sont propres à LOUBKARTING.
