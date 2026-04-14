export class DomView {
    constructor(game) {
        this.game = game;
        this.selectedCards = null;
        this.selectedPile = null;
    }

    render() {
        const state = this.game.getState();

        // Renderuj stock
        this.renderStock(state.stock);

        // Renderuj waste
        this.renderWaste(state.waste);

        // Renderuj foundations
        state.foundations.forEach((foundation, i) => {
            this.renderFoundation(foundation, i);
        });

        // Renderuj tableau
        state.tableau.forEach((pile, i) => {
            this.renderTableau(pile, i);
        });

        // Aktualizuj status
        document.getElementById('moves').textContent = `Redeals: ${state.redealCount}/${state.maxRedeal === -1 ? '∞' : state.maxRedeal}`;

    }

    renderStock(stock) {
        const stockEl = document.getElementById('stock');
        stockEl.innerHTML = '';

        if (stock.cards.length > 0) {
            const card = this.createCardElement(stock.cards[0], false);
            card.dataset.pile = 'stock';
            stockEl.appendChild(card);
        }
    }

    renderWaste(waste) {
        const wasteEl = document.getElementById('waste');
        wasteEl.innerHTML = '';

        if (waste.cards.length > 0) {
            // Pokaż tylko górną kartę
            const topCard = waste.cards[waste.cards.length - 1];
            const card = this.createCardElement(topCard, true);
            card.dataset.pile = 'waste';
            card.dataset.index = waste.cards.length - 1;
            wasteEl.appendChild(card);
        }
    }

    renderFoundation(foundation, index) {
        const foundationEl = document.getElementById(`foundation-${index}`);
        foundationEl.innerHTML = '';
        foundationEl.dataset.pile = 'foundation';
        foundationEl.dataset.index = index;

        if (foundation.cards.length > 0) {
            const topCard = foundation.cards[foundation.cards.length - 1];
            const card = this.createCardElement(topCard, true);
            card.dataset.pile = 'foundation';
            card.dataset.index = index;
            foundationEl.appendChild(card);
        }
    }

    renderTableau(pile, pileIndex) {
        const tableauEl = document.getElementById(`tableau-${pileIndex}`);
        tableauEl.innerHTML = '';
        tableauEl.dataset.pile = 'tableau';
        tableauEl.dataset.index = pileIndex;

        pile.cards.forEach((card, cardIndex) => {
            const cardEl = this.createCardElement(card, card.visible);
            cardEl.style.position = 'absolute';
            // cardEl.style.top = `${cardIndex * 25}px`;
            // const offset = window.innerWidth < 768 ? 15 : 25;
            const offset = 25;
            cardEl.style.top = `${cardIndex * offset}px`;
            cardEl.dataset.pile = 'tableau';
            cardEl.dataset.pileIndex = pileIndex;
            cardEl.dataset.cardIndex = cardIndex;
            tableauEl.appendChild(cardEl);
        });
    }

    createCardElement(card, visible) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';

        if (!visible) {
            cardEl.classList.add('face-down');
            return cardEl;
        }

        cardEl.classList.add(card.isRed() ? 'red' : 'black');

        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        const symbol = values[card.value] + suits[card.suit];

        // 4 rogi
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(corner => {
            const cornerEl = document.createElement('div');
            cornerEl.className = `card-corner ${corner}`;
            cornerEl.textContent = symbol;
            cardEl.appendChild(cornerEl);
        });

        return cardEl;
    }

    selectCards(cards, pile) {
        this.clearSelection();

        this.selectedCards = cards;
        this.selectedPile = pile;

        if (pile.type === 'tableau') {
            const tableauIndex = this.game.getState().tableau.indexOf(pile);
            const startIndex = pile.cards.length - cards.length;

            // Zaznacz karty
            document.querySelectorAll(`#tableau-${tableauIndex} .card`).forEach((cardEl, idx) => {
                if (idx >= startIndex) {
                    cardEl.classList.add('selected');
                }
            });

            // Dodaj ramkę wokół grupy
            const pileEl = document.getElementById(`tableau-${tableauIndex}`);
            pileEl.classList.add('has-selection');
            pileEl.style.setProperty('--selection-start', startIndex);
            pileEl.style.setProperty('--selection-count', cards.length);
        } else {
            // Waste/foundation - tylko podświetl kartę z tego konkretnego pile
            const pileIndex = pile.type === 'foundation' ?
                this.game.getState().foundations.indexOf(pile) : null;

            document.querySelectorAll('.card').forEach(cardEl => {
                if (pile.type === 'foundation') {
                    const cardPileIndex = parseInt(cardEl.dataset.index);
                    if (cardEl.dataset.pile === 'foundation' && cardPileIndex === pileIndex) {
                        cardEl.classList.add('selected');
                    }
                } else if (cardEl.dataset.pile === pile.type) {
                    cardEl.classList.add('selected');
                }
            });
        }
    }

    clearSelection() {
        this.selectedCards = null;
        this.selectedPile = null;
        document.querySelectorAll('.card.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }

    showMessage(message, type = 'info') {
        // Prosty alert na razie
        if (type === 'error') {
            console.error(message);
        } else {
            console.log(message);
        }
    }

    showWin() {
        setTimeout(() => {
            alert('🎉 Congratulations! You won! 🎉');
        }, 300);
    }
}