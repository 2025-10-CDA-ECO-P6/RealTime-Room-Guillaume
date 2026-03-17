import { describe, it, expect } from "vitest";
import { addCard, addToTotalScore, clearHand, flip7, isBust, scoreSum, winningCondition } from './flip7'

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

describe("clearHand", () => {
  it("should clear the hand", () => {
    expect(clearHand([7, 8])).toEqual([]);
  });
});

describe("scoreSum", () => {
  it("should return the sum of the hand", () => {
    expect(scoreSum([7, 8])).toBe(15);
  });
});

describe("addToTotalScore", () => {
  it("should add the hand score to the total score", () => {
    expect(addToTotalScore(10, scoreSum([7, 8]))).toBe(25);
  });
});

describe("winningCondition", () => {
  it("should return true if the total score is higher than 200", () => {
    expect(winningCondition(205)).toBe(true);
  });

  it("should return false if the total score is less than or equal to 200", () => {
    expect(winningCondition(195)).toBe(false);
  });
});

describe("flip7", () => {
    it("the player gets 7 différents cards", () => {
        expect(flip7([1, 2, 3, 4, 5, 6, 7])).toBe(true)    
    });
        it("the player gets 7 cards but not all different", () => { 
        expect(flip7([1, 2, 3, 4, 5, 6, 6])).toBe(false)
    });
});