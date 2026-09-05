# Anti-Cheat & Security System

Because this game relies heavily on hidden information, strict backend security is required to prevent DevTools inspecting, role spoofing, and API spam.

## Raised Concerns & Loophole Fixes

**Concern 1: "Ghost Spectator" Stream Sniping**
*   **The Exploit:** If Spectators can see the full colored board, they can easily open Discord and DM an Operative friend, telling them exactly which cards to pick (Stream Sniping).
*   **The Fix:** Spectators get the **exact same view as Operatives**. They cannot see any of the hidden colors. They are completely blind to the answers, meaning it is impossible for them to help a team cheat. They can still use hype emotes, but they guess alongside the players.

**Concern 2: Network Sniffing (The DevTools Hack)**
*   **The Exploit:** Operatives inspecting the raw WebSocket JSON payload to see hidden colors.
*   **The Fix (Dual-State Caching):** The Python server maintains two JSON states in memory for each room: `state_spymaster` (full colors) and `state_operative` (unrevealed colors are forced to `"HIDDEN"`). The server never sends the colors to Operatives in the first place.

**Concern 3: Role Spoofing (JWT & Connection Sets)**
*   **The Exploit:** Hackers sending fake WebSocket commands to switch their role to Spymaster mid-game.
*   **The Fix:** Clients authenticate using a signed JSON Web Token (JWT). The server locks roles when the game starts. WebSocket objects are stored in memory Sets (e.g., `spymaster_ws`, `operative_ws`). Validation is O(1).

**Concern 4: Brute Force Guesses (API Spam)**
*   **The Exploit:** Scripts spamming 1,000 `GUESS_CARD` actions per second to crash the VPS.
*   **The Fix:** An In-Memory Token Bucket. A lightweight Python `deque` (max size 5) is attached to every connection object. If 5 messages arrive in under 1.0 seconds, the server instantly drops the connection. No database required.

**Concern 5: The AFK Troll (Asyncio Timers)**
*   **The Exploit:** A public Spymaster refuses to type a clue, holding the lobby hostage forever.
*   **The Fix:** "Blitz Mode" timer. When a turn starts, spawn an `asyncio.sleep(60)` task. If the timer expires, the turn automatically passes. If the player submits a clue before 60 seconds, call `task.cancel()`. This utilizes zero CPU.

## Profanity & Chat Filters
*   **Tool:** Utilize `alt-profanity-check` (Python machine learning) to catch slurs, misspellings (e.g. `f*ck`), and toxicity across all languages. Applies to usernames, custom room names, and Spymaster clues.
