import e from "express";

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
  return totalScore > 200;
}

export function flip7(hand: number[]): boolean {
    const uniqueCards = new Set(hand);
    return uniqueCards.size === 7;
}

export function applyDouble(handscore: number, hasDoubleCard: boolean): number {
    return hasDoubleCard ? handscore * 2 : handscore;
}

export function applyBonus(handscore: number, bonusCards: number[]): number {
    const totalBonus = bonusCards.reduce((sum, card) => sum + card, 0);
    return handscore + totalBonus;
}
