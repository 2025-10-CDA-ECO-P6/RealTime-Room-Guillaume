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