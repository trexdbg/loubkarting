# LOUBKARTING — Game Design Document / Earth Tour
**Version du concept : 0.8** · Jeu solo isométrique pour le navigateur · GitHub Pages

## Interface et navigation (v0.6)

**Objectif : accéder à l'action voulue avec le moins de choix possible.** Le jeu s'ouvre directement sur **Course**, sans écran d'accueil intermédiaire.

Quatre onglets toujours visibles :
- **Course** : prochaine épreuve, boss, voiture, arme, accès, difficulté et bouton de départ.
- **Monde** : atlas des cinq régions maintenant jouables, quatre courses par région, état de déblocage et avenir des Grands Prix.
- **Voitures** : voir un modèle, comparer trois caractéristiques, acheter ou équiper.
- **Atelier** : améliorer les performances et choisir une arme.

**Transport** est un écran secondaire, ouvert via le Monde ou le statut « Accès » de la course. Il présente les achats nécessaires (remorque, bateau, avion intercontinental) et les droits d'inscription. Le solde est visible à tout moment.

Principes d'ergonomie : un seul appel à l'action dominant par écran ; labels courts ; états de blocage clairs avec la condition utile ; pas de décor ou de paragraphe explicatif qui repousse la fonction ; pas d'achat involontaire par simple sélection du modèle ; navigation à quatre onglets utilisable au clavier et sur mobile. Conservation des voitures dessinées en perspective dans le concessionnaire.

Après une course, « Retour au garage » ouvre l'atelier ; « Épreuve suivante » ouvre la préparation ou le transport si le paiement manque. Les anciennes sauvegardes et les règles de progression sont conservées.

**Hors périmètre :** animations de transport, cinématiques, nouvel atelier 3D, nouvelles zones.

## Direction

Un jeu de **course-combat sur Terre**. Le joueur commence au volant d'une petite citadine, gagne des crédits, apprend à conduire et construit progressivement une collection de véhicules de plus en plus spécialisés jusqu'à la monoplace.

**Tonalité :** automobile, sportive, spectaculaire, mais relativement sérieuse. Les attaques sont des technologies futuristes stylisées — pas des bananes, des carapaces ou des personnages empruntés à d'autres franchises. L'inspiration est le *genre* des courses arcade isométriques et du kart-combat, avec assets, pistes, noms et bande-son originaux.

**Priorité absolue :** un pilotage qui procure du plaisir, des voitures réellement distinctes à l'écran, des circuits lisibles et un sentiment de progression.

## Organisation de la Terre

Cinq grandes régions, quatre courses chacune. **Le boss est le leader permanent de sa région et participe aux quatre épreuves face au joueur et à deux autres pilotes IA.** La 4e course est la finale officielle pour le titre de la zone, pas sa première apparition. Puis une saison mondiale de dix Grands Prix en monoplace : **30 courses au total**.

| Région | Continent | Biome | Courses | Boss | État |
|---|---|---|---:|---|---|
| 01 · Alpes | Europe | Montagne, cols, lacets | 4 | Le Bouquetin | **Jouable** |
| 02 · Littoral | Océanie | Plage, corniche et mer | 4 | Sirène du Cap | **Jouable après le boss des Alpes et achat du bateau** |
| 03 · Grand Nord | Amérique du Nord | Neige, verglas, pins | 4 | Le Blizzard | **Jouable après Sirène du Cap et avion** |
| 04 · Sahara | Afrique | Dunes, canyons, oasis | 4 | Le Scorpion | **Jouable après Le Blizzard** |
| 05 · Amazonie | Amérique du Sud | Forêt, boue, pluie, ponts | 4 | Le Jaguar | **Jouable après Le Scorpion** |
| 06 · World Grand Prix | International | Circuits automobiles de prestige | **10** | Champion mondial | Planifié, monoplace obligatoire |

### Alpes — 4 épreuves jouables
1. **Les Gorges Rouges** : route de falaise, huile, pont, rocher, saut optionnel.
2. **Le Pont du Chaos** : deux ponts étroits, huile et saut obligatoire.
3. **La Mine Noire** : huile, roches, deux wagonnets mobiles et saut latéral.
4. **Le Sommet des Titans** : verglas, rochers, grand saut, pont final et duel avec **Le Bouquetin**.

### Grammaire des obstacles alpins (v0.7)

Les obstacles sont édités **par course** dans `course-challenges.js`, avec une position normalisée (`at`, fraction de la longueur de piste), une longueur, une largeur et une voie (`lane`). Leur position réelle dépend du tracé. Ce sont des scénarios déterministes et reproductibles.

- **Pont** : le bitume est réduit de 106 à ~53–63 unités de demi-largeur. Une voiture trop près du bord chute et réapparaît 170 unités plus tôt : -17 PV / blindage et +2 s de pénalité.
- **Rampe** : déclenche un saut balistique si vitesse > 85. La voiture est réellement projetée en hauteur dans la perspective isométrique, puis revient au sol.
- **Fosse** : section manquante, partielle (raccourci risqué) ou totale (saut obligatoire). Un véhicule trop bas chute. Les IA apprennent une séquence de saut simplifiée.
- **Huile / verglas** : réduction de l'adhérence et inertie du braquage; l'IA réduit son allure.
- **Roche / wagonnet** : choc physique avec perte de vitesse, de blindage et effet visuel. Le wagonnet change de voie au cours du temps.
- **Boss** : adversaire des quatre courses, avec blindage et vitesse supérieurs ; lorsqu'il est à proximité il essaie aussi de fermer la voie du joueur.

**Règles de qualité des 20 circuits de carrière :** silhouette unique, moment signature, choix risque/récompense, lecture immédiate des pièges, rival le plus dangereux identifiable. Le Littoral, le Grand Nord, le Sahara et l'Amazonie utilisent désormais le moteur de pièges avec leurs propres matériaux et leurs scénarios. Le rendu reste en Canvas isométrique, encore susceptible de retouches visuelles.

### Animations de chute et équité entre les pilotes

Pour **tous les concurrents** : une chute déclenche une animation d'environ 1 seconde (rotation, profondeur, rétrécissement et fondu) suivie d'un retour sur la route signalé par un halo. Pendant la chute, le véhicule est non-interactif : il n'avance pas, ne tire pas et ne peut ni prendre un bonus ni subir de nouveau projectile. Après réapparition il est brièvement protégé. Les sauts hors des limites de la piste sont également sanctionnés.

Le joueur conserve le barème : **+2 secondes** pour une chute non létale (et perte de PV), **+3 secondes** pour une destruction, y compris après une chute létale ; il n'y a pas de double pénalité. Pour les IA, la chute suspend la progression et les renvoie en arrière, sans fin de course définitive. Un véhicule ennemi détruit par les armes est maintenant réparé puis revient aussi.

### Littoral — 4 épreuves jouables
1. **Baie d'Azur** : grandes courbes en bord de mer.
2. **Corniche des Embruns** : tracé sinueux.
3. **Cap Solaire** : virages à contretemps.
4. **Couronne des Marées** : finale contre **Sirène du Cap**.

Chaque épreuve jouable dispose d'un **tracé fermé distinct**, d'une variation d'environnement cohérente et d'un meilleur temps séparé. **Nouveaux pièges littoraux** : eau, sable, jetées, passages étroits et rampes de saut. Les trois autres régions possèdent aussi des décors et des obstacles physiques spécifiques.

### Grand Nord — 4 courses
1. Sentier Blanc : verglas, rochers et pont de givre.
2. Lac Gelé : longue zone glissante et saut au-dessus d'une faille.
3. Col du Nord : route gelée, pont étroit et raccourci risqué.
4. Tempête Royale : finale contre **Le Blizzard**, glace, pont, saut et rochers.

### Sahara — 4 courses
1. Dunes Rouges : passages dans le sable et saut par-dessus une cassure.
2. Oasis Mirage : sable profond, oasis et pont étroit.
3. Gorge des Sables : pont de canyon et saut obligatoire.
4. Soleil Noir : finale contre **Le Scorpion**, tempête de sable, pont et saut.

### Amazonie — 4 courses
1. Route Canopée : boue et troncs couchés.
2. Fleuve Vert : gués, pont de bois et saut au-dessus de la rivière.
3. Piste Tropicale : boue, troncs et ornières.
4. Roi de la Jungle : finale contre **Le Jaguar**, boue, fleuve et saut.

L'eau réduit la vitesse et l'adhérence ; la glace provoque des dérives, le sable ralentit, la boue ralentit et fait glisser, les troncs endommagent. Ces effets s'appliquent aussi aux IA.

### World Grand Prix — dix étapes futures
La dernière compétition n'est **pas un sixième continent** : c'est le championnat mondial, réunissant des circuits de style Grand Prix dans différentes régions.

| GP | Nom original | Source d'ambiance automobile |
|---|---|---|
| 1 | Riviera GP | Rues étroites et port méditerranéen, esprit Monaco |
| 2 | Ardennes GP | Forêts et fortes dénivellations, esprit Spa |
| 3 | Lombardia GP | Longues lignes droites rapides, esprit Monza |
| 4 | Suzuka Spirit | Virages en S et changements de rythme |
| 5 | Silver Coast GP | Grand circuit rapide, esprit Silverstone |
| 6 | Brazil Heights | Relief et virages agressifs, esprit Interlagos |
| 7 | Eifel Ring | Asphalte vallonné, esprit Nürburgring |
| 8 | Lone Star GP | Circuit américain spectaculaire |
| 9 | Desert Twilight | Grand Prix nocturne au désert |
| 10 | Grand Final | Finale mondiale 100 % originale |

Les **layouts seront créés de zéro** et non recopiés de circuits sous licence. Aucun droit sur les marques, tracés officiels, musiques ou livrées officielles de F1 n'est sous-entendu.

## Carrière, logistique et argent

La progression est à la fois **sportive** et **financière** :

- Le joueur commence gratuitement à la première course des Alpes avec sa Citadine 91.
- Il affronte **trois adversaires**, dont **Le Bouquetin dans chacune des courses alpines**. Sur la côte, **Sirène du Cap** est toujours présent. Le boss est le plus rapide, le mieux protégé et le plus agressif. Sa dernière course doit être remportée en première position.
- Une **place sur le podium** (top 3 sur quatre concurrents) valide les courses ordinaires. Une **victoire** (1re place) valide la finale régionale.
- En plus de la qualification sportive, le joueur doit posséder le **transport adapté** et payer un **droit d'inscription unique** pour chaque nouvelle épreuve. Une course déjà accessible peut être rejouée sans repayer le droit.
- Le joueur peut refaire des courses pour gagner de l'argent et acheter une meilleure voiture. La boucle économique doit rester jouable sans argent réel ni connexion à un serveur.

### Transport & déplacements

| Achat | Prix prototype | Déblocage |
|---|---:|---|
| **Remorque** | 320 CR | Accès aux courses alpines 2–4 après qualification |
| **Bateau** | 1 600 CR | Accès à la zone Littoral, après la victoire sur Le Bouquetin |
| **Avion** | 5 000 CR | Trois voyages intercontinentaux, après victoire contre Sirène du Cap |

Droits d'inscription (paiement une seule fois) : **Alpes** : 0 / 120 / 240 / 360 CR ; **Littoral** : 0 / 200 / 340 / 480 CR ; **Grand Nord** : 0 / 260 / 440 / 650 CR ; **Sahara** : 0 / 310 / 520 / 750 CR ; **Amazonie** : 0 / 360 / 620 / 850 CR. Les transports sont des jalons de carrière et non des véhicules pilotables en course.

### Récompenses et récupération de lingots

| Source | Récompense |
|---|---:|
| Classement : 1er / 2e / 3e / 4e | 450 / 360 / 290 / 230 CR |
| Joueur éliminé | 75 CR |
| Premier podium dans une nouvelle épreuve normale | +280 CR |
| Première victoire contre le boss régional dans la finale | +850 CR |
| Lingot d'or ramassé sur le circuit | +40 ou +65 CR |
| **Voiture adverse détruite** | **+240 CR** |

Les lingots ont une représentation originale en perspective isométrique dorée avec l'inscription **CR**. Ils peuvent être ramassés pendant le pilotage et leur valeur s'affiche en direct. Il ne s'agit pas de sprites extraits de *Rock N' Roll Racing*. Le bilan détaillé de course additionne classement, bonus de première qualification, lingots ramassés et voitures détruites ; le total est ajouté au portefeuille à l'arrivée, même en cas d'élimination du joueur.

Les voitures rivales ont des points de blindage : les dards ioniques, impulsions EMP et mines magnétiques infligent des dégâts. Une voiture détruite passe désormais par une animation de chute, puis revient sur la piste (boss compris) avec son blindage restauré. Le boss a une jauge de résistance supérieure et subit moins de dégâts. Un adversaire ne rapporte le bonus de destruction qu'une fois par course, même s'il peut être neutralisé à nouveau.

Pour des raisons de jouabilité, le jeu sauvegarde les crédits, transports et inscriptions achetés, voitures, améliorations et qualifications dans le navigateur. Les anciennes sauvegardes v0.3 sont migrées pour préserver les parcours déjà validés.

**Prévu ultérieurement** : paiement de trajets internationaux plus complexes, écran visuel de convoyage, récompenses variables par zone, contrats de sponsors, primes de boss spéciales et équilibrage fin de l'économie.

## Garage — cinq classes d'automobiles

| Niveau | Nom propre au jeu | Influence de design (sans marque copiée) | Prix | Particularités |
|---|---|---|---:|---|
| 1 | **Citadine 91** | Petite citadine française du début des années 1990 | **Gratuite** | Légère, rustique, précise |
| 2 | **RS Éclipse** | Compacte française sportive « hot hatch » | **900 CR** | Plus rapide, nerveuse |
| 3 | **Kaze AWD** | Berline japonaise de rallye, transmission intégrale | **2 600 CR** | Polyvalente, adhérence, aileron |
| 4 | **Vortex V12** | Supercar GT racée, puissance de moteur central | **6 500 CR** | Très rapide, exigeante en virages |
| 5 | **Apex Formula** | Monoplace de compétition | **13 000 CR** | Maximum de performance, vulnérable, ticket d'entrée du World GP |

Les noms et silhouettes sont créés pour ce jeu ; pas de logos Renault, Peugeot, Subaru, Mitsubishi, Porsche, Ferrari, Dodge, F1 ou de design de carrosserie reproduit à l'identique. En jeu, la monoplace possède des roues apparentes et une architecture de carrosserie dédiée.

Évolutions communes déjà jouables : **Moteur** (vitesse + accélération), **Blindage** (réduction des dégâts) et **Nitro** (capacité + recharge), trois niveaux coûtant 200 / 400 / 600 CR.

À développer ultérieurement : sons moteurs distincts, statistiques de freinage / grip / masse / dérive, animations de suspensions, silhouettes dessinées finement et améliorations propres à chaque voiture.

## Modules offensifs

Les armes sont des modules sélectionnés **au garage avant le départ**. Chacun consomme des munitions récupérables sur le circuit. Une touche, trois styles :
1. **Dard ionique** — projectile guidé. Une munition. Convient aux attaques ciblées.
2. **Onde EMP** — impulsion qui ralentit temporairement les adversaires dans un rayon proche. Deux munitions et plus de temps de recharge. Convient au peloton.
3. **Piège magnétique** — pose d’une mine derrière la voiture ; l’adversaire qui passe dessus est ralenti et endommagé. Une munition. Convient à la défense.

Les adversaires IA disposent, dans cette version, d’un projectile guidé simplifié. Le boss régional tire plus souvent et résiste mieux que ses deux concurrents. Les attaques, effets, collisions et équilibrages seront approfondis par biome et par boss.

## Principes de conduite et de combat à conserver

- Caméra isométrique stable, circuit clairement lisible.
- Course rapide, bonnes sensations au clavier et sur écran tactile.
- Récompenses liées au résultat, pas à des microtransactions.
- Boss avec une vraie personnalité (voiture, couleurs, nom, pilotage et compétences spécifiques à terme).
- Attention à l'équilibre : les voitures très rapides doivent être moins faciles à piloter.
- Les armes ont une efficacité tactique, ne doivent pas transformer le jeu en chaos illisible.

## État d'implémentation

### Disponible dans v0.8
- Cinq régions jouables, vingt épreuves à tracés distincts, cinq boss.
- Cinq voitures (achat, sélection, visuels différenciés), trois modules offensifs.
- Courses 3 tours, trois IA dont un boss permanent, collisions, nitro, dégâts et élimination des véhicules.
- Lingots collectables, primes de destruction, revenus détaillés, remorque et bateau achetables, droits d’inscription par course, crédits et déblocages sauvegardés.
- Interface et commandes ordinateur + mobile, son facultatif.
- Tests automatiques de progression et de sauvegarde.

### Étapes suivantes
1. **V0.5** : meilleur ressenti des trajectoires (adhérence, dérapage, freinage), comportement spécifique par véhicule, boss plus intelligents.
2. **V0.6** : neige (adhérence faible), désert (sable ralentissant), forêt (pluie et boue), quatre vrais circuits par zone, pilotes et boss inédits.
3. **V0.6** : environnement graphique original nettement plus riche, sons moteurs et rock composé spécifiquement pour le jeu.
4. **V0.7** : dix GP mondiaux, accès réservé à Apex Formula, championnat et trophées.
5. **V1.0** : équilibrage, accessibilité, gamepad, performances mobiles et campagne complète.
6. **Plus tard** : multijoueur en ligne ; GitHub Pages seul ne suffit pas pour gérer l'autorité serveur, la synchronisation et les parties.

*Ce document expose à la fois ce qui fonctionne et ce qui est volontairement au stade de projet.*
