import { describe, it, expect } from "vitest";
import { addCard, addToTotalScore, applyBonus, applyDouble, applyFlip7Bonus, calculateTurnScore, clearHand, flip7, isBust, scoreSum, winningCondition } from './flip7'

describe("isBust", () => {
  it("should return false if the card is not in the hand", () => {
    expect(isBust(3, [7, 8])).toBe(false);
  });

  it("should return true if the card is already in the hand", () => {
    expect(isBust(3, [3, 8])).toBe(true);
  });

  it("should return false if the hand is empty", () => {
    expect(isBust(3, [])).toBe(false);
  });
});

describe("addCard", () => {
  it("should add a card to the hand if it's not a bust", () => {
    expect(addCard(3, [7, 8])).toEqual([7, 8, 3]);
  });
  it("sould add the 0 card to the hand", () => {
    expect(addCard(0, [7, 8])).toEqual([7, 8, 0]);
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

  it("should return 0 if the hand contains only a 0 card", () => {
    expect(scoreSum([0])).toBe(0);
  });

  it("should return 0 if the hand is empty", () => {
    expect(scoreSum([])).toBe(0);
  });   
});

describe("addToTotalScore", () => {
  it("should add the hand score to the total score", () => {
    expect(addToTotalScore(10, scoreSum([7, 8]))).toBe(25);
  });

  it("should return 0 if the hand is empty", () => {
    expect(scoreSum([])).toBe(0);
});
});

describe("winningCondition", () => {
  it("should return true if the total score is higher than 200", () => {
    expect(winningCondition(205)).toBe(true);
  });

  it ("should return true if the total score is exactly 200", () => {
    expect(winningCondition(200)).toBe(true);
  });  

  it("should return false if the total score is less than 200", () => {
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

    it("the player gets less than 7 cards", () => {
        expect(flip7([1, 2, 3])).toBe(false)
    });

    it("the player gets an empty hand", () => {
        expect(flip7([])).toBe(false)
    });
});

describe("applyFlip7Bonus", () => {
    it("should add 15 points to the hand score if the player gets 7 different cards", () => {
        expect(applyFlip7Bonus(10, true)).toBe(25);
    });
    it("should not change the hand score if the player does not get 7 different cards", () => {
        expect(applyFlip7Bonus(10, false)).toBe(10);
    });
});

describe("applyDouble", () => {
    it ("should double the turn score if get x2 card", () => {
        expect(applyDouble(10, true)).toBe(20);
    });
    it ("should not change the turn score if no x2 card", () => {
        expect(applyDouble(10, false)).toBe(10);
    });
});

describe("applyBonus", () => {
    it ("should add to the turn score the bonus points", () => {
        expect(applyBonus(10, [2,8])).toBe(20);
    });
    it ("should not change the turn score if no bonus card", () => {
        expect(applyBonus(10, [])).toBe(10);
    });
});

describe("calculateTurnScore", () => {
    it("should calculate the turn score with all bonuses applied", () => {
        expect(calculateTurnScore([1, 2, 3, 4, 5, 6, 7], true, true, [2, 8])).toBe(81);
    });
    it("should calculate the turn score without any bonuses", () => {
        expect(calculateTurnScore([1, 2, 3], false, false, [])).toBe(6);
    });
});