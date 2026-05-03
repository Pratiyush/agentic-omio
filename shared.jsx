// shared.jsx — design tokens, icons, helpers shared across mobile + claude flows.

// ─── Tokens ───────────────────────────────────────────────────────────────
// Warm off-white + near-black ink, single burnt-amber accent.
// Using CSS variables on the artboard root so dark mode + accent are tweakable.

const TOKENS_CSS = `
  .ab-root {
    --bg: #faf8f4;
    --bg-elev: #ffffff;
    --bg-sunk: #f3efe7;
    --ink: #1a1714;
    --ink-2: #4a4640;
    --ink-3: #7a766f;
    --ink-4: #aaa49a;
    --line: rgba(26,23,20,0.08);
    --line-2: rgba(26,23,20,0.14);
    --accent: oklch(0.68 0.15 50);
    --accent-ink: #fff;
    --accent-soft: oklch(0.96 0.025 50);
    --pos: oklch(0.62 0.13 155);
    --warn: oklch(0.7 0.14 75);

    --r-sm: 6px;
    --r: 10px;
    --r-lg: 14px;
    --r-xl: 20px;

    --sans: "Inter Tight", "Inter", -apple-system, system-ui, sans-serif;
    --serif: "Instrument Serif", "Times New Roman", serif;
    --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;

    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .ab-root.dark {
    --bg: #14110e;
    --bg-elev: #1d1a16;
    --bg-sunk: #0e0c0a;
    --ink: #f3efe7;
    --ink-2: #c8c2b6;
    --ink-3: #8e887e;
    --ink-4: #5e594f;
    --line: rgba(255,250,240,0.08);
    --line-2: rgba(255,250,240,0.14);
    --accent-soft: oklch(0.28 0.04 50);
  }
  .ab-root * { box-sizing: border-box; }
  .ab-root .mono { font-family: var(--mono); font-feature-settings: "ss01"; }
  .ab-root .serif { font-family: var(--serif); }
  .ab-root .num { font-variant-numeric: tabular-nums; }
`;

function injectTokens() {
  if (document.getElementById('ab-tokens')) return;
  const s = document.createElement('style');
  s.id = 'ab-tokens';
  s.textContent = TOKENS_CSS;
  document.head.appendChild(s);
}

// ─── Icons (stroke-based, 1.5 weight, currentColor) ───────────────────────
const Icon = ({ name, size = 16, stroke = 1.5, style }) => {
  const paths = {
    train: 'M5 3h14v12H5zM7 15l-2 4M17 15l2 4M9 7h6M9 11h.01M15 11h.01',
    bus: 'M5 4h14v13a2 2 0 01-2 2H7a2 2 0 01-2-2V4zM5 9h14M8 15h.01M16 15h.01M7 19v2M17 19v2',
    plane: 'M21 12l-9-9v5L3 12l9 4v5l9-9z',
    swap: 'M7 4v14M4 7l3-3 3 3M17 20V6M14 17l3 3 3-3',
    calendar: 'M3 7h18M3 7v12a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-3h14l2 3M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
    pin: 'M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z',
    chevron: 'M9 6l6 6-6 6',
    chevronDown: 'M6 9l6 6 6-6',
    chevronUp: 'M18 15l-6-6-6 6',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
    close: 'M6 6l12 12M18 6L6 18',
    check: 'M5 13l4 4L19 7',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z',
    clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
    filter: 'M4 5h16M7 12h10M10 19h4',
    info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7v.01',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4',
    card: 'M3 7h18v12H3zM3 11h18M7 16h3',
    ticket: 'M3 9V7h18v2a2 2 0 000 4v2H3v-2a2 2 0 000-4zM10 7v14M14 7v14',
    calAdd: 'M3 7h18v14H3zM3 7l2-3h14l2 3M16 14h-3m0 0h-3m3 0v-3m0 3v3',
    bookmark: 'M6 3h12v18l-6-4-6 4z',
    moon: 'M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z',
    sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    menu: 'M4 6h16M4 12h16M4 18h16',
    home: 'M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
    refresh: 'M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5',
    wifi: 'M2 8.5a14 14 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name]} />
    </svg>
  );
};

// ─── Tiny helpers ────────────────────────────────────────────────────────
const fmtPrice = (n) => `€${n}`;
const pad = (n) => String(n).padStart(2, '0');

// brand glyph — simple original mark for our placeholder agent ("Trove")
const TroveMark = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <path d="M7 12 L11 16 L17 8" stroke={color} strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Mode pill (rail/bus/flight) — original mark, no Omio iconography
function ModeChip({ mode, active, price, duration, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
        background: 'transparent', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 2, color: active ? 'var(--ink)' : 'var(--ink-3)',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
        fontFamily: 'inherit',
      }}>
      <Icon name={mode} size={20} />
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.1 }} className="num">{price}</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.2 }}>{duration}</div>
    </button>
  );
}

Object.assign(window, {
  injectTokens, Icon, fmtPrice, pad, TroveMark, ModeChip,
});
