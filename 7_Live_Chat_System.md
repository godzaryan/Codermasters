# Live Chat & Quick Chat System

To keep players engaged without Voice Chat, a robust text-based communication system is required. However, it must be highly optimized to avoid choking the 1GB RAM VPS.

## 1. The Unified WebSocket Connection
*   **The Optimization:** Do **NOT** open a separate WebSocket connection for chat. Every open connection consumes RAM.
*   **The Implementation:** Multiplex the chat over the existing game WebSocket. Chat messages are simply a different "action" type in the JSON payload:
    ```json
    { "action": "CHAT", "sender": "Player1", "text": "Are you sure about this?" }
    ```

## 2. Quick Chat (Rocket League Style)
Typing on mobile during a timed game is frustrating. Quick Chat solves this and is incredibly efficient.
*   **The UI:** Right above the chat text input, display a scrolling row of preset buttons (e.g., "Good Clue!", "Watch out!", "I have no idea", "Let's pass").
*   **The Ultimate Optimization:** Do not send the text over the network. Send a tiny integer ID.
    ```json
    { "action": "QUICK_CHAT", "id": 4 }
    ```
    The React frontend instantly maps `4` to `"Watch out!"`. 
*   **Massive Benefit:** Quick chat requires **zero profanity filtering** because the text is hardcoded on the frontend. It saves CPU cycles on the backend and requires less than 20 bytes of bandwidth per message.

## 3. Custom Live Chat & Anti-Spam
When users decide to type custom messages, strict guardrails must be applied.
*   **Profanity Filter:** Every custom string must pass through the `cleantext` + `alt-profanity-check` pipeline before the server broadcasts it.
*   **Rate Limiting:** Chat spam is the easiest way to DDoS a small server. We utilize the same In-Memory Token Bucket from the game logic:
    *   Limit: 5 chat messages per 3 seconds.
    *   Penalty: Temporary 10-second mute for the first offense, connection drop for the second.
*   **Message Cap:** To prevent memory bloat on the React frontend, the chat UI must only keep the most recent 50 messages in its state. As new messages arrive, the oldest ones are popped off the array (`chatHistory.slice(-50)`).

## 4. Chat UI Layout
*   **Desktop:** A permanent 300px wide sidebar on the right side of the screen.
*   **Mobile:** Hidden behind a "Chat (3)" floating action button. Tapping it slides a frosted-glass bottom sheet up over the bottom half of the board, allowing players to read/type while still seeing the top half of the game board.
