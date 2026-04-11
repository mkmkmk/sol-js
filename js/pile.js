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