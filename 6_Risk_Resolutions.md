# Risk Resolutions & Ultimate Optimizations

Based on final architectural reviews, several assumptions were corrected to ensure flawless performance on a 1GB RAM Amazon VPS and maximum device compatibility.

## 1. 1GB RAM Server Optimization
*   **The Flaw:** Running multiple Gunicorn workers and a Redis database cluster will crash a 1GB RAM server via Out of Memory (OOM) errors.
*   **The Fix:** **The Monolithic Async Event Loop**.
    *   We completely strip Redis and Gunicorn from the architecture. 
    *   We rely entirely on a single Python process running **FastAPI + Uvicorn + uvloop**.
    *   Because `uvloop` handles networking asynchronously via C-bindings, a single thread can manage thousands of WebSockets simultaneously while utilizing less than 150MB of RAM. The state remains purely in a native Python dictionary.

## 2. WebGL Browser Crashing (The 3D Fix)
*   **The Flaw:** Initializing a heavy WebGL Canvas (React Three Fiber) can instantly crash the browser on 5-year-old mobile devices before the graceful degradation code even runs.
*   **The Fix:** **CSS 3D Transforms**.
    *   We abandon React Three Fiber (WebGL). 
    *   Instead, we use native CSS 3D properties (`transform: rotateX() translateZ() preserve-3d`).
    *   CSS 3D is natively hardware-accelerated by the browser, meaning it achieves the exact same 3D isometric tilt and 3D card flips as WebGL, but requires zero initialization time, zero external libraries, and has a 0% chance of crashing older mobile browsers.

## 3. Foolproof Automated Profanity Filtering
*   **The Flaw:** Trolls use "Zalgo" text, unicode manipulation (e.g., `ƒúçk`), and invisible spacing to bypass standard machine learning filters without human intervention.
*   **The Fix:** **Normalization Pipeline**.
    *   Before passing a username or clue to the machine learning filter (`alt-profanity-check`), the Python server runs the text through a normalization library like **`cleantext`**.
    *   `cleantext` automatically strips unicode, removes zalgo modifications, standardizes punctuation, and removes invisible zero-width spaces. 
    *   Once normalized, the text is fed into the ML filter, guaranteeing an incredibly high catch rate without any human moderators.

## 4. Bandwidth Preservation
*   **The Fix:** The "Multiplayer Mouse Cursors" feature was permanently scrapped. While fun, broadcasting mouse coordinates at 20 frames a second for massive lobbies would overwhelm a 1GB RAM VPS network interface. Removing it guarantees smooth WebSocket delivery for actual game logic.
