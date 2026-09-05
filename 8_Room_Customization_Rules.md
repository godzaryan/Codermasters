# Room Customization & Rules Options

When a player clicks "Create Private Room", they act as the Host. The Host is presented with a configuration menu to customize the game rules before the lobby starts. Here are the optimized, highly practical settings we will offer:

## 1. Word Pack Selection (The Dictionary)
*   **Standard (Default):** The classic 400+ family-friendly Codenames word list.
*   **Mature / Undercover:** A slightly edgier, adult-oriented word list (Requires Host confirmation).
*   **Custom (User Generated):** A text box where the host can paste a comma-separated list of words (e.g., inside jokes, clan names). The Python backend will randomly pull 25 words from this custom array instead of the database. *(Note: Must be >= 25 words).*

## 2. Turn Timers (Blitz Mode)
To prevent the "AFK Troll" and keep games fast-paced.
*   **Relaxed (No Timer):** Default for private rooms.
*   **Standard (60s):** The Spymaster has 60 seconds to give a clue, and Operatives have 60 seconds to guess. If the timer expires, the turn automatically passes.
*   **Lightning (30s):** For chaotic, high-energy voice chats.

## 3. The "Zero / Unlimited" Clue Rule
In the official rules, a Spymaster can give "0" or "Unlimited" as the number to remove the "Plus One" guess limit for the Operatives.
*   **Enabled (Default):** Allows advanced Spymasters to let their team clean up missed words from previous turns.
*   **Disabled (Strict Mode):** Forces Spymasters to only give exact numerical values (1-9). Good for beginners who get confused by unlimited guessing.

## 4. Board Size
*   **Classic 5x5 (Default):** 25 words, 1 Assassin. Best for 4-8 players.
*   **Large 6x6 (Massive Mode):** 36 words, 2 Assassins. Best for large lobbies (10+ players) where Operatives need more targets to debate over.

## 5. The Assassin Penalty
*   **Sudden Death (Default):** Clicking the Assassin (Black Card) instantly ends the game. The team who clicked it loses immediately.
*   **Forgiving (Beginner Mode):** Clicking the Assassin does *not* end the game. Instead, it instantly ends the team's turn and gives the *enemy* team +1 point. Highly recommended for rooms with children or players who have never played before.
