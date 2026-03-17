export function isBust (card: number, hand: number[]): boolean {
  return hand.includes(card);
}