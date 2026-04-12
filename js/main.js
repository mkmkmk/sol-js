import { KlondikeGame } from './klondike.js';
import { DomView } from './dom-view.js';
import { DomController } from './dom-controller.js';

let game, view, controller;

function init() {
    game = new KlondikeGame({
        dealThree: false,
        maxRedeal: 5,
        kingsOnly: true
    });

    game.setup();

    view = new DomView(game);
    controller = new DomController(game, view);

    view.render();

    // Debug - expose na window
    window.DEBUG = {
        save: () => {
            const json = game.serialize().replace(/\n/g, '').replace(/\s+/g, ' ');
            console.log(json);
        },
        load: (json) => {
            game.deserialize(json);
            view.render();
        },
        game, view, controller
    };
}

document.addEventListener('DOMContentLoaded', init);