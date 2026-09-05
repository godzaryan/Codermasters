# Game Logic and Rules (UI-Aligned)

## 1. Core Mechanics
- **Grid:** 5x5 (25 cards).
- **Cards:** 9 Red, 8 Blue (or vice-versa depending on who goes first), 1 Assassin, 7 Neutral.
- **Roles:** Spymaster (gives clues) and Operative (guesses words).
- **Clue Format:** One Word + One Number (e.g., "OCEAN", "2").

## 2. Updated Rules (Based on UI Features)
Based on the finalized UI components, the following modern digital rules apply:

### The "Forgiving Assassin" Rule (Optional Setting)
- **Classic:** If an Operative clicks the Assassin (Black card), their team instantly loses the game.
- **Forgiving (UI Toggle):** If enabled via the `SettingsModal`, clicking the Assassin does not end the game. Instead, the team loses **3 points/cards** (effectively giving the enemy team 3 free guesses) and their turn immediately ends.

### The Blitz Timer (Optional Setting)
- **Rule:** If enabled, each turn is strictly limited to 60 seconds.
- **Enforcement:** The backend will forcefully trigger an "End Turn" event if the timer reaches 0, switching control to the opposing team.

### Quick Chat & Communication Rules
- **Anti-Cheat:** Operatives and Spymasters cannot type custom messages during active turns to prevent cheating (e.g., a Spymaster typing "no don't click that").
- **Quick Chat:** Players can ONLY communicate using the predefined, horizontally scrolling Quick Chat pills (e.g., "Good Game", "Watch out!") provided in the `ChatPanel`. The backend will drop any custom text payloads during active gameplay if they violate this.

## 3. The Turn Phase Logic
1. **Clue Phase:** Spymaster submits a Clue Word and Number via the `ActionBar`. 
   - *Rule:* The word cannot be a word currently visible on the board. (Validated by backend).
2. **Guess Phase:** Operatives click cards on the `GameBoard`.
   - *Success:* If they click their own team's color, they may guess again (up to the Clue Number + 1).
   - *Failure (Neutral):* Turn immediately ends.
   - *Failure (Enemy):* Enemy team gets the point, turn immediately ends.
   - *Failure (Assassin):* Game Over (or -3 points if Forgiving Mode is on).

## 4. End Game & Recap
- The game ends when one team finds all their agents, or the Assassin is clicked.
- **Post-Game Recap:** The backend will compile a history of all clues given and all cards clicked during that clue's active window. This data is fed to the `PostGameRecap` UI modal to show teams exactly where misunderstandings occurred.
