# Advanced Unique Gameplay Features

These features elevate the game above standard physical or digital clones while remaining highly practical to implement over WebSockets.

*(Note: Multiplayer cursor tracking was deliberately removed from this design to aggressively preserve backend bandwidth and CPU on a 1GB RAM VPS).*

## 1. Spectator "Ghost" Mode & Emotes
*   **Concept:** Late joiners or dead players are put into Spectator mode. 
*   **Anti-Cheat:** Spectators see the exact same blind board as the Operatives to prevent them from DMing the answers (Stream Sniping).
*   **Interaction:** Spectators cannot chat, but can click floating "Hype Emotes" (😱, 🤔, 💀) that float across the screen, adding immense hype when Operatives are hovering over the Assassin card.

## 2. Post-Game "Misunderstanding" Recap
*   **Concept:** When the game ends, display a visual web mapping the Spymaster's clues to the actual cards the Operatives guessed.
*   **Benefit:** Capitalizes on the funniest part of the game (arguing about bad clues) by providing visual proof of the team's thought process.

## 3. Custom Word Packs
*   **Concept:** Allow the Host to upload a comma-separated list of custom words (inside jokes, clan names, specific gaming jargon) when creating a room.
*   **Benefit:** Discord communities thrive on inside jokes. Custom word packs drastically increase replayability and community engagement.

## 4. "Co-Op" Spymasters (Private Text Chat)
*   **Concept:** Allow two players to share the Spymaster role for one team to reduce anxiety.
*   **Interaction:** Since they can't talk out loud without the Operatives hearing, they are provided a private, encrypted text chat channel on the UI that only they can see to coordinate their clues.
