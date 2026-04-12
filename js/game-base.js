export class Card {
    constructor(suit, value) {
        this.suit = suit;      // 0-3 (♠♥♦♣)
        this.value = value;    // 1-13 (A=1, K=13)
        this.visible = false;
    }
    
    isRed() {
        return this.suit === 1 || this.suit === 2; // ♥♦
    }
    
    isBlack() {
        return !this.isRed();
    }
    
    toString() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return `${values[this.value]}${suits[this.suit]}`;
    }
}

export class Pile {
    constructor(type) {
        this.type = type;  // 'stock', 'waste', 'foundation', 'tableau'
        this.cards = [];
    }
    
    top() {
        return this.cards[this.cards.length - 1];
    }
    
    isEmpty() {
        return this.cards.length === 0;
    }
    
    push(card) {
        this.cards.push(card);
    }
    
    pop() {
        return this.cards.pop();
    }
}

export class SolitaireGame {
    constructor() {
        this.score = 0;
        this.moves = [];
    }
    
    // Interfejs do implementacji przez konkretne gry
    setup() {
        throw new Error('Must implement setup()');
    }
    
    canMove(cards, fromPile, toPile) {
        throw new Error('Must implement canMove()');
    }
    
    move(cards, fromPile, toPile) {
        throw new Error('Must implement move()');
    }
    
    isWon() {
        throw new Error('Must implement isWon()');
    }
    
    getState() {
        throw new Error('Must implement getState()');
    }
    
    getHint() {
        return null;
    }
}