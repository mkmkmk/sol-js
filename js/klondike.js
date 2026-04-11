import { SolitaireGame } from './game-base.js';
import { Card } from './card.js';
import { Pile } from './pile.js';

export class KlondikeGame extends SolitaireGame {
    constructor(options = {}) {
        super();
        this.dealThree = options.dealThree || false;
        this.maxRedeal = options.maxRedeal ?? 2;
        this.kingsOnly = options.kingsOnly ?? true;
        this.redealCount = 0;
    }

    setup() {
        // Tworzymy sloty (jak w .scm)
        this.stock = new Pile('stock');
        this.waste = new Pile('waste');
        this.foundations = [
            new Pile('foundation'),
            new Pile('foundation'),
            new Pile('foundation'),
            new Pile('foundation')
        ];
        this.tableau = [
            new Pile('tableau'),
            new Pile('tableau'),
            new Pile('tableau'),
            new Pile('tableau'),
            new Pile('tableau'),
            new Pile('tableau'),
            new Pile('tableau')
        ];

        // Tworzymy i tasujemy talię
        const deck = this.createDeck();
        this.shuffle(deck);
        this.stock.cards = deck;

        // Rozdajemy karty na tableau
        this.dealTableau();
    }

    createDeck() {
        const deck = [];
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 1; value <= 13; value++) {
                deck.push(new Card(suit, value));
            }
        }
        return deck;
    }

    shuffle(deck) {
        // Fisher-Yates shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    dealTableau() {
        // Rozdajemy jak w .scm: 1 karta na stos 0, 2 na stos 1, itd.
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = this.stock.cards.pop();
                this.tableau[j].cards.push(card);
            }
            // Odkrywamy górną kartę
            this.tableau[i].top().visible = true;
        }
    }

    // Implementacja droppable? z .scm
    canMove(cards, fromPile, toPile) {
        if (cards.length === 0) return false;

        const topCard = cards[cards.length - 1]; // Najniższa karta w sekwencji

        // Ruch na tableau
        if (toPile.type === 'tableau') {
            if (toPile.isEmpty()) {
                // Puste miejsce - tylko Król (jeśli kingsOnly)
                return !this.kingsOnly || topCard.value === 13;
            }
            const target = toPile.top();
            // Naprzemienne kolory i malejąca wartość
            return target.isRed() !== topCard.isRed() &&
                target.value === topCard.value + 1;
        }

        // Ruch na foundation
        if (toPile.type === 'foundation') {
            if (cards.length !== 1) return false; // Tylko pojedyncze karty

            if (toPile.isEmpty()) {
                return topCard.value === 1; // Tylko As
            }
            const target = toPile.top();
            // Ten sam kolor, rosnąco
            return target.suit === topCard.suit &&
                target.value === topCard.value - 1;
        }

        return false;
    }

    // Implementacja complete-transaction z .scm
    move(cards, fromPile, toPile) {

        console.log('=== canMove DEBUG ===');
        console.log('cards:', cards.map(c => c.toString()));
        console.log('fromPile:', fromPile.type);
        console.log('toPile:', toPile.type, toPile.isEmpty() ? 'empty' : toPile.top().toString());


        if (!this.canMove(cards, fromPile, toPile)) return false;

        // Odwracamy kolejność przy dodawaniu do stosu (adapter dla formatu .scm)
        const cardsToAdd = [...cards].reverse();

        cardsToAdd.forEach(card => {
            const index = fromPile.cards.indexOf(card);
            fromPile.cards.splice(index, 1);
            toPile.cards.push(card);
        });

        if (fromPile.type === 'tableau' && !fromPile.isEmpty()) {
            fromPile.top().visible = true;
        }

        if (fromPile.type === 'foundation') this.score -= 1;
        if (toPile.type === 'foundation') this.score += 1;

        return true;
    }

    // Implementacja button-clicked (dobieranie ze stocku)
    dealFromStock() {
        const count = this.dealThree ? 3 : 1;

        if (this.stock.isEmpty()) {
            // Redeal - przerzucamy waste → stock
            if (this.maxRedeal === -1 || this.redealCount < this.maxRedeal) {
                while (!this.waste.isEmpty()) {
                    const card = this.waste.cards.pop();
                    card.visible = false;
                    this.stock.cards.push(card);
                }
                this.redealCount++;
                return true;
            }
            return false;
        }

        // Dobieramy karty
        for (let i = 0; i < count && !this.stock.isEmpty(); i++) {
            const card = this.stock.cards.pop();
            card.visible = true;
            this.waste.cards.push(card);
        }
        return true;
    }

    // Implementacja game-won
    isWon() {
        return this.foundations.every(f => f.cards.length === 13);
    }

    // Zwraca stan gry (dla View)
    getState() {
        return {
            stock: this.stock,
            waste: this.waste,
            foundations: this.foundations,
            tableau: this.tableau,
            score: this.score,
            redealCount: this.redealCount,
            maxRedeal: this.maxRedeal,
            canDeal: !this.stock.isEmpty() ||
                (this.maxRedeal === -1 || this.redealCount < this.maxRedeal)
        };
    }
}