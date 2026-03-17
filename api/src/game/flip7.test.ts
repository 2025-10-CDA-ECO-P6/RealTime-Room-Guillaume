import { describe, it, expect } from "vitest";
import { addCard, isBust } from './flip7'

describe("isBust", () => {
  it("should return false if the card is not in the hand", () => {
    expect(isBust(3, [7, 8])).toBe(false);
  });

  it("should return true if the card is already in the hand", () => {
    expect(isBust(3, [3, 8])).toBe(true);
  });
});

describe("addCard", () => {
  it("should add a card to the hand if it's not a bust", () => {
    expect(addCard(3, [7, 8])).toEqual([7, 8, 3]);
  });
});