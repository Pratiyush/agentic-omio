// claude-flow.jsx — Full A1–A14 sequence + widget display modes + error states.
//
// Mental model:
//   • Conversation thread is a vertical scroll of message turns.
//   • The "widget" is a SINGLE inline iframe (one instance) that updates in
//     place — search results → traveler details → payment-pending → resolved.
//   • Display mode (inline / fullscreen / pip) is set on the widget itself.
//   • Refinement state (before/during/after) animates the result list.
//   • Geo state and error state are explicit demo levers.

// ════════════════════════════════════════════════════════════════════════
// ClaudeFlow — orchestrator. Drives stages 0–14 (matching A1–A14 in the spec)
// plus a Tweaks-driven override mode for picking arbitrary states.
// ════════════════════════════════════════════════════════════════════════

const STAGES = {
  A0: 0,
  A1: 1, A2: 2, A3: 3, A4: 4, A5: 5, A6: 6, A7: 7, A8: 8,
  A9: 9, A10: 10, A11: 11, A12: 12, A13: 13, A14: 14,
  A15: 15, A16: 16, A17: 17, A18: 18, A19: 19,
};

function ClaudeFlow({ tweaks, externalConfirm, standalone = true }) {
  // ── Walkthrough/controlled mode: start at any stage by name and skip auto-advance.
  const initialStage = tweaks.startStage && STAGES[tweaks.startStage] !== undefined
    ? STAGES[tweaks.startStage]
    : STAGES.A1;
  const [stage, setStage] = React.useState(initialStage);
  const [picked, setPicked] = React.useState(null);
  const [refining, setRefining] = React.useState(false); // A6 transient
  const threadRef = React.useRef(null);

  // Sync to externally-controlled stage changes (walkthrough Next/Prev)
  React.useEffect(() => {
    if (tweaks.controlled && tweaks.startStage && STAGES[tweaks.startStage] !== undefined) {
      setStage(STAGES[tweaks.startStage]);
    }
  }, [tweaks.controlled, tweaks.startStage]);

  // ── Auto-advance through narration beats so the thread feels alive
  const advance = (next, ms) => {
    const t = setTimeout(() => setStage(next), ms);
    return () => clearTimeout(t);
  };

  React.useEffect(() => {
    if (tweaks.controlled) return; // walkthrough mode: pin to startStage, no auto-advance
    if (stage === STAGES.A0) return advance(STAGES.A1, 1800);
    if (stage === STAGES.A1) return advance(STAGES.A2, 700);
    if (stage === STAGES.A2) return advance(STAGES.A3, 1300); // tool-call pill → widget
    if (stage === STAGES.A3) return advance(STAGES.A4, 900);
    // A4 → wait for user; demo flips to A5/A6 on a click. We auto-progress for the demo.
    if (stage === STAGES.A4) return advance(STAGES.A5, 2200);
    if (stage === STAGES.A5) {
      setRefining(true);
      const t = setTimeout(() => { setRefining(false); setStage(STAGES.A6); }, 1100);
      return () => clearTimeout(t);
    }
    if (stage === STAGES.A6) return advance(STAGES.A7, 1600); // user picks (simulated)
    if (stage === STAGES.A7) return advance(STAGES.A8, 1100);
    // A8 = traveler form (waits for click in real life; we auto-advance demo)
    if (stage === STAGES.A8) return advance(STAGES.A9, 2400);
    if (stage === STAGES.A9) return advance(STAGES.A10, 900);
    // A10 = payment-pending. When linked to mobile (standalone=false), wait for
    // externalConfirm. In standalone demo mode, sequential auto-advance.
    if (stage === STAGES.A10 && standalone) return advance(STAGES.A11, 1800);
    if (stage === STAGES.A11) return advance(STAGES.A12, 900);
    if (stage === STAGES.A12) return advance(STAGES.A13, 900);
    if (stage === STAGES.A13) return advance(STAGES.A14, 1100);
    if (stage === STAGES.A14) return advance(STAGES.A15, 2400);
    if (stage === STAGES.A15) return advance(STAGES.A16, 2200);
    if (stage === STAGES.A16) return advance(STAGES.A17, 2200);
    if (stage === STAGES.A17) return advance(STAGES.A18, 2200);
    if (stage === STAGES.A18) return advance(STAGES.A19, 2200);
  }, [stage, tweaks.controlled, standalone]);

  React.useEffect(() => {
    if (tweaks.controlled) return; // walkthrough mode: ignore external payment confirm
    if (externalConfirm && stage < STAGES.A11) {
      setStage(STAGES.A11);
      const t1 = setTimeout(() => setStage(STAGES.A12), 1200);
      const t2 = setTimeout(() => setStage(STAGES.A13), 2200);
      const t3 = setTimeout(() => setStage(STAGES.A14), 3300);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [externalConfirm, stage, tweaks.controlled]);

  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [stage, refining]);

  const replay = () => { setStage(STAGES.A1); setPicked(null); setRefining(false); };

  // ── Widget state derived from stage (shared between inline / pip / fullscreen)
  const widgetState =
    stage <= STAGES.A2 ? 'searching'
    : stage < STAGES.A8 ? 'results'
    : stage === STAGES.A8 ? 'traveler'
    : stage === STAGES.A9 || stage === STAGES.A10 ? 'pending'
    : 'resolved';

  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      <ChatChrome onReplay={replay} />

      <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 24px', background: 'var(--bg)' }}>
        {/* A0 — onboarding: MCP connector + example chips */}
        {stage === STAGES.A0 && (
          <ClaudeOnboarding onPick={(q) => setStage(STAGES.A1)} />
        )}

        {/* A1 */}
        {stage >= STAGES.A1 && (
        <UserBubble label="A1">Get me to Munich Tuesday morning, back Sunday night. Prefer rail, under €200 round trip.</UserBubble>
        )}

        {/* A2 — pre-search narration with tool-call pill */}
        {stage >= STAGES.A2 && (
          <AssistantBubble label="A2">
            <div className="serif" style={{ fontSize: 16, lineHeight: 1.45, color: 'var(--ink)' }}>
              Pulling rail options for <em>Berlin → Munich</em>, Tue 12 May out, Sun 17 May back. Filtering under €200.
            </div>
            <ToolCallPill name="omio.search_routes" status={stage === STAGES.A2 ? 'running' : 'done'} />
          </AssistantBubble>
        )}

        {/* A3 — the widget itself, inline */}
        {stage >= STAGES.A3 && tweaks.displayMode !== 'pip' && tweaks.displayMode !== 'fullscreen' && (
          <WidgetFrame note="A3 · live MCP App widget">
            <BookingWidget
              state={widgetState} refining={refining} picked={picked}
              onPick={(i) => setPicked(i)} tweaks={tweaks}
            />
          </WidgetFrame>
        )}

        {/* A4 — post-search narration, one question */}
        {stage >= STAGES.A4 && stage < STAGES.A6 && (
          <AssistantBubble label="A4">
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Best value is <b>€168 round trip on ICE</b> — 4h 14m out, 4h 18m back, both direct. Cheapest is €136 on IC but two stops each way. Want me to filter to direct only?
            </div>
          </AssistantBubble>
        )}

        {/* A5 — user refinement */}
        {stage >= STAGES.A5 && <UserBubble label="A5">Direct only please.</UserBubble>}

        {/* A6 — refinement state — widget updates IN PLACE; narration above */}
        {stage >= STAGES.A6 && stage < STAGES.A7 && (
          <AssistantBubble label="A6">
            <ThinkingPill text="Filtering to direct only…" />
            <Annotation>↑ widget above re-flows in place — same iframe instance</Annotation>
          </AssistantBubble>
        )}

        {/* A7 — selection event from widget (no user message) */}
        {stage >= STAGES.A7 && (
          <AssistantBubble label="A7">
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Got it — <b>09:14 ICE 1023</b> outbound, <b>17:12 ICE 1024</b> return. €168 total. I'll need traveler details next.
            </div>
            <Annotation type="event">↑ no user message — widget posted a <code>select</code> event back</Annotation>
          </AssistantBubble>
        )}

        {/* A8 — widget morphs to traveler form (already shown via widgetState) */}
        {stage === STAGES.A8 && (
          <Annotation type="hint">Widget above is now in <b>traveler</b> state — same instance, different surface</Annotation>
        )}

        {/* A9 — payment handoff narration */}
        {stage >= STAGES.A9 && stage < STAGES.A12 && (
          <AssistantBubble label="A9">
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Opening Stripe checkout in a new tab — I'll be here when you're back. <em>Don't close this conversation.</em>
            </div>
          </AssistantBubble>
        )}

        {/* A10 hint */}
        {stage === STAGES.A10 && (
          <Annotation type="hint">Widget above shows <b>payment-pending</b> state with cancel link</Annotation>
        )}

        {/* A11 = interstitial happens in OTHER tab; not rendered here */}

        {/* A12 — webhook-driven confirmation narration */}
        {stage >= STAGES.A12 && (
          <AssistantBubble label="A12">
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Booked. Reference <span className="mono">TRV-9F2A</span>. ICE 1023 from Berlin Hbf at <b>09:14 Tuesday</b>, return Sunday <b>17:12</b>. Tickets sent to <span className="mono">alex@example.com</span>. I added both legs to your calendar and I'll watch for delays.
            </div>
            <Annotation type="event">↑ rendered from webhook · stripe success → omio → tool result</Annotation>
          </AssistantBubble>
        )}

        {/* A13 — confirmation card (NOT inside widget) */}
        {stage >= STAGES.A13 && (
          <AssistantBubble label="A13" silent>
            <ConfirmationCard variant={tweaks.confirmVariant} returnTrip={tweaks.returnTrip} />
          </AssistantBubble>
        )}

        {/* A14 — proactive next steps */}
        {stage >= STAGES.A14 && (
          <AssistantBubble label="A14">
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Want me to find a hotel near Marienplatz for those nights, or check the weather for Tuesday morning?
            </div>
            <NextStepChips />
          </AssistantBubble>
        )}

        {/* ── Trip lifecycle (A15–A19) — same thread, persistent ── */}
        {stage >= STAGES.A15 && (
          <LifecycleDivider label="Monday · 24h before" />
        )}
        {stage >= STAGES.A15 && (
          <AssistantBubble label="A15">
            <LifecycleHeader tone="neutral" text="Heads up · pre-trip" />
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Heads up: your train tomorrow leaves <b>Berlin Hbf at 08:34</b>. Platform usually <b>11–14</b>, confirmed 30 min before.
            </div>
            <Annotation type="event">↑ Proactive — same conversation thread</Annotation>
          </AssistantBubble>
        )}

        {stage >= STAGES.A16 && (
          <LifecycleDivider label="Tuesday · 30 min before" />
        )}
        {stage >= STAGES.A16 && (
          <AssistantBubble label="A16">
            <LifecycleHeader tone="action" text="Time to board" />
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Time to board. <b>Platform 12, ICE 1023.</b> 6 min walk from your hotel.
            </div>
            <BoardingMiniCard />
          </AssistantBubble>
        )}

        {stage >= STAGES.A17 && (
          <LifecycleDivider label="Mid-trip · live update" alert />
        )}
        {stage >= STAGES.A17 && (
          <AssistantBubble label="A17">
            <LifecycleHeader tone="alert" text="Minor delay" />
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Minor delay: arriving <b>München Hbf 12:54</b> instead of 12:48. Onward connection still safe.
            </div>
          </AssistantBubble>
        )}

        {stage >= STAGES.A18 && (
          <LifecycleDivider label="Arrival · Munich" />
        )}
        {stage >= STAGES.A18 && (
          <AssistantBubble label="A18">
            <LifecycleHeader tone="neutral" text="Welcome to Munich" />
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              You're in Munich. Want hotel options near Marienplatz?
            </div>
            <NextStepChips munich />
          </AssistantBubble>
        )}

        {stage >= STAGES.A19 && (
          <LifecycleDivider label="Sunday · post-trip" />
        )}
        {stage >= STAGES.A19 && (
          <AssistantBubble label="A19">
            <LifecycleHeader tone="neutral" text="Trip complete" />
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              Trip complete. Receipt below — <b>€168.00</b>. How was the ride?
            </div>
            <PostTripReceipt />
            <RatingChips />
          </AssistantBubble>
        )}

        <div style={{ height: 12 }} />
      </div>

      {/* Composer */}
      <Composer />

      {/* Picture-in-picture corner — only when displayMode === 'pip' */}
      {tweaks.displayMode === 'pip' && stage >= STAGES.A3 && (
        <div style={{
          position: 'absolute', right: 14, bottom: 88, width: 280,
          borderRadius: 14, border: '1px solid var(--line-2)', background: 'var(--bg-elev)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderBottom: '1px solid var(--line)', gap: 6 }}>
            <Icon name="train" size={11} style={{ color: 'var(--ink-3)' }} />
            <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', flex: 1 }}>BER → MUC · pinned</div>
            <Icon name="close" size={11} style={{ color: 'var(--ink-4)' }} />
          </div>
          <div style={{ maxHeight: 260, overflow: 'hidden' }}>
            <BookingWidget state={widgetState} refining={refining} picked={picked} onPick={setPicked} tweaks={tweaks} compact />
          </div>
        </div>
      )}

      {/* Fullscreen takeover */}
      {tweaks.displayMode === 'fullscreen' && stage >= STAGES.A3 && (
        <FullscreenWidget tweaks={tweaks} state={widgetState} refining={refining} picked={picked} onPick={setPicked} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Chat chrome bits
// ════════════════════════════════════════════════════════════════════════
function ChatChrome({ onReplay }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--line)', background: 'var(--bg-elev)', flexShrink: 0 }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
        <Icon name="sparkle" size={13} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Booking thread</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4 }}>claude · omio mcp</div>
      </div>
      <button onClick={onReplay} style={{
        background: 'transparent', border: '1px solid var(--line-2)', borderRadius: 8,
        padding: '5px 9px', fontSize: 11, color: 'var(--ink-2)', fontWeight: 500,
        fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
      }}>
        <Icon name="refresh" size={11} /> Replay
      </button>
    </div>
  );
}

function Composer() {
  return (
    <div style={{ padding: '10px 18px 16px', borderTop: '1px solid var(--line)', background: 'var(--bg-elev)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--line-2)', borderRadius: 12 }}>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-4)' }}>Reply to Claude…</div>
        <button style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="arrow" size={13} stroke={2.2} />
        </button>
      </div>
    </div>
  );
}

function UserBubble({ children, label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14, position: 'relative' }}>
      {label && <StageBadge label={label} side="right" />}
      <div style={{ maxWidth: '78%', padding: '10px 14px', background: 'var(--ink)', color: 'var(--bg)', borderRadius: 16, borderBottomRightRadius: 4, fontSize: 13.5, lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}

function AssistantBubble({ children, label, silent }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start', position: 'relative' }}>
      {label && <StageBadge label={label} side="left" />}
      {!silent && (
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <TroveMark size={14} color="currentColor" />
        </div>
      )}
      {silent && <div style={{ width: 26, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function StageBadge({ label, side }) {
  return (
    <div className="mono" style={{
      position: 'absolute', top: 0, [side]: -6, transform: side === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
      fontSize: 8, color: 'var(--ink-4)', letterSpacing: 0.5, padding: '2px 4px',
      pointerEvents: 'none',
    }}>{label}</div>
  );
}

function ToolCallPill({ name, status }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 10px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 999, fontSize: 11, color: 'var(--ink-2)', marginTop: 8 }}>
      {status === 'running' ? <DotPulse /> : <Icon name="check" size={10} stroke={2.5} style={{ color: 'var(--pos)' }} />}
      <span className="mono" style={{ letterSpacing: 0.3 }}>{name}</span>
    </div>
  );
}

function ThinkingPill({ text }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 999, fontSize: 12, color: 'var(--ink-2)' }}>
      <DotPulse /> {text}
    </div>
  );
}

function Annotation({ children, type = 'note' }) {
  const c = type === 'event' ? 'var(--accent)' : type === 'hint' ? 'var(--ink-3)' : 'var(--ink-4)';
  return (
    <div className="mono" style={{ fontSize: 9.5, color: c, letterSpacing: 0.4, marginTop: 6, textTransform: 'uppercase' }}>{children}</div>
  );
}

function DotPulse() {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      <style>{`@keyframes ab-pulse { 0%,80%,100% { opacity: 0.3 } 40% { opacity: 1 } }`}</style>
      {[0,1,2].map(i => (
        <span key={i} style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--accent)', animation: `ab-pulse 1.2s ${i*0.15}s infinite` }} />
      ))}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Widget frame — visual treatment that says "iframe / live MCP App".
// ════════════════════════════════════════════════════════════════════════
function WidgetFrame({ children, note, fixed }) {
  return (
    <div style={{ marginLeft: 36, marginBottom: 14, position: 'relative' }}>
      <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.5, padding: '0 0 4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }} />
        {note}
      </div>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line-2)', background: 'var(--bg-elev)', boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 4px 20px rgba(0,0,0,0.04)' }}>
        {children}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// BookingWidget — the live MCP App, four states: searching | results |
// traveler | pending | resolved. Same instance updates in place.
// ════════════════════════════════════════════════════════════════════════

const RAIL_PAIRS = [
  { id: 0, tag: 'Best value', out: { op: 'ICE 1023', from: '09:14', to: '13:28', dur: '4h 14m', stops: 0, p: 89 }, ret: { op: 'ICE 1024', from: '17:12', to: '21:30', dur: '4h 18m', stops: 0, p: 79 } },
  { id: 1, tag: 'Fastest',    out: { op: 'ICE 587',  from: '09:04', to: '13:02', dur: '3h 58m', stops: 0, p: 119 }, ret: { op: 'ICE 588',  from: '19:04', to: '22:58', dur: '3h 54m', stops: 0, p: 109 } },
  { id: 2, tag: 'Cheapest',   out: { op: 'IC 2271',  from: '10:34', to: '15:20', dur: '4h 46m', stops: 1, p: 72 }, ret: { op: 'IC 2272',  from: '15:34', to: '20:20', dur: '4h 46m', stops: 1, p: 64 } },
];

function BookingWidget({ state, refining, picked, onPick, tweaks, compact }) {
  // Error state hijacks rendering
  if (tweaks.errorState && tweaks.errorState !== 'none') {
    return <ErrorWidget kind={tweaks.errorState} />;
  }
  if (state === 'searching') return <SearchingWidget />;
  if (state === 'traveler') return <TravelerWidget tweaks={tweaks} />;
  if (state === 'pending')   return <PendingWidget />;
  return <ResultsWidget refining={refining} picked={picked} onPick={onPick} tweaks={tweaks} compact={compact} />;
}

function ResultsWidget({ refining, picked, onPick, tweaks, compact }) {
  const directOnly = tweaks.refinementState === 'after';
  const items = directOnly ? RAIL_PAIRS.filter(p => p.out.stops === 0 && p.ret.stops === 0) : RAIL_PAIRS;
  const isRefining = refining || tweaks.refinementState === 'during';

  return (
    <div>
      <WidgetHeader />
      <GeoChip state={tweaks.geoState} />

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px 10px', overflowX: 'auto' }}>
        <FilterChip label="Best value" selected />
        <FilterChip label="Fastest" />
        <FilterChip label="Cheapest" />
        <FilterChip label="Direct only" selected={directOnly} />
      </div>

      {/* paired result list */}
      <div style={{ position: 'relative', minHeight: 60 }}>
        {isRefining && <RefiningOverlay />}
        {items.map((it, i) => (
          <PairedResult key={it.id} it={it} returnTrip={tweaks.returnTrip} selected={picked === i}
            onClick={() => onPick(i)} compact={compact}
            staggered={tweaks.refinementState === 'after'} idx={i} />
        ))}
      </div>

      {/* footer */}
      {!compact && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--ink-3)' }}>
          <span>Showing {items.length} of {directOnly ? 8 : 24}</span>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          <a style={{ color: 'var(--ink-2)', cursor: 'pointer' }}>Expand to see all</a>
          <div style={{ flex: 1 }} />
          <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
            <ExpandIcon /> Open fullscreen
          </button>
        </div>
      )}
    </div>
  );
}

function WidgetHeader() {
  return (
    <div style={{ padding: '11px 14px 9px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line)' }}>
      <Icon name="train" size={13} style={{ color: 'var(--ink-2)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1 }}>Berlin Hbf → München Hbf</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.3, marginTop: 1, textTransform: 'uppercase' }}>TUE 12 → SUN 17 · 1 ADULT</div>
      </div>
      <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', padding: 4, cursor: 'pointer' }}>
        <PencilIcon />
      </button>
    </div>
  );
}

function GeoChip({ state }) {
  if (state === 'denied') {
    return (
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', background: 'var(--bg-sunk)' }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Where are you starting from?</div>
        <input placeholder="Enter origin city or station" style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', color: 'var(--ink)' }} />
      </div>
    );
  }
  if (state === 'asking') {
    return (
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="pin" size={13} style={{ color: 'var(--ink-3)' }} />
        <div style={{ flex: 1, fontSize: 11.5, color: 'var(--ink-2)' }}>Use your location?</div>
        <button style={{ padding: '4px 10px', background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Allow</button>
        <button style={{ padding: '4px 8px', background: 'transparent', color: 'var(--ink-3)', border: 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Different city</button>
      </div>
    );
  }
  // granted
  return (
    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon name="pin" size={11} style={{ color: 'var(--accent)' }} />
      <span style={{ fontSize: 11, color: 'var(--ink-2)' }}>From your location · Berlin Hbf</span>
      <a style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 'auto', cursor: 'pointer' }}>change</a>
    </div>
  );
}

function FilterChip({ label, selected }) {
  return (
    <div style={{
      padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500,
      background: selected ? 'var(--ink)' : 'var(--bg-elev)',
      color: selected ? 'var(--bg)' : 'var(--ink-2)',
      border: selected ? '1px solid var(--ink)' : '1px solid var(--line-2)',
      whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
      transition: 'background .2s, color .2s',
    }}>{label}</div>
  );
}

function RefiningOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(1px)', zIndex: 5, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 30, pointerEvents: 'none' }}>
      <div style={{ padding: '6px 12px', borderRadius: 999, background: 'var(--ink)', color: 'var(--bg)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 7 }}>
        <DotPulse /> Re-running search…
      </div>
    </div>
  );
}

function PairedResult({ it, returnTrip, selected, onClick, compact, staggered, idx }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', padding: compact ? '8px 12px' : '11px 14px',
      background: selected ? 'var(--accent-soft)' : 'transparent',
      border: 'none', borderTop: idx > 0 ? '1px solid var(--line)' : 'none',
      cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', display: 'block',
      animation: staggered ? `ab-stagger 0.3s ${idx * 0.06}s both` : undefined,
    }}>
      <style>{`@keyframes ab-stagger { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }`}</style>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
        <span className="mono" style={{ fontSize: 8.5, color: 'var(--accent)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>{it.tag}</span>
        <div style={{ flex: 1 }} />
        <span className="num" style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: -0.2 }}>€{it.out.p + (returnTrip ? it.ret.p : 0)}</span>
      </div>
      <Leg leg={it.out} dir="Out" />
      {returnTrip && <Leg leg={it.ret} dir="Ret" />}
    </button>
  );
}

function Leg({ leg, dir }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
      <div className="mono" style={{ fontSize: 8.5, color: 'var(--ink-3)', letterSpacing: 0.4, width: 22, textTransform: 'uppercase' }}>{dir}</div>
      <div className="num" style={{ fontSize: 13, fontWeight: 500 }}>{leg.from}</div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>──</div>
      <div className="num" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{leg.to}</div>
      <div style={{ flex: 1 }} />
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{leg.op} · {leg.dur}{leg.stops > 0 ? ` · ${leg.stops} stop` : ''}</div>
    </div>
  );
}

function SearchingWidget() {
  return (
    <div>
      <WidgetHeader />
      <div style={{ padding: 14 }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <DotPulse /> Searching omio
        </div>
        {[0,1,2].map(i => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
            <div style={{ height: 10, width: 60, borderRadius: 4, background: 'var(--bg-sunk)' }} />
            <div style={{ height: 12, width: 100, borderRadius: 4, background: 'var(--bg-sunk)' }} />
            <div style={{ flex: 1 }} />
            <div style={{ height: 12, width: 36, borderRadius: 4, background: 'var(--bg-sunk)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TravelerWidget({ tweaks }) {
  return (
    <div>
      <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Traveler details · adult 1</div>
      </div>
      <div style={{ padding: 14 }}>
        <FormRow label="Full name" value="Alex Mendoza" />
        <FormRow label="Email" value="alex@example.com" />
        <FormRow label="Date of birth" value="14 Mar 1991" />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}><FormRow label="Seat preference" value="Window · Quiet zone" select /></div>
        </div>
        <button style={{ width: '100%', height: 38, marginTop: 10, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Icon name="lock" size={12} stroke={2} /> Continue to payment
        </button>
        <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.4, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
          BOOKING CREATES A GUEST OMIO ACCOUNT TIED TO YOUR EMAIL —<br/>INVISIBLE, LETS YOU MANAGE TRIPS LATER
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, value, select }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: 0.5, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
      <div style={{ height: 32, padding: '0 10px', display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--line-2)', borderRadius: 7, fontSize: 12.5, color: 'var(--ink)', position: 'relative' }}>
        {value}
        {select && <Icon name="chevronDown" size={11} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />}
      </div>
    </div>
  );
}

function PendingWidget() {
  return (
    <div>
      <WidgetHeader />
      <div style={{ padding: 22, textAlign: 'center' }}>
        <ClockSpin />
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 12 }}>Complete payment in the new tab…</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>I'll update this when Stripe confirms.</div>
        <a style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 10, display: 'inline-block', cursor: 'pointer', textDecoration: 'underline' }}>Cancel and return</a>
      </div>
    </div>
  );
}

function ClockSpin() {
  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <style>{`@keyframes ab-spin { to { transform: rotate(360deg); } }`}</style>
      <svg width="32" height="32" viewBox="0 0 32 32" style={{ animation: 'ab-spin 1.6s linear infinite' }}>
        <circle cx="16" cy="16" r="13" fill="none" stroke="var(--line-2)" strokeWidth="2" />
        <circle cx="16" cy="16" r="13" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeDasharray="20 100" />
      </svg>
    </div>
  );
}

// ── Error variants ─────────────────────────────────────────────────────
function ErrorWidget({ kind }) {
  const cfgs = {
    empty:        { title: 'No direct trains under €200', body: "Closest is €204 with one change.", actions: ['Expand budget', 'Include connections'] },
    geoDenied:    { title: 'Where are you starting from?', body: 'Location not available.', actions: ['Use Berlin Hbf', 'Type a city'] },
    cancelled:    { title: 'Payment cancelled', body: 'No charge made — you can try again or pick a different journey.', actions: ['Try again', 'Pick different'] },
    failed:       { title: 'Card declined — bank wants verification', body: 'Try a different card, or your bank may have blocked the charge.', actions: ['Different card', 'Retry'] },
    expired:      { title: 'Prices may have changed since we searched', body: 'Last search was 2h ago. Want me to refresh?', actions: ['Refresh prices', 'Use last quote'] },
    disruption:   { title: 'Heads up — your 09:14 ICE is delayed 35 min', body: 'You can stay on it, or rebook to the 10:30 ICE for free.', actions: ['Stay on it', 'Rebook 10:30'] },
  };
  const c = cfgs[kind] || cfgs.empty;
  return (
    <div>
      <WidgetHeader />
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="info" size={13} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.45 }}>{c.body}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {c.actions.map((a, i) => (
            <button key={i} style={{
              padding: '6px 11px', borderRadius: 7, fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              background: i === 0 ? 'var(--ink)' : 'var(--bg-elev)',
              color: i === 0 ? 'var(--bg)' : 'var(--ink-2)',
              border: i === 0 ? '1px solid var(--ink)' : '1px solid var(--line-2)',
            }}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Fullscreen takeover (B2)
// ════════════════════════════════════════════════════════════════════════
function FullscreenWidget({ tweaks, state, refining, picked, onPick }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-elev)' }}>
        <Icon name="train" size={14} style={{ color: 'var(--ink-2)' }} />
        <div style={{ fontSize: 13, fontWeight: 600 }}>Berlin Hbf → München Hbf</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>FULLSCREEN · 24 OPTIONS</div>
        <div style={{ flex: 1 }} />
        <select style={{ fontSize: 11, padding: '4px 8px', border: '1px solid var(--line-2)', borderRadius: 6, background: 'var(--bg)', fontFamily: 'inherit', color: 'var(--ink-2)' }}>
          <option>Best value</option><option>Fastest</option><option>Cheapest</option><option>Earliest</option><option>Latest</option>
        </select>
        <button style={{ background: 'transparent', border: '1px solid var(--line-2)', borderRadius: 7, padding: '4px 9px', fontSize: 11, fontFamily: 'inherit', color: 'var(--ink-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="close" size={11} /> Close
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Filter sidebar */}
        <div style={{ width: 180, borderRight: '1px solid var(--line)', padding: '12px 14px', overflowY: 'auto', background: 'var(--bg-elev)' }}>
          <FacetGroup label="Operator" items={['Deutsche Bahn', 'ÖBB', 'FlixTrain']} />
          <FacetGroup label="Max changes" items={['Direct', '1 change', '2+']} />
          <FacetGroup label="Time window" items={['Morning', 'Afternoon', 'Evening']} />
          <div className="mono" style={{ fontSize: 9, letterSpacing: 0.5, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 6, marginTop: 12 }}>Price</div>
          <input type="range" min="50" max="300" defaultValue="200" style={{ width: '100%' }} />
          <div className="num mono" style={{ fontSize: 10, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>€50</span><span>€200</span><span>€300</span>
          </div>
        </div>

        {/* Result list (denser) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {RAIL_PAIRS.concat(RAIL_PAIRS).concat(RAIL_PAIRS.slice(0,2)).map((it, i) => (
            <PairedResult key={i} it={it} returnTrip={tweaks.returnTrip} selected={picked === i} onClick={() => onPick(i)} idx={i} />
          ))}
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{ padding: '10px 18px', borderTop: '1px solid var(--line)', background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Selected · ICE 1023 + ICE 1024</div>
        <div style={{ flex: 1 }} />
        <div className="num" style={{ fontSize: 16, fontWeight: 600 }}>€168</div>
        <button style={{ height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Continue</button>
      </div>
    </div>
  );
}

function FacetGroup({ label, items }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: 0.5, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {items.map((x, i) => (
        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, padding: '3px 0', color: 'var(--ink-2)' }}>
          <input type="checkbox" defaultChecked={i === 0} style={{ accentColor: 'var(--accent)' }} /> {x}
        </label>
      ))}
    </div>
  );
}

// Tiny inline icons ───────────────
function PencilIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
}
function ExpandIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>;
}

// ════════════════════════════════════════════════════════════════════════
// Confirmation card variants (A13) — kept from previous
// ════════════════════════════════════════════════════════════════════════
function ConfirmationCard({ variant = 'ticket', returnTrip }) {
  if (variant === 'ticket') return <ConfirmTicket returnTrip={returnTrip} />;
  if (variant === 'timeline') return <ConfirmTimeline returnTrip={returnTrip} />;
  return <ConfirmReceipt returnTrip={returnTrip} />;
}

function ConfirmTicket({ returnTrip }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--bg-elev)' }}>
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px dashed var(--line-2)' }}>
        <Icon name="check" size={13} stroke={2.5} style={{ color: 'var(--pos)' }} />
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>Confirmed</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginLeft: 'auto' }}>TRV-9F2A</div>
      </div>
      <Band when="Tue 12 May" dir="Outbound" from="08:34" fromName="Berlin Hbf" to="12:48" toName="München Hbf" train="ICE 1023 · COACH 24 · SEAT 35A" />
      {returnTrip && <Band when="Sun 17 May" dir="Return" from="17:12" fromName="München Hbf" to="21:30" toName="Berlin Hbf" train="ICE 1024 · COACH 12 · SEAT 18C" border />}
      <div style={{ padding: '8px 14px', background: 'var(--bg-sunk)', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--line)' }}>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Total paid</div>
          <div className="num" style={{ fontSize: 14.5, fontWeight: 600 }}>€{returnTrip ? 168 : 89}</div>
        </div>
        <button style={{ padding: '6px 11px', background: 'transparent', border: '1px solid var(--line-2)', borderRadius: 7, fontSize: 11.5, fontWeight: 500, cursor: 'pointer', color: 'var(--ink-2)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="ticket" size={11} /> View tickets
        </button>
      </div>
    </div>
  );
}

function Band({ when, dir, from, fromName, to, toName, train, border }) {
  return (
    <div style={{ padding: '10px 14px', borderTop: border ? '1px dashed var(--line-2)' : 'none' }}>
      <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{dir} · {when}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <div>
          <div className="num" style={{ fontSize: 19, fontWeight: 600, lineHeight: 1, letterSpacing: -0.3 }}>{from}</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{fromName}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
          <Icon name="train" size={11} style={{ color: 'var(--ink-3)' }} />
          <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontSize: 19, fontWeight: 600, lineHeight: 1, letterSpacing: -0.3 }}>{to}</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{toName}</div>
        </div>
      </div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 5, letterSpacing: 0.3 }}>{train}</div>
    </div>
  );
}

function ConfirmTimeline({ returnTrip }) {
  const items = [
    { date: 'Tue 12 May', from: '08:34 Berlin Hbf', to: '12:48 München Hbf', train: 'ICE 1023', dur: '4h 14m' },
    ...(returnTrip ? [{ date: 'Sun 17 May', from: '17:12 München Hbf', to: '21:30 Berlin Hbf', train: 'ICE 1024', dur: '4h 18m' }] : []),
  ];
  return (
    <div style={{ borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg-elev)', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: 'var(--pos)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon name="check" size={11} stroke={3} /></div>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>Trip confirmed</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>TRV-9F2A</div>
      </div>
      <div style={{ position: 'relative', paddingLeft: 7 }}>
        <div style={{ position: 'absolute', left: 10, top: 5, bottom: 5, width: 1, background: 'var(--line-2)' }} />
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i === items.length - 1 ? 0 : 12, position: 'relative' }}>
            <div style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--accent)', marginTop: 5, flexShrink: 0, marginLeft: -1, zIndex: 1, boxShadow: '0 0 0 3px var(--bg-elev)' }} />
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{it.date}</div>
              <div style={{ fontSize: 12.5, marginTop: 2 }}>{it.from}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>↓ {it.train} · {it.dur}</div>
              <div style={{ fontSize: 12.5 }}>{it.to}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '8px 11px', background: 'var(--bg-sunk)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <Icon name="card" size={12} style={{ color: 'var(--ink-3)' }} />
        <div className="num" style={{ flex: 1, fontWeight: 600 }}>€{returnTrip ? 168 : 89} paid</div>
        <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 9.5 }}>•••• 4242</div>
      </div>
    </div>
  );
}

function ConfirmReceipt({ returnTrip }) {
  const rows = [
    { l: 'Outbound · ICE 1023', r: '€89.00' },
    ...(returnTrip ? [{ l: 'Return · ICE 1024', r: '€79.00' }] : []),
    { l: 'Booking fee', r: '€0.00' },
  ];
  return (
    <div style={{ borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg-elev)', padding: '12px 14px', fontFamily: 'var(--mono)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>RECEIPT</div>
        <div style={{ flex: 1, borderBottom: '1px dashed var(--line-2)', marginBottom: 2 }} />
        <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>TRV-9F2A</div>
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', fontSize: 11.5, padding: '3px 0', color: 'var(--ink-2)' }}>
          <div style={{ flex: 1 }}>{row.l}</div>
          <div className="num">{row.r}</div>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 6, paddingTop: 6, display: 'flex', fontSize: 12.5, fontWeight: 600 }}>
        <div style={{ flex: 1 }}>TOTAL</div>
        <div className="num">€{returnTrip ? '168.00' : '89.00'}</div>
      </div>
    </div>
  );
}

function NextStepChips({ munich }) {
  const chips = munich ? [
    { icon: 'home', label: 'Hotels near Marienplatz' },
    { icon: 'pin', label: 'How to get there' },
    { icon: 'sun', label: 'Weather' },
  ] : [
    { icon: 'home', label: 'Hotels' },
    { icon: 'sun', label: 'Weather' },
    { icon: 'pin', label: 'Directions to Berlin Hbf' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
      {chips.map((c, i) => (
        <button key={i} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 500, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit' }}>
          <Icon name={c.icon} size={11} /> {c.label}
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// A0 · Onboarding — MCP connector + example chips
// ════════════════════════════════════════════════════════════════════════
function ClaudeOnboarding({ onPick }) {
  const examples = [
    'Berlin → Munich tomorrow',
    'Cheapest weekend in Lisbon',
    'I need to be in Paris by Friday morning',
  ];
  return (
    <div style={{ padding: '20px 4px 8px' }}>
      {/* MCP connector card */}
      <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--ink)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>o</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Omio</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 7px', borderRadius: 999, background: 'oklch(0.95 0.06 155)', color: 'var(--pos)', fontSize: 9.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }} className="mono">
              <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--pos)' }} /> Connected
            </div>
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, marginTop: 2, textTransform: 'uppercase' }}>MCP · trains · buses · flights · ferries</div>
        </div>
        <button style={{ background: 'transparent', border: '1px solid var(--line-2)', borderRadius: 7, padding: '4px 9px', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'inherit', cursor: 'pointer' }}>Manage</button>
      </div>

      <div className="serif" style={{ fontSize: 22, lineHeight: 1.2, letterSpacing: -0.3, marginTop: 18, color: 'var(--ink)' }}>
        Ask Claude to plan a trip.
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>
        I'll search 800+ operators across 37 countries, pair return legs, and book through Stripe. Try one of these:
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        {examples.map((q, i) => (
          <button key={i} onClick={() => onPick(q)} style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px',
            background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 10,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            fontSize: 13, color: 'var(--ink-2)',
          }}>
            <Icon name="sparkle" size={11} style={{ color: 'var(--accent)' }} />
            <span style={{ flex: 1 }}>{q}</span>
            <Icon name="arrow" size={11} style={{ color: 'var(--ink-4)' }} />
          </button>
        ))}
      </div>

      <Annotation type="hint">First-time discovery · A0 · auto-advances to A1</Annotation>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Lifecycle (A15–A19) helpers
// ════════════════════════════════════════════════════════════════════════
function LifecycleDivider({ label, alert }) {
  const c = alert ? 'oklch(0.55 0.16 25)' : 'var(--ink-4)';
  const line = alert ? 'oklch(0.85 0.08 25)' : 'var(--line)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
      <div style={{ flex: 1, height: 1, background: line }} />
      <div className="mono" style={{ fontSize: 9, color: c, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: line }} />
    </div>
  );
}

function LifecycleHeader({ tone, text }) {
  const colors = {
    alert: { bg: 'oklch(0.95 0.05 25)', fg: 'oklch(0.55 0.16 25)' },
    action: { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
    neutral: { bg: 'var(--bg-sunk)', fg: 'var(--ink-3)' },
  }[tone] || { bg: 'var(--bg-sunk)', fg: 'var(--ink-3)' };
  return (
    <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, background: colors.bg, color: colors.fg, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: colors.fg }} /> {text}
    </div>
  );
}

function BoardingMiniCard() {
  return (
    <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>12</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Platform 12 · ICE 1023</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.3 }}>BERLIN HBF · DEP 08:34 · 6 MIN WALK</div>
      </div>
      <Icon name="train" size={14} style={{ color: 'var(--ink-3)' }} />
    </div>
  );
}

function PostTripReceipt() {
  return (
    <div style={{ marginTop: 10, padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>RECEIPT</div>
        <div style={{ flex: 1, borderBottom: '1px dashed var(--line-2)' }} />
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>TRV-9F2A</div>
      </div>
      {[
        ['Berlin → München · ICE 1023', '€89.00'],
        ['München → Berlin · ICE 1024', '€79.00'],
      ].map((r, i) => (
        <div key={i} style={{ display: 'flex', fontSize: 11.5, padding: '2px 0', color: 'var(--ink-2)' }}>
          <div style={{ flex: 1 }}>{r[0]}</div>
          <div className="num">{r[1]}</div>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 6, paddingTop: 6, display: 'flex', fontSize: 12.5, fontWeight: 600 }}>
        <div style={{ flex: 1 }}>Paid</div>
        <div className="num">€168.00</div>
      </div>
    </div>
  );
}

function RatingChips() {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
      {['👍 Great', '😐 OK', '👎 Issues'].map(c => (
        <button key={c} style={{ padding: '6px 11px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', fontSize: 11.5, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit' }}>{c}</button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Voice mode — pre-A1 entry point
// ════════════════════════════════════════════════════════════════════════
function ClaudeVoice({ tweaks, onConfirm }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setT(x => x + 1), 60);
    return () => clearInterval(id);
  }, []);
  const bars = Array.from({ length: 28 }, (_, i) => {
    const v = Math.sin((t * 0.18) + i * 0.4) * 0.5 + 0.5;
    return 12 + v * Math.sin(i * 0.5 + t * 0.05) * 26 + 14;
  });
  return (
    <div className={"ab-root" + (tweaks?.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <ChatChrome onReplay={() => {}} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 24 }}>
        <div>
          <LifecycleHeader tone="action" text="● Listening" />
          <div className="serif" style={{ fontSize: 24, lineHeight: 1.2, letterSpacing: -0.3, color: 'var(--ink)', marginTop: 4 }}>
            "Berlin to Munich tomorrow afternoon<span style={{ borderBottom: '2px solid var(--accent)' }}>, back Sunday</span>
            <span style={{ opacity: 0.4 }}> night…"</span>
          </div>
          <Annotation type="hint">Live transcription · A0-voice · pre-A1</Annotation>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 80, margin: '20px 0' }}>
          {bars.map((h, i) => (
            <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: 'var(--accent)', opacity: 0.4 + (Math.abs(i - 14) < 7 ? 0.6 : 0.2) }} />
          ))}
        </div>

        {/* Transcript confirm card */}
        <div style={{ padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12, marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>I heard</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5 }}>
            "Berlin → Munich tomorrow afternoon, back Sunday night, prefer rail."
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button onClick={onConfirm} style={{ padding: '7px 14px', background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="check" size={11} stroke={2.5} /> Send to Claude
            </button>
            <button style={{ padding: '7px 11px', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--line-2)', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button>
          </div>
        </div>

        {/* Mic controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <button style={{ width: 44, height: 44, borderRadius: 22, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
            <Icon name="close" size={15} />
          </button>
          <button style={{ width: 60, height: 60, borderRadius: 30, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px var(--accent-soft)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8"/></svg>
          </button>
          <div style={{ width: 44 }} />
        </div>
      </div>
    </div>
  );
}

function NextStepChipsLegacy() { return null; }

// Onboarding wrapped in chat chrome (for A0 standalone artboard)
function ClaudeOnboardingFrame({ tweaks }) {
  return (
    <div className={"ab-root" + (tweaks?.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <ChatChrome onReplay={() => {}} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 22px 24px' }}>
        <ClaudeOnboarding onPick={() => {}} />
      </div>
      <Composer />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Returning guest checkout (was "v2 claim account") — relabeled per spec
// ════════════════════════════════════════════════════════════════════════
function ClaimAccountPrompt() {
  return (
    <div className="ab-root" style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bookmark" size={14} />
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Returning guest checkout</div>
        </div>
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: -0.3 }}>Welcome back, Alex.<br/>Want to claim your trips?</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.5 }}>
          We found <b>3 past bookings</b> tied to alex@example.com. Set a password and we'll link them — saved travelers, history, alerts.
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {['Berlin → München','Lisbon → Porto','Paris → Amsterdam'].map((t, i) => (
            <div key={i} style={{ padding: '7px 11px', background: 'var(--bg-sunk)', borderRadius: 7, fontSize: 11.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name="ticket" size={10} style={{ color: 'var(--ink-3)' }} />
              <span style={{ flex: 1 }}>{t}</span>
              <span className="mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>TRV-{['9F2A','7C4D','3B11'][i]}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 16 }}>
          <button style={{ flex: 1, height: 40, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Claim — set password</button>
          <button style={{ height: 40, padding: '0 14px', background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line-2)', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Not now</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ClaudeFlow, ClaimAccountPrompt, ConfirmationCard, BookingWidget,
  WidgetFrame, ErrorWidget, FullscreenWidget,
  ClaudeVoice, ClaudeOnboarding, ClaudeOnboardingFrame,
  // shared with chatgpt-flow.jsx
  UserBubble, StageBadge, ThinkingPill, DotPulse, Annotation,
  SearchingWidget, ClockSpin, FormRow,
});
