# Klondike Solitaire - Console Version

Tekstowa wersja pasjansa Klondike zaimplementowana w JavaScript na podstawie kodu z Aisleriot (klondike.scm).

## Uruchomienie w VS Code (Debian 12)

### 1. Zainstaluj Live Server extension:
- Otwórz VS Code
- Przejdź do Extensions (Ctrl+Shift+X)
- Wyszukaj "Live Server" (autor: Ritwick Dey)
- Zainstaluj

### 2. Uruchom projekt:
- Otwórz folder projektu w VS Code
- Kliknij prawym na `index.html`
- Wybierz "Open with Live Server"
- Lub użyj skrótu: Alt+L Alt+O

### 3. Gra otworzy się w przeglądarce!

## Komendy

- `d` - Dobierz kartę ze stocku
- `m W T0` - Przenieś z Waste na Tableau 0
- `m T0 F0` - Przenieś z Tableau 0 na Foundation 0
- `m T0 T1` - Przenieś z Tableau 0 na Tableau 1
- `m T0 T1 3` - Przenieś 3 karty z Tableau 0 na Tableau 1
- `h` - Podpowiedź
- `help` - Pokaż pomoc
- `new` - Nowa gra

## Struktura

- `js/card.js` - Klasa karty
- `js/pile.js` - Klasa stosu kart
- `js/game-base.js` - Bazowa klasa gry
- `js/klondike.js` - Logika Klondike (z klondike.scm)
- `js/console-view.js` - Widok tekstowy
- `js/console-controller.js` - Obsługa komend
- `js/main.js` - Główna aplikacja

## Debugowanie

Otwórz DevTools (F12) w przeglądarce:
- Console - logi i błędy
- Sources - debugowanie kodu
- Możesz ustawić breakpointy w plikach JS