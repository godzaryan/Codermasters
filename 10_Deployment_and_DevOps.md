# DevOps & Deployment Pipeline

This document outlines how the application actually gets from your codebase onto the internet, utilizing your specific VPS port constraints (TCP 6969) and GitHub.

## 1. Frontend CI/CD (Vercel)
Deploying the frontend is completely automated and requires almost zero maintenance.
*   **The Pipeline:** You push your Next.js code to the `main` branch of your GitHub repository. Vercel automatically detects the push via Webhooks, runs the build process (`npm run build`), and instantly deploys the updated UI to its global Edge network.
*   **Environment Variables:** In your Vercel project settings, you must define the URL that tells the frontend where to find your Amazon VPS.
    ```env
    NEXT_PUBLIC_WEBSOCKET_URL=wss://<your-vps-ip>:6969/ws
    ```

## 2. Backend Deployment (Amazon VPS)
Since your VPS specifically has **TCP Port 6969** open, we will bind the Python WebSocket server directly to that port.

### The Port Configuration
When running the `uvicorn` server, it will be configured to listen on your open port:
```bash
uvicorn main:app --host 0.0.0.0 --port 6969
```
*(Note: UDP port 26001 is not needed since WebSockets operate entirely over TCP, but it leaves the door open if you ever want to add Voice Chat via WebRTC later!).*

### The HTTPS / WSS Requirement (Important)
Because Vercel hosts your frontend securely on `https://`, modern browsers will **block** any attempts to connect to an insecure WebSocket (`ws://`). You must use a secure WebSocket (`wss://`).
*   **The Fix:** You will need to install a free **Let's Encrypt / Certbot** SSL certificate on your VPS.
*   Instead of making Python handle the SSL certificates directly, the industry standard is to install a lightweight reverse proxy like **Caddy** or **Nginx** on your VPS. The proxy listens on port 6969 securely (`wss://`), and internally passes the traffic to your Python server.

### Backend Updates (The "Git Pull" Method)
Since Vercel handles the frontend automatically, updating your backend on the VPS requires a slightly different flow:
1.  You push backend changes to GitHub.
2.  SSH into your Amazon VPS.
3.  Run a simple script that pulls the code and restarts the background service:
    ```bash
    git pull origin main
    sudo systemctl restart codenames-backend
    ```
    By running it as a `systemd` service, if the Python server ever crashes, Linux will automatically restart it within 1 second.
