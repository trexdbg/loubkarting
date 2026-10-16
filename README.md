# 🏁 LOUBKARTING — Earth Tour (v0.6)

Un jeu **solo de course-combat isométrique sur Terre**, avec garage, armes et carrière. Jeu indépendant en HTML/CSS/Canvas JavaScript, hébergeable sur **GitHub Pages**.

🎮 **Jeu (après activation Pages) : https://trexdbg.github.io/loubkarting/**

📖 **[Game Design complet : Earth Tour](docs/GAME_DESIGN.md)**

## Studio véhicules — refonte visuelle (v0.6)

Les **cinq véhicules** sont désormais dessinés à partir de **maillages polygonaux 3D stylisés projetés dans le canvas**, sans WebGL ni dépendances supplémentaires :

- **Citadine 91** : caisse courte, habitacle haut, boucliers et feux rétro.
- **RS Éclipse** : compacte élargie, capot nervuré, prises d'air et becquet.
- **Kaze AWD** : berline de rallye haute, prise d'air moteur, aileron et jantes épaisses.
- **Vortex V12** : supercar profilée, ouïes latérales, caisse basse et diffuseur.
- **Apex Formula** : monoplace à roues apparentes, museau étroit, halo, ailerons avant/arrière.

Le moteur de rendu `vehicles.js` est **partagé entre la piste, le grand showroom et les cinq vignettes** ; peinture, surfaces vitrées, ombres, pneumatiques et éléments de carrosserie restent cohérents dans les trois contextes. Les animations de vitrine sont limitées aux menus pour préserver la fluidité des courses. La physique, l'économie et les sauvegardes ne changent pas.

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
- **Trois adversaires IA, dont le boss régional présent aux quatre départs** (plus rapide, agressif et résistant). Missiles, collisions, destruction réelle des rivaux, réparation, nitro, blindage, difficulté, classement sur quatre voitures et records par épreuve.
- **Des lingots originaux à ramasser sur la piste (40 ou 65 CR)**, une **prime de 240 CR par voiture adverse détruite**, un gain de classement et un bonus de première qualification. Trois améliorations (moteur, blindage, nitro) jusqu’au niveau 3.
- **Carrière à péages** : qualification sur le podium, puis **transport et inscription à payer** avant la course suivante. La remorque est nécessaire dès la 2e course des Alpes ; le bateau est nécessaire pour rejoindre le Littoral après avoir battu le boss. Le bouton « Épreuve suivante » conduit au garage/logistique tant que le trajet ou l’inscription n’est pas payé.
- **10 peintures de carrosserie**, couleur d'origine comprise : choix à l'achat, changement gratuit à l'atelier, aperçu 3D et sauvegarde par voiture.
- Sauvegardes locales du garage, des armes sélectionnées, des crédits et de la progression. Aucun compte requis.

## Économie, transport et inscription

| Équipement / dépense | Prix | Effet |
|---|---:|---|
| Remorque | 320 CR | Permet de rejoindre les courses 2, 3 et 4 des Alpes |
| Inscription Alpes 2 / 3 / 4 | 120 / 240 / 360 CR | Paiement **une seule fois** par épreuve |
| Bateau | 1 600 CR | Débloque le Littoral une fois le boss des Alpes vaincu |
| Inscription Littoral 2 / 3 / 4 | 200 / 340 / 480 CR | Paiement **une seule fois** par épreuve |
| Avion | 5 000 CR envisagés | **Non disponible**, prévu pour les futures régions |

La première course de chaque région est gratuite une fois le voyage payé. Les transports et droits sont sauvegardés. Les anciennes carrières sont migrées pour ne pas faire payer à nouveau les épreuves déjà obtenues.

**Récompenses d'une course :** 450 / 360 / 290 / 230 CR (de la première à la quatrième place), ou 75 CR en cas d'élimination du joueur ; puis **+40 ou +65 CR par lingot collecté**, **+240 CR par rival détruit**, et +280 CR lors du premier podium sur une épreuve ordinaire / +850 CR lors de la première victoire en finale de région.

Les véhicules détruits quittent la piste pour cette course. Le boss possède davantage de blindage et tire plus souvent, mais peut aussi être éliminé.

## Interface de carrière : simple et directe (v0.6)

La carrière s'ouvre **directement sur la prochaine course**. Quatre onglets principaux suffisent :

- **Course** : circuit et boss, voiture et arme choisies, difficulté, droit d'accès et départ.
- **Monde** : carte, régions, quatre courses par région. Les destinations non jouables sont indiquées sur une seule ligne.
- **Voitures** : présentation, performances, achat explicite et sélection des cinq bolides.
- **Atelier** : améliorations mécaniques et choix de l'arme.

**Transport et inscription** ne sont pas un onglet permanent. Cet écran s'ouvre depuis « Monde » ou « Accès » lorsqu'il est nécessaire pour débloquer un départ. Le solde de crédits reste visible dans l'en-tête. Après une course, « Retour au garage » ouvre l'atelier, et « Épreuve suivante » conduit au paiement ou au départ suivant.

Les textes redondants, titres géants, étapes fictives et actions dupliquées ont été réduits. L'interface est responsive, avec une navigation à quatre onglets sur mobile. Les voitures gardent leurs prévisualisations originales, sans calcul de rendu 3D sur les écrans où elles sont invisibles.

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
