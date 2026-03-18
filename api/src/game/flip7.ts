export type Card = {
  value: number
  type: 'number' | 'bonus' | 'double'
}

export function isBust (card: Card, hand: Card[]): boolean {
  return hand.some((c) => c.value === card.value && c.type === card.type);
}

export function addCard (card: Card, hand: Card[]): Card[] {
  return [...hand, card];
}

export function clearHand (hand: Card[]): Card[] {
  return [];
}

export function scoreSum(hand: Card[]): number {
  return hand
    .filter(card => card.type === 'number')
    .reduce((sum, card) => sum + card.value, 0)
}  

export function addToTotalScore(totalScore: number, handScore: number): number {
  return totalScore + handScore;
}

export function winningCondition(totalScore: number): boolean {
  return totalScore >= 200;
}

export function flip7(hand: Card[]): boolean {
    const numberCards = hand.filter(card => card.type === 'number')
    const uniqueCards = new Set(numberCards.map(card => card.value))
    return uniqueCards.size === 7
}

export function applyFlip7Bonus(handScore: number, hasFlip7: boolean): number {
    return hasFlip7 ? handScore + 15 : handScore;
}

export function applyDouble(handscore: number, hasDoubleCard: boolean): number {
    return hasDoubleCard ? handscore * 2 : handscore;
}

export function applyBonus(handscore: number, bonusCards: Card[]): number {
    const totalBonus = bonusCards.reduce((sum, card) => sum + card.value, 0);
    return handscore + totalBonus;
}

export function calculateTurnScore(hand: Card[], hasDoubleCard: boolean, hasFlip7: boolean, bonusCards: Card[]): number {
    let handScore = scoreSum(hand);
    handScore = applyDouble(handScore, hasDoubleCard);
    handScore = applyFlip7Bonus(handScore, hasFlip7);
    handScore = applyBonus(handScore, bonusCards);
    return handScore;
}

export function createDeck(): Card[] {
    const deck: Card[] = [];
    for (let i = 1; i <= 12; i++) {
        for (let j = 0; j < i; j++) {
            deck.push({ value: i, type: 'number' });
        }
    }
    deck.push({ value: 0, type: 'number' }); // Add the 0 card

    deck.push({ value: 2, type: 'bonus' });
    deck.push({ value: 4, type: 'bonus' });
    deck.push({ value: 6, type: 'bonus' });
    deck.push({ value: 8, type: 'bonus' });
    deck.push({ value: 10, type: 'bonus' });// Bonus cards have a value that will be added to the score

    deck.push({ value: 0, type: 'double' }); // Double card doesn't have a value, it just doubles the score

    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
}

export function drawCard(deck: Card[]): { card: Card, remainingDeck: Card[] } {
    const [card, ...remainingDeck] = deck;
    return { card, remainingDeck };
}

export function sortHand(hand: Card[]): { numberCards: Card[], bonusCards: Card[], hasDouble: boolean } {
    const numberCards = hand.filter(card => card.type === 'number').sort((a, b) => a.value - b.value);
    const bonusCards = hand.filter(card => card.type === 'bonus').sort((a, b) => a.value - b.value);
    const doubleCard = hand.find(card => card.type === 'double');
    return { numberCards, bonusCards, hasDouble: !!doubleCard };
}
