export class DomController {
    constructor(game, view) {
        this.game = game;
        this.view = view;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Click na stock - dobierz karty
        document.getElementById('stock').addEventListener('click', () => {
            this.handleStockClick();
        });

        // Click na karty i pile
        document.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.card');
            const pileEl = e.target.closest('.pile');

            if (cardEl && cardEl.dataset.pile !== 'stock') {
                this.handleCardClick(cardEl);
            } else if (pileEl && !cardEl) {
                this.handlePileClick(pileEl);
            }
        });

        // New game button
        document.getElementById('new-game').addEventListener('click', () => {
            this.handleNewGame();
        });
    }

    handleStockClick() {
        if (this.game.dealFromStock()) {
            this.view.clearSelection();
            this.view.render();
        }
    }

    handleCardClick(cardEl) {
        const pileType = cardEl.dataset.pile;
        const state = this.game.getState();

        let pile, cards;

        if (cardEl.classList.contains('face-down')) {
            return;
        }

        if (pileType === 'waste') {
            pile = state.waste;
            cards = [pile.top()];
        } else if (pileType === 'foundation') {
            const index = parseInt(cardEl.dataset.index);
            pile = state.foundations[index];
            cards = [pile.top()];
        } else if (pileType === 'tableau') {
            const pileIndex = parseInt(cardEl.dataset.pileIndex);
            const cardIndex = parseInt(cardEl.dataset.cardIndex);
            pile = state.tableau[pileIndex];

            // Pobierz wszystkie karty od klikniętej do góry
            cards = pile.cards.slice(cardIndex);

            console.log('=== DEBUG ===');
            console.log('Clicked card index:', cardIndex);
            console.log('Total cards in pile:', pile.cards.length);
            console.log('Cards to select:', cards.length);
            console.log('Cards:', cards.map(c => c.toString()));

            // Sprawdź czy to poprawna sekwencja
            if (!this.game.isValidTableauBuild(cards.slice())) {
                this.view.showMessage('Invalid card sequence', 'error');
                return;
            }

            // Odwróć dla zgodności z modelem (jak w console-controller)
            cards = cards.reverse();
        }

        // Jeśli już coś zaznaczone - próbuj przenieść
        if (this.view.selectedCards) {
            // Sprawdź czy kliknięto tę samą kartę/pile - anuluj
            if (this.view.selectedPile === pile) {
                this.view.clearSelection();
                return;  // Anuluj bez komunikatu
            }
            const targetPile = this.findPileFromElement(cardEl);
            if (targetPile) {
                this.tryMove(targetPile);
            }
        } else {
            // Zaznacz karty
            this.view.selectCards(cards, pile);
        }
    }

    handlePileClick(pileEl) {
        if (!this.view.selectedCards) return;

        const targetPile = this.findPileFromElement(pileEl);
        if (targetPile) {
            this.tryMove(targetPile);
        }
    }

    findPileFromElement(el) {
        const pileType = el.dataset.pile;
        const state = this.game.getState();

        if (pileType === 'foundation') {
            const index = parseInt(el.dataset.index);
            return state.foundations[index];
        } else if (pileType === 'tableau') {
            const index = parseInt(el.dataset.index || el.dataset.pileIndex);
            return state.tableau[index];
        } else if (pileType === 'waste') {
            return state.waste;
        }

        return null;
    }

    tryMove(targetPile) {
        const cards = this.view.selectedCards;
        const fromPile = this.view.selectedPile;

        if (this.game.move(cards, fromPile, targetPile)) {
            this.view.clearSelection();
            this.view.render();

            // Sprawdź wygraną
            if (this.game.isWon()) {
                this.view.showWin();
            }
        } else {
            this.view.showMessage('Invalid move', 'error');
            this.view.clearSelection();
        }
    }

    handleNewGame() {
        if (confirm('Start a new game?')) {
            this.game.setup();
            this.view.clearSelection();
            this.view.render();
        }
    }
}