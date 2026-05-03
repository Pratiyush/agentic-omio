# Handover note · for the CEO of Omio

> A short, hand-over message you can paste into email, LinkedIn, or print.
> Tone: respectful, specific, no over-pitching.
> Replace `[Your name]` and adjust the URL to wherever you end up hosting.

---

## Email — short version

**Subject:** A short walkthrough — how Omio shows up in Claude, ChatGPT, and as omio.ai

Hi Naren,

A small gesture, not a pitch.

I spent some time this week thinking about how Omio lands across the new conversational surfaces — Claude (Anthropic), ChatGPT, Gemini — and what that means for the surface you actually own: **omio.ai**. Rather than a deck, I built a clickable walkthrough so the trade-offs are *felt*, not described.

Three parallel flows, switchable side-by-side:

1. **Claude** — distribution surface. MCP App, inline widget, payment hops to Stripe Checkout in a new tab.
2. **ChatGPT** — distribution surface. Apps SDK, ACP inline payment, no tab switch (but the host takes 4%).
3. **omio.ai** — the flagship. Native voice, 0% fee, and a lifecycle layer (auto-rebook on price drop, mid-trip alerts, post-trip) that the hosts cannot copy.

The thesis is in the three-way comparison near the end of the omio.ai flow: *same backend, three presentations, one winner.* Hosts cover discovery and first-booking at low CAC. omio.ai owns the trip after conversion — and that is where retention, repeat bookings, and the next 4–6 % of margin live. **Both, not either.**

Ten minutes end-to-end. Two minutes if you skip straight to the omio.ai flow and the closer.

Walkthrough: <https://pratiyush.github.io/agentic-omio/>
(Local for now — happy to host it for you, or screenshare whenever fits your calendar.)

A small thing, made carefully. Hope it sparks something.

— [Your name]

---

## Even shorter — single-paragraph version (for LinkedIn / Slack DM)

> Hi Naren — built a quick clickable walkthrough showing how Omio plays across Claude, ChatGPT, and omio.ai. The thesis is in the three-way compare near the end: hosts give us distribution; omio.ai owns the trip after conversion (auto-rebook, mid-trip alerts, post-trip), which is where the next 4–6% of margin and the retention moat live. Ten minutes if you click through everything, two if you jump to the omio.ai flow. Happy to send the URL or screenshare. — [Your name]

---

## Talking-points cheat sheet (if you walk through it live)

- **Open on Claude flow.** "This is how Omio looks inside Claude — MCP App, widget renders inline, but payment hops to Stripe Checkout in a new tab. Distribution channel #1."
- **Switch to ChatGPT (press 2).** "Same journey on ChatGPT. Apps SDK widget, ACP inline payment, conversation never breaks. Distribution channel #2 — and the host takes 4% per booking."
- **Switch to omio.ai (press 3).** "Same backend. But this surface, we own the chrome. Native voice, native payment sheet — 0% platform fee."
- **Skip to the magic moment (omio step 14, ★ Magic moment).** "Watch this. Overnight the same train drops €20. We auto-rebook proactively, refund the difference. The hosts cannot do this — they don't watch the trip after conversion."
- **Three-way reveal (omio step 20, ★ The reveal).** "Side by side. Hosts cover the discovery and first-booking layer. We own the lifecycle. That's where the moat is."
- **Closer (omio step 21).** "Three asks: distribution slots in the MCP/Apps SDK/UCP rollouts; ACP fee path to <2% as we scale; lifecycle infra resourcing — the part hosts cannot copy."

---

## Hosting options if local URL won't work

The walkthrough is currently served from `python3 -m http.server 8765` running locally. Three quick paths to make it shareable:

1. **Vercel / Netlify static deploy** (5 min): drop the `agentic-omio-prototype/` folder into a project root. No build step needed — it's HTML + JSX-via-CDN.
2. **GitHub Pages**: push the folder to a public repo, enable Pages, point to `/`.
3. **Tunnel for live demo**: `ngrok http 8765` or `cloudflared tunnel` while you're on the call. Use this if Naren wants to click around himself but you don't want to commit to permanent hosting yet.

For an in-person screenshare or video call, hosting isn't required — just open `prototype.html` while the local server is running and share the screen.
