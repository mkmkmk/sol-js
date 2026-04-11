export class ConsoleView {
    constructor(game, outputElement) {
        this.game = game;
        this.output = outputElement;
    }

    render() {
        const state = this.game.getState();
        let output = '';

        output += '=== KLONDIKE SOLITAIRE ===\n\n';

        // Stock i Waste
        output += this.renderStockAndWaste(state);
        output += '\n\n';

        // Foundations
        output += this.renderFoundations(state);
        output += '\n\n';

        // Tableau
        output += this.renderTableau(state);
        output += '\n\n';

        // Status
        output += `Score: ${state.score}\n`;
        output += `Stock: ${state.stock.cards.length} cards\n`;
        output += `Redeals: ${state.redealCount}/${state.maxRedeal === -1 ? '∞' : state.maxRedeal}\n`;
        output += `Can deal: ${state.canDeal ? 'Yes' : 'No'}\n`;

        this.output.textContent = output;
    }

    renderStockAndWaste(state) {
        const stockStr = state.stock.isEmpty()
            ? '[  ]'.padEnd(6)
            : `[${state.stock.cards.length.toString().padStart(2)}]`.padEnd(6);

        const wasteCards = state.waste.cards.slice(-3);
        const wasteStr = wasteCards.length === 0
            ? '[  ]'.padEnd(6)
            : wasteCards.map(c => `[${this.cardToString(c)}]`).join(' ');

        return `Stock: ${stockStr}  Waste: ${wasteStr}`;
    }

    renderFoundations(state) {
        let output = 'Foundations:\n';
        const foundationStrs = state.foundations.map((f, i) => {
            if (f.isEmpty()) {
                return `F${i}: [   ]`;
            }
            return `F${i}: [${this.cardToString(f.top)}]`;
        });
        output += '  ' + foundationStrs.join('   ');
        return output;
    }

    renderTableau(state) {
        let output = 'Tableau:\n';

        const maxHeight = Math.max(...state.tableau.map(t => t.cards.length), 1);

        for (let row = 0; row < maxHeight; row++) {
            const rowStrs = state.tableau.map((pile, col) => {
                if (row >= pile.cards.length) {
                    return '     ';
                }
                const card = pile.cards[row];
                if (!card.visible) {
                    return '[???]';
                }
                return `[${this.cardToString(card)}]`;
            });

            output += `  ${rowStrs.join(' ')}\n`;
        }

        const colNumbers = state.tableau.map((_, i) => ` T${i}  `).join(' ');
        output += `  ${colNumbers}`;

        return output;
    }

    cardToString(card) {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        const valueStr = values[card.value];
        const suitStr = suits[card.suit];
        
        return `${valueStr}${suitStr}`.padEnd(3);
    }

    showHelp() {
        let output = '\n=== COMMANDS ===\n\n';
        output += '  d              - Deal from stock\n';
        output += '  m W T0         - Move from Waste to Tableau 0\n';
        output += '  m T0 F0        - Move from Tableau 0 to Foundation 0\n';
        output += '  m T0 T1        - Move from Tableau 0 to Tableau 1\n';
        output += '  m T0 T1 3      - Move 3 cards from Tableau 0 to Tableau 1\n';
        output += '  h              - Get hint\n';
        output += '  help           - Show this help\n';
        output += '  new            - New game\n\n';

        this.appendOutput(output);
    }

    appendOutput(text) {
        this.output.textContent += text;
    }

    showMessage(message, type = 'info') {
        const prefix = type === 'error' ? '✗' : type === 'success' ? '✓' : '💡';
        this.appendOutput(`${prefix} ${message}\n`);
    }
}