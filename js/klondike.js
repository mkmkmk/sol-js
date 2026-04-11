import { SolitaireGame } from './game-base.js';
import { Card } from './card.js';
import { Pile } from './pile.js';

export class KlondikeGame extends SolitaireGame {
    constructor(options = {}) {
        super();
        this.dealThree = options.dealThree || false;
        this.maxRedeal = options.maxRedeal ?? 5;
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

    getDefaultMoveCount(fromPile, toPile) {
        // Foundation przyjmuje tylko 1 kartę
        if (toPile.type === 'foundation') {
            return 1;
        }

        // Waste też tylko 1
        if (fromPile.type === 'waste') {
            return 1;
        }

        // Tableau - wszystkie widoczne w sekwencji
        if (fromPile.type === 'tableau') {
            return this.getMaxMovableCards(fromPile);
        }

        return 1;
    }

    isValidTableauBuild(cards) {
        if (cards.length === 0) return false;
        if (cards.length === 1) return true;

        for (let i = 0; i < cards.length - 1; i++) {
            const current = cards[i];
            const next = cards[i + 1];

            // Muszą być naprzemienne kolory
            if (current.isRed() === next.isRed()) return false;

            // Muszą być malejące wartości
            if (current.value !== next.value + 1) return false;
        }

        return true;
    }

    getMaxMovableCards(fromPile) {
        if (fromPile.type !== 'tableau') return 1;

        const cards = fromPile.cards;
        let count = 0;

        for (let i = cards.length - 1; i >= 0; i--) {
            if (!cards[i].visible) break;
            count++;

            const sequence = cards.slice(i);
            if (!this.isValidTableauBuild(sequence)) {
                count--;
                break;
            }
        }

        return Math.max(1, count);
    }

    serialize() {
        return JSON.stringify({
            stock: this.stock.cards,
            waste: this.waste.cards,
            foundations: this.foundations.map(f => f.cards),
            tableau: this.tableau.map(t => t.cards),
            score: this.score,
            redealCount: this.redealCount,
            options: {
                dealThree: this.dealThree,
                maxRedeal: this.maxRedeal,
                kingsOnly: this.kingsOnly
            }
        }, null, 2);  // Pretty print z wcięciami
    }

    deserialize(json) {
        const data = JSON.parse(json);

        // Odtwórz karty (muszą być obiektami Card, nie plain objects)
        this.stock.cards = data.stock.map(c => Object.assign(new Card(c.suit, c.value), c));
        this.waste.cards = data.waste.map(c => Object.assign(new Card(c.suit, c.value), c));

        this.foundations.forEach((f, i) => {
            f.cards = data.foundations[i].map(c => Object.assign(new Card(c.suit, c.value), c));
        });

        this.tableau.forEach((t, i) => {
            t.cards = data.tableau[i].map(c => Object.assign(new Card(c.suit, c.value), c));
        });

        this.score = data.score;
        this.redealCount = data.redealCount;

        // Opcjonalnie odtwórz opcje
        if (data.options) {
            this.dealThree = data.options.dealThree;
            this.maxRedeal = data.options.maxRedeal;
            this.kingsOnly = data.options.kingsOnly;
        }
    }
}