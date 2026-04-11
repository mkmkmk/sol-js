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