# LOUBKARTING — Game Design Document / Earth Tour
**Version du concept : 0.3** · Jeu solo isométrique pour le navigateur · GitHub Pages

## Direction

Un jeu de **course-combat sur Terre**. Le joueur commence au volant d'une petite citadine, gagne des crédits, apprend à conduire et construit progressivement une collection de véhicules de plus en plus spécialisés jusqu'à la monoplace.

**Tonalité :** automobile, sportive, spectaculaire, mais relativement sérieuse. Les attaques sont des technologies futuristes stylisées — pas des bananes, des carapaces ou des personnages empruntés à d'autres franchises. L'inspiration est le *genre* des courses arcade isométriques et du kart-combat, avec assets, pistes, noms et bande-son originaux.

**Priorité absolue :** un pilotage qui procure du plaisir, des voitures réellement distinctes à l'écran, des circuits lisibles et un sentiment de progression.

## Organisation de la Terre

Cinq grandes régions, quatre courses chacune. La 4e est une confrontation contre le pilote dominant de la zone. Puis une saison mondiale de dix Grands Prix en monoplace : **30 courses au total**.

| Région | Continent | Biome | Courses | Boss | État |
|---|---|---|---:|---|---|
| 01 · Alpes | Europe | Montagne, cols, lacets | 4 | Le Bouquetin | **Jouable** |
| 02 · Littoral | Océanie | Plage, corniche et mer | 4 | Sirène du Cap | **Jouable après le boss des Alpes** |
| 03 · Grand Nord | Amérique du Nord | Neige, verglas, pins | 4 | Le Blizzard | Planifié |
| 04 · Sahara | Afrique | Dunes, canyons, oasis | 4 | Le Scorpion | Planifié |
| 05 · Amazonie | Amérique du Sud | Forêt, boue, pluie, ponts | 4 | Le Jaguar | Planifié |
| 06 · World Grand Prix | International | Circuits automobiles de prestige | **10** | Champion mondial | Planifié, monoplace obligatoire |

### Alpes — 4 épreuves jouables
1. **Col des Brumes** : première course, apprentissage.
2. **Épingle des Cimes** : enchaînements techniques.
3. **Crête du Tonnerre** : alternance de longues courbes et virages serrés.
4. **Ascension Royale** : combat final contre **Le Bouquetin**.

### Littoral — 4 épreuves jouables
1. **Baie d'Azur** : grandes courbes en bord de mer.
2. **Corniche des Embruns** : tracé sinueux.
3. **Cap Solaire** : virages à contretemps.
4. **Couronne des Marées** : finale contre **Sirène du Cap**.

Chaque épreuve jouable dispose actuellement d'un **tracé fermé distinct**, d'une variation d'environnement cohérente avec le biome et d'un meilleur temps séparé. Les décors restent provisoires, dessinés par le moteur Canvas.

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

## Progression de carrière

- L'épreuve 01 des Alpes est accessible immédiatement.
- **Top 3** sur une course standard : épreuve suivante débloquée.
- **1re place sur une finale de zone** : boss vaincu, région suivante débloquée si celle-ci est développée.
- Le World Grand Prix sera accessible après avoir conquis les cinq régions **et posséder la monoplace**. Il reste non implémenté.
- Une course peut être rejouée pour gagner des crédits supplémentaires.
- Première qualification : bonus de **280 CR** pour une course standard, **850 CR** pour un boss.
- Gains de base : 450 / 360 / 290 / 230 / 180 CR selon le classement ; 75 CR en cas d'élimination.
- Progression sauvegardée localement dans le navigateur. Pas de compte utilisateur, pas de synchronisation entre appareils à ce stade.

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
3. **Piège magnétique** — pose d'une mine derrière la voiture ; l'adversaire qui passe dessus est ralenti. Une munition. Convient à la défense.

Les adversaires IA disposent, dans cette version, d'un projectile guidé simplifié. Les attaques, effets, collisions et équilibrages seront approfondis par biome et par boss.

## Principes de conduite et de combat à conserver

- Caméra isométrique stable, circuit clairement lisible.
- Course rapide, bonnes sensations au clavier et sur écran tactile.
- Récompenses liées au résultat, pas à des microtransactions.
- Boss avec une vraie personnalité (voiture, couleurs, nom, pilotage et compétences spécifiques à terme).
- Attention à l'équilibre : les voitures très rapides doivent être moins faciles à piloter.
- Les armes ont une efficacité tactique, ne doivent pas transformer le jeu en chaos illisible.

## État d'implémentation

### Disponible dans v0.3
- Deux régions réellement jouables, huit épreuves à tracés distincts, deux boss.
- Cinq voitures (achat, sélection, visuels différenciés), trois modules offensifs.
- Courses 3 tours, quatre IA, collisions, nitro, dégâts, classement.
- Crédits, achats et débloquages sauvegardés.
- Interface et commandes ordinateur + mobile, son facultatif.
- Tests automatiques de progression et de sauvegarde.

### Étapes suivantes
1. **V0.4** : meilleur ressenti des trajectoires (adhérence, dérapage, freinage), comportement spécifique par véhicule, boss plus intelligents.
2. **V0.5** : neige (adhérence faible), désert (sable ralentissant), forêt (pluie et boue), quatre vrais circuits par zone, pilotes et boss inédits.
3. **V0.6** : environnement graphique original nettement plus riche, sons moteurs et rock composé spécifiquement pour le jeu.
4. **V0.7** : dix GP mondiaux, accès réservé à Apex Formula, championnat et trophées.
5. **V1.0** : équilibrage, accessibilité, gamepad, performances mobiles et campagne complète.
6. **Plus tard** : multijoueur en ligne ; GitHub Pages seul ne suffit pas pour gérer l'autorité serveur, la synchronisation et les parties.

*Ce document expose à la fois ce qui fonctionne et ce qui est volontairement au stade de projet.*
