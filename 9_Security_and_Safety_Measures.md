# Application Security & Safety Measures

While previous documents covered "Anti-Cheat" (gameplay exploits), this document covers pure **Application Security (AppSec)**. Since the backend is running on a constrained 1GB RAM server, preventing malicious attacks, DDoS, and memory leaks is critical for uptime.

## 1. Client-Side Security (React/Next.js)

### XSS (Cross-Site Scripting) Injection
*   **The Exploit:** A hacker joins a lobby and sets their username (or Custom Word Pack) to `<script>alert("hacked")</script>`. When other players' browsers render that username, the script executes, stealing local storage tokens or redirecting them to a malicious site.
*   **The Fix:** 
    1.  React natively escapes strings rendered in JSX (`{player.name}` is safe). We must ensure no developer ever uses `dangerouslySetInnerHTML` in the codebase.
    2.  **Backend Sanitization:** The Python server runs all string inputs through `bleach` or `cleantext` to permanently strip HTML tags before they are ever saved to the room state.

## 2. Server-Side Network Security (FastAPI)

### CSWSH (Cross-Site WebSocket Hijacking)
*   **The Exploit:** A malicious website (e.g., `freeprizes.com`) tricks a user into visiting it. That website opens a hidden WebSocket connection to our Python server using the user's browser credentials, silently taking actions on their behalf.
*   **The Fix:** **Strict CORS & Origin Checking**.
    *   In the FastAPI WebSocket router, we explicitly define `allowed_origins=["https://our-codenames-app.vercel.app"]`.
    *   If a WebSocket connection attempt comes from any other domain, the server instantly rejects the handshake.

### The "Fat Payload" Exploit (OOM Crash)
*   **The Exploit:** A hacker bypasses the frontend UI and uses a Python script to connect to our WebSocket. They send a single chat message that contains 50 Megabytes of random text. When the server attempts to parse `json.loads(payload)`, it consumes all 1GB of RAM and the VPS crashes.
*   **The Fix:** **Hard Byte Caps.**
    *   Configure Uvicorn/FastAPI to reject any incoming WebSocket frame larger than `4096 bytes` (4KB). 
    *   The connection is instantly dropped before Python even attempts to parse the JSON.

## 3. Server Memory Security (Resource Exhaustion)

### "Zombie Room" Flooding
*   **The Exploit:** Because we store game state in a Python Dictionary (`rooms = {}`) instead of a database, an attacker could write a script that sends 10,000 `CREATE_ROOM` requests per minute. Each room takes up a tiny bit of RAM. Eventually, the 1GB RAM fills up and the server dies.
*   **The Fix:** **The TTL Garbage Collector.**
    *   We run a background `asyncio` loop that acts as a Garbage Collector. Every 5 minutes, it loops through the `rooms` dictionary. 
    *   If a room has `len(connected_players) == 0` for more than 10 minutes, the room is completely deleted (`del rooms[room_id]`), freeing the RAM.

### "Infinite Connection" Bleeding
*   **The Exploit:** A bot opens a WebSocket connection to the lobby but never sends any actions. They open 5,000 of these "silent" connections to exhaust the maximum file descriptors on the Linux VPS, preventing real players from joining.
*   **The Fix:** **Idle Timeouts (Heartbeats).**
    *   The server expects a `PING` message from the React frontend every 30 seconds.
    *   If a WebSocket connection does not send a `PING` for 60 seconds, the Python server assumes they are a dead connection or a silent bot and forces a disconnect.
