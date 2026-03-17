export function isBust (card: number, hand: number[]): boolean {
  return hand.includes(card);
}

export function addCard (card: number, hand: number[]): number[] {
  return [...hand, card];
}

export function clearHand (hand: number[]): number[] {
  return [];
}