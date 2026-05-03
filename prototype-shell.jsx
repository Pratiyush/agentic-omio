// prototype-shell.jsx — Walkthrough wrapper, post-5-agent-review.
//
// Changes in this revision (vs previous):
//  • B1  Midnight theme: light variant fixed (was inverted)
//  • V1  Accent-ink on saturated dark accents → white for legibility
//  • C2  tweaks object memoized to stop sync-effect refire on parent re-renders
//  • C3  remountKey expanded with errorState / displayMode / confirmVariant
//  • C4  ARIA tabpanel wrapper around the stage with aria-labelledby
//  • C5  key={flowKey} on progress dots wrapper to force clean reconcile
//  • SectionDivider eyebrow → accent (visual consistency with IntroSlide)
//  • N1  omio.ai intro bullets rewritten — revenue / retention / moat
//  • N3  Claude: cl-pip + cl-fullscreen removed; A13 timeline+receipt merged
//        into one side-by-side step (`ConfirmVariantsRow`)
//  • N2  ChatGPT compare frame removed; replaced by three-way compare in omio
//  • B3  omio magic moment added (`OmioRefundDiff`) after payment success
//  • N4  omio edges reframed as resilience
//  • B4  Closer slide added at end of omio with the ask
//  • B2  omio expanded with refund-diff + three-way + closer
//
// Keyboard: ←/→ prev/next · 1/2/3 flow · Q/W/E device · T theme · D dark · P present

// ════════════════════════════════════════════════════════════════════════
// Custom slide components
// ════════════════════════════════════════════════════════════════════════

// Desktop browser chrome wrapper — gives chat-frame steps a "this is on
// desktop" affordance (macOS window controls + URL field) without faking
// browser features. Used only when device === 'desktop' and frame === 'chat'.
function BrowserChrome({ host = 'claude.ai', dark = false, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: 'var(--bg)' }}>
      <div style={{
        flex: '0 0 38px',
        background: 'var(--bg-elev)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 14, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ed6a5e' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f5bf4f' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#62c554' }} />
        </div>
        <div style={{
          flex: 1, height: 24,
          background: 'var(--bg-sunk)',
          border: '1px solid var(--line)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center',
          padding: '0 12px',
          gap: 8,
          fontFamily: 'var(--mono)', fontSize: 11,
          color: 'var(--ink-3)',
          letterSpacing: '0.02em',
        }}>
          <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
            <path d="M2 5V3.5C2 2.12 3.12 1 4.5 1S7 2.12 7 3.5V5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="1.5" y="5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          {host}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>{children}</div>
    </div>
  );
}

// Phone-sized container for components that expect a phone-shaped surface
// (e.g. OmioPaymentSheet uses bottom-anchored modal that collapses in a tall frame).
// Sized to fit comfortably inside the stage viewport so the modal sheet is fully visible.
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 440, height: 'min(660px, calc(100vh - 220px))',
      maxHeight: 660, margin: '0 auto', position: 'relative',
      overflow: 'hidden', background: 'var(--bg)',
      borderRadius: 'var(--r-xl)', border: '1px solid var(--line)',
      boxShadow: '0 16px 60px rgba(0,0,0,0.10)',
    }}>
      {children}
    </div>
  );
}

function IntroSlide({ eyebrow, headline, subhead, bullets, footer }) {
  return (
    <div style={{
      width: '100%', minHeight: 600,
      background: 'var(--bg)', color: 'var(--ink)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '56px 64px', fontFamily: 'var(--sans)', boxSizing: 'border-box',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 28,
      }}>{eyebrow}</div>
      <h1 style={{
        fontFamily: 'var(--serif)', fontSize: 52, lineHeight: 1.05,
        margin: 0, marginBottom: 20, color: 'var(--ink)', fontWeight: 400,
        letterSpacing: '-0.01em',
      }}>{headline}</h1>
      <p style={{
        fontSize: 17, lineHeight: 1.5, color: 'var(--ink-2)',
        margin: 0, marginBottom: 36, maxWidth: 720,
      }}>{subhead}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontSize: 14, color: 'var(--ink-2)', display: 'flex', gap: 14,
            alignItems: 'baseline',
          }}>
            <span style={{
              color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 11,
              minWidth: 26, letterSpacing: '0.04em',
            }}>{String(i+1).padStart(2,'0')}</span>
            <span style={{ flex: 1 }}>{b}</span>
          </li>
        ))}
      </ul>
      <div style={{
        marginTop: 40, paddingTop: 16, borderTop: '1px solid var(--line)',
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
        color: 'var(--ink-4)', textTransform: 'uppercase',
      }}>{footer || 'Press → to begin · 1 / 2 / 3 to switch flows'}</div>
    </div>
  );
}

function SectionDivider({ eyebrow, title, body }) {
  return (
    <div style={{
      width: '100%', minHeight: 440,
      background: 'var(--bg)', color: 'var(--ink)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '56px 64px', fontFamily: 'var(--sans)', boxSizing: 'border-box',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16,
      }}>{eyebrow}</div>
      <h2 style={{
        fontFamily: 'var(--serif)', fontSize: 38, lineHeight: 1.1,
        margin: 0, marginBottom: 18, color: 'var(--ink)', fontWeight: 400,
      }}>{title}</h2>
      <p style={{
        fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)',
        margin: 0, maxWidth: 600,
      }}>{body}</p>
    </div>
  );
}

// Claude A13 confirmation variants rendered side-by-side. Replaces the
// two separate variant slides for tighter pacing.
function ConfirmVariantsRow({ tweaks }) {
  const variants = ['ticket', 'timeline', 'receipt'];
  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{
      width: '100%', minHeight: 600, background: 'var(--bg-sunk)',
      padding: '28px 24px', boxSizing: 'border-box',
      fontFamily: 'var(--sans)', color: 'var(--ink)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6,
      }}>A13 · Confirmation card · three layouts, one data model</div>
      <h3 style={{
        fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.15, fontWeight: 400,
        margin: 0, marginBottom: 18, color: 'var(--ink)',
      }}>Same booking. Pick the chrome that fits.</h3>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
        alignItems: 'start',
      }}>
        {variants.map((v) => (
          <div key={v} style={{
            background: 'var(--bg)', borderRadius: 12, padding: 14,
            border: '1px solid var(--line)', boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
              color: 'var(--ink-3)', textTransform: 'uppercase',
            }}>{v} variant</div>
            <ConfirmationCard variant={v} returnTrip={true} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Magic moment for omio.ai — auto-rebook with refund delta.
// Demonstrates "stays with the trip" in a way hosts cannot.
function OmioRefundDiff({ tweaks }) {
  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{
      width: '100%', minHeight: 600, background: 'var(--bg)',
      padding: '40px 56px', boxSizing: 'border-box',
      fontFamily: 'var(--sans)', color: 'var(--ink)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8,
      }}>The differentiator · auto-rebook</div>
      <h2 style={{
        fontFamily: 'var(--serif)', fontSize: 38, lineHeight: 1.1, fontWeight: 400,
        margin: 0, marginBottom: 26, color: 'var(--ink)', maxWidth: 740,
      }}>Hosts don't watch your trip. We do.</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720 }}>
        {/* Original booking */}
        <div style={{
          background: 'var(--bg-elev)', border: '1px solid var(--line)',
          borderRadius: 14, padding: 18,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase' }}>
            Tuesday · 14:22 — booked
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.5 }}>
            ICE 1023 · Berlin → Munich · Tue 12 May · €168 confirmed.
          </div>
        </div>

        {/* Auto-rebook event */}
        <div style={{
          background: 'var(--bg-elev)', border: '1px solid var(--line)',
          borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' }}>
            Wednesday · 06:14 — proactive
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.5 }}>
            Same train, same seat dropped to <strong>€148</strong> overnight (DB last-minute fare).
            Auto-rebooking unless you say no.
          </div>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
            background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10,
            padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 12,
          }}>
            <span style={{ color: 'var(--ink-3)' }}>old</span>
            <span style={{ textDecoration: 'line-through', color: 'var(--ink-3)' }}>€168.00</span>
            <span style={{ color: 'var(--ink-4)' }}>→</span>
            <span style={{ color: 'var(--accent)' }}>new €148.00</span>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <span style={{ color: 'var(--ink-2)' }}>refund €20.00 to •••• 4242</span>
          </div>
        </div>

        {/* Confirmation */}
        <div style={{
          background: 'var(--bg-elev)', border: '1px solid var(--line)',
          borderRadius: 14, padding: 18,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase' }}>
            Wednesday · 06:14 — done
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.5 }}>
            Refund initiated · new ticket sent · same seat, same train, €20 saved.
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--line)',
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
        color: 'var(--ink-4)', textTransform: 'uppercase', maxWidth: 720,
      }}>This requires watching the booking after conversion · only the native surface does it.</div>
    </div>
  );
}

// Three-way capability comparison — replaces the two-way Claude vs ChatGPT
// frame and shows omio.ai as the clear winner. Final reveal slide.
function ThreeWayCompare() {
  const rows = [
    ['Conversational booking',           'yes', 'yes', 'yes'],
    ['Inline widget / cards',            'yes', 'yes', 'yes'],
    ['Voice entry',                      'yes', 'yes', 'yes'],
    ['In-thread payment (no tab switch)', 'no',  'yes', 'yes'],
    ['Platform fee on transaction',      'Stripe only', 'ACP +4%', '0%'],
    ['Live trip lifecycle (24h → post)', 'as cards',  'as cards',  'native push'],
    ['Auto-rebook on price drop',        'no',  'no',  'yes'],
    ['Climate-aware search',             'no',  'no',  'yes'],
    ['Multi-city / flex dates',          'no',  'no',  'yes'],
    ['Group + accessibility filters',    'no',  'no',  'yes'],
  ];
  const cell = (val) => {
    if (val === 'yes')  return <span style={{ color: 'var(--pos, #2a7a3b)' }}>●</span>;
    if (val === 'no')   return <span style={{ color: 'var(--ink-4)' }}>—</span>;
    return <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>{val}</span>;
  };

  return (
    <div style={{
      width: '100%', minHeight: 560, background: 'var(--bg)', color: 'var(--ink)',
      padding: '40px 56px', boxSizing: 'border-box', fontFamily: 'var(--sans)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8,
      }}>The reveal · three surfaces compared</div>
      <h2 style={{
        fontFamily: 'var(--serif)', fontSize: 38, lineHeight: 1.1, fontWeight: 400,
        margin: 0, marginBottom: 26, color: 'var(--ink)',
      }}>Same backend. Three presentations. One winner.</h2>

      <div style={{
        background: 'var(--bg-elev)', borderRadius: 14, border: '1px solid var(--line)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--ink-3)',
          padding: '12px 18px', borderBottom: '1px solid var(--line)',
          background: 'var(--bg-sunk)',
        }}>
          <div>Capability</div>
          <div style={{ textAlign: 'center' }}>Claude</div>
          <div style={{ textAlign: 'center' }}>ChatGPT</div>
          <div style={{ textAlign: 'center', color: 'var(--accent)' }}>omio.ai</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '11px 18px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none',
            fontSize: 13, alignItems: 'center',
          }}>
            <div style={{ color: 'var(--ink)' }}>{r[0]}</div>
            <div style={{ textAlign: 'center', fontSize: 16 }}>{cell(r[1])}</div>
            <div style={{ textAlign: 'center', fontSize: 16 }}>{cell(r[2])}</div>
            <div style={{
              textAlign: 'center', fontSize: 16,
              background: 'var(--accent-soft)',
            }}>{cell(r[3])}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 22,
        fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)',
        maxWidth: 720,
      }}>
        Hosts cover the discovery + booking layer. Only the native surface owns the trip after conversion — and that's where retention, repeat bookings, and the next 4–6% of margin live.
      </div>
    </div>
  );
}

// Final ask slide — "what we need from you."
function ClosingSlide() {
  return (
    <div style={{
      width: '100%', minHeight: 600, background: 'var(--bg)', color: 'var(--ink)',
      padding: '56px 64px', boxSizing: 'border-box', fontFamily: 'var(--sans)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 28,
      }}>The ask · what we need</div>
      <h1 style={{
        fontFamily: 'var(--serif)', fontSize: 52, lineHeight: 1.05, fontWeight: 400,
        margin: 0, marginBottom: 20, color: 'var(--ink)', letterSpacing: '-0.01em',
        maxWidth: 880,
      }}>Flagship + Distribution. Both, not either.</h1>
      <p style={{
        fontSize: 17, lineHeight: 1.5, color: 'var(--ink-2)',
        margin: 0, marginBottom: 36, maxWidth: 720,
      }}>
        omio.ai is the flagship surface — where retention, lifecycle margin, and the moat live. Claude / ChatGPT / Gemini are distribution — discovery and first-booking at the lowest possible CAC. Both ship from the same backend. We need three things to move now.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, maxWidth: 1000 }}>
        {[
          { eyebrow: '01 · Distribution',  title: 'Host slot commitments',
            body: 'Claude MCP App + ChatGPT Apps SDK + Gemini UCP — six-week parallel build.' },
          { eyebrow: '02 · Margin',        title: 'ACP fee re-negotiation',
            body: 'Hosts take 4% on ACP. We need a path to <2% as volume crosses 100k bookings/mo.' },
          { eyebrow: '03 · Moat',          title: 'Lifecycle infra investment',
            body: 'Push, auto-rebook, and refund-diff service is what hosts cannot copy. Resource it.' },
        ].map((c, i) => (
          <div key={i} style={{
            background: 'var(--bg-elev)', border: '1px solid var(--line)',
            borderRadius: 14, padding: 22,
          }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10,
            }}>{c.eyebrow}</div>
            <div style={{
              fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.15,
              fontWeight: 400, marginBottom: 10, color: 'var(--ink)',
            }}>{c.title}</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>{c.body}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 36, paddingTop: 16, borderTop: '1px solid var(--line)',
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
        color: 'var(--ink-4)', textTransform: 'uppercase',
      }}>End of walkthrough · questions?</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Step manifests
// ════════════════════════════════════════════════════════════════════════

const CLAUDE_STEPS = [
  { id: 'cl-intro', label: 'Intro · Claude flow', frame: 'free',
    summary: "Sets context for the Claude walkthrough — MCP App architecture, payment path, what to watch for.",
    render: () => <IntroSlide
      eyebrow="Walkthrough · Claude"
      headline="Distribution surface #1 — Claude."
      subhead="Omio ships inside Claude as a Model Context Protocol App. The widget renders inline, the conversation never closes — but payment hops to Stripe Checkout in a new tab and returns via webhook."
      bullets={[
        "Discovery + first booking at low CAC — Claude's user base, Omio's inventory",
        "Payment: Stripe Checkout (new tab) — webhook confirms back to thread",
        "Limit: trip lifecycle is best-effort proactive cards, not native push",
      ]} /> },
  { id: 'cl-onboarding', label: 'A0 · Onboarding · MCP connector', frame: 'chat',
    summary: "First-time entry — Claude surfaces the Omio MCP card and three example prompts.",
    render: (t) => <ClaudeOnboardingFrame tweaks={t} /> },
  { id: 'cl-voice', label: 'Voice mode · listening', frame: 'chat',
    summary: "Alt entry — voice with live waveform plus transcription before the query is sent.",
    render: (t) => <ClaudeVoice tweaks={t} /> },
  { id: 'cl-A1', label: 'A1 · User asks', frame: 'chat',
    summary: "User asks for a Berlin → Munich round trip under €200. Demo route locked.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A1', controlled: true }} /> },
  { id: 'cl-A2', label: 'A2 · Searching · tool call', frame: 'chat',
    summary: "Claude calls omio.search_routes — tool-call pill shows the search running with live status.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A2', controlled: true }} /> },
  { id: 'cl-A3', label: 'A3 · Inline results widget', frame: 'chat',
    summary: "Live MCP App widget renders inline with three paired-leg results — best-value, fastest, cheapest.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A3', controlled: true }} /> },
  { id: 'cl-A4', label: 'A4 · Post-search narration', frame: 'chat',
    summary: "Claude narrates the best option in plain language and surfaces a follow-up question to refine.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A4', controlled: true }} /> },
  { id: 'cl-A5', label: 'A5 · User refines', frame: 'chat',
    summary: "User refines: 'Direct only please.' — natural language, no UI filter.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A5', controlled: true }} /> },
  { id: 'cl-A6', label: 'A6 · Refinement reflowing', frame: 'chat',
    summary: "Same widget instance — direct-only options stagger in, prior items demote to history.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A6', controlled: true }} /> },
  { id: 'cl-A7', label: 'A7 · Selection confirmed', frame: 'chat',
    summary: "User picks the best-value pair. Claude confirms and previews next step.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A7', controlled: true }} /> },
  { id: 'cl-A8', label: 'A8 · Traveler form', frame: 'chat',
    summary: "Traveler form appears in the widget — name, DOB, email, seat preference. All inline.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A8', controlled: true }} /> },
  { id: 'cl-A9', label: 'A9 · Payment handoff', frame: 'chat',
    summary: "Watch this beat — Claude announces Stripe Checkout opening in a new tab. Conversation pauses.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A9', controlled: true }} /> },
  { id: 'cl-A10', label: 'A10 · Payment pending', frame: 'chat',
    summary: "Widget shows payment-pending state while Stripe runs in another tab. Cancel-and-return offered.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A10', controlled: true }} /> },
  { id: 'cl-A12', label: 'A12 · Booking confirmed', frame: 'chat',
    summary: "Webhook fires from Stripe. Claude announces the booking with reference TRV-9F2A.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A12', controlled: true }} /> },
  { id: 'cl-A13-ticket', label: 'A13 · Confirmation card · ticket', frame: 'chat',
    summary: "Confirmation lands in the thread. Three layout variants ship; we pick ticket for the demo.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A13', confirmVariant: 'ticket', controlled: true }} /> },
  { id: 'cl-A13-row', label: 'A13 · Three layouts, one data model', frame: 'wide',
    summary: "All three confirmation variants side-by-side — ticket, timeline, receipt. Same data, different chrome.",
    render: (t) => <ConfirmVariantsRow tweaks={t} /> },
  { id: 'cl-A14', label: 'A14 · Proactive next steps', frame: 'chat',
    summary: "Claude offers proactive next steps — hotel near Marienplatz, weather check.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A14', controlled: true }} /> },
  { id: 'cl-A15', label: 'A15 · Next day · 24h heads-up', frame: 'chat',
    summary: "Time jump — next morning. Heads-up about tomorrow's departure and platform.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A15', controlled: true }} /> },
  { id: 'cl-A16', label: 'A16 · Trip day · 30 min boarding', frame: 'chat',
    summary: "Time jump — trip day. 'Time to board' with platform and walking time from current location.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A16', controlled: true }} /> },
  { id: 'cl-A17', label: 'A17 · Mid-trip · live update', frame: 'chat',
    summary: "Mid-trip — minor delay alert. Onward connection still safe. Same thread, no app to open.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A17', controlled: true }} /> },
  { id: 'cl-A18', label: 'A18 · Arrival · welcome', frame: 'chat',
    summary: "Arrival — welcome to Munich, contextual hotel suggestions offered as chips.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A18', controlled: true }} /> },
  { id: 'cl-A19', label: 'A19 · Sunday · post-trip', frame: 'chat',
    summary: "Post-trip — receipt summary plus rating prompt closes the loop.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, startStage: 'A19', controlled: true }} /> },
  { id: 'cl-claim', label: 'Returning guest · claim account', frame: 'free',
    summary: "Next time the same email books — claim previous bookings, set a password, link history.",
    render: () => <ClaimAccountPrompt /> },
  { id: 'cl-divider-edges', label: '— Edge cases —', frame: 'free',
    summary: "Section break — what happens when the happy path breaks.",
    render: () => <SectionDivider eyebrow="Section · Edge cases" title="What breaks, and how Claude recovers."
      body="No results, declined cards, cancelled payments — every error stays in the same conversation. The user never has to context-switch to fix it." /> },
  { id: 'cl-error-empty', label: 'Edge · No results', frame: 'chat',
    summary: "No results — Claude offers nearest alternatives in conversation.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, errorState: 'empty', startStage: 'A3', controlled: true }} /> },
  { id: 'cl-error-failed', label: 'Edge · Card declined', frame: 'chat',
    summary: "Card declined — bank wants verification. Try Apple Pay or a different card, no flow restart.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, errorState: 'failed', startStage: 'A10', controlled: true }} /> },
  { id: 'cl-error-cancelled', label: 'Edge · Payment cancelled', frame: 'chat',
    summary: "User cancelled payment — no charge made, retry path offered, seat held briefly.",
    render: (t) => <ClaudeFlow tweaks={{ ...t, errorState: 'cancelled', startStage: 'A10', controlled: true }} /> },
];

const CHATGPT_STEPS = [
  { id: 'gpt-intro', label: 'Intro · ChatGPT flow', frame: 'free',
    summary: "Sets context — Apps SDK + ACP inline payment, the trade-off vs Claude.",
    render: () => <IntroSlide
      eyebrow="Walkthrough · ChatGPT"
      headline="Distribution surface #2 — ChatGPT."
      subhead="Same journey, ChatGPT's surface. The Omio app appears via @-mention and ACP runs payment inside the widget — no tab switch, no webhook round-trip. Cost: 4% platform fee on every transaction."
      bullets={[
        "Largest distribution audience — ChatGPT's MAU dwarfs everything else",
        "Payment: Agentic Commerce Protocol (ACP) inline · 4% platform fee",
        "Limit: ACP region-locked; rest of world falls back to Claude-style Stripe",
      ]} /> },
  { id: 'gpt-onboarding', label: 'Onboarding · @Omio mention', frame: 'chat',
    summary: "First touch via @omio mention — discovery panel and example prompts.",
    render: (t) => <GPTOnboarding tweaks={t} /> },
  { id: 'gpt-mention', label: 'Mention autocomplete', frame: 'chat',
    summary: "Discoverable entry — typing @ surfaces installed apps. omio is one tap away.",
    render: () => <MentionAutocomplete /> },
  { id: 'gpt-voice', label: 'Voice mode · listening', frame: 'chat',
    summary: "ChatGPT voice — clipped, less editorial than Claude's. Same end behaviour.",
    render: (t) => <GPTVoice tweaks={t} /> },
  { id: 'gpt-A1', label: 'A1 · User asks', frame: 'chat',
    summary: "Same Berlin → Munich query — kept identical so the comparison reads cleanly.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A1', controlled: true }} /> },
  { id: 'gpt-A2', label: 'A2 · Searching with Omio app', frame: 'chat',
    summary: "ChatGPT calls Omio via Apps SDK. Tool-pill shows 'Using Omio app' instead of an MCP method name.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A2', controlled: true }} /> },
  { id: 'gpt-A3', label: 'A3 · Apps SDK widget inline', frame: 'chat',
    summary: "Apps SDK widget renders inline with the required 'Powered by Omio' attribution chip.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A3', controlled: true }} /> },
  { id: 'gpt-A4', label: 'A4 · Post-search question', frame: 'chat',
    summary: "ChatGPT summarises options and asks for refinement — same structure, more clipped voice.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A4', controlled: true }} /> },
  { id: 'gpt-A5', label: 'A5 · User refines', frame: 'chat',
    summary: "User refines: direct only.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A5', controlled: true }} /> },
  { id: 'gpt-A6', label: 'A6 · Filtering', frame: 'chat',
    summary: "Widget filters to direct-only. Thinking pill in the conversation.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A6', controlled: true }} /> },
  { id: 'gpt-A7', label: 'A7 · Selection confirmed', frame: 'chat',
    summary: "Selection locked. ChatGPT confirms and continues to traveler details.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A7', controlled: true }} /> },
  { id: 'gpt-A8', label: 'A8 · Traveler form', frame: 'chat',
    summary: "Traveler form lives inside the same widget instance — no new surface.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A8', controlled: true }} /> },
  { id: 'gpt-A9', label: 'A9 · Pay inline · ACP starts', frame: 'chat',
    summary: "Pay inline — no new tab. ACP starts within the widget. Compare to Claude A9.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'A9', controlled: true }} /> },
  { id: 'gpt-pay-method', label: 'ACP · Payment method', frame: 'chat',
    summary: "ACP method picker — Apple Pay default, saved cards listed, add new card.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'PAY_METHOD', controlled: true }} /> },
  { id: 'gpt-pay-sca', label: 'ACP · SCA verification', frame: 'chat',
    summary: "SCA challenge — verify with bank, 5-digit code in the widget.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'PAY_SCA', controlled: true }} /> },
  { id: 'gpt-pay-processing', label: 'ACP · Processing', frame: 'chat',
    summary: "Processing — Stripe confirms with bank in ~3 seconds. Widget locked, no flicker.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'PAY_PROC', controlled: true }} /> },
  { id: 'gpt-pay-success', label: 'ACP · Paid · widget transforms', frame: 'chat',
    summary: "Paid — widget transforms to confirmation in place. Zero tab switches.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'PAY_DONE', controlled: true }} /> },
  { id: 'gpt-life', label: 'Lifecycle · proactive cards', frame: 'chat',
    summary: "Time jump — proactive lifecycle: calendar add, 24h heads-up, boarding, mid-trip, arrival, post-trip.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, startStage: 'LIFE', controlled: true }} /> },
  { id: 'gpt-divider-edges', label: '— Edge cases —', frame: 'free',
    summary: "Section break — ACP rollout edges and where the inline path can't run.",
    render: () => <SectionDivider eyebrow="Section · ACP edges" title="Where the inline path can't run."
      body="ACP needs region support, a linked payment method, and a Plus/Pro tier. Outside that, the flow falls back to the Claude-style Stripe path — same backend, different chrome." /> },
  { id: 'gpt-e1', label: 'E1 · ACP region fallback', frame: 'chat',
    summary: "Unsupported region — ACP falls back to Stripe Checkout in a new tab. Same as Claude's path.",
    render: (t) => <ChatGPTFlow tweaks={{ ...t, acpRegion: 'unsupported' }} /> },
  { id: 'gpt-edges', label: 'E2 · E3 · E4 · Edge cases', frame: 'free',
    summary: "Edges — no payment method linked, signed-out tier, refund initiation.",
    render: () => <ACPEdgeCases /> },
];

const OMIO_STEPS = [
  { id: 'om-intro', label: 'Intro · omio.ai flow', frame: 'free',
    summary: "Sets context — the native flagship. Why this surface earns the margin and the moat.",
    render: () => <IntroSlide
      eyebrow="Walkthrough · omio.ai"
      headline="The flagship surface — where margin and moat live."
      subhead="Hosts (Claude, ChatGPT, Gemini) bring the audience and take their cut. omio.ai is where Omio owns the chrome, the lifecycle, and the next 4–6% of margin. Native voice, native payment, lifelong trip companion."
      bullets={[
        "Margin · 0% platform fee, native Stripe — recapture the 4% ACP take",
        "Retention · Lifecycle continuity (auto-rebook, refund-diff, push) hosts can't copy",
        "Moat · Climate-aware search, multi-city, group, accessibility — surfaces hosts won't build",
      ]} /> },
  { id: 'om-why', label: 'Why omio.ai · strategic frame', frame: 'free',
    summary: "Positioning — three things only the native surface can do that hosts cannot.",
    render: () => <WhyOmioAi /> },
  { id: 'om-hero-empty', label: 'Hero · empty', frame: 'wide',
    summary: "Empty hero — big serif prompt, voice button, geo chip. The native landing.",
    render: (t) => <OmioHero tweaks={t} mode="empty" /> },
  { id: 'om-hero-firsttime', label: 'Hero · first-time user', frame: 'wide',
    summary: "First-time hero — trust micro-row plus three example chips to anchor expectations.",
    render: (t) => <OmioFirstTime tweaks={t} /> },
  { id: 'om-hero-returning', label: 'Hero · returning user', frame: 'wide',
    summary: "Welcome back — frequent routes plus an upcoming trip card surfaced before the prompt.",
    render: (t) => <OmioHero tweaks={t} mode="returning" /> },
  { id: 'om-hero-voice', label: 'Hero · voice listening', frame: 'wide',
    summary: "Voice — large editorial transcript, central waveform. Voice-first by design.",
    render: (t) => <OmioVoice tweaks={t} /> },
  { id: 'om-conversation', label: 'A3 · Streaming with climate · the differentiator', frame: 'wide',
    summary: "This is what only Omio does. CO₂ vs flight comparisons in search, not a separate tab. Hosts can't.",
    render: (t) => <OmioConversation tweaks={t} /> },
  { id: 'om-refine-cheaper', label: 'Refinement · cheaper', frame: 'wide',
    summary: "Prior cards demote to history, cheaper options reflow. Same instance, no separate filter UI.",
    render: (t) => <OmioRefinement tweaks={t} kind="cheaper" /> },
  { id: 'om-refine-faster', label: 'Refinement · faster', frame: 'wide',
    summary: "Refinement variant — faster options surfaced.",
    render: (t) => <OmioRefinement tweaks={t} kind="faster" /> },
  { id: 'om-refine-fewer', label: 'Refinement · fewer transfers', frame: 'wide',
    summary: "Refinement variant — fewer-transfer options surfaced.",
    render: (t) => <OmioRefinement tweaks={t} kind="fewer" /> },
  { id: 'om-pay-method', label: 'Payment sheet · method', frame: 'wide',
    summary: "Native payment sheet — Apple Pay, Visa, Klarna, Link, add card. 0% fee, no iframe, no redirect.",
    render: (t) => <PhoneFrame><OmioPaymentSheet tweaks={t} state="method" /></PhoneFrame> },
  { id: 'om-pay-sca', label: 'Payment sheet · SCA verification', frame: 'wide',
    summary: "Native SCA — same sheet, no redirect, no surface change.",
    render: (t) => <PhoneFrame><OmioPaymentSheet tweaks={t} state="sca" /></PhoneFrame> },
  { id: 'om-pay-success', label: 'Payment sheet · success', frame: 'wide',
    summary: "Paid — booking reference plus 'returning to thread' state. Sheet collapses cleanly.",
    render: (t) => <PhoneFrame><OmioPaymentSheet tweaks={t} state="success" /></PhoneFrame> },
  { id: 'om-magic-rebook', label: '★ Magic moment · auto-rebook with refund', frame: 'free',
    summary: "Watch this — overnight the same train drops €20. Omio rebooks proactively, refunds the diff. Hosts cannot do this.",
    render: (t) => <OmioRefundDiff tweaks={t} /> },
  { id: 'om-lifecycle', label: 'Trip lifecycle · 24h → post-trip', frame: 'wide',
    summary: "Time jump — full persistent trip lifecycle in one scroll: 24h, boarding, mid-trip, arrival, post-trip.",
    render: (t) => <OmioLifecycle tweaks={t} /> },
  { id: 'om-manage-change', label: 'Manage · change return', frame: 'wide',
    summary: "Change return date — refund and new fare diff in a single card. Confirm → rebooked.",
    render: (t) => <OmioManage tweaks={t} kind="change" /> },
  { id: 'om-manage-cancel', label: 'Manage · cancel', frame: 'wide',
    summary: "Cancel booking — refund preview, fee, net amount, confirm → cancellation receipt.",
    render: (t) => <OmioManage tweaks={t} kind="cancel" /> },
  { id: 'om-advanced', label: 'Advanced · what only omio.ai ships', frame: 'wide',
    summary: "Capabilities hosts won't build — multi-city, flex-date heatmap, price alerts, group, accessibility, climate-aware. Native moat.",
    render: (t) => <OmioAdvanced tweaks={t} /> },
  { id: 'om-resilience', label: 'Resilience · native recovery', frame: 'wide',
    summary: "Reframed: when the network or operator fails, the native surface auto-resumes. Sold-out, payment retry, schedule push, reconnect.",
    render: (t) => <OmioEdgeStates tweaks={t} /> },
  { id: 'om-three-way', label: '★ The reveal · three-way compare', frame: 'free',
    summary: "Side-by-side: same backend, three presentations, one winner. Where omio earns the margin.",
    render: () => <ThreeWayCompare /> },
  { id: 'om-closer', label: '★ Close · the ask', frame: 'free',
    summary: "Final slide. Three asks: distribution slots, ACP fee re-negotiation, lifecycle infra.",
    render: () => <ClosingSlide /> },
];

const FLOW_DEFS = {
  claude:  { name: 'Claude',   steps: CLAUDE_STEPS },
  chatgpt: { name: 'ChatGPT',  steps: CHATGPT_STEPS },
  omio:    { name: 'omio.ai',  steps: OMIO_STEPS },
};

// ════════════════════════════════════════════════════════════════════════
// Themes (B1 + V1 fixed)
// ════════════════════════════════════════════════════════════════════════

const THEMES = {
  warm: {
    label: 'Warm',
    light: { '--bg': '#f0eee9', '--bg-elev': '#fbfaf6', '--bg-sunk': '#e8e4dc',
             '--ink': '#1a1814', '--ink-2': '#3a352d', '--ink-3': '#6f6a62', '--ink-4': '#9d978c',
             '--accent': 'oklch(0.68 0.15 50)', '--accent-soft': 'oklch(0.92 0.04 60)', '--accent-ink': '#fff',
             '--line': 'rgba(26,24,20,0.08)', '--line-2': 'rgba(26,24,20,0.14)' },
    dark:  { '--bg': '#1a1814', '--bg-elev': '#23201b', '--bg-sunk': '#13110e',
             '--ink': '#f0eee9', '--ink-2': '#cfc8bd', '--ink-3': '#9d978c', '--ink-4': '#6f6a62',
             '--accent': 'oklch(0.74 0.16 55)', '--accent-soft': 'oklch(0.34 0.06 60)', '--accent-ink': '#1a1814',
             '--line': 'rgba(255,253,247,0.10)', '--line-2': 'rgba(255,253,247,0.16)' },
  },
  cool: {
    label: 'Cool',
    light: { '--bg': '#f7f8fa', '--bg-elev': '#ffffff', '--bg-sunk': '#eef0f4',
             '--ink': '#0d1014', '--ink-2': '#262a32', '--ink-3': '#5b6470', '--ink-4': '#8b95a3',
             '--accent': 'oklch(0.62 0.18 260)', '--accent-soft': 'oklch(0.93 0.04 260)', '--accent-ink': '#fff',
             '--line': 'rgba(13,16,20,0.08)', '--line-2': 'rgba(13,16,20,0.14)' },
    dark:  { '--bg': '#0d1117', '--bg-elev': '#161b22', '--bg-sunk': '#0a0d12',
             '--ink': '#e6edf3', '--ink-2': '#b6bec9', '--ink-3': '#8b95a3', '--ink-4': '#5b6470',
             '--accent': 'oklch(0.72 0.18 260)', '--accent-soft': 'oklch(0.30 0.08 260)', '--accent-ink': '#ffffff',
             '--line': 'rgba(230,237,243,0.10)', '--line-2': 'rgba(230,237,243,0.16)' },
  },
  // B1: Midnight LIGHT now genuinely lighter; DARK pushes deeper navy.
  midnight: {
    label: 'Midnight',
    light: { '--bg': '#eef2fa', '--bg-elev': '#ffffff', '--bg-sunk': '#dde4f1',
             '--ink': '#0a1530', '--ink-2': '#243056', '--ink-3': '#525d75', '--ink-4': '#8a93a8',
             '--accent': 'oklch(0.55 0.14 235)', '--accent-soft': 'oklch(0.92 0.05 235)', '--accent-ink': '#ffffff',
             '--line': 'rgba(10,21,48,0.10)', '--line-2': 'rgba(10,21,48,0.18)' },
    dark:  { '--bg': '#0a0d18', '--bg-elev': '#10141f', '--bg-sunk': '#06080f',
             '--ink': '#e8eef9', '--ink-2': '#a4afc8', '--ink-3': '#6e7a93', '--ink-4': '#3e4762',
             '--accent': 'oklch(0.78 0.16 200)', '--accent-soft': 'oklch(0.28 0.10 200)', '--accent-ink': '#06080f',
             '--line': 'rgba(232,238,249,0.12)', '--line-2': 'rgba(232,238,249,0.20)' },
  },
  mono: {
    label: 'Mono',
    light: { '--bg': '#fafafa', '--bg-elev': '#ffffff', '--bg-sunk': '#f0f0f0',
             '--ink': '#0a0a0a', '--ink-2': '#2a2a2a', '--ink-3': '#666666', '--ink-4': '#9a9a9a',
             '--accent': '#0a0a0a', '--accent-soft': '#e8e8e8', '--accent-ink': '#fafafa',
             '--line': 'rgba(10,10,10,0.10)', '--line-2': 'rgba(10,10,10,0.18)' },
    dark:  { '--bg': '#0a0a0a', '--bg-elev': '#161616', '--bg-sunk': '#040404',
             '--ink': '#fafafa', '--ink-2': '#cccccc', '--ink-3': '#888888', '--ink-4': '#555555',
             '--accent': '#fafafa', '--accent-soft': '#262626', '--accent-ink': '#0a0a0a',
             '--line': 'rgba(250,250,250,0.10)', '--line-2': 'rgba(250,250,250,0.18)' },
  },
  solar: {
    label: 'Solar',
    light: { '--bg': '#fff8ef', '--bg-elev': '#fffdf6', '--bg-sunk': '#fbf0db',
             '--ink': '#3a1f00', '--ink-2': '#5d3812', '--ink-3': '#8a5d2e', '--ink-4': '#b58a5c',
             '--accent': 'oklch(0.72 0.18 30)', '--accent-soft': 'oklch(0.93 0.05 30)', '--accent-ink': '#fff',
             '--line': 'rgba(58,31,0,0.10)', '--line-2': 'rgba(58,31,0,0.18)' },
    dark:  { '--bg': '#1d130a', '--bg-elev': '#291c10', '--bg-sunk': '#120b06',
             '--ink': '#fff8ef', '--ink-2': '#dbc9b1', '--ink-3': '#a78a6a', '--ink-4': '#74553c',
             '--accent': 'oklch(0.78 0.18 30)', '--accent-soft': 'oklch(0.32 0.10 30)', '--accent-ink': '#1d130a',
             '--line': 'rgba(255,248,239,0.10)', '--line-2': 'rgba(255,248,239,0.18)' },
  },
};

const THEME_KEYS = Object.keys(THEMES);

const DEVICES = {
  desktop: { label: 'Desktop' },
  mobile:  { label: 'Mobile'  },
  ios:     { label: 'iOS'     },
};

// ════════════════════════════════════════════════════════════════════════
// Shell styles
// ════════════════════════════════════════════════════════════════════════

const SHELL_CSS = `
.ws-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-sunk);
  color: var(--ink);
  font-family: var(--sans);
}
.ws-topbar, .ws-bottombar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--bg-elev);
  border-bottom: 1px solid var(--line);
  gap: 10px;
  z-index: 10;
  flex-wrap: wrap;
}
.ws-bottombar {
  border-bottom: none;
  border-top: 1px solid var(--line);
  position: sticky;
  bottom: 0;
  padding: 12px 18px;
}
.ws-bottombar-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}
.ws-summary {
  width: 100%;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink-2);
  font-style: italic;
  margin-top: 4px;
  padding-left: 2px;
  line-height: 1.45;
}
.ws-brand {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-3);
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
.ws-brand-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent);
}
.ws-pills-group {
  display: flex; gap: 4px;
  background: var(--bg-sunk);
  padding: 3px;
  border-radius: var(--r);
  border: 1px solid var(--line);
}
.ws-pill {
  appearance: none; border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.ws-pill:hover { color: var(--ink); }
.ws-pill.active {
  background: var(--accent);
  color: var(--accent-ink);
}
.ws-pills-group.subdued .ws-pill.active {
  background: var(--ink);
  color: var(--bg);
}
.ws-spacer { flex: 1 1 auto; }
.ws-controls-right { display: flex; gap: 8px; align-items: center; flex: 0 0 auto; }
.ws-toggle {
  appearance: none; border: 1px solid var(--line);
  background: var(--bg);
  width: 32px; height: 30px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--ink-2);
  transition: background 0.15s, color 0.15s;
}
.ws-toggle:hover { color: var(--ink); background: var(--bg-elev); }
.ws-toggle.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.ws-theme-select {
  appearance: none;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  padding: 6px 26px 6px 10px;
  border-radius: 7px;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position: calc(100% - 14px) calc(50% - 1px), calc(100% - 9px) calc(50% - 1px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}
.ws-stage {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  background: var(--bg-sunk);
}
.ws-frame {
  border-radius: var(--r-xl);
  border: 1px solid var(--line);
  overflow: hidden;
  background: var(--bg);
  box-shadow: 0 16px 60px rgba(0,0,0,0.10);
  transition: opacity 0.2s ease;
  flex: 0 0 auto;
}
/* Desktop sizes — chat is wrapped in a BrowserChrome to look like a desktop window */
.ws-frame.desktop.chat { width: min(720px, 100%); height: min(880px, calc(100vh - 200px)); }
.ws-frame.desktop.wide { width: min(1280px, 100%); min-height: 720px; max-height: calc(100vh - 200px); overflow: auto; }
.ws-frame.desktop.free { padding: 0; max-width: min(1100px, 100%); min-height: 560px; height: auto; }
/* Mobile sizes — true phone proportions */
.ws-frame.mobile.chat { width: 375px; height: 812px; }
.ws-frame.mobile.wide { width: 393px; height: 852px; overflow: auto; }
.ws-frame.mobile.free { width: 393px; max-height: 852px; overflow: auto; }
.ws-frame.ios { background: transparent; border: none; box-shadow: none; }
.ws-step-label {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--ink-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
  min-width: 0;
}
.ws-step-counter {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-3);
  letter-spacing: 0.05em;
  margin: 0 8px;
  flex: 0 0 auto;
}
.ws-progress {
  display: flex;
  gap: 3px;
  align-items: center;
  flex: 0 0 auto;
  max-width: 50%;
  overflow: hidden;
}
.ws-progress-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--line-2);
  transition: background 0.15s, transform 0.15s;
}
.ws-progress-dot.active { background: var(--accent); transform: scale(1.8); }
.ws-progress-dot.passed { background: var(--ink-4); }
.ws-nav { display: flex; gap: 6px; flex: 0 0 auto; }
.ws-nav-btn {
  appearance: none; border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink);
  padding: 6px 12px;
  border-radius: 7px;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex; align-items: center; gap: 4px;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.ws-nav-btn:hover { background: var(--bg-elev); }
.ws-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ws-nav-btn.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.ws-nav-btn.primary:hover { filter: brightness(1.05); }
.ws-shortcuts {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--ink-4);
  text-transform: uppercase;
  flex: 0 0 auto;
}
.ws-root.present .ws-topbar,
.ws-root.present .ws-bottombar { display: none; }
.ws-root.present .ws-stage { padding: 0; }
@media (max-width: 1024px) {
  .ws-shortcuts { display: none; }
}
@media (max-width: 900px) {
  .ws-progress { display: none; }
}
@media (max-width: 900px) {
  .ws-frame.desktop.chat { width: 95vw; max-width: 720px; height: 75vh; }
}
@media (max-width: 600px) {
  .ws-frame.desktop.chat, .ws-frame.mobile.chat { width: 95vw; max-width: 380px; height: 70vh; }
}
`;

function injectShellStyles() {
  if (document.getElementById('ws-shell-styles')) return;
  const style = document.createElement('style');
  style.id = 'ws-shell-styles';
  style.textContent = SHELL_CSS;
  document.head.appendChild(style);
}

function applyTheme(themeKey, dark) {
  const theme = THEMES[themeKey] || THEMES.warm;
  return dark ? theme.dark : theme.light;
}

// ════════════════════════════════════════════════════════════════════════
// PrototypeShell
// ════════════════════════════════════════════════════════════════════════

function PrototypeShell() {
  const [flowKey, setFlowKey]   = React.useState('claude');
  const [step, setStep]         = React.useState(0);
  const [device, setDevice]     = React.useState('desktop');
  const [themeKey, setThemeKey] = React.useState('warm');
  const [dark, setDark]         = React.useState(false);
  const [present, setPresent]   = React.useState(false);

  React.useEffect(() => {
    injectTokens();
    injectShellStyles();
    document.body.style.background = 'var(--bg-sunk)';
    document.body.style.margin = '0';
    return () => { document.body.style.background = ''; };
  }, []);

  const flow = FLOW_DEFS[flowKey];
  const steps = flow.steps;
  const current = steps[step];

  // C2: stable tweaks reference — only changes when `dark` flips.
  const tweaks = React.useMemo(() => ({
    dark,
    geoState: 'granted',
    refinementState: 'before',
    returnTrip: true,
    confirmVariant: 'ticket',
    displayMode: 'inline',
    errorState: 'none',
    paymentState: 'auto',
    acpRegion: 'supported',
    acpAccount: 'default',
  }), [dark]);

  const next = React.useCallback(() => setStep((s) => Math.min(s + 1, steps.length - 1)), [steps.length]);
  const prev = React.useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const switchFlow = React.useCallback((k) => { setFlowKey(k); setStep(0); }, []);
  const cycleTheme = React.useCallback(() => {
    setThemeKey((k) => {
      const idx = THEME_KEYS.indexOf(k);
      return THEME_KEYS[(idx + 1) % THEME_KEYS.length];
    });
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.target.isContentEditable) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === '1') { switchFlow('claude'); }
      else if (e.key === '2') { switchFlow('chatgpt'); }
      else if (e.key === '3') { switchFlow('omio'); }
      else if (e.key === 'q' || e.key === 'Q') { setDevice('desktop'); }
      else if (e.key === 'w' || e.key === 'W') { setDevice('mobile'); }
      else if (e.key === 'e' || e.key === 'E') { setDevice('ios'); }
      else if (e.key === 't' || e.key === 'T') { cycleTheme(); }
      else if (e.key === 'd' || e.key === 'D') { setDark((d) => !d); }
      else if (e.key === 'p' || e.key === 'P') { setPresent((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, switchFlow, cycleTheme]);

  const themeStyle = applyTheme(themeKey, dark);
  const stepContent = current.render(tweaks);

  // Per-flow host for the desktop browser chrome URL field.
  const HOST_BY_FLOW = {
    claude:  'claude.ai/chat/booking',
    chatgpt: 'chatgpt.com/c/omio-trip',
    omio:    'omio.ai',
  };

  let framedContent;
  let frameClass = `ws-frame ${device} ${current.frame}`;
  if (device === 'desktop' && current.frame === 'chat') {
    framedContent = (
      <BrowserChrome host={HOST_BY_FLOW[flowKey] || 'claude.ai'} dark={dark}>
        {stepContent}
      </BrowserChrome>
    );
  } else if (device === 'ios') {
    if (current.frame === 'chat') {
      framedContent = (
        <IOSDevice width={393} height={852} dark={dark}>
          <div style={{ width: '100%', height: '100%', paddingTop: 50, paddingBottom: 34, boxSizing: 'border-box' }}>
            {stepContent}
          </div>
        </IOSDevice>
      );
    } else if (current.frame === 'wide') {
      framedContent = (
        <IOSDevice width={393} height={852} dark={dark}>
          <div style={{ width: '100%', height: '100%', paddingTop: 50, paddingBottom: 34, boxSizing: 'border-box', overflow: 'auto' }}>
            {stepContent}
          </div>
        </IOSDevice>
      );
    } else {
      framedContent = stepContent;
      frameClass = `ws-frame desktop ${current.frame}`;
    }
  } else {
    framedContent = stepContent;
  }

  // C3: include all tweaks-derived knobs so internal orchestrator state
  // resets cleanly when those props differ between adjacent steps.
  const remountKey = [
    flowKey, current.id, device, themeKey, dark ? 'd' : 'l',
    tweaks.errorState, tweaks.displayMode, tweaks.confirmVariant,
  ].join('-');

  // C4: ARIA — connect tabs to the panel that renders the current step.
  const tabId = (k) => `ws-tab-${k}`;
  const panelId = `ws-panel-${flowKey}`;

  return (
    <div
      className={"ws-root ab-root" + (dark ? ' dark' : '') + (present ? ' present' : '')}
      style={themeStyle}
    >
      {/* Top bar */}
      <div className="ws-topbar">
        <div className="ws-brand">
          <span className="ws-brand-dot" />
          AGENTIC · OMIO
        </div>
        <div className="ws-pills-group" role="tablist" aria-label="Flow">
          {Object.entries(FLOW_DEFS).map(([k, f]) => (
            <button key={k} id={tabId(k)} role="tab" aria-selected={k === flowKey}
              aria-controls={panelId}
              className={"ws-pill" + (k === flowKey ? ' active' : '')}
              onClick={() => switchFlow(k)}>
              {f.name}
            </button>
          ))}
        </div>
        <div className="ws-pills-group subdued" role="tablist" aria-label="Device">
          {Object.entries(DEVICES).map(([k, d]) => (
            <button key={k} role="tab" aria-selected={k === device}
              className={"ws-pill" + (k === device ? ' active' : '')}
              onClick={() => setDevice(k)}>
              {d.label}
            </button>
          ))}
        </div>
        <div className="ws-spacer" />
        <span className="ws-shortcuts">← → · 1 2 3 · Q W E · T · D · P</span>
        <div className="ws-controls-right">
          <select
            className="ws-theme-select"
            value={themeKey}
            onChange={(e) => setThemeKey(e.target.value)}
            title="Theme (T)" aria-label="Theme">
            {THEME_KEYS.map((k) => (
              <option key={k} value={k}>{THEMES[k].label}</option>
            ))}
          </select>
          <button className={"ws-toggle" + (dark ? ' on' : '')}
            onClick={() => setDark((d) => !d)} title="Toggle dark mode (D)" aria-label="Toggle dark mode">
            {dark ? <SunGlyph /> : <MoonGlyph />}
          </button>
          <button className={"ws-toggle" + (present ? ' on' : '')}
            onClick={() => setPresent((p) => !p)} title="Toggle present mode (P)" aria-label="Toggle present mode">
            <PresentGlyph />
          </button>
        </div>
      </div>

      {/* Stage — wrapped in role=tabpanel */}
      <div className="ws-stage" role="tabpanel" id={panelId} aria-labelledby={tabId(flowKey)}>
        <div key={remountKey} className={frameClass}>
          {framedContent}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="ws-bottombar">
        <div className="ws-bottombar-row">
          <div className="ws-step-label">{current.label}</div>
          {/* C5: forced wrapper remount on flow switch */}
          <div key={flowKey} className="ws-progress" aria-hidden="true">
            {steps.map((s, i) => (
              <span key={s.id}
                className={"ws-progress-dot" + (i === step ? ' active' : (i < step ? ' passed' : ''))} />
            ))}
          </div>
          <div className="ws-step-counter">
            {(step + 1).toString().padStart(2, '0')} / {steps.length.toString().padStart(2, '0')}
          </div>
          <div className="ws-nav">
            <button className="ws-nav-btn" onClick={prev} disabled={step === 0} aria-label="Previous step">← Prev</button>
            <button className="ws-nav-btn primary" onClick={next} disabled={step === steps.length - 1} aria-label="Next step">Next →</button>
          </div>
        </div>
        <div className="ws-summary">{current.summary}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Glyphs
// ════════════════════════════════════════════════════════════════════════

function MoonGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function PresentGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

window.PrototypeShell = PrototypeShell;
