// chatgpt-flow.jsx — ChatGPT thread with ACP inline payment.
//
// Key difference from Claude: payment happens INSIDE the widget. No tab
// switch, no webhook round trip, no returning interstitial. The widget
// transitions: results → traveler → method-pick → SCA → processing →
// success — all the same iframe instance.
//
// Voice: clipped, less editorial than Claude.
// Chrome: "Powered by Omio" attribution, "App" badge, ACP disclosure footer.

const G_STAGES = {
  A1: 1, A2: 2, A3: 3, A4: 4, A5: 5, A6: 6, A7: 7, A8: 8, A9: 9,
  // ACP payment states (inside widget)
  PAY_METHOD: 10, PAY_SCA: 11, PAY_PROC: 12, PAY_DONE: 13,
  // Lifecycle / proactive
  LIFE: 14,
};

function ChatGPTFlow({ tweaks }) {
  // ── Walkthrough/controlled mode: start at any stage by name and skip auto-advance.
  const initialStage = tweaks.startStage && G_STAGES[tweaks.startStage] !== undefined
    ? G_STAGES[tweaks.startStage]
    : G_STAGES.A1;
  const [stage, setStage] = React.useState(initialStage);
  const threadRef = React.useRef(null);

  // Sync to externally-controlled stage changes (walkthrough Next/Prev)
  React.useEffect(() => {
    if (tweaks.controlled && tweaks.startStage && G_STAGES[tweaks.startStage] !== undefined) {
      setStage(G_STAGES[tweaks.startStage]);
    }
  }, [tweaks.controlled, tweaks.startStage]);

  React.useEffect(() => {
    if (tweaks.controlled) return; // walkthrough mode: pin to startStage, no auto-advance
    const advance = (next, ms) => setTimeout(() => setStage(next), ms);
    let t;
    if (stage === G_STAGES.A1) t = advance(G_STAGES.A2, 600);
    else if (stage === G_STAGES.A2) t = advance(G_STAGES.A3, 1200);
    else if (stage === G_STAGES.A3) t = advance(G_STAGES.A4, 800);
    else if (stage === G_STAGES.A4) t = advance(G_STAGES.A5, 2000);
    else if (stage === G_STAGES.A5) t = advance(G_STAGES.A6, 900);
    else if (stage === G_STAGES.A6) t = advance(G_STAGES.A7, 1300);
    else if (stage === G_STAGES.A7) t = advance(G_STAGES.A8, 1000);
    else if (stage === G_STAGES.A8) t = advance(G_STAGES.A9, 2200);
    else if (stage === G_STAGES.A9) t = advance(G_STAGES.PAY_METHOD, 1100);
    else if (stage === G_STAGES.PAY_METHOD) t = advance(G_STAGES.PAY_SCA, 2400);
    else if (stage === G_STAGES.PAY_SCA) t = advance(G_STAGES.PAY_PROC, 2400);
    else if (stage === G_STAGES.PAY_PROC) t = advance(G_STAGES.PAY_DONE, 2400);
    else if (stage === G_STAGES.PAY_DONE) t = advance(G_STAGES.LIFE, 2200);
    return () => clearTimeout(t);
  }, [stage, tweaks.controlled]);

  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [stage]);

  // Allow tweaks to lock widget into a specific payment state for showcase
  const forcedPay = tweaks.paymentState && tweaks.paymentState !== 'auto' ? tweaks.paymentState : null;

  // Widget state derived from stage + forced override
  let widgetState;
  if (forcedPay) widgetState = forcedPay;
  else if (stage <= G_STAGES.A2) widgetState = 'searching';
  else if (stage < G_STAGES.A8) widgetState = 'results';
  else if (stage === G_STAGES.A8) widgetState = 'traveler';
  else if (stage === G_STAGES.A9 || stage === G_STAGES.PAY_METHOD) widgetState = 'method';
  else if (stage === G_STAGES.PAY_SCA) widgetState = 'sca';
  else if (stage === G_STAGES.PAY_PROC) widgetState = 'processing';
  else widgetState = 'success';

  const replay = () => setStage(G_STAGES.A1);

  // ACP-not-supported region: render the fallback path instead
  if (tweaks.acpRegion === 'unsupported') {
    return <ACPRegionFallback tweaks={tweaks} replay={replay} />;
  }

  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <GPTChrome onReplay={replay} />

      <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px', background: 'var(--bg)' }}>
        <UserBubble label="A1">Get me to Munich Tuesday morning, back Sunday night. Prefer rail, under €200 round trip.</UserBubble>

        {stage >= G_STAGES.A2 && (
          <GPTBubble label="A2">
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>Searching Omio for Berlin → Munich, 12 May out / 17 May back, under €200.</div>
            <GPTToolPill name="Using Omio app" running={stage === G_STAGES.A2} />
          </GPTBubble>
        )}

        {stage >= G_STAGES.A3 && (
          <WidgetFrame note="A3 · CHATGPT APPS SDK · INLINE">
            <GPTWidget state={widgetState} tweaks={tweaks} />
          </WidgetFrame>
        )}

        {stage >= G_STAGES.A4 && stage < G_STAGES.A6 && (
          <GPTBubble label="A4">
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>€168 round trip on ICE is the best balance — both legs direct. Cheapest is €136 but adds two stops each way. Want direct only?</div>
          </GPTBubble>
        )}

        {stage >= G_STAGES.A5 && <UserBubble label="A5">Direct only.</UserBubble>}

        {stage >= G_STAGES.A6 && stage < G_STAGES.A7 && (
          <GPTBubble label="A6"><ThinkingPill text="Filtering…" /></GPTBubble>
        )}

        {stage >= G_STAGES.A7 && (
          <GPTBubble label="A7">
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>Locked in 09:14 outbound, 17:12 return, €168 total. Continuing to traveler details.</div>
          </GPTBubble>
        )}

        {stage >= G_STAGES.A9 && stage < G_STAGES.PAY_DONE && (
          <GPTBubble label="A9">
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>Ready to pay. <b>€168.00 total</b> — taking payment now, no new tab needed.</div>
            <Annotation type="event">↑ ACP · payment runs IN-WIDGET · conversation never breaks</Annotation>
          </GPTBubble>
        )}

        {stage >= G_STAGES.PAY_DONE && (
          <GPTBubble label="B4">
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>Booked. Reference <span className="mono">TRV-9F2A</span>. ICE 1023 Tuesday <b>09:14</b>, return Sunday <b>17:12</b>. Tickets sent to <span className="mono">alex@example.com</span>.</div>
          </GPTBubble>
        )}

        {stage >= G_STAGES.LIFE && (
          <>
            <GPTBubble label="D2" attribution>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>Adding both legs to your calendar.</div>
              <CalendarCard />
            </GPTBubble>

            <ProactiveDivider label="LATER · 24h before trip" />
            <GPTBubble label="D3" attribution proactive>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>Heads up: your train tomorrow leaves <b>Berlin Hbf at 08:34</b>. Check-in opens at 08:14.</div>
            </GPTBubble>

            <ProactiveDivider label="DAY OF · 30 min before" />
            <GPTBubble label="D4" attribution proactive>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>Time to board. <b>Platform 12, ICE 1023.</b> 12 min walk from your location.</div>
              <GPTBoardingMini />
            </GPTBubble>

            <ProactiveDivider label="MID-TRIP · live update" alert />
            <GPTBubble label="D5" attribution proactive alert>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>Minor delay: arriving <b>München Hbf 12:54</b> instead of 12:48. Onward connection still safe.</div>
            </GPTBubble>

            <ProactiveDivider label="ARRIVAL · Munich" />
            <GPTBubble label="D6" attribution proactive>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>You're in Munich. Want hotel options near Marienplatz?</div>
              <GPTNextChips items={['Hotels near Marienplatz', 'How to get there', 'Weather']} />
            </GPTBubble>

            <ProactiveDivider label="POST-TRIP · Sunday night" />
            <GPTBubble label="D7" attribution proactive>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>Trip complete. Receipt below — <b>€168.00</b>. How was the ride?</div>
              <GPTReceiptMini />
              <GPTRatingChips />
            </GPTBubble>
          </>
        )}

        <div style={{ height: 12 }} />
      </div>

      <GPTComposer />
    </div>
  );
}

// ── Chrome ─────────────────────────────────────────────────────────────
function GPTChrome({ onReplay }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--line)', background: 'var(--bg-elev)', flexShrink: 0 }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
        ◌
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>ChatGPT · @omio</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4 }}>apps sdk · acp payments</div>
      </div>
      <button onClick={onReplay} style={{
        background: 'transparent', border: '1px solid var(--line-2)', borderRadius: 8,
        padding: '5px 9px', fontSize: 11, color: 'var(--ink-2)', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
      }}>
        <Icon name="refresh" size={11} /> Replay
      </button>
    </div>
  );
}

function GPTComposer() {
  return (
    <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--line)', background: 'var(--bg-elev)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--line-2)', borderRadius: 22 }}>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-4)' }}>Message ChatGPT · @ to call apps</div>
        <button style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: '#000', color: '#fff', cursor: 'pointer' }}>↑</button>
      </div>
    </div>
  );
}

function GPTBubble({ children, label, attribution, proactive, alert }) {
  const dotBg = alert ? 'oklch(0.95 0.06 25)' : (proactive ? 'var(--accent-soft)' : '#000');
  const dotFg = alert ? 'oklch(0.55 0.18 25)' : (proactive ? 'var(--accent)' : '#fff');
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start', position: 'relative' }}>
      {label && <StageBadge label={label} side="left" />}
      <div style={{ width: 26, height: 26, borderRadius: 13, background: dotBg, color: dotFg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 12, fontWeight: 700 }}>
        {alert ? '!' : (proactive ? '@' : '◌')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {attribution && <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 3 }}>FROM @OMIO APP</div>}
        {children}
      </div>
    </div>
  );
}

function GPTToolPill({ name, running }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', background: 'var(--bg-sunk)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 11, color: 'var(--ink-2)', marginTop: 6 }}>
      {running ? <DotPulse /> : <Icon name="check" size={9} stroke={2.5} style={{ color: 'var(--pos)' }} />}
      <span>{name}</span>
    </div>
  );
}

function ProactiveDivider({ label, alert }) {
  const c = alert ? 'oklch(0.55 0.18 25)' : 'var(--ink-4)';
  const line = alert ? 'oklch(0.85 0.08 25)' : 'var(--line)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
      <div style={{ flex: 1, height: 1, background: line }} />
      <div className="mono" style={{ fontSize: 9, color: c, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: line }} />
    </div>
  );
}

function CalendarCard() {
  return (
    <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--bg-sunk)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="calendar" size={15} style={{ color: 'var(--ink-2)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>2 events added</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>Tue 12 May · Sun 17 May</div>
      </div>
      <Icon name="check" size={13} stroke={2.5} style={{ color: 'var(--pos)' }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// GPTWidget — wraps shared booking widget but switches to ACP payment
// surfaces (method / sca / processing / success) instead of pending+webhook.
// ════════════════════════════════════════════════════════════════════════
function GPTWidget({ state, tweaks }) {
  if (state === 'searching') return <WithGPTAttribution><SearchingWidget /></WithGPTAttribution>;
  if (state === 'results' || state === 'traveler') {
    return (
      <WithGPTAttribution>
        {state === 'results'
          ? <BookingWidget state="results" refining={false} picked={null} onPick={() => {}} tweaks={tweaks} />
          : <BookingWidget state="traveler" refining={false} picked={null} onPick={() => {}} tweaks={tweaks} />}
      </WithGPTAttribution>
    );
  }
  if (state === 'method')     return <WithGPTAttribution><PaymentMethodPicker tweaks={tweaks} /></WithGPTAttribution>;
  if (state === 'sca')        return <WithGPTAttribution><SCAChallenge /></WithGPTAttribution>;
  if (state === 'processing') return <WithGPTAttribution><ACPProcessing /></WithGPTAttribution>;
  if (state === 'success')    return <WithGPTAttribution><ACPSuccess tweaks={tweaks} /></WithGPTAttribution>;
  if (state === 'fail')       return <WithGPTAttribution><PaymentFail /></WithGPTAttribution>;
  return null;
}

// ChatGPT-required attribution wrapper — "Powered by Omio" + App badge.
function WithGPTAttribution({ children }) {
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 6px', background: '#000', color: '#fff', borderRadius: 4, fontSize: 8.5, fontWeight: 600, letterSpacing: 0.6, zIndex: 4 }} className="mono">APP</div>
        {children}
      </div>
      <div style={{ padding: '6px 12px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-sunk)' }}>
        <div className="mono" style={{ fontSize: 8.5, color: 'var(--ink-4)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Powered by</div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: -0.2 }}>omio</div>
        <div style={{ flex: 1 }} />
        <div className="mono" style={{ fontSize: 8.5, color: 'var(--ink-4)', letterSpacing: 0.4, textTransform: 'uppercase' }}>v1.2 · openai apps</div>
      </div>
    </div>
  );
}

// ── B1: Payment method picker ─────────────────────────────────────────
function PaymentMethodPicker({ tweaks }) {
  const noMethods = tweaks.acpAccount === 'no-payment';
  const [picked, setPicked] = React.useState('apple');
  return (
    <div>
      <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Pay €168.00 to Omio</div>
      </div>
      {noMethods ? (
        <AddCardElements />
      ) : (
        <div style={{ padding: 12 }}>
          <PMOption icon="apple" label="Apple Pay" sub="Touch ID" picked={picked === 'apple'} onClick={() => setPicked('apple')} />
          <PMOption icon="visa" label="•••• 4242" sub="Visa · exp 06/27" picked={picked === 'visa'} onClick={() => setPicked('visa')} />
          <PMOption icon="plus" label="Add new card" sub="" picked={picked === 'new'} onClick={() => setPicked('new')} />
          <button style={{ width: '100%', height: 38, marginTop: 6, background: '#000', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Icon name="lock" size={11} stroke={2} /> Pay €168.00
          </button>
          <div className="mono" style={{ fontSize: 8.5, color: 'var(--ink-4)', letterSpacing: 0.4, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
            STRIPE · ACP · OMIO MERCHANT OF RECORD
          </div>
        </div>
      )}
    </div>
  );
}

function PMOption({ icon, label, sub, picked, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 11px',
      background: picked ? 'var(--accent-soft)' : 'var(--bg)',
      border: picked ? '1px solid var(--accent)' : '1px solid var(--line-2)',
      borderRadius: 8, cursor: 'pointer', marginBottom: 6, fontFamily: 'inherit', color: 'inherit', textAlign: 'left',
    }}>
      <div style={{ width: 18, height: 18, borderRadius: 9, border: picked ? '5px solid var(--accent)' : '1.5px solid var(--line-2)', flexShrink: 0 }} />
      <PMIcon kind={icon} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</div>
        {sub && <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{sub}</div>}
      </div>
    </button>
  );
}

function PMIcon({ kind }) {
  if (kind === 'apple') return <div style={{ width: 26, height: 18, borderRadius: 4, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}></div>;
  if (kind === 'visa')  return <div className="mono" style={{ width: 26, height: 18, borderRadius: 4, background: '#1a1f71', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>VISA</div>;
  return <div style={{ width: 26, height: 18, borderRadius: 4, background: 'var(--bg-sunk)', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={11} /></div>;
}

function AddCardElements() {
  return (
    <div style={{ padding: 12 }}>
      <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>No payment method on file</div>
      <FormRow label="Card number" value="•••• •••• •••• 4242" />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}><FormRow label="Expiry" value="06 / 27" /></div>
        <div style={{ flex: 1 }}><FormRow label="CVC" value="•••" /></div>
      </div>
      <button style={{ width: '100%', height: 36, marginTop: 6, background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save & Pay €168.00</button>
      <div className="mono" style={{ fontSize: 8.5, color: 'var(--ink-4)', textAlign: 'center', marginTop: 8 }}>STRIPE ELEMENTS · IN-WIDGET</div>
    </div>
  );
}

// ── B2: SCA / 3DS challenge ───────────────────────────────────────────
function SCAChallenge() {
  return (
    <div>
      <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Verify with your bank</div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 10, lineHeight: 1.45 }}>
          Your bank sent a code to <b>••• ••• 4521</b>. Enter it below:
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
          {[3, 9, 7, 1, 4].map((d, i) => (
            <div key={i} className="num" style={{ width: 36, height: 44, borderRadius: 7, border: i < 3 ? '1.5px solid var(--accent)' : '1.5px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: i < 3 ? 'var(--ink)' : 'var(--ink-4)', background: 'var(--bg)' }}>
              {i < 3 ? d : '_'}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', fontSize: 11.5 }}>
          <a style={{ color: 'var(--ink-2)', cursor: 'pointer' }}>Resend</a>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          <a style={{ color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</a>
        </div>
        <div className="mono" style={{ fontSize: 8.5, color: 'var(--ink-4)', textAlign: 'center', marginTop: 12, letterSpacing: 0.4 }}>3DS · INLINE · NO REDIRECT</div>
      </div>
    </div>
  );
}

// ── B3: Processing ────────────────────────────────────────────────────
function ACPProcessing() {
  return (
    <div>
      <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Processing payment…</div>
      </div>
      <div style={{ padding: 22, textAlign: 'center' }}>
        <ClockSpin />
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 12 }}>Stripe is confirming with your bank.</div>
        <div className="mono" style={{ fontSize: 8.5, color: 'var(--ink-4)', marginTop: 4, letterSpacing: 0.4 }}>WIDGET LOCKED · ~3S</div>
      </div>
    </div>
  );
}

// ── B4: Success — widget transforms into confirmation ─────────────────
function ACPSuccess({ tweaks }) {
  return (
    <div>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid var(--line)', background: 'oklch(0.97 0.05 155)' }}>
        <Icon name="check" size={13} stroke={2.5} style={{ color: 'var(--pos)' }} />
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>Paid €168.00 · Confirmed</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginLeft: 'auto' }}>TRV-9F2A</div>
      </div>
      <div style={{ padding: '0 0 0 0' }}>
        <ConfirmationCard variant={tweaks.confirmVariant || 'ticket'} returnTrip={tweaks.returnTrip !== false} />
      </div>
    </div>
  );
}

// ── B5: Failure ───────────────────────────────────────────────────────
function PaymentFail() {
  return (
    <div>
      <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Payment failed</div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'oklch(0.94 0.07 25)', color: 'oklch(0.5 0.18 25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="close" size={13} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Card declined</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.45 }}>
              Your bank declined this charge. Try another card or check with your bank.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button style={{ flex: 1, padding: '7px 11px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', background: '#000', color: '#fff', border: 'none' }}>Try another card</button>
          <button style={{ padding: '7px 11px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--bg-elev)', color: 'var(--ink-2)', border: '1px solid var(--line-2)' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// ACP fallback (E1) — region without ACP support
// ════════════════════════════════════════════════════════════════════════
function ACPRegionFallback({ tweaks, replay }) {
  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GPTChrome onReplay={replay} />
      <div style={{ padding: 20, flex: 1 }}>
        <UserBubble label="A1">Get me to Munich Tuesday morning, back Sunday night.</UserBubble>
        <GPTBubble label="E1">
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>Inline payment isn't available in your region yet — opening Stripe checkout in a new tab.</div>
          <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-elev)', border: '1px dashed var(--line-2)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
            <Icon name="card" size={12} style={{ color: 'var(--ink-3)' }} />
            <span style={{ flex: 1, color: 'var(--ink-2)' }}>Falling back to Stripe Checkout (Claude-style)</span>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: 0.4, textTransform: 'uppercase' }}>↗ NEW TAB</span>
          </div>
          <Annotation>↑ ACP is rolling out · expect wider support over time</Annotation>
        </GPTBubble>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Comparison frame (overview)
// ════════════════════════════════════════════════════════════════════════
function ClaudeVsGPTCompare() {
  const claudeSteps = [
    { l: 'Search', t: 'in chat' },
    { l: 'Select', t: 'in widget' },
    { l: 'Traveler', t: 'in widget' },
    { l: 'Stripe Checkout', t: 'NEW TAB', alert: true },
    { l: 'Returning', t: 'interstitial', alert: true },
    { l: 'Webhook', t: 'background' },
    { l: 'Confirmation', t: 'in chat' },
  ];
  const gptSteps = [
    { l: 'Search', t: 'in chat' },
    { l: 'Select', t: 'in widget' },
    { l: 'Traveler', t: 'in widget' },
    { l: 'Method', t: 'in widget' },
    { l: 'SCA', t: 'in widget' },
    { l: 'Confirmation', t: 'in widget' },
  ];
  return (
    <div className="ab-root" style={{ width: '100%', height: '100%', padding: 24, background: 'var(--bg)', overflowY: 'auto' }}>
      <div className="serif" style={{ fontSize: 28, lineHeight: 1.05, letterSpacing: -0.5, marginBottom: 4 }}>Two surfaces, two payment models</div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 600, marginBottom: 24 }}>
        Claude breaks the conversation to charge a card. ChatGPT charges inside the widget. Same booking, fundamentally different UX cost.
      </div>

      <CompareRow title="Claude" subtitle="MCP · Stripe Checkout · webhook return" steps={claudeSteps} accent="var(--ink)" />
      <div style={{ height: 18 }} />
      <CompareRow title="ChatGPT" subtitle="Apps SDK · ACP · Shared Payment Token" steps={gptSteps} accent="var(--accent)" />

      <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Stat n="1" label="tab switch" sub="Claude" />
        <Stat n="0" label="tab switches" sub="ChatGPT" highlight />
        <Stat n="~3" label="context shifts" sub="Claude" />
        <Stat n="0" label="context shifts" sub="ChatGPT" highlight />
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.4, marginTop: 12, textTransform: 'uppercase' }}>
        Cost of zero shifts: 4% openai platform fee on each booking
      </div>
    </div>
  );
}

function CompareRow({ title, subtitle, steps, accent }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: accent }}>{title}</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 4, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{
              padding: '8px 11px', borderRadius: 8,
              background: s.alert ? 'oklch(0.95 0.06 60)' : 'var(--bg-elev)',
              border: s.alert ? '1px solid oklch(0.7 0.14 60)' : '1px solid var(--line-2)',
              minWidth: 100,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{s.l}</div>
              <div className="mono" style={{ fontSize: 9, color: s.alert ? 'oklch(0.45 0.12 60)' : 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 }}>{s.t}</div>
            </div>
            {i < steps.length - 1 && <div style={{ alignSelf: 'center', color: 'var(--ink-4)', fontSize: 13 }}>→</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Stat({ n, label, sub, highlight }) {
  return (
    <div>
      <div className="num" style={{ fontSize: 32, fontWeight: 600, letterSpacing: -1, color: highlight ? 'var(--accent)' : 'var(--ink)' }}>{n}</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: -2 }}>{label}</div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 1 }}>{sub}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// @-mention autocomplete (C4)
// ════════════════════════════════════════════════════════════════════════
function MentionAutocomplete() {
  return (
    <div className="ab-root" style={{ width: '100%', height: '100%', padding: 20, background: 'var(--bg)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ marginBottom: 8, padding: 8, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.5, textTransform: 'uppercase', padding: '2px 6px 6px' }}>Apps · 4 matches</div>
        {[
          { name: 'omio', tag: 'Trains, buses, flights', selected: true },
          { name: 'maps', tag: 'Routing, places' },
          { name: 'weather', tag: 'Forecasts' },
          { name: 'calendar', tag: 'Schedule' },
        ].map((a, i) => (
          <div key={i} style={{
            padding: '8px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
            background: a.selected ? 'var(--accent-soft)' : 'transparent', cursor: 'pointer',
          }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: a.selected ? 'var(--accent)' : 'var(--bg-sunk)', color: a.selected ? 'var(--accent-ink)' : 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>@</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>@{a.name}</div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{a.tag}</div>
            </div>
            {a.selected && <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.4 }}>↵</div>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 22 }}>
        <div style={{ fontSize: 13, color: 'var(--ink)' }}>
          <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '1px 4px', borderRadius: 3, fontWeight: 600 }}>@omio</span>
          <span style={{ color: 'var(--ink-2)' }}>&nbsp;find me a train to Munich…</span>
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ width: 26, height: 26, borderRadius: 13, border: 'none', background: '#000', color: '#fff', cursor: 'pointer' }}>↑</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// ACP edge cases (E2/E3/E4) — single artboard
// ════════════════════════════════════════════════════════════════════════
function ACPEdgeCases() {
  return (
    <div className="ab-root" style={{ width: '100%', height: '100%', padding: 20, background: 'var(--bg)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, overflowY: 'auto' }}>
      <EdgeCard label="E2 · No payment method linked"
        body="First-time ACP — collect card via Stripe Elements inside the iframe."
        cta="Add card →" />
      <EdgeCard label="E3 · ChatGPT signed-out / unsupported tier"
        body="ACP requires US Plus / Pro / Free with linked account."
        cta="Sign in to ChatGPT →" />
      <EdgeCard label="E4 · Refund initiation"
        body='User says "cancel that Munich trip" — inline confirm, ACP reverse SPT, money flows back to original method.'
        cta="Confirm refund →" />
    </div>
  );
}

function EdgeCard({ label, body, cta }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: 0.5, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ padding: 14, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--bg-elev)' }}>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 12 }}>{body}</div>
        <button style={{ padding: '7px 11px', background: '#000', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{cta}</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Lifecycle mini-cards
// ════════════════════════════════════════════════════════════════════════
function GPTBoardingMini() {
  return (
    <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>12</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Platform 12 · ICE 1023</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.3 }}>BERLIN HBF · DEP 08:34 · 12 MIN WALK</div>
      </div>
      <Icon name="train" size={14} style={{ color: 'var(--ink-3)' }} />
    </div>
  );
}

function GPTNextChips({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
      {items.map((c, i) => (
        <button key={i} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', fontSize: 11.5, fontWeight: 500, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit' }}>{c}</button>
      ))}
    </div>
  );
}

function GPTReceiptMini() {
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
        <div style={{ flex: 1 }}>Paid via ACP</div>
        <div className="num">€168.00</div>
      </div>
    </div>
  );
}

function GPTRatingChips() {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
      {['👍 Great', '😐 OK', '👎 Issues'].map(c => (
        <button key={c} style={{ padding: '6px 11px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', fontSize: 11.5, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit' }}>{c}</button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// GPTVoice — clipped, utilitarian voice modal (less editorial than Claude)
// ════════════════════════════════════════════════════════════════════════
function GPTVoice({ tweaks, onConfirm }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setT(x => x + 1), 60);
    return () => clearInterval(id);
  }, []);
  const bars = Array.from({ length: 32 }, (_, i) => {
    const v = Math.sin((t * 0.2) + i * 0.42) * 0.5 + 0.5;
    return 6 + v * Math.sin(i * 0.45 + t * 0.04) * 24 + 12;
  });

  return (
    <div className={"ab-root" + (tweaks?.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <GPTChrome onReplay={() => {}} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 18, gap: 14 }}>
        {/* status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: 'oklch(0.6 0.2 25)', boxShadow: '0 0 0 4px oklch(0.95 0.05 25)' }} />
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-2)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>● Listening · @omio</div>
          <div style={{ flex: 1 }} />
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: 0.4 }}>00:04</div>
        </div>

        {/* live transcription — clipped/utilitarian */}
        <div style={{ padding: '12px 14px', background: 'var(--bg-sunk)', border: '1px solid var(--line)', borderRadius: 10 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Live transcription</div>
          <div style={{ fontSize: 14.5, lineHeight: 1.45, color: 'var(--ink)' }}>
            "Berlin to Munich tomorrow afternoon, back Sunday<span style={{ display: 'inline-block', width: 1, height: 14, background: 'var(--ink)', verticalAlign: 'text-bottom', marginLeft: 1, animation: 'gpt-blink 1s steps(2) infinite' }} />"
            <style>{`@keyframes gpt-blink { 50% { opacity: 0 } }`}</style>
          </div>
        </div>

        {/* waveform */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, height: 56 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: '#000', opacity: 0.3 + (Math.abs(i - 16) < 8 ? 0.5 : 0.1) }} />
          ))}
        </div>

        {/* attribution chip */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', padding: '3px 9px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--accent)' }} /> Powered by Omio
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* parsed query confirm */}
        <div style={{ padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 10 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Parsed</div>
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
            <b>Berlin → Munich</b>, tomorrow PM, return Sunday. Rail.
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button onClick={onConfirm} style={{ padding: '7px 14px', background: '#000', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="check" size={11} stroke={2.5} /> Search
            </button>
            <button style={{ padding: '7px 11px', background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line-2)', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
          </div>
        </div>

        {/* mic dock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, paddingTop: 6 }}>
          <button style={{ width: 40, height: 40, borderRadius: 20, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
            <Icon name="close" size={14} />
          </button>
          <button style={{ width: 56, height: 56, borderRadius: 28, border: 'none', background: '#000', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8"/></svg>
          </button>
          <div style={{ width: 40 }} />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// GPTOnboarding — first-touch via @Omio mention
// ════════════════════════════════════════════════════════════════════════
function GPTOnboarding({ tweaks }) {
  const [step, setStep] = React.useState('typing'); // typing → connected
  React.useEffect(() => {
    const id = setTimeout(() => setStep('connected'), 1800);
    return () => clearTimeout(id);
  }, []);
  const examples = [
    'Berlin → Munich tomorrow',
    'Cheapest weekend in Lisbon',
    'I need to be in Paris by Friday morning',
  ];

  return (
    <div className={"ab-root" + (tweaks?.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <GPTChrome onReplay={() => {}} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 8px' }}>
        {/* contextual blank-state hint */}
        {step === 'typing' && (
          <div style={{ padding: 14, background: 'var(--bg-sunk)', border: '1px dashed var(--line-2)', borderRadius: 10, marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Tip</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>Type <span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>@</span> to call an app from the chat. Try <span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>@omio</span> to plan trips.</div>
          </div>
        )}

        {/* once connected, app badge + suggested prompts */}
        {step === 'connected' && (
          <>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 11px', borderRadius: 999, background: 'oklch(0.95 0.06 155)', border: '1px solid oklch(0.85 0.1 155)', marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: 4, background: 'var(--pos)' }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--pos)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700 }}>App connected · @omio</span>
            </div>

            <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.55, marginBottom: 4 }}>
              <b>@omio</b> is ready. Ask about trains, buses, flights, or ferries — I'll search 800+ operators across 37 countries and book inline with ACP.
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.4, marginBottom: 12, textTransform: 'uppercase' }}>Try a prompt</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {examples.map((q, i) => (
                <button key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px',
                  background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 10,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  fontSize: 13, color: 'var(--ink-2)',
                }}>
                  <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '1px 5px', borderRadius: 3, fontWeight: 600, fontSize: 11 }} className="mono">@omio</span>
                  <span style={{ flex: 1 }}>{q}</span>
                  <Icon name="arrow" size={11} style={{ color: 'var(--ink-4)' }} />
                </button>
              ))}
            </div>
            <Annotation type="hint">First-time discovery · auto-advances to A1 search</Annotation>
          </>
        )}
      </div>

      {/* composer with autocomplete dropdown when typing */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--line)', background: 'var(--bg-elev)', position: 'relative', flexShrink: 0 }}>
        {step === 'typing' && (
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 60, padding: 8, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', zIndex: 10 }}>
            <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.5, textTransform: 'uppercase', padding: '2px 6px 6px' }}>Apps · matches "omi"</div>
            {[
              { name: 'omio', tag: 'Trains, buses, flights, ferries · 800+ operators', selected: true },
              { name: 'omnibox', tag: 'Quick captures' },
            ].map((a, i) => (
              <div key={i} style={{
                padding: '8px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
                background: a.selected ? 'var(--accent-soft)' : 'transparent',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: a.selected ? 'var(--accent)' : 'var(--bg-sunk)', color: a.selected ? 'var(--accent-ink)' : 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                  {a.name === 'omio' ? 'o' : '•'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>@{a.name} {a.name === 'omio' && <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 500 }}>· Book trains, buses, flights, ferries</span>}</div>
                  {a.name !== 'omio' && <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{a.tag}</div>}
                  {a.name === 'omio' && <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 1, letterSpacing: 0.3 }}>{a.tag}</div>}
                </div>
                {a.selected && <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.4 }}>↵</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'var(--bg)', border: '1px solid ' + (step === 'typing' ? 'var(--accent)' : 'var(--line-2)'), borderRadius: 22 }}>
          {step === 'typing' ? (
            <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)' }}>
              <span style={{ background: 'var(--bg-sunk)', color: 'var(--ink-2)', padding: '1px 4px', borderRadius: 3, fontWeight: 600 }}>@Omi</span>
              <span style={{ display: 'inline-block', width: 1, height: 12, background: 'var(--ink)', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'gpt-blink 1s steps(2) infinite' }} />
            </div>
          ) : (
            <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)' }}>
              <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }} className="mono">@omio</span>
              <span style={{ color: 'var(--ink-4)', marginLeft: 6 }}>plan a trip…</span>
            </div>
          )}
          <button style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: '#000', color: '#fff', cursor: 'pointer' }}>↑</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ChatGPTFlow, GPTWidget, PaymentMethodPicker, SCAChallenge, ACPProcessing, ACPSuccess, PaymentFail,
  ClaudeVsGPTCompare, MentionAutocomplete, ACPEdgeCases, ACPRegionFallback,
  GPTVoice, GPTOnboarding,
});
