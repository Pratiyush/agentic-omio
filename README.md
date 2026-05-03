# Agentic Booking — Omio across Claude, ChatGPT, omio.ai

Interactive walkthrough of how Omio could ship across the three new conversational AI surfaces, with a side-by-side comparison and the strategic argument for the native flagship.

**→ Live: <https://pratiyush.github.io/agentic-omio/>**

## What's inside

Three parallel walkthroughs — switchable side-by-side:

| Flow | Steps | Surface |
|---|---:|---|
| **Claude** | 27 | MCP App, inline widget, payment hops to Stripe Checkout in a new tab |
| **ChatGPT** | 21 | Apps SDK widget, ACP inline payment (4% platform fee), no tab switch |
| **omio.ai** | 21 | The native flagship — voice, native payment sheet (0% fee), full lifecycle layer |

Each flow walks the same Berlin → Munich round-trip booking from discovery → payment → confirmation → trip lifecycle. The omio.ai flow includes a *magic moment* (auto-rebook with refund delta) and a closing three-way comparison.

## Controls

| Action | Mouse | Keyboard |
|---|---|---|
| Next / Prev step | Buttons bottom-right | `→` / `←` |
| Switch flow | Top-bar pills | `1` / `2` / `3` |
| Switch device frame (Desktop / Mobile / iOS) | Top-bar pills | `Q` / `W` / `E` |
| Cycle theme (Warm · Cool · Midnight · Mono · Solar) | Top-bar dropdown | `T` |
| Toggle dark mode | Top-bar toggle | `D` |
| Toggle present mode (hide chrome) | Top-bar toggle | `P` |

## Stack

- React 18 + Babel standalone, loaded from CDN — **no build step**
- Single-file shell (`prototype-shell.jsx`) wrapping the per-flow components
- Each flow is its own JSX file: `claude-flow.jsx`, `chatgpt-flow.jsx`, `omio-flow.jsx`
- Shared primitives: `shared.jsx` (tokens, icons), `ios-frame.jsx` (iPhone chrome)

## Run locally

```bash
git clone https://github.com/Pratiyush/agentic-omio.git
cd agentic-omio
python3 -m http.server 8765
# open http://localhost:8765/
```

A static server is required because Babel-on-the-fly fetches the `.jsx` files. `file://` won't work.

## License

This prototype is shared as a design / strategy artifact. Branding for **Omio** belongs to Omio GmbH; the code and the design vocabulary here are mine. If you'd like to reuse the harness for a different product, fork freely.
