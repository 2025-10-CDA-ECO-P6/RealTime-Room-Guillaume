# Journal d'itération — Flip 7

## Règles métier identifiées

| Règle | Fonction | Fichier |
|-------|----------|---------|
| Un joueur bust s'il reçoit une carte déjà en main | `isBust` | `flip7.ts` |
| Une carte s'ajoute à la main | `addCard` | `flip7.ts` |
| La main se vide en cas de bust ou fin de manche | `clearHand` | `flip7.ts` |
| Le score d'une manche = somme des cartes numéro | `scoreSum` | `flip7.ts` |
| Le score total = cumul des manches | `addToTotalScore` | `flip7.ts` |
| 7 cartes numéro différentes = Flip 7 | `flip7` | `flip7.ts` |
| Flip 7 rapporte 15 points bonus | `applyFlip7Bonus` | `flip7.ts` |
| La carte x2 double le score des cartes numéro | `applyDouble` | `flip7.ts` |
| Les bonus fixes s'ajoutent au score | `applyBonus` | `flip7.ts` |
| Le score final combine toutes les règles | `calculateTurnScore` | `flip7.ts` |
| Un joueur gagne s'il atteint ou dépasse 200 points | `winningCondition` | `flip7.ts` |
| Le deck contient 94 cartes (numéro + bonus + action) | `createDeck` | `flip7.ts` |
| Le deck est mélangé aléatoirement | `shuffleDeck` | `flip7.ts` |
| Piocher retire la première carte du deck | `drawCard` | `flip7.ts` |
| La main est triée par type (numéro, bonus, double) | `sortHand` | `flip7.ts` |

---

## Étapes d'implémentation

### Itération 1 — Logique de bust
**Règle** : Un joueur buste s'il reçoit un numéro déjà en main.  
**Test** : `isBust({value:3,type:'number'}, [{value:3,type:'number'}])` → `true`  
**Implémentation** : `hand.some(c => c.value === card.value && c.type === card.type)`

### Itération 2 — Ajout de carte
**Règle** : Une carte s'ajoute à la main.  
**Test** : `addCard({value:3,type:'number'}, [{value:7,type:'number'}])` → `[{7},{3}]`  
**Implémentation** : `[...hand, card]`

### Itération 3 — Vidage de main
**Règle** : La main se vide en cas de bust ou fin de manche.  
**Test** : `clearHand([{value:7,type:'number'}])` → `[]`  
**Implémentation** : `return []`

### Itération 4 — Calcul du score de manche
**Règle** : Le score = somme des cartes numéro uniquement.  
**Test** : `scoreSum([{value:7,type:'number'},{value:8,type:'number'}])` → `15`  
**Implémentation** : `hand.filter(c => c.type === 'number').reduce((sum, c) => sum + c.value, 0)`

### Itération 5 — Score total
**Règle** : Le score total est le cumul des manches.  
**Test** : `addToTotalScore(10, 15)` → `25`  
**Implémentation** : `totalScore + handScore`

### Itération 6 — Condition de victoire
**Règle** : Un joueur gagne s'il atteint ou dépasse 200 points.  
**Test** : `winningCondition(200)` → `true` / `winningCondition(195)` → `false`  
**Implémentation** : `totalScore >= 200`

### Itération 7 — Flip 7
**Règle** : 7 cartes numéro différentes = Flip 7. Les bonus ne comptent pas.  
**Test** : `flip7([{value:1,type:'number'},...x7])` → `true`  
**Implémentation** : `new Set(hand.filter(c => c.type === 'number').map(c => c.value)).size === 7`

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
**Test** : `applyBonus(10, [{value:2,type:'bonus'},{value:8,type:'bonus'}])` → `20`  
**Implémentation** : `score + bonusCards.reduce((sum, c) => sum + c.value, 0)`

### Itération 11 — Score final de manche
**Règle** : Le score final combine toutes les règles dans l'ordre.  
**Test** : `calculateTurnScore([...7 numéros + double + 2 bonus])` → `81`  
**Implémentation** : `sortHand` → `scoreSum` → `applyDouble` → `applyFlip7Bonus` → `applyBonus`

### Itération 12 — Création du deck
**Règle** : Le deck contient 94 cartes avec la bonne composition.  
**Test** : `createDeck().length` → `94`  
**Implémentation** : Boucle pour les numéros + push des bonus et actions

### Itération 13 — Mélange du deck
**Règle** : Le deck est mélangé sans muter l'original.  
**Test** : `shuffleDeck(deck).length === deck.length` et `shuffleDeck(deck) !== deck`  
**Implémentation** : Algorithme Fisher-Yates sur une copie `[...deck]`

### Itération 14 — Pioche
**Règle** : Piocher retire la première carte et retourne le deck restant.  
**Test** : `drawCard(deck)` → `{ card, remainingDeck }` / `drawCard([])` → `null`  
**Implémentation** : Destructuring `const [card, ...remainingDeck] = deck`

### Itération 15 — Tri de la main
**Règle** : La main est triée par type pour le calcul du score.  
**Test** : `sortHand([numéro, bonus, double])` → `{ numberCards, bonusCards, hasDouble }`  
**Implémentation** : `filter` par type

---

## Refactorisation majeure — Type Card

Après les premières itérations, la structure `number[]` a été remplacée par `Card[]` :
```ts
type Card = {
  value: number
  type: 'number' | 'bonus' | 'double' | 'action'
  effect?: 'freeze' | 'flip_three' | 'second_chance'
}
```

Cette refactorisation a permis de distinguer les cartes numéro des cartes bonus et action, nécessaire pour les règles de Flip 7 et le calcul du score.

---

## Cas limites testés

- Main vide → `scoreSum([])` = 0, `isBust(3, [])` = false, `flip7([])` = false
- Carte 0 → `scoreSum([{value:0,type:'number'}])` = 0
- Score exactement à 200 → `winningCondition(200)` = true
- Deck vide → `drawCard([])` = null
- 6 cartes numéro + 1 bonus → `flip7(...)` = false