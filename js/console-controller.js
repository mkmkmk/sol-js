export class ConsoleController {
    constructor(game, view) {
        this.game = game;
        this.view = view;
    }

    parseCommand(input) {
        const parts = input.trim().toLowerCase().split(/\s+/);
        const cmd = parts[0];

        switch (cmd) {
            case 'd':
            case 'deal':
                return this.handleDeal();

            case 'm':
            case 'move':
                return this.handleMove(parts);

            case 'h':
            case 'hint':
                this.handleHint();
                return 'skip-render';

            case 'help':
                this.view.showHelp();
                return 'skip-render';

            case 'new':
                return 'new';

            default:
                this.view.showMessage('Unknown command. Type "help" for commands.', 'error');
                return 'skip-render';
        }
    }

    handleDeal() {
        if (this.game.dealFromStock()) {
            this.view.showMessage('Dealt cards from stock', 'success');
            return 'continue';
        } else {
            this.view.showMessage('Cannot deal (no cards and no redeals left)', 'error');
            return 'continue';
        }
    }

    handleMove(parts) {
        // Format: m <from> <to> [count]
        if (parts.length < 3) {
            this.view.showMessage('Usage: m <from> <to> [count]', 'error');
            return 'continue';
        }

        
        const fromPile = this.parsePile(parts[1]);
        const toPile = this.parsePile(parts[2]);

        if (!fromPile || !toPile) {
            this.view.showMessage('Invalid pile. Use: W (waste), T0-T6 (tableau), F0-F3 (foundation)', 'error');
            return 'continue';
        }``
        const count = parts[3] ? parseInt(parts[3]) : this.game.getDefaultMoveCount(fromPile, toPile);

        if (!fromPile || !toPile) {
            this.view.showMessage('Invalid pile. Use: W (waste), T0-T6 (tableau), F0-F3 (foundation)', 'error');
            return 'continue';
        }

        // Pobieramy karty do przeniesienia
        const cards = this.getCardsToMove(fromPile, count);
        if (!cards) {
            this.view.showMessage('Cannot get cards from source pile', 'error');
            return 'continue';
        }

        // Próbujemy wykonać ruch
        if (this.game.move(cards, fromPile, toPile)) {
            this.view.showMessage('Move successful', 'success');

            // Sprawdzamy wygraną
            if (this.game.isWon()) {
                this.view.appendOutput('\n🎉 CONGRATULATIONS! YOU WON! 🎉\n\n');
            }
        } else {
            this.view.showMessage('Invalid move', 'error');
        }

        return 'continue';
    }

    parsePile(str) {
        const state = this.game.getState();
        
        if (str === 'w') return state.waste;
        if (str === 's') return state.stock;
        
        if (str.startsWith('t')) {
            const index = parseInt(str.substring(1));
            if (index >= 0 && index < 7) {
                return state.tableau[index];
            }
        }
        
        if (str.startsWith('f')) {
            const index = parseInt(str.substring(1));
            if (index >= 0 && index < 4) {
                return state.foundations[index];
            }
        }
        
        return null;
    }
    
    getCardsToMove(fromPile, count) {
        if (fromPile.isEmpty()) return null;
        
        // Dla waste - zawsze tylko górna karta
        if (fromPile.type === 'waste') {
            return [fromPile.top()];
        }
        
        // Dla tableau - pobieramy count widocznych kart od góry
        if (fromPile.type === 'tableau') {
            const cards = [];
            for (let i = fromPile.cards.length - count; i < fromPile.cards.length; i++) {
                if (i < 0 || !fromPile.cards[i].visible) return null;
                cards.push(fromPile.cards[i]);
            }

            
            // Sprawdzamy czy to poprawna sekwencja (is-tableau-build?)
            if (!this.game.isValidTableauBuild(cards)) return null;
            return cards.reverse();
        }
        
        // Dla foundation - tylko górna karta
        if (fromPile.type === 'foundation') {
            return [fromPile.top()];
        }

        return null;
    }

    handleHint() {
        const hint = this.game.getHint();
        if (hint) {
            this.view.showMessage(`Hint: ${hint}`, 'info');
        } else {
            this.view.showMessage('No hints available', 'info');
        }
        return 'continue';
    }
}