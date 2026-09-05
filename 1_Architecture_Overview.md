# Architecture Overview

## Raised Architectural Concerns
**Question:** *Why not host the entire game, including real-time networking, entirely on Vercel for free?*
**Answer & Resolution:** Vercel operates on Serverless Functions. These functions spin up, answer an HTTP request, and instantly die. They cannot maintain the persistent WebSocket connections required for a fast, real-time multiplayer game. Therefore, attempting to use Vercel for real-time game state results in dropped connections or expensive database polling.
**Resolution:** The project utilizes a **Hybrid Approach**.

## The Hybrid Approach
### 1. Frontend (The Face)
*   **Hosting:** Vercel
*   **Framework:** Next.js (React) configured as a Single Page Application (SPA).
*   **Purpose:** Vercel’s global Edge CDN serves the static HTML, CSS, and JS assets incredibly fast. Next.js handles routing for lobbies (e.g., `/room/ABCD`).
*   **Networking:** Uses `react-use-websocket` to open a persistent connection directly to the Amazon VPS.

### 2. Backend (The Brain) (Optimized for 1GB RAM VPS)
*   **Hosting:** Amazon VPS (1GB RAM constraint).
*   **Language & Framework:** Python with **FastAPI**.
*   **Server Engine:** Uvicorn running with **uvloop** (a C-based event loop making Python async operations as fast as Node.js).
*   **State Management Strategy:** Because the VPS only has 1GB of RAM, we **do not use Redis**, and we **do not run multiple workers**. 
    *   Instead, we run a **single, highly-optimized asynchronous thread**. A single `uvloop` instance can handle thousands of concurrent WebSockets while using less than 150MB of RAM.
    *   Game state is stored purely in an in-memory Python Dictionary (`rooms = {}`). 

### 3. Database (Optional)
*   The core game is strictly anonymous, requiring no persistent database.
*   Usernames and preferences are stored locally in the browser (`localStorage`).
