import { describe, it, expect } from "vitest";
import { addCard, addToTotalScore, applyBonus, applyDouble, applyFlip7Bonus, calculateTurnScore, Card, clearHand, createDeck, drawCard, flip7, isBust, scoreSum, shuffleDeck, sortHand, winningCondition } from './flip7'

describe("isBust", () => {
    it("should return false if the card is not in the hand", () => {
      expect(isBust({ value: 3, type: 'number' }, [{ value: 7, type: 'number' }, { value: 8, type: 'number' }])).toBe(false);
    });

    it("should return true if the card is already in the hand", () => {
      expect(isBust({ value: 3, type: 'number' }, [{ value: 3, type: 'number' }, { value: 8, type: 'number' }])).toBe(true);
    });

    it("should return false if the hand is empty", () => {
      expect(isBust({ value: 3, type: 'number' }, [])).toBe(false);
    });
});

describe("addCard", () => {
    it("should add a card to the hand if it's not a bust", () => {
      expect(addCard({ value: 3, type: 'number' }, [{ value: 7, type: 'number' }, { value: 8, type: 'number' }])).toEqual([{ value: 7, type: 'number' }, { value: 8, type: 'number' }, { value: 3, type: 'number' }]);
    });
    it("should add the 0 card to the hand", () => {
      expect(addCard({ value: 0, type: 'number' }, [{ value: 7, type: 'number' }, { value: 8, type: 'number' }])).toEqual([{ value: 7, type: 'number' }, { value: 8, type: 'number' }, { value: 0, type: 'number' }]);
    });
});

describe("clearHand", () => {
    it("should clear the hand", () => {
      expect(clearHand([{ value: 7, type: 'number' }, { value: 8, type: 'number' }])).toEqual([]);
    });
});

describe("scoreSum", () => {
    it("should return the sum of the hand", () => {
      expect(scoreSum([{ value: 7, type: 'number' }, { value: 8, type: 'number' }])).toBe(15);
    });

    it("should return 0 if the hand contains only a 0 card", () => {
      expect(scoreSum([{ value: 0, type: 'number' }])).toBe(0);
    });

    it("should return 0 if the hand is empty", () => {
      expect(scoreSum([])).toBe(0);
    });   
});

describe("addToTotalScore", () => {
    it("should add the hand score to the total score", () => {
      expect(addToTotalScore(10, scoreSum([{ value: 7, type: 'number' }, { value: 8, type: 'number' }]))).toBe(25);
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
        expect(flip7([
          { value: 1, type: 'number' }, 
          { value: 2, type: 'number' }, 
          { value: 3, type: 'number' }, 
          { value: 4, type: 'number' }, 
          { value: 5, type: 'number' }, 
          { value: 6, type: 'number' }, 
          { value: 7, type: 'number' }
        ])).toBe(true)    
    });
    
    it("the player gets 7 cards but not all different", () => { 
        expect(flip7([
          { value: 1, type: 'number' }, 
          { value: 2, type: 'number' }, 
          { value: 3, type: 'number' }, 
          { value: 4, type: 'number' }, 
          { value: 5, type: 'number' }, 
          { value: 6, type: 'number' }, 
          { value: 6, type: 'number' }
        ])).toBe(false)
    });

    it("the player gets less than 7 cards", () => {
        expect(flip7([
          { value: 1, type: 'number' }, 
          { value: 2, type: 'number' }, 
          { value: 3, type: 'number' }
        ])).toBe(false)
    });

    it("the player gets an empty hand", () => {
        expect(flip7([])).toBe(false)
    });
    it("should return false if the player has 6 number cards and 1 bonus card", () => {
      expect(flip7([
          { value: 1, type: 'number' },
          { value: 2, type: 'number' },
          { value: 3, type: 'number' },
          { value: 4, type: 'number' },
          { value: 5, type: 'number' },
          { value: 6, type: 'number' },
          { value: 4, type: 'bonus' }
      ])).toBe(false)
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
        expect(applyBonus(10, [{ value: 2, type: 'bonus' }, { value: 8, type: 'bonus' }])).toBe(20);
    });
    it ("should not change the turn score if no bonus card", () => {
        expect(applyBonus(10, [])).toBe(10);
    });
});

describe("calculateTurnScore", () => {
    it("should calculate the turn score with a mixed hand", () => {
        const hand: Card[] = [
            { value: 1, type: 'number' },
            { value: 2, type: 'number' },
            { value: 3, type: 'number' },
            { value: 4, type: 'number' },
            { value: 5, type: 'number' },
            { value: 6, type: 'number' },
            { value: 7, type: 'number' },
            { value: 0, type: 'double' },
            { value: 2, type: 'bonus' },
            { value: 8, type: 'bonus' }
        ]
        expect(calculateTurnScore(hand)).toBe(81)
    });
    it("should calculate the turn score without any bonuses", () => {
        expect(calculateTurnScore([{ value: 1, type: 'number' }, { value: 2, type: 'number' }, { value: 3, type: 'number' }])).toBe(6);
    });
});

describe("createDeck", () => {
    it("should create a deck of 86 cards", () => {
      expect(createDeck().length).toBe(85);
    });
    it("should contain 12 copies of the card 12", () => {
      const deck = createDeck()
      const count = deck.filter(card => card.value === 12).length
      expect(count).toBe(12)
    });
    it("sould contain 1 copy of the card 0", () => {
      const deck = createDeck()
      const count = deck.filter(card => card.value  === 0 && card.type === 'number').length
      expect(count).toBe(1)
    });
});
      
describe("shuffleDeck", () => {
    it("should return a deck with the same cards", () => {
        const deck = createDeck()
        const shuffled = shuffleDeck(deck)
        expect(shuffled.length).toBe(deck.length)
    });
    it("should not mutate the original deck", () => {
        const deck = createDeck()
        const shuffled = shuffleDeck(deck)
        expect(shuffled).not.toBe(deck) 
    });
})

describe("drawCard", () => {
    it("should draw a card from the deck", () => {
        const deck = createDeck()
        const result = drawCard(deck)
        expect(result).not.toBeNull()
        if (!result) return
        expect(result.card).toEqual(deck[0])
        expect(result.remainingDeck.length).toBe(84)
    });
    it("should not mutate the original deck", () => {
        const deck = createDeck()
        drawCard(deck)
        expect(deck.length).toBe(85)
    });
    it("should return null if the deck is empty", () => {
        const result = drawCard([])
        expect(result).toBeNull()
    });
})

describe("sortHand", () => {
    it("should separate number cards, bonus cards and double card", () => {
        const hand: Card[] = [
            { value: 3, type: 'number' },
            { value: 5, type: 'number' },
            { value: 4, type: 'bonus' },
            { value: 0, type: 'double' }
        ]
        expect(sortHand(hand)).toEqual({
            numberCards: [{ value: 3, type: 'number' }, { value: 5, type: 'number' }],
            bonusCards: [{ value: 4, type: 'bonus' }],
            hasDouble: true
        })
    });
})