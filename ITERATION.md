# Journal d'itération — Flip 7

## Règles métier identifiées

| Règle | Fonction | Fichier |
|-------|----------|---------|
| Un joueur bust s'il reçoit une carte déjà en main | `isBust` | `flip7.ts` |
| Une carte s'ajoute à la main si pas de bust | `addCard` | `flip7.ts` |
| La main se vide en cas de bust ou fin de manche | `clearHand` | `flip7.ts` |
| Le score d'une manche = somme des cartes numéro | `scoreSum` | `flip7.ts` |
| Le score total = cumul des manches | `addToTotalScore` | `flip7.ts` |
| 7 cartes différentes = Flip 7 | `flip7` | `flip7.ts` |
| Flip 7 rapporte 15 points bonus | `applyFlip7Bonus` | `flip7.ts` |
| La carte x2 double le score des cartes numéro | `applyDouble` | `flip7.ts` |
| Les bonus fixes s'ajoutent au score | `applyBonus` | `flip7.ts` |
| Le score final d'une manche combine toutes les règles | `calculateTurnScore` | `flip7.ts` |
| Un joueur gagne s'il atteint ou dépasse 200 points | `winningCondition` | `flip7.ts` |

---

## Étapes d'implémentation

### Itération 1 — Logique de bust
**Règle** : Un joueur buste s'il reçoit un numéro déjà en main.  
**Test** : `isBust(3, [3, 8])` → `true` / `isBust(3, [7, 8])` → `false`  
**Implémentation** : `hand.includes(card)`

### Itération 2 — Ajout de carte
**Règle** : Une carte s'ajoute à la main si pas de bust.  
**Test** : `addCard(3, [7, 8])` → `[7, 8, 3]`  
**Implémentation** : `[...hand, card]`

### Itération 3 — Vidage de main
**Règle** : La main se vide en cas de bust ou fin de manche.  
**Test** : `clearHand([7, 8])` → `[]`  
**Implémentation** : `return []`

### Itération 4 — Calcul du score de manche
**Règle** : Le score = somme des cartes numéro.  
**Test** : `scoreSum([7, 8])` → `15`  
**Implémentation** : `hand.reduce((sum, card) => sum + card, 0)`

### Itération 5 — Score total
**Règle** : Le score total est le cumul des manches.  
**Test** : `addToTotalScore(10, 15)` → `25`  
**Implémentation** : `totalScore + handScore`

### Itération 6 — Condition de victoire
**Règle** : Un joueur gagne s'il atteint ou dépasse 200 points.  
**Test** : `winningCondition(205)` → `true` / `winningCondition(195)` → `false`  
**Implémentation** : `totalScore >= 200`

### Itération 7 — Flip 7
**Règle** : 7 cartes numéro différentes = Flip 7.  
**Test** : `flip7([1,2,3,4,5,6,7])` → `true`  
**Implémentation** : `new Set(hand).size === 7`

### Itération 8 — Bonus Flip 7
**Règle** : Flip 7 rapporte 15 points supplémentaires.  
**Test** : `applyFlip7Bonus(10, true)` → `25`  
**Implémentation** : `hasFlip7 ? handScore + 15 : handScore`

### Itération 9 — Carte x2
**Règle** : La carte x2 double le score des cartes numéro.  
**Test** : `applyDouble(10, true)` → `20`  
**Implémentation** : `hasDoubleCard ? score * 2 : score`

### Itération 10 — Bonus fixes
**Règle** : Les bonus +2 à +10 s'ajoutent au score.  
**Test** : `applyBonus(10, [2, 8])` → `20`  
**Implémentation** : `score + bonusCards.reduce(...)`

### Itération 11 — Score final de manche
**Règle** : Le score final combine toutes les règles dans l'ordre.  
**Test** : `calculateTurnScore([1,2,3,4,5,6,7], true, true, [2,8])` → `81`  
**Implémentation** : Orchestration de `scoreSum` → `applyDouble` → `applyFlip7Bonus` → `applyBonus`

---

## Cas limites testés

- Main vide → `scoreSum([])` = 0, `isBust(3, [])` = false, `flip7([])` = false
- Carte 0 → `scoreSum([0])` = 0, `addCard(0, [7, 8])` = `[7, 8, 0]`
- Score exactement à 200 → `winningCondition(200)` = true