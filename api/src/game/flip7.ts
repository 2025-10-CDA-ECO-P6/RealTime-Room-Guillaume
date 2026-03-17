export function isBust (card: number, hand: number[]): boolean {
  return hand.includes(card);
}

export function addCard (card: number, hand: number[]): number[] {
  return [...hand, card];
}

export function clearHand (hand: number[]): number[] {
  return [];
}

export function scoreSum (hand: number[]): number {
  return hand.reduce((sum, card) => sum + card, 0);
}   

export function addToTotalScore(totalScore: number, handScore: number): number {
  return totalScore + handScore;
}

export function winningCondition(totalScore: number): boolean {
  return totalScore >= 200;
}

export function flip7(hand: number[]): boolean {
    const uniqueCards = new Set(hand);
    return uniqueCards.size === 7;
}

export function applyFlip7Bonus(handScore: number, hasFlip7: boolean): number {
    return hasFlip7 ? handScore + 15 : handScore;
}

export function applyDouble(handscore: number, hasDoubleCard: boolean): number {
    return hasDoubleCard ? handscore * 2 : handscore;
}

export function applyBonus(handscore: number, bonusCards: number[]): number {
    const totalBonus = bonusCards.reduce((sum, card) => sum + card, 0);
    return handscore + totalBonus;
}

export function calculateTurnScore(hand: number[], hasDoubleCard: boolean, hasFlip7: boolean, bonusCards: number[]): number {
    let handScore = scoreSum(hand);
    handScore = applyDouble(handScore, hasDoubleCard);
    handScore = applyFlip7Bonus(handScore, hasFlip7);
    handScore = applyBonus(handScore, bonusCards);
    return handScore;
}