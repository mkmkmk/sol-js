import { KlondikeGame } from './klondike.js';
import { ConsoleView } from './console-view.js';
import { ConsoleController } from './console-controller.js';
import { Card } from './game-base.js';

let game, view, controller;

function initGame() {
    game = new KlondikeGame({
        dealThree: false,
        maxRedeal: 2,
        kingsOnly: true
    });
    
    game.setup();
    
    const outputElement = document.getElementById('game-output');
    view = new ConsoleView(game, outputElement);
    controller = new ConsoleController(game, view);
    
    view.render();
    view.showHelp();
}

function handleCommand() {
    const input = document.getElementById('command-input');
    const command = input.value.trim();
    
    if (!command) return;
    
    view.appendOutput(`\n> ${command}\n`);
    
    const result = controller.parseCommand(command);
    
    if (result === 'new') {
        initGame();
    } else {
        view.render();
    }
    
    input.value = '';
    input.focus();
    
    // Auto-scroll do dołu
    const output = document.getElementById('game-output');
    output.scrollTop = output.scrollHeight;
}


window.testMove = function () {
    game.tableau[1].cards = [new Card(3, 7)]; // 7♣
    game.tableau[1].cards[0].visible = true;
    
    game.tableau[3].cards = [new Card(1, 6), new Card(0, 5)]; // 6♥, 5♠
    game.tableau[3].cards.forEach(c => c.visible = true);
    
    view.render();
    return 'Test ready - try: m T3 T1 2';
};


// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    const input = document.getElementById('command-input');
    const button = document.getElementById('submit-btn');
    
    button.addEventListener('click', handleCommand);
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCommand();
        }
    });
});