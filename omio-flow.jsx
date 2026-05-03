// omio-flow.jsx — omio.ai: native AI surface. Hero, streaming conversation,
// native payment sheet, trip lifecycle, advanced features.
//
// Design language is a STEP UP from the host-embedded flows: more editorial,
// generous whitespace, voice-first. Same accent, slightly different chrome.

// ════════════════════════════════════════════════════════════════════════
// A · Home / hero
// ════════════════════════════════════════════════════════════════════════

function OmioHero({ tweaks, mode = 'empty' }) {
  const [placeholder, setPlaceholder] = React.useState(0);
  const placeholders = [
    'Where do you want to go?',
    'I need to be in Munich Tuesday morning…',
    'Cheapest weekend in Lisbon next month?',
  ];
  React.useEffect(() => {
    const t = setInterval(() => setPlaceholder(p => (p + 1) % placeholders.length), 2400);
    return () => clearInterval(t);
  }, []);

  if (mode === 'voice') return <OmioVoice tweaks={tweaks} />;
  if (mode === 'firsttime') return <OmioFirstTime tweaks={tweaks} placeholders={placeholders} />;

  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <OmioTopBar mode={mode} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div className="serif" style={{ fontSize: 48, lineHeight: 1.0, letterSpacing: -1.2, textAlign: 'center', marginBottom: 22, maxWidth: 540 }}>
          {mode === 'returning' ? <>Welcome back,<br/><em style={{ color: 'var(--accent)' }}>Alex.</em></> : <>Tell me where<br/>to go.</>}
        </div>

        {/* Big input */}
        <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--bg-elev)', border: '1.5px solid var(--line-2)', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <Icon name="search" size={16} style={{ color: 'var(--ink-3)' }} />
            <input
              defaultValue=""
              placeholder={placeholders[placeholder]}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 16, color: 'var(--ink)', minWidth: 0 }}
            />
            <button style={{ width: 38, height: 38, borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow" size={15} stroke={2.2} />
            </button>
          </div>
        </div>

        {/* Below-input: voice button + geo + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <button style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)' }}>
            <MicIcon /> Voice
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 999, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', fontSize: 12, color: 'var(--ink-2)' }}>
            <Icon name="pin" size={11} style={{ color: 'var(--accent)' }} /> Berlin
            <a style={{ color: 'var(--ink-3)', marginLeft: 3, cursor: 'pointer' }}>change</a>
          </div>
        </div>

        <div style={{ marginTop: 18, fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center', maxWidth: 440, lineHeight: 1.5 }}>
          I search 800+ operators across 37 countries. Tell me what you need.
        </div>

        {/* Returning state extras */}
        {mode === 'returning' && (
          <div style={{ width: '100%', maxWidth: 560, marginTop: 28 }}>
            {/* Continue with last conversation */}
            <button style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>Continue with Anna — Munich trip</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, marginTop: 1 }}>Last message · 14m ago</div>
              </div>
              <Icon name="chevron" size={13} style={{ color: 'var(--ink-3)' }} />
            </button>
            {/* Frequent routes */}
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', margin: '14px 0 6px' }}>Your frequent routes</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Berlin → Munich','Lisbon → Porto','Amsterdam → Paris'].map(r => (
                <button key={r} style={{ padding: '7px 12px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', fontFamily: 'inherit', fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer' }}>{r}</button>
              ))}
            </div>
            {/* Upcoming trip */}
            <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: 'var(--accent-soft)', border: '1px solid oklch(0.85 0.06 50)' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--accent)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Upcoming · in 3 days</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Berlin Hbf → München Hbf · Tue 09:14</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-2)', marginTop: 2 }}>● ICE 1023 · on time · 14° partly cloudy</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OmioTopBar({ mode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'var(--bg-elev)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--ink)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>o</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: -0.2 }}>omio<span style={{ color: 'var(--accent)' }}>.ai</span></div>
      </div>
      <div style={{ flex: 1 }} />
      {mode === 'returning' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Trips</div>
          <div style={{ width: 26, height: 26, borderRadius: 13, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>A</div>
        </div>
      ) : (
        <button style={{ padding: '5px 11px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'transparent', fontSize: 11.5, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8"/>
    </svg>
  );
}

// ── A3: Voice mode ─────────────────────────────────────────────────────
function OmioVoice({ tweaks }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setT(t => t + 1), 60);
    return () => clearInterval(id);
  }, []);
  const bars = Array.from({ length: 32 }, (_, i) => {
    const v = Math.sin((t * 0.18) + i * 0.4) * 0.5 + 0.5;
    return 14 + v * Math.sin(i * 0.5 + t * 0.05) * 28 + 14;
  });
  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <OmioTopBar mode="returning" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28 }}>
        <div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--accent)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>● Listening</div>
          <div className="serif" style={{ fontSize: 28, lineHeight: 1.15, letterSpacing: -0.5, color: 'var(--ink)' }}>
            "Get me to Munich Tuesday morning, back Sunday<span style={{ borderBottom: '2px solid var(--accent)' }}> night, under</span>
            <span style={{ opacity: 0.4 }}> two hundred…</span>"
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 12 }}>transcript · live</div>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 80, margin: '20px 0' }}>
          {bars.map((h, i) => (
            <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: 'var(--accent)', opacity: 0.4 + (Math.abs(i - 16) < 8 ? 0.6 : 0.2) }} />
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <button style={{ width: 44, height: 44, borderRadius: 22, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
            <Icon name="close" size={15} />
          </button>
          <button style={{ width: 64, height: 64, borderRadius: 32, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px var(--accent-soft)' }}>
            <MicIcon />
          </button>
          <button style={{ width: 44, height: 44, borderRadius: 22, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
            <Icon name="menu" size={15} />
          </button>
        </div>
        <div className="mono" style={{ fontSize: 10, textAlign: 'center', color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 8 }}>Tap mic to send · "Hey Omio" to wake</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// B · Streaming conversation
// ════════════════════════════════════════════════════════════════════════
function OmioConversation({ tweaks }) {
  const [streamed, setStreamed] = React.useState(0); // how many cards visible
  const [refined, setRefined] = React.useState(false);

  React.useEffect(() => {
    if (streamed < 3) {
      const t = setTimeout(() => setStreamed(s => s + 1), 700);
      return () => clearTimeout(t);
    }
    if (!refined) {
      const t = setTimeout(() => setRefined(true), 3000);
      return () => clearTimeout(t);
    }
  }, [streamed, refined]);

  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <OmioTopBar mode="returning" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <UserBubble>Get me to Munich Tuesday morning, back Sunday night. Prefer rail, under €200 round trip.</UserBubble>

        <OmioBubble>
          <div className="serif" style={{ fontSize: 18, lineHeight: 1.35, color: 'var(--ink)' }}>
            Tuesday morning Berlin → Munich, returning Sunday night, under €200. Pulling rail options now.
          </div>
        </OmioBubble>

        {/* Streamed cards */}
        <div style={{ marginLeft: 36, marginBottom: 14 }}>
          {streamed >= 1 && <OmioPairedCard tag="Best value" price={168} co2={22} flightCo2={88} key="a" />}
          {streamed >= 2 && <OmioPairedCard tag="Fastest" price={228} dur="3h 58m / 3h 54m" co2={24} flightCo2={88} key="b" />}
          {streamed >= 3 && <OmioPairedCard tag="Cheapest" price={136} stops={2} co2={26} flightCo2={88} key="c" />}
          {streamed < 3 && (
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.4, padding: '6px 4px', textTransform: 'uppercase' }}>
              <DotPulse /> streaming · {streamed}/3
            </div>
          )}
        </div>

        {streamed >= 3 && (
          <OmioBubble>
            <div className="serif" style={{ fontSize: 17, lineHeight: 1.4, color: 'var(--ink)' }}>
              <b>€168 on ICE is the pick</b> — both legs direct, 4h 14m out, 4h 18m back. The €136 is tempting but adds two stops each way and arrives after midnight Sunday. Want to lock the €168 or see more options?
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button style={{ padding: '7px 13px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Lock €168</button>
              <button style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>See more</button>
              <button style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Direct only</button>
            </div>
          </OmioBubble>
        )}

        {refined && (
          <>
            <UserBubble>Only mornings outbound, and only direct.</UserBubble>
            <OmioBubble>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>Filtering to morning departures, direct only…</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.4, marginTop: 4, textTransform: 'uppercase' }}>↑ same thread, results re-flow above as history</div>
            </OmioBubble>
            <div style={{ marginLeft: 36, marginBottom: 14 }}>
              <OmioPairedCard tag="Best value · still leads" price={168} co2={22} flightCo2={88} highlighted />
            </div>
            <OmioBubble>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>Down to 4 options. Same €168 ICE 1023 still leads. Want to lock it?</div>
            </OmioBubble>
          </>
        )}

        <div style={{ height: 12 }} />
      </div>
      <OmioComposer />
    </div>
  );
}

function OmioBubble({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--ink)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>o</div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function OmioComposer() {
  return (
    <div style={{ padding: '12px 20px 18px', borderTop: '1px solid var(--line)', background: 'var(--bg-elev)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--line-2)', borderRadius: 14 }}>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-4)' }}>Refine, ask anything…</div>
        <button style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: 'var(--bg-sunk)', color: 'var(--ink-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MicIcon />
        </button>
        <button style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer' }}>↑</button>
      </div>
    </div>
  );
}

// ── B2: paired result card ─────────────────────────────────────────────
function OmioPairedCard({ tag, price, dur, stops, co2, flightCo2, highlighted }) {
  return (
    <div style={{
      borderRadius: 14, border: highlighted ? '1.5px solid var(--accent)' : '1px solid var(--line-2)',
      background: 'var(--bg-elev)', marginBottom: 10, overflow: 'hidden',
      animation: 'omio-stream 0.5s both',
    }}>
      <style>{`@keyframes omio-stream { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
      <div style={{ padding: '11px 14px 9px', display: 'flex', alignItems: 'baseline', gap: 8, borderBottom: '1px dashed var(--line)' }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>{tag}</div>
        <div style={{ flex: 1 }} />
        <div className="num" style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>€{price}</div>
      </div>
      <OmioLeg dir="OUT" date="Tue 12 May" from="08:34" fromName="Berlin Hbf" to="12:48" toName="München Hbf" train="ICE 1023" duration="4h 14m" stops={stops || 0} />
      <OmioLeg dir="RET" date="Sun 17 May" from="17:12" fromName="München Hbf" to="21:30" toName="Berlin Hbf" train="ICE 1024" duration="4h 18m" stops={stops || 0} border />
      <div style={{ padding: '10px 14px', background: 'var(--bg-sunk)', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--line)' }}>
        <LeafIcon />
        <div style={{ fontSize: 11.5 }}>
          <span className="num" style={{ fontWeight: 600 }}>CO₂ {co2} kg</span>
          <span style={{ color: 'var(--ink-3)' }}> · vs flight {flightCo2} kg</span>
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 12px', borderRadius: 7, border: highlighted ? 'none' : '1px solid var(--line-2)', background: highlighted ? 'var(--accent)' : 'transparent', color: highlighted ? 'var(--accent-ink)' : 'var(--ink-2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          Select this trip
        </button>
      </div>
    </div>
  );
}

function OmioLeg({ dir, date, from, fromName, to, toName, train, duration, stops, border }) {
  return (
    <div style={{ padding: '10px 14px', borderTop: border ? '1px dashed var(--line)' : 'none' }}>
      <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{dir} · {date}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <div>
          <div className="num" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1, letterSpacing: -0.3 }}>{from}</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{fromName}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
          <Icon name="train" size={11} style={{ color: 'var(--ink-3)' }} />
          <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1, letterSpacing: -0.3 }}>{to}</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{toName}</div>
        </div>
      </div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 5, letterSpacing: 0.3 }}>
        {train} · {duration} · {stops > 0 ? `${stops} stop${stops > 1 ? 's' : ''}` : 'Direct'}
      </div>
    </div>
  );
}

function LeafIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.13 145)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3c-5.5 0-12 1-15 4s-3 11 0 14 11 3 14 0 4-9.5 4-15"/><path d="M3 21l9-9"/>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════
// D · Native payment sheet
// ════════════════════════════════════════════════════════════════════════
function OmioPaymentSheet({ tweaks, state = 'method' }) {
  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Dimmed conversation behind */}
      <div style={{ position: 'absolute', inset: 0, padding: 24, opacity: 0.35, pointerEvents: 'none' }}>
        <UserBubble>Lock the €168 ICE.</UserBubble>
        <OmioBubble><div className="serif" style={{ fontSize: 16, lineHeight: 1.4 }}>Booking for you and Anna, both adults. Window seat for you, aisle for her. Email confirmations to both.</div></OmioBubble>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 16,
        background: 'var(--bg-elev)', borderRadius: 18, boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        overflow: 'hidden', maxHeight: 'calc(100% - 32px)',
      }}>
        {state === 'method' && <OmioPaySheet />}
        {state === 'sca' && <OmioPaySCA />}
        {state === 'success' && <OmioPaySuccess />}
      </div>
    </div>
  );
}

function OmioPaySheet() {
  return (
    <div>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Pay €168.00</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.4, marginTop: 2, textTransform: 'uppercase' }}>Berlin → Munich · Tue 12 / Sun 17</div>
        </div>
        <button style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: 'var(--bg-sunk)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
          <Icon name="close" size={13} />
        </button>
      </div>
      <div style={{ padding: 14 }}>
        <PMOption icon="apple" label="Apple Pay" sub="Touch ID · fastest for you" picked />
        <PMOption icon="visa" label="•••• 4242" sub="Visa · exp 06/27" />
        <KlarnaOption />
        <PMOption icon="link" label="Pay with Link" sub="Stripe · 1-tap" />
        <PMOption icon="plus" label="Add new card" />

        {/* Discount */}
        <div style={{ marginTop: 10, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-sunk)', borderRadius: 8 }}>
          <Icon name="ticket" size={11} style={{ color: 'var(--ink-3)' }} />
          <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-3)' }}>Discount code</div>
          <a style={{ fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer' }}>Add</a>
        </div>

        {/* Breakdown */}
        <div style={{ marginTop: 12, padding: '8px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <RowL l="Tickets" r="€159.00" />
          <RowL l="Booking fee" r="€9.00" />
          <RowL l="Total" r="€168.00" bold />
        </div>

        <button style={{ width: '100%', height: 44, marginTop: 12, background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Icon name="lock" size={12} stroke={2} /> Pay €168.00 with Apple Pay
        </button>
        <div style={{ fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
          By paying you accept Omio's <u>terms</u> and the operator's <u>fare conditions</u>.
        </div>
      </div>
    </div>
  );
}

function KlarnaOption() {
  return (
    <button style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 11px',
      background: 'var(--bg)', border: '1px solid var(--line-2)', borderRadius: 8, cursor: 'pointer',
      marginBottom: 6, fontFamily: 'inherit', color: 'inherit', textAlign: 'left',
    }}>
      <div style={{ width: 18, height: 18, borderRadius: 9, border: '1.5px solid var(--line-2)', flexShrink: 0 }} />
      <div style={{ width: 26, height: 18, borderRadius: 4, background: 'oklch(0.92 0.12 350)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, fontFamily: 'monospace' }}>K</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>Klarna · 3 payments of €56</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>0% interest</div>
      </div>
    </button>
  );
}

function RowL({ l, r, bold }) {
  return (
    <div style={{ display: 'flex', padding: '3px 0', fontSize: bold ? 14 : 12, color: bold ? 'var(--ink)' : 'var(--ink-2)', fontWeight: bold ? 600 : 400 }}>
      <div style={{ flex: 1 }}>{l}</div>
      <div className="num">{r}</div>
    </div>
  );
}

function OmioPaySCA() {
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Verify with your bank</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14 }}>Code sent to ••• ••• 4521</div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, justifyContent: 'center' }}>
        {[3, 9, 7, 1, 4].map((d, i) => (
          <div key={i} className="num" style={{ width: 40, height: 48, borderRadius: 9, border: i < 3 ? '1.5px solid var(--accent)' : '1.5px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: i < 3 ? 'var(--ink)' : 'var(--ink-4)', background: 'var(--bg)' }}>{i < 3 ? d : '_'}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', fontSize: 12 }}>
        <a style={{ color: 'var(--ink-2)', cursor: 'pointer' }}>Resend</a>
        <span style={{ color: 'var(--ink-4)' }}>·</span>
        <a style={{ color: 'var(--ink-3)', cursor: 'pointer' }}>Use different card</a>
      </div>
    </div>
  );
}

function OmioPaySuccess() {
  return (
    <div style={{ padding: '28px 16px 24px', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--pos)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon name="check" size={20} stroke={2.8} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Booked.</div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 }}>TRV-9F2A</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>Tickets in your inbox · returning to thread…</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// E · Confirmation card (persistent in conversation)
// F · Trip lifecycle
// ════════════════════════════════════════════════════════════════════════
function OmioLifecycle({ tweaks }) {
  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <OmioTopBar mode="returning" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
        {/* E1 confirmation card */}
        <OmioBubble>
          <div className="serif" style={{ fontSize: 16, lineHeight: 1.4 }}>Booked. Tickets are in your inbox and saved here. I'll watch for delays and ping you 30 min before each leg.</div>
          <OmioConfirmCard />
        </OmioBubble>

        <LifeDivider label="Tomorrow · 24h before" />
        <OmioBubble>
          <NewBadge />
          <div className="serif" style={{ fontSize: 15.5, lineHeight: 1.4, marginTop: 4 }}>
            Your Munich trip is tomorrow. ICE 1023 from Berlin Hbf at <b>09:14</b>. Weather looks fine, no rail strikes flagged. Anything you want me to do?
          </div>
          <ChipRow chips={['Hotel for tonight','Pre-order seat upgrade','Check route']} />
        </OmioBubble>

        <LifeDivider label="Tuesday · 30 min before" />
        <OmioBubble>
          <NewBadge />
          <div className="serif" style={{ fontSize: 15.5, lineHeight: 1.4, marginTop: 4 }}>
            Boarding in 30 min. Platform <b>4</b>, Berlin Hbf. Your walk from current location is <b>12 min</b> — leave by <b>08:32</b>.
          </div>
          <MiniMap />
        </OmioBubble>

        {/* F4 disruption — KILLER FEATURE */}
        <LifeDivider label="Mid-trip · disruption" alert />
        <OmioBubble>
          <div className="mono" style={{ fontSize: 9.5, color: 'oklch(0.55 0.16 25)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>● Live update</div>
          <div className="serif" style={{ fontSize: 16, lineHeight: 1.4 }}>
            Heads up — your <span className="mono" style={{ fontWeight: 600 }}>09:14</span> is now <span className="mono" style={{ fontWeight: 600, color: 'oklch(0.55 0.16 25)' }}>09:42</span> due to track work near Wolfsburg. Same platform 4. Arrival München updated to 13:16.
          </div>
          <ChipRow chips={['Push hotel check-in','Notify Anna','Find faster route']} />
        </OmioBubble>

        <LifeDivider label="Arrival" />
        <OmioBubble>
          <div className="serif" style={{ fontSize: 15.5, lineHeight: 1.4 }}>
            Welcome to Munich. Your hotel is 8 min by U-Bahn — U6 from Hauptbahnhof to Marienplatz. Want directions?
          </div>
        </OmioBubble>

        <LifeDivider label="Sunday post-trip" />
        <OmioBubble>
          <div className="serif" style={{ fontSize: 15.5, lineHeight: 1.4 }}>
            Hope Munich went well. Want the receipt for expenses, or rate the journey?
          </div>
          <ChipRow chips={['Email receipt','Rate ICE 1023','Book again']} />
        </OmioBubble>

        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

function OmioConfirmCard() {
  return (
    <div style={{ marginTop: 10, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, background: 'oklch(0.97 0.05 155)' }}>
        <Icon name="check" size={13} stroke={2.5} style={{ color: 'var(--pos)' }} />
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>Confirmed · live status</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginLeft: 'auto' }}>TRV-9F2A</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: 12, borderRight: '1px dashed var(--line-2)' }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Out · Tue 12 May</div>
          <div className="num" style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>09:14 → 13:28</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 2 }}>ICE 1023 · Pl. 4 · Coach 24 · Seat 35A</div>
        </div>
        <div style={{ flex: 1, padding: 12 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Ret · Sun 17 May</div>
          <div className="num" style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>17:12 → 21:30</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 2 }}>ICE 1024 · Coach 12 · Seat 18C</div>
        </div>
      </div>
      {/* QR placeholder + actions */}
      <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--line)' }}>
        <QRPlaceholder />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 500 }}>Show at gate</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>Tap to fullscreen</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid var(--line)', background: 'var(--bg-sunk)' }}>
        <SmallAction label="Calendar" icon="calAdd" />
        <SmallAction label="Directions" icon="pin" />
        <SmallAction label="Share with Anna" icon="user" />
      </div>
    </div>
  );
}

function QRPlaceholder() {
  return (
    <div style={{ width: 44, height: 44, borderRadius: 6, background: '#fff', border: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)', padding: 3, gap: 1 }}>
      {Array.from({ length: 64 }).map((_, i) => (
        <div key={i} style={{ background: (i * 17 + 3) % 5 < 2 ? '#000' : 'transparent', borderRadius: 0.5 }} />
      ))}
    </div>
  );
}

function SmallAction({ label, icon }) {
  return (
    <button style={{ flex: 1, padding: '8px 6px', background: 'transparent', border: 'none', borderRight: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'inherit', cursor: 'pointer', color: 'var(--ink-2)', fontSize: 11 }}>
      <Icon name={icon} size={11} /> {label}
    </button>
  );
}

function LifeDivider({ label, alert }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
      <div style={{ flex: 1, height: 1, background: alert ? 'oklch(0.85 0.08 25)' : 'var(--line)' }} />
      <div className="mono" style={{ fontSize: 9, color: alert ? 'oklch(0.55 0.16 25)' : 'var(--ink-4)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: alert ? 'oklch(0.85 0.08 25)' : 'var(--line)' }} />
    </div>
  );
}

function NewBadge() {
  return (
    <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 7px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 8.5, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
      🔔 NEW
    </div>
  );
}

function ChipRow({ chips }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
      {chips.map(c => (
        <button key={c} style={{ padding: '6px 11px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', fontSize: 11.5, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit' }}>{c}</button>
      ))}
    </div>
  );
}

function MiniMap() {
  return (
    <div style={{ marginTop: 10, padding: 12, background: 'var(--bg-sunk)', borderRadius: 10, position: 'relative', height: 100, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none">
        <path d="M10 60 Q 50 30, 90 40 T 180 20" stroke="var(--accent)" strokeWidth="2" fill="none" strokeDasharray="3 3" />
        <circle cx="10" cy="60" r="4" fill="var(--accent)" />
        <circle cx="180" cy="20" r="4" fill="var(--ink)" />
      </svg>
      <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, color: 'var(--ink-3)' }} className="mono">YOU</div>
      <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, color: 'var(--ink-2)', textAlign: 'right' }} className="mono">BERLIN HBF · PL.4</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// H · Advanced features
// ════════════════════════════════════════════════════════════════════════
function OmioAdvanced({ tweaks }) {
  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', padding: 22, background: 'var(--bg)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, overflowY: 'auto' }}>
      {/* H1 multi-city */}
      <FeatureCard title="H1 · Multi-city" sub="One question, three legs, one booking">
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: 8 }}>
          "Berlin Tue → Munich, Munich Fri → Vienna, Vienna Sun → Berlin."
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[['BER','MUC','Tue 12 · 09:14'], ['MUC','VIE','Fri 15 · 14:30'], ['VIE','BER','Sun 17 · 17:12']].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-sunk)', borderRadius: 7, fontSize: 11.5 }}>
              <div className="mono" style={{ fontWeight: 600, width: 36 }}>{l[0]}</div>
              <Icon name="arrow" size={11} style={{ color: 'var(--ink-3)' }} />
              <div className="mono" style={{ fontWeight: 600, width: 36 }}>{l[1]}</div>
              <div style={{ flex: 1 }} />
              <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 9.5 }}>{l[2]}</div>
            </div>
          ))}
        </div>
        <div className="num" style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>€312 total · 1 reference</div>
      </FeatureCard>

      {/* H2 flex dates heatmap */}
      <FeatureCard title="H2 · Flex dates" sub="Cheapest week in May · Berlin → Lisbon">
        <Heatmap />
      </FeatureCard>

      {/* H3 price alerts */}
      <FeatureCard title="H3 · Price alerts" sub="Watching the route, AI pings when it drops">
        <div style={{ padding: 10, background: 'var(--bg-sunk)', borderRadius: 8, fontSize: 12, color: 'var(--ink-2)', marginBottom: 8 }}>
          "Watch this route and tell me if it drops below €100"
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: '1px solid var(--line-2)', borderRadius: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>Berlin → Lisbon · &lt; €100</div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>watching · current best €128</div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>×</button>
        </div>
      </FeatureCard>

      {/* H6 climate-aware */}
      <FeatureCard title="H6 · Climate-aware" sub="AI volunteers the comparison">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ClimateRow mode="train" win price="€89" dur="8h 20m" co2={28} />
          <ClimateRow mode="plane" price="€120" dur="1h 50m" co2={158} />
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.5 }}>
          "Train wins on price <b>and</b> emissions. Fly only if time-constrained."
        </div>
      </FeatureCard>

      {/* H4 group */}
      <FeatureCard title="H4 · Group bookings" sub="6 travelers · group fare savings">
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 8 }}>
          "For 6 people, group fares apply — €112 each instead of €168."
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)' }}>save €336</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>across the group</div>
        </div>
      </FeatureCard>

      {/* H5 accessibility */}
      <FeatureCard title="H5 · Accessibility" sub='"I use a wheelchair" → step-free routes only'>
        <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 8 }}>
          AI filters routes, surfaces operator assistance booking, confirms platform accessibility. Persistent preference.
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>
          ✓ Saved · always-on filter
        </div>
      </FeatureCard>
    </div>
  );
}

function FeatureCard({ title, sub, children }) {
  return (
    <div style={{ padding: 14, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12 }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: 0.5, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: -0.2, marginTop: 2, marginBottom: 10 }}>{sub}</div>
      {children}
    </div>
  );
}

function Heatmap() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  // Generate fake price data, find min
  const prices = days.map((_, i) => 89 + Math.floor(Math.sin(i * 0.9) * 30 + Math.cos(i * 1.7) * 20) + 30);
  const min = Math.min(...prices);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => {
          const cheap = prices[i] === min;
          const intensity = (prices[i] - min) / 50;
          return (
            <div key={d} style={{ padding: '6px 4px', borderRadius: 6, background: cheap ? 'var(--accent)' : `oklch(${0.95 - intensity * 0.15} ${0.025 + intensity * 0.04} 50)`, color: cheap ? 'var(--accent-ink)' : 'var(--ink-2)', textAlign: 'center', cursor: 'pointer', border: cheap ? '1.5px solid var(--accent)' : '1px solid transparent' }}>
              <div className="mono" style={{ fontSize: 8.5, opacity: 0.85, letterSpacing: 0.3 }}>{d}</div>
              <div className="num" style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>€{prices[i]}</div>
            </div>
          );
        })}
      </div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 6, letterSpacing: 0.3 }}>Tap a day to refine · only chart in product</div>
    </div>
  );
}

function ClimateRow({ mode, price, dur, co2, win }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: win ? 'var(--accent-soft)' : 'var(--bg-sunk)', borderRadius: 7, border: win ? '1px solid var(--accent)' : '1px solid transparent' }}>
      <Icon name={mode} size={14} style={{ color: win ? 'var(--accent)' : 'var(--ink-3)' }} />
      <div className="num" style={{ fontSize: 13, fontWeight: 600, width: 50 }}>{price}</div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', width: 60 }}>{dur}</div>
      <div style={{ flex: 1 }} />
      <div className="num" style={{ fontSize: 11.5, color: co2 > 100 ? 'oklch(0.55 0.16 25)' : 'oklch(0.55 0.13 145)', fontWeight: 600 }}>{co2} kg CO₂</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// "Why omio.ai" — three claims hero strip
// ════════════════════════════════════════════════════════════════════════
function WhyOmioAi() {
  return (
    <div className="ab-root" style={{ width: '100%', height: '100%', padding: '36px 32px', background: 'var(--bg)', overflowY: 'auto' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: 0.5, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 600 }}>Why omio.ai</div>
      <div className="serif" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: -0.8, marginTop: 6, marginBottom: 28, maxWidth: 720 }}>
        Three things only this surface can do. The host integrations are distribution. <em style={{ color: 'var(--accent)' }}>This is the flagship.</em>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        <Claim n="01" title="It searches with judgment.">
          <div style={{ padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 10, fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink-2)' }} className="serif">
            "The €136 is tempting <em>but</em> adds two stops each way and arrives after midnight Sunday. <b>Lock the €168.</b>"
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 6, letterSpacing: 0.4, textTransform: 'uppercase' }}>Concierge, not search engine</div>
        </Claim>
        <Claim n="02" title="It pays in one sheet.">
          <CompareBars />
        </Claim>
        <Claim n="03" title="It stays with the trip.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['T-24h Heads up', 'T-30m Boarding', 'Mid-trip Delay alert', 'Arrival Welcome', 'Post-trip Receipt'].map((m, i) => (
              <div key={m} style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 11, color: 'var(--ink-2)' }}>
                <div style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--accent)' }} />
                <span>{m}</span>
              </div>
            ))}
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 8, letterSpacing: 0.4, textTransform: 'uppercase' }}>Hosts can't do this</div>
        </Claim>
      </div>

      <div style={{ marginTop: 30, padding: 16, background: 'var(--ink)', color: 'var(--bg)', borderRadius: 12 }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: 0.5, opacity: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>Strategic frame</div>
        <div className="serif" style={{ fontSize: 18, lineHeight: 1.45, letterSpacing: -0.2 }}>
          Omio is everywhere a traveler asks for a journey — Claude, ChatGPT, Gemini, omio.ai. Same backend, same Stripe, same shadow-account model — different presentation per surface. <span style={{ color: 'var(--accent)' }}>The flagship is omio.ai. The host integrations are distribution.</span>
        </div>
      </div>
    </div>
  );
}

function Claim({ n, title, children }) {
  return (
    <div>
      <div className="num mono" style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: 0.5 }}>{n}</div>
      <div className="serif" style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: -0.4, marginTop: 4, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function CompareBars() {
  const rows = [
    { label: 'Claude', sub: 'Stripe redirect', val: 100, color: 'oklch(0.7 0.14 60)' },
    { label: 'ChatGPT', sub: 'ACP · 4% fee', val: 35, color: 'var(--ink-3)' },
    { label: 'omio.ai', sub: 'Native · 0% fee', val: 8, color: 'var(--accent)' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map(r => (
        <div key={r.label}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>{r.label}</div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.3 }}>{r.sub}</div>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-sunk)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${r.val}%`, background: r.color, borderRadius: 4 }} />
          </div>
        </div>
      ))}
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 4, letterSpacing: 0.3 }}>FRICTION SCORE · LESS IS BETTER</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// OmioFirstTime — first-touch hero variant
// ════════════════════════════════════════════════════════════════════════
function OmioFirstTime({ tweaks, placeholders }) {
  const examples = [
    'Berlin → Munich tomorrow',
    'Cheapest weekend in Lisbon next month',
    'I need to be in Paris by Friday morning',
  ];
  return (
    <div className={"ab-root" + (tweaks.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <OmioTopBar mode="firsttime" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 32px 24px' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>● New here</span> &nbsp;·&nbsp; first trip
        </div>
        <div className="serif" style={{ fontSize: 52, lineHeight: 1.0, letterSpacing: -1.3, textAlign: 'center', marginBottom: 24, maxWidth: 540 }}>
          Tell me <em style={{ color: 'var(--accent)' }}>where</em><br/>to&nbsp;go.
        </div>

        {/* Big input */}
        <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--bg-elev)', border: '1.5px solid var(--accent)', borderRadius: 16, boxShadow: '0 6px 28px oklch(0.85 0.06 60 / 0.4)' }}>
            <Icon name="search" size={16} style={{ color: 'var(--accent)' }} />
            <input
              defaultValue=""
              placeholder="Where do you want to go?"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 16, color: 'var(--ink)', minWidth: 0 }}
            />
            <button style={{ width: 38, height: 38, borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow" size={15} stroke={2.2} />
            </button>
          </div>
        </div>

        {/* Example chips */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 560 }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Try one of these</div>
          {examples.map((q, i) => (
            <button key={i} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px',
              background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              fontSize: 13.5, color: 'var(--ink-2)',
            }}>
              <Icon name="sparkle" size={11} style={{ color: 'var(--accent)' }} />
              <span style={{ flex: 1 }}>{q}</span>
              <Icon name="arrow" size={11} style={{ color: 'var(--ink-4)' }} />
            </button>
          ))}
        </div>

        {/* Trust micro-row */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--ink-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--accent)' }} /> Pay in one sheet</span>
          <span style={{ color: 'var(--line-2)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--accent)' }} /> Stay with the trip</span>
          <span style={{ color: 'var(--line-2)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--accent)' }} /> No app needed</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// C · Refinement loop — prior cards demoted to history, new ones reflow
// ════════════════════════════════════════════════════════════════════════
function OmioRefinement({ tweaks, kind = 'cheaper' }) {
  // kind: 'cheaper' | 'faster' | 'fewer'
  const config = {
    cheaper: {
      userMsg: "Anything cheaper but still direct?",
      reasoning: "Re-checking cheaper direct options. The €136 had two stops — let me find a true cheaper-and-direct.",
      results: [
        { tag: 'Cheaper · still direct', price: 142, co2: 22, dur: '4h 22m / 4h 18m', highlighted: true },
        { tag: 'Best value', price: 168, co2: 22 },
      ],
      summary: <>Found <b>€142 on IC</b> — both legs direct, +8 min on the outbound. Saves €26 vs the ICE.</>,
    },
    faster: {
      userMsg: "Earlier please — I want to be in Munich before noon.",
      reasoning: "Filtering to outbound arrivals before 12:00. Two options now.",
      results: [
        { tag: 'Earliest arrival', price: 184, dur: '3h 48m / 4h 18m', co2: 22, highlighted: true },
        { tag: 'Best value', price: 168, co2: 22 },
      ],
      summary: <>Earliest gets you in at <b>11:22</b>. €16 more than the €168 — call it.</>,
    },
    fewer: {
      userMsg: "Any options with fewer transfers? Hate changing trains.",
      reasoning: "Already filtered to direct on the outbound. Re-checking the return for direct-only.",
      results: [
        { tag: 'Both legs · direct', price: 168, co2: 22, highlighted: true },
      ],
      summary: <>Already direct both ways on the €168. No further reductions possible — direct is the floor.</>,
    },
  }[kind];

  return (
    <div className={"ab-root" + (tweaks?.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <OmioTopBar mode="returning" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* Demoted prior turn — visually faded, marked as history */}
        <div style={{ opacity: 0.55, position: 'relative' }}>
          <div className="mono" style={{ position: 'absolute', top: -8, right: 0, fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.5, textTransform: 'uppercase', padding: '2px 6px', background: 'var(--bg-sunk)', borderRadius: 4 }}>Earlier · history</div>
          <UserBubble>Get me to Munich Tuesday morning, back Sunday night. Under €200.</UserBubble>
          <OmioBubble>
            <div className="serif" style={{ fontSize: 16, lineHeight: 1.4 }}>€168 ICE looks best — both legs direct.</div>
          </OmioBubble>
          <div style={{ marginLeft: 36, marginBottom: 6 }}>
            <DemotedResult tag="Best value" price={168} />
            <DemotedResult tag="Cheapest" price={136} note="2 stops each way" />
          </div>
        </div>

        <RefineDivider />

        {/* New turn */}
        <UserBubble>{config.userMsg}</UserBubble>
        <OmioBubble>
          <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>{config.reasoning}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.4, marginTop: 4, textTransform: 'uppercase' }}>↑ same thread · cards reflow below</div>
        </OmioBubble>
        <div style={{ marginLeft: 36, marginBottom: 14 }}>
          {config.results.map((r, i) => (
            <OmioPairedCard key={i} tag={r.tag} price={r.price} co2={r.co2} flightCo2={88} dur={r.dur} stops={r.stops} highlighted={r.highlighted} />
          ))}
        </div>

        <OmioBubble>
          <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>{config.summary}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button style={{ padding: '7px 13px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Lock this</button>
            <button style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Refine more</button>
          </div>
        </OmioBubble>
        <div style={{ height: 12 }} />
      </div>
      <OmioComposer />
    </div>
  );
}

function DemotedResult({ tag, price, note }) {
  return (
    <div style={{ padding: '7px 12px', marginBottom: 4, background: 'var(--bg-sunk)', border: '1px dashed var(--line-2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{tag}</div>
      <div style={{ flex: 1, fontSize: 11, color: 'var(--ink-3)' }}>{note || 'considered'}</div>
      <div className="num" style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: note ? 'line-through' : 'none' }}>€{price}</div>
    </div>
  );
}

function RefineDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 14px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      <div className="mono" style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>↻ refining</div>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// G · Manage / change / refund
// ════════════════════════════════════════════════════════════════════════
function OmioManage({ tweaks, kind = 'change' }) {
  // kind: 'change' | 'cancel'
  return (
    <div className={"ab-root" + (tweaks?.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <OmioTopBar mode="returning" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <UserBubble>{kind === 'change' ? 'Change my return to Sunday 19:30 instead of 17:12.' : 'Cancel my Munich trip.'}</UserBubble>

        <OmioBubble>
          <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>
            {kind === 'change'
              ? <>Pulling your booking. Here's what I have on file:</>
              : <>Got it — confirming you want to cancel <b>TRV-9F2A</b>:</>}
          </div>
        </OmioBubble>

        <div style={{ marginLeft: 36, marginBottom: 14 }}>
          <OriginalBookingCard />
        </div>

        {kind === 'change' && (
          <>
            <OmioBubble>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>
                Found a Sunday 19:30 — ICE 1028, direct, arrives 23:48. Here's the math:
              </div>
            </OmioBubble>
            <div style={{ marginLeft: 36, marginBottom: 14 }}>
              <DiffCard rows={[
                ['Original return · ICE 1024 17:12', '−€79.00', 'refund'],
                ['New return · ICE 1028 19:30', '+€94.00', 'new'],
              ]} net={15} netLabel="Net difference" />
            </div>
            <OmioBubble>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>Charge €15 to your Visa ·· 4242, refund the difference back to Apple Pay. Confirm?</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Confirm change · €15</button>
                <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Show more options</button>
              </div>
            </OmioBubble>

            {/* Success */}
            <RefineDivider />
            <OmioBubble>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>
                Done. Return rebooked to <b>Sun 17 May · ICE 1028 · 19:30</b>. New ticket below — old ticket voided.
              </div>
            </OmioBubble>
            <div style={{ marginLeft: 36, marginBottom: 14 }}>
              <NewTicketCard train="ICE 1028" dep="19:30" arr="23:48" date="Sun 17 May" bookingRef="TRV-9F2A-R2" />
            </div>
          </>
        )}

        {kind === 'cancel' && (
          <>
            <OmioBubble>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>Cancellation refund preview:</div>
            </OmioBubble>
            <div style={{ marginLeft: 36, marginBottom: 14 }}>
              <DiffCard rows={[
                ['Outbound · ICE 1023', '−€89.00', 'refund'],
                ['Return · ICE 1024', '−€79.00', 'refund'],
                ['Cancellation fee', '+€10.00', 'fee'],
              ]} net={-158} netLabel="Refund to Apple Pay" />
            </div>
            <OmioBubble>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>Refund posts in 3–5 business days. Confirm cancellation?</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'oklch(0.55 0.18 25)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel trip · refund €158</button>
                <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Keep trip</button>
              </div>
            </OmioBubble>

            <RefineDivider />
            <OmioBubble>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.4 }}>
                Trip cancelled. Refund of <b>€158.00</b> on its way to Apple Pay. I removed both legs from your calendar.
              </div>
            </OmioBubble>
            <div style={{ marginLeft: 36 }}>
              <CancellationReceipt />
            </div>
          </>
        )}

        <div style={{ height: 12 }} />
      </div>
      <OmioComposer />
    </div>
  );
}

function OriginalBookingCard() {
  return (
    <div style={{ padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Booking on file</div>
        <div style={{ flex: 1 }} />
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>TRV-9F2A</div>
      </div>
      <div className="serif" style={{ fontSize: 16, fontWeight: 500 }}>Berlin → München · round trip</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.3, marginTop: 4 }}>OUT · TUE 12 MAY · ICE 1023 · 08:34→12:48 · DIRECT</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.3, marginTop: 2 }}>RET · SUN 17 MAY · ICE 1024 · 17:12→21:30 · DIRECT</div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--line)', display: 'flex' }}>
        <div style={{ flex: 1, fontSize: 11, color: 'var(--ink-3)' }}>Paid · Apple Pay</div>
        <div className="num" style={{ fontSize: 13, fontWeight: 600 }}>€168.00</div>
      </div>
    </div>
  );
}

function DiffCard({ rows, net, netLabel }) {
  return (
    <div style={{ padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12 }}>
      <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Change preview</div>
      {rows.map((r, i) => {
        const tone = r[2] === 'refund' ? 'oklch(0.55 0.13 145)' : (r[2] === 'fee' ? 'oklch(0.55 0.18 25)' : 'var(--ink)');
        return (
          <div key={i} style={{ display: 'flex', padding: '4px 0', fontSize: 12, color: 'var(--ink-2)' }}>
            <div style={{ flex: 1 }}>{r[0]}</div>
            <div className="num" style={{ color: tone, fontWeight: 600 }}>{r[1]}</div>
          </div>
        );
      })}
      <div style={{ marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'baseline' }}>
        <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{netLabel}</div>
        <div className="num" style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3, color: net < 0 ? 'oklch(0.55 0.13 145)' : 'var(--ink)' }}>
          {net < 0 ? '−' : '+'}€{Math.abs(net).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function NewTicketCard({ train, dep, arr, date, bookingRef }) {
  return (
    <div style={{ padding: 12, background: 'var(--accent-soft)', border: '1.5px solid var(--accent)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>● New return ticket</div>
        <div style={{ flex: 1 }} />
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--accent)' }}>{bookingRef}</div>
      </div>
      <div className="serif" style={{ fontSize: 16, fontWeight: 500 }}>{train}</div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-2)', letterSpacing: 0.3, marginTop: 4 }}>{date.toUpperCase()} · {dep} → {arr} · DIRECT</div>
    </div>
  );
}

function CancellationReceipt() {
  return (
    <div style={{ padding: 12, background: 'var(--bg-elev)', border: '1px solid var(--line-2)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Cancellation receipt</div>
        <div style={{ flex: 1 }} />
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>TRV-9F2A · CXL</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>Cancelled 02 May 2026 · 14:08 CET</div>
      <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 6 }}>
        <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-3)' }}>Refund to Apple Pay</div>
        <div className="num" style={{ fontSize: 16, fontWeight: 600, color: 'oklch(0.55 0.13 145)' }}>−€158.00</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// I · Edge states pack
// ════════════════════════════════════════════════════════════════════════
function OmioEdgeStates({ tweaks }) {
  return (
    <div className={"ab-root" + (tweaks?.dark ? ' dark' : '')} style={{ width: '100%', height: '100%', padding: 22, background: 'var(--bg)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, overflowY: 'auto' }}>
      <EdgePane label="I1 · Sold out mid-flow" tone="alert">
        <div className="serif" style={{ fontSize: 17, lineHeight: 1.4, marginBottom: 8 }}>
          The €168 ICE 1023 just sold out while we were checking. Two close alternatives:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
          <AltOption tag="Closest match · ICE 1025" price={172} note="+4 min later, both direct" />
          <AltOption tag="Cheaper · IC 2034" price={148} note="+24 min, 1 stop outbound" />
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.4, marginTop: 12, textTransform: 'uppercase' }}>↑ inventory poll · 12s ago · auto-suggested</div>
      </EdgePane>

      <EdgePane label="I2 · Payment failed in sheet" tone="alert">
        <div className="serif" style={{ fontSize: 17, lineHeight: 1.4, marginBottom: 8 }}>
          Visa ··4242 was declined by your bank — likely the SCA timeout.
        </div>
        <div style={{ padding: 10, background: 'oklch(0.97 0.04 25)', border: '1px solid oklch(0.85 0.08 25)', borderRadius: 8, fontSize: 12, color: 'oklch(0.45 0.16 25)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: 4, background: 'oklch(0.55 0.18 25)' }} /> <b>Card declined</b> · sheet stays open
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Try Apple Pay</button>
          <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Different card</button>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.4, marginTop: 12, textTransform: 'uppercase' }}>↑ trip held 5 min · seat reserved</div>
      </EdgePane>

      <EdgePane label="I3 · Schedule change push" tone="warn">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, background: 'oklch(0.96 0.06 75)', color: 'oklch(0.5 0.13 60)', fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }} className="mono">
          <span style={{ width: 5, height: 5, borderRadius: 3, background: 'oklch(0.55 0.16 60)' }} /> ● Push · 18 min ago
        </div>
        <div className="serif" style={{ fontSize: 17, lineHeight: 1.4, marginBottom: 8 }}>
          Your <b>08:34 ICE 1023</b> tomorrow was rescheduled by DB to <b>08:48</b>. Same train, same platform, +14 min.
        </div>
        <div style={{ padding: 10, background: 'var(--bg-sunk)', borderRadius: 8, fontSize: 11.5, color: 'var(--ink-2)', marginTop: 4 }}>
          <span className="mono" style={{ color: 'var(--ink-3)', letterSpacing: 0.3 }}>BERLIN HBF</span> &nbsp;
          <span className="num" style={{ textDecoration: 'line-through', color: 'var(--ink-3)' }}>08:34</span> →
          <span className="num" style={{ fontWeight: 600 }}> 08:48</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Accept new time</button>
          <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Find alternative</button>
        </div>
      </EdgePane>

      <EdgePane label="I4 · Connection lost" tone="neutral">
        <div className="serif" style={{ fontSize: 17, lineHeight: 1.4, marginBottom: 8 }}>
          Connection dropped while saving your booking. Don't worry — your seat is held.
        </div>
        <div style={{ padding: 10, background: 'var(--bg-sunk)', borderRadius: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 9 }}>
          <SpinnerSmall />
          <div style={{ flex: 1, fontSize: 11.5, color: 'var(--ink-2)' }}>
            Reconnecting…
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.3, marginTop: 1 }}>RETRY 2/5 · LAST PING 4s AGO</div>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.4, marginTop: 12, textTransform: 'uppercase' }}>↑ idempotent retry · no double-charge risk</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-elev)', color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Retry now</button>
        </div>
      </EdgePane>
    </div>
  );
}

function EdgePane({ label, tone, children }) {
  const accentBorder = tone === 'alert' ? 'oklch(0.85 0.08 25)' : tone === 'warn' ? 'oklch(0.85 0.08 75)' : 'var(--line-2)';
  return (
    <div style={{ padding: 18, background: 'var(--bg-elev)', border: '1px solid ' + accentBorder, borderRadius: 14, display: 'flex', flexDirection: 'column' }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function AltOption({ tag, price, note }) {
  return (
    <div style={{ padding: '8px 11px', background: 'var(--bg-sunk)', border: '1px solid var(--line-2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700 }}>{tag}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{note}</div>
      </div>
      <div className="num" style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3 }}>€{price}</div>
      <button style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Use</button>
    </div>
  );
}

function SpinnerSmall() {
  return (
    <>
      <style>{`@keyframes omio-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 16, height: 16, borderRadius: 8, border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'omio-spin 0.8s linear infinite' }} />
    </>
  );
}

Object.assign(window, {
  OmioHero, OmioConversation, OmioPaymentSheet, OmioLifecycle, OmioAdvanced, WhyOmioAi, OmioVoice,
  OmioFirstTime, OmioRefinement, OmioManage, OmioEdgeStates,
});
