# Modular Backend Architecture & Error Handling

To ensure the Python backend is easily maintainable, scalable, and impossible to crash, the codebase must be split into strictly isolated modules. This prevents a "spaghetti code" monolithic file and makes debugging trivial.

## 1. Modular Directory Structure

When coding begins, the Python project must follow this exact folder structure:

```text
/backend
│
├── main.py                     # Entry point. ONLY handles FastAPI initialization and WebSocket routing.
│
├── /core
│   ├── state_manager.py        # Holds the `rooms = {}` dictionary. Exposes functions to safely update state.
│   ├── connection_manager.py   # Handles broadcasting, rate-limiting (Token Bucket), and dropping connections.
│   └── background_tasks.py     # The asyncio TTL Garbage collector and 60-second Blitz timers.
│
├── /game_engine
│   ├── board_generator.py      # Only handles Fisher-Yates shuffling and word pack injection.
│   └── rules_validator.py      # Validates if a guess is legal (Is it their turn? Do they have guesses left?).
│
├── /models
│   ├── request_schemas.py      # Pydantic models for incoming WebSocket JSON (Validation).
│   └── response_schemas.py     # Pydantic models for outgoing state (Dual-Caching definitions).
│
└── /security
    ├── profanity_filter.py     # The `cleantext` + `alt-profanity-check` pipeline.
    └── auth.py                 # JWT validation for WebSocket handshakes.
```

**Why this is debuggable:** 
If the game board generates with 2 Assassins instead of 1, you instantly know the bug is isolated entirely inside `game_engine/board_generator.py` and you don't have to scroll through 2,000 lines of WebSocket routing to fix it.

---

## 2. Robust Error Handling Strategy

Because WebSockets are persistent, unhandled exceptions will crash the entire single-thread `uvloop` process. Every module must handle errors gracefully.

### A. The "Disconnect" Catch (Client Drop)
Players *will* close their tabs, lose Wi-Fi, or crash.
*   **The Implementation:** The core WebSocket endpoint in `main.py` must be wrapped in a specific try-catch block:
    ```python
    try:
        while True:
            data = await websocket.receive_text()
            # Process data...
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
        # Broadcast "Player X Left" to the room so the UI updates, instead of throwing a traceback error.
    ```

### B. Payload Validation (Pydantic Exceptions)
If a hacker or a buggy frontend sends malformed JSON (e.g., missing the "room_code" field).
*   **The Implementation:** We use Pydantic models for everything. If `request_schemas.parse_raw(data)` fails, it throws a `ValidationError`. 
*   We catch this instantly, ignore the bad data to save CPU, and send back a structured error to the client:
    `{"type": "error", "message": "Invalid payload format."}`

### C. Game State Desync Errors
Due to network latency, an Operative might click a card a millisecond after the timer expires and the turn passes.
*   **The Implementation:** The `rules_validator.py` checks state *first*. If it detects an out-of-turn action, it does **not** raise a Python Exception (which kills the server). It simply returns a `False` flag, and the server sends a soft error to that specific client:
    `{"type": "warning", "message": "It is no longer your turn."}`
    The frontend React app listens for "warning" types and simply ignores the click.

### D. Silent Logging (The Watchdog)
To debug issues in production without slowing down the 1GB RAM server:
*   We use Python's native `logging` module configured to write to a rotating `.log` file asynchronously. 
*   If a critical error *does* happen (e.g., the Profanity API fails), the backend logs the traceback to the file but continues running the game lobby unaffected.
