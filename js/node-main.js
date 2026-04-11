import readline from 'readline';
import { KlondikeGame } from './klondike.js';
import { ConsoleController } from './console-controller.js';
import { writeFileSync, readFileSync, existsSync } from 'fs';

class NodeConsoleView {
    constructor(game) {
        this.game = game;
    }
    
    render() {
        const state = this.game.getState();
        console.clear();
        
        console.log('=== KLONDIKE SOLITAIRE ===\n');
        
        // Stock i Waste
        console.log(this.renderStockAndWaste(state));
        console.log('');
        
        // Foundations
        console.log(this.renderFoundations(state));
        console.log('');
        
        // Tableau
        console.log(this.renderTableau(state));
        console.log('');
        
        // Status
        console.log(`Score: ${state.score}`);
        console.log(`Stock: ${state.stock.cards.length} cards`);
        console.log(`Redeals: ${state.redealCount}/${state.maxRedeal === -1 ? '∞' : state.maxRedeal}`);
        console.log(`Can deal: ${state.canDeal ? 'Yes' : 'No'}`);
        console.log('');
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
            return `F${i}: [${this.cardToString(f.top())}]`;
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
        const values = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
        
        const valueStr = values[card.value];
        const suitStr = suits[card.suit];
        
        return `${valueStr}${suitStr}`.padEnd(3);
    }
    
    showHelp() {
        console.log('\n=== COMMANDS ===\n');
        console.log('  d              - Deal from stock');
        console.log('  m W T0         - Move from Waste to Tableau 0');
        console.log('  m T0 F0        - Move from Tableau 0 to Foundation 0');
        console.log('  m T0 T1        - Move from Tableau 0 to Tableau 1');
        console.log('  m T0 T1 3      - Move 3 cards from Tableau 0 to Tableau 1');
        console.log('  h              - Get hint');
        console.log('  help           - Show this help');
        console.log('  new            - New game');
        console.log('  quit           - Exit game\n');
    }
    
    showMessage(message, type = 'info') {
        const prefix = type === 'error' ? '✗' : type === 'success' ? '✓' : '💡';
        console.log(`${prefix} ${message}`);
    }
    
    appendOutput(text) {
        console.log(text);
    }
}

function main() {
    let game = new KlondikeGame({
        dealThree: false,
        maxRedeal: 2,
        kingsOnly: true
    });
    
    game.setup();
    
    const view = new NodeConsoleView(game);
    const controller = new ConsoleController(game, view);

    global.DEBUG = {
        save: () => {
            const state = game.serialize();
            writeFileSync('debug-state-sav.json', state);
            console.log('✓ State saved to debug-state-sav.json');
        },
        load: () => {
            if (!existsSync('debug-state-sav.json')) {
                console.log('✗ File debug-state-sav.json not found');
                return;
            }
            const state = readFileSync('debug-state-sav.json', 'utf8');
            game.deserialize(state);
            view.render();
            console.log('✓ State loaded from debug-state-sav.json');
        },
        game, view, controller
    };
    global.save = () => DEBUG.save();
    global.load = () => DEBUG.load();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });
    
    view.render();
    view.showHelp();
    rl.prompt();
    
    rl.on('line', (input) => {
        const command = input.trim();
        
        if (!command) {
            rl.prompt();
            return;
        }
        
        if (command.toLowerCase() === 'quit' || command.toLowerCase() === 'q') {
            console.log('\nThanks for playing!');
            rl.close();
            return;
        }
        
        const result = controller.parseCommand(command);
        
        if (result === 'new') {
            game = new KlondikeGame({
                dealThree: false,
                maxRedeal: 2,
                kingsOnly: true
            });
            game.setup();
            controller.game = game;
            view.game = game;
        }
        
        view.render();
        rl.prompt();
    });
    
    rl.on('close', () => {
        console.log('\nGoodbye!');
        process.exit(0);
    });
}

main();