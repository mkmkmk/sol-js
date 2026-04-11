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
