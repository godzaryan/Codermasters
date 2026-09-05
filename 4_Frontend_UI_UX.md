# Frontend UI/UX & Aesthetics

The frontend must feel like a premium AAA video game, not a generic dashboard.

## Raised Concerns: Performance on Old Devices
**Question:** *How do we ensure the game isn't too heavy and runs smoothly at 60fps on 5-year-old mobile devices?*
**Resolution:** **Graceful Degradation**. 
1. **The WebGL Check:** React Three Fiber checks if the device's GPU can handle 3D rendering. If not, the app instantly and silently falls back to a purely 2D, flat CSS grid using Tailwind.
2. **Framer Motion "Reduced Motion":** If a player is on a low-end device or has "Battery Saver" mode on, Framer Motion detects it automatically (`useReducedMotion`). It replaces complex physics-based spring animations with simple, instant opacity fades.
3. **Low-Poly Assets:** Even for powerful devices, the 3D cards use basic geometric boxes with baked colors, avoiding expensive raytraced shadows.

---

## 1. The 3D Game Board (React Three Fiber)
*   **Implementation:** The 5x5 grid is rendered as a WebGL 3D scene using React Three Fiber (R3F).
*   **Lighting & Depth:** Cards have physical thickness. A subtle dynamic light follows the user's cursor, casting faint shadows across the board.

## 2. 60fps Micro-Animations (Framer Motion)
*   **Physics Springs:** Replaces rigid CSS transitions with spring physics.
*   **Card Flips:** When guessed, the 3D card physically flips 180 degrees over 0.6s.
*   **Screen Shake:** If the Assassin is clicked, trigger a harsh screen shake keyframe animation and turn ambient lighting red.
*   **Lobby Drag & Drop:** Avatars smoothly glide between team columns using Framer's `layoutId`.

## 3. Visual Styling (Glassmorphism & Particles)
*   **Background:** Deep, animated mesh gradients (dark purples/blues).
*   **UI Panels:** Sidebars (Chat, Logbook) use Tailwind's `backdrop-blur-md` and `bg-white/10` to create a frosted glass effect over the animated background.
*   **Typography:** Modern fonts like 'Inter' or 'Outfit'.
*   **Particles:** Use `canvas-confetti` to blast dense, physics-based confetti when a team wins.

## 4. Mobile Responsiveness & Fallbacks
*   **The CSS Grid:** Maintain `grid-cols-5`, but wrap text and slightly shrink font sizes.
*   **The Bottom Sheet:** On vertical mobile screens, the Chat and Logbook are hidden behind swipeable bottom sheets to dedicate 100% of screen real estate to the board.
*   **Touch Input:** Force a "Double Tap to Confirm" interaction on mobile to prevent accidental fat-finger clicks.
