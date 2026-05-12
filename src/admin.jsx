// Admin "Command Center" — desktop dashboard
import React, { useState, useMemo } from 'react';
import { Icon } from './icons.jsx';
import { FieldLabel, Field, inputStyle } from './mobile.jsx';

function AdminSidebar({ page, setPage, settings }) {
  const [collapsed, setCollapsed] = useState(false);
  const items = [
    { id: 'dash', label: 'Dashboard',    icon: 'grid' },
    { id: 'feed', label: 'Appointments', icon: 'cal' },
    { id: 'bays', label: 'Bay Status',   icon: 'bay' },
    { id: 'svc',  label: 'Services',     icon: 'wrench' },
    { id: 'set',  label: 'Settings',     icon: 'settings' },
  ];
  return (
    <div style={{
      width: collapsed ? 56 : 220,
      transition: 'width 0.2s ease',
      background: 'var(--bg-2)', borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: collapsed ? '18px 0' : '18px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8, minHeight: 64 }}>
        <div className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {collapsed
            ? <>RM<span style={{ color: 'var(--orange)' }}>/</span>C</>
            : <>RM<span style={{ color: 'var(--orange)' }}>/</span>COLLISION</>
          }
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} title="Collapse" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--mute)', padding: 4, display: 'flex', flexShrink: 0,
          }}>
            <span style={{ display: 'flex', transform: 'rotate(180deg)' }}>
              <Icon name="chev" size={14} />
            </span>
          </button>
        )}
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '8px 4px' }}>
        {items.map(it => (
          <button key={it.id} onClick={() => setPage(it.id)} title={collapsed ? it.label : undefined} style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 0' : '10px 10px',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            background: page === it.id ? 'var(--surf)' : 'transparent',
            color: page === it.id ? 'var(--text)' : 'var(--mute)',
            borderLeft: '2px solid ' + (page === it.id ? 'var(--orange)' : 'transparent'),
            fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 500,
          }}>
            <Icon name={it.icon} size={16} strokeWidth={page === it.id ? 2 : 1.5} />
            {!collapsed && <span>{it.label}</span>}
          </button>
        ))}
        {/* Expand button lives inside nav when collapsed */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} title="Expand" style={{
            width: '100%', display: 'flex', justifyContent: 'center',
            padding: '10px 0', marginTop: 4,
            background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--mute)',
            borderLeft: '2px solid transparent',
          }}>
            <Icon name="chev" size={14} />
          </button>
        )}
      </div>

      {/* Status footer */}
      {!collapsed && (
        <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
          <div style={{ background: 'var(--surf)', padding: 10, border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="dot dot-pulse" style={{ background: settings.holidayMode ? 'var(--red)' : 'var(--green)', color: settings.holidayMode ? 'var(--red)' : 'var(--green)' }} />
              <span className="mono" style={{ fontSize: 9, color: 'var(--mute)' }}>{settings.holidayMode ? 'PAUSED' : 'LIVE'}</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text)', marginTop: 4 }}>
              {settings.activeBays}/{settings.bays} BAYS · {settings.shopStatus.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminTopBar({ settings }) {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  return (
    <div style={{
      height: 48, borderBottom: '1px solid var(--line)', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 18,
    }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: 0.1 }}>
        <span style={{ color: 'var(--orange)' }}>●</span> SYSTEM · OPERATIONAL
      </div>
      <div style={{ width: 1, height: 18, background: 'var(--line)' }} />
      <div className="mono" style={{ fontSize: 11, color: 'var(--mute)' }}>TUE · MAY 12 · {time}</div>
      <div style={{ flex: 1 }} />
      <div className="mono" style={{ fontSize: 10, color: 'var(--mute)' }}>SHIFT — A · MGR: M.LOWRY</div>
      <div style={{ width: 30, height: 30, background: 'var(--orange)', color: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="display">
        <span style={{ fontSize: 12, fontWeight: 700 }}>ML</span>
      </div>
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
function AdminDashboard({ appointments, services, settings, updateAppointment }) {
  const counts = useMemo(() => ({
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    inBay: appointments.filter(a => a.status === 'in-bay').length,
    complete: appointments.filter(a => a.status === 'complete').length,
  }), [appointments]);

  const revenue = appointments
    .filter(a => a.status !== 'declined')
    .reduce((sum, a) => sum + a.services.reduce((s, id) => {
      const sv = services.find(x => x.id === id);
      return s + (sv ? sv.price : 0);
    }, 0), 0);

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text)' }}>
      <div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--mute)' }}>[ DASHBOARD / TODAY ]</div>
        <div className="display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, marginTop: 4 }}>
          Today's run sheet
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
        {[
          { l: 'PENDING',   v: counts.pending,   c: 'var(--amber)' },
          { l: 'CONFIRMED', v: counts.confirmed, c: 'var(--green)' },
          { l: 'IN BAY',    v: counts.inBay,     c: 'var(--orange)' },
          { l: 'REVENUE',   v: '$' + revenue,    c: 'var(--text)', big: true },
        ].map((k,i)=>(
          <div key={i} style={{ background: 'var(--surf)', padding: 16, position: 'relative' }}>
            <div className="mono" style={{ fontSize: 9, color: 'var(--mute)', letterSpacing: 0.1 }}>{k.l}</div>
            <div className="display" style={{ fontSize: k.big ? 26 : 30, fontWeight: 700, color: k.c, marginTop: 6, lineHeight: 1 }}>{k.v}</div>
            <div className="mono" style={{ fontSize: 9, color: 'var(--mute)', marginTop: 6 }}>VS YEST · <span style={{color: i === 3 ? 'var(--green)':'var(--mute)'}}>{i === 3 ? '+12%' : i === 0 ? '+1' : '—'}</span></div>
          </div>
        ))}
      </div>

      {/* Two-col: feed + bays */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <AppointmentFeed appointments={appointments} services={services} updateAppointment={updateAppointment} compact />
        <BayPanel appointments={appointments} settings={settings} />
      </div>
    </div>
  );
}

// ─── APPOINTMENT FEED ───────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    pending:   { label: 'PENDING',   bg: 'rgba(245,180,40,0.12)',  c: 'var(--amber)' },
    confirmed: { label: 'CONFIRMED', bg: 'rgba(60,200,120,0.12)',  c: 'var(--green)' },
    'in-bay':  { label: 'IN BAY',    bg: 'rgba(255,87,51,0.14)',   c: 'var(--orange)' },
    complete:  { label: 'COMPLETE',  bg: 'rgba(150,150,170,0.12)', c: 'var(--mute)' },
    declined:  { label: 'DECLINED',  bg: 'rgba(220,70,70,0.12)',   c: 'var(--red)' },
  }[status] || { label: status.toUpperCase(), bg: 'var(--line)', c: 'var(--text)' };
  return (
    <span className="mono" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 8px', fontSize: 9, letterSpacing: 0.1,
      background: map.bg, color: map.c, border: '1px solid currentColor',
    }}>
      <span className="dot" style={{ background: 'currentColor', width: 5, height: 5 }} />
      {map.label}
    </span>
  );
}

function AppointmentFeed({ appointments, services, updateAppointment, compact = false }) {
  const sorted = [...appointments].sort((a,b)=> {
    const order = { pending: 0, confirmed: 1, 'in-bay': 2, complete: 3, declined: 4 };
    return order[a.status] - order[b.status];
  });
  return (
    <div style={{ border: '1px solid var(--line)', background: 'var(--surf)' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)' }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: 0.1 }}>
          [ LIVE FEED / {appointments.length} ]
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="mono" style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--mute)', padding: '4px 8px', fontSize: 9, cursor: 'pointer' }}>FILTER</button>
          <button className="mono" style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--mute)', padding: '4px 8px', fontSize: 9, cursor: 'pointer' }}><Icon name="refresh" size={10} /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '110px 1fr 90px 120px' : '110px 1fr 1fr 90px 100px 120px', gap: 12, padding: '8px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        {(compact ? ['PLATE / SLOT','CUSTOMER / VEHICLE','STATUS','ACTIONS'] : ['PLATE / SLOT','CUSTOMER','VEHICLE','BAY','STATUS','ACTIONS']).map(h => (
          <div key={h} className="mono" style={{ fontSize: 9, color: 'var(--mute)', letterSpacing: 0.1 }}>{h}</div>
        ))}
      </div>
      <div style={{ maxHeight: compact ? 360 : 'none', overflowY: 'auto' }}>
        {sorted.map(a => {
          const items = services.filter(s => a.services.includes(s.id));
          return (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: compact ? '110px 1fr 90px 120px' : '110px 1fr 1fr 90px 100px 120px', gap: 12, padding: '12px 14px', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>{a.plate}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--mute)', marginTop: 2 }}>{a.slot}</div>
              </div>
              <div>
                <div className="display" style={{ fontSize: 13, fontWeight: 600 }}>{a.customer}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--mute)', marginTop: 2 }}>{compact ? a.vehicle : items.map(s=>s.name).join(' · ')}</div>
              </div>
              {!compact && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>{a.vehicle}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--mute)' }}>{a.mileage.toLocaleString()} MI</div>
                </div>
              )}
              {!compact && (
                <div className="mono" style={{ fontSize: 12, color: 'var(--text)' }}>BAY {a.bay}</div>
              )}
              {!compact && (
                <div className="mono" style={{ fontSize: 11, color: 'var(--mute)' }}>${items.reduce((s,x)=>s+x.price,0)}</div>
              )}
              <div><StatusPill status={a.status} /></div>
              <div style={{ display: 'flex', gap: 4 }}>
                {a.status === 'pending' && (
                  <>
                    <button onClick={()=>updateAppointment(a.id, { status: 'confirmed' })} className="mono" style={{
                      flex: 1, padding: '6px 4px', fontSize: 9, cursor: 'pointer',
                      background: 'var(--orange)', color: '#0A0A0B', border: 'none', fontWeight: 600,
                    }}>CONFIRM</button>
                    <button onClick={()=>updateAppointment(a.id, { status: 'declined' })} className="mono" style={{
                      padding: '6px 6px', fontSize: 9, cursor: 'pointer',
                      background: 'transparent', color: 'var(--mute)', border: '1px solid var(--line)',
                    }}><Icon name="close" size={10} /></button>
                  </>
                )}
                {a.status === 'confirmed' && (
                  <button onClick={()=>updateAppointment(a.id, { status: 'in-bay' })} className="mono" style={{
                    flex: 1, padding: '6px 4px', fontSize: 9, cursor: 'pointer',
                    background: 'transparent', color: 'var(--orange)', border: '1px solid var(--orange)', fontWeight: 600,
                  }}>START</button>
                )}
                {a.status === 'in-bay' && (
                  <button onClick={()=>updateAppointment(a.id, { status: 'complete' })} className="mono" style={{
                    flex: 1, padding: '6px 4px', fontSize: 9, cursor: 'pointer',
                    background: 'transparent', color: 'var(--green)', border: '1px solid var(--green)', fontWeight: 600,
                  }}>FINISH</button>
                )}
                {(a.status === 'complete' || a.status === 'declined') && (
                  <button className="mono" style={{
                    flex: 1, padding: '6px 4px', fontSize: 9, cursor: 'pointer',
                    background: 'transparent', color: 'var(--mute)', border: '1px solid var(--line)',
                  }}>VIEW</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BAY PANEL ──────────────────────────────────────────────────────────────
function BayPanel({ appointments, settings }) {
  const bays = Array.from({length: settings.bays}, (_,i)=> String(i+1).padStart(2,'0'));
  const findBay = b => appointments.find(a => a.bay === b && (a.status === 'in-bay' || a.status === 'confirmed'));
  return (
    <div style={{ border: '1px solid var(--line)', background: 'var(--surf)' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: 0.1 }}>[ BAY STATUS ]</div>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bays.map(b => {
          const apt = findBay(b);
          const inBay = apt && apt.status === 'in-bay';
          return (
            <div key={b} style={{
              padding: 12, border: '1px solid var(--line)',
              background: inBay ? 'rgba(255,87,51,0.06)' : 'var(--bg-2)',
              borderLeft: '3px solid ' + (inBay ? 'var(--orange)' : apt ? 'var(--amber)' : 'var(--line-2)'),
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="display" style={{ fontSize: 14, fontWeight: 700 }}>BAY {b}</span>
                <span className="mono" style={{ fontSize: 9, color: inBay ? 'var(--orange)' : apt ? 'var(--amber)' : 'var(--faint)' }}>
                  {inBay ? '● ACTIVE' : apt ? '◯ NEXT' : '— IDLE'}
                </span>
              </div>
              {apt && (
                <div className="mono" style={{ fontSize: 10, color: 'var(--mute)', marginTop: 4 }}>
                  {apt.plate} · {apt.slot.split('·')[1].trim()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SETTINGS ───────────────────────────────────────────────────────────────
function AdminSettings({ settings, setSettings, dark, accent, setTweak }) {
  const days = [
    { k: 'mon', l: 'MON' }, { k: 'tue', l: 'TUE' }, { k: 'wed', l: 'WED' },
    { k: 'thu', l: 'THU' }, { k: 'fri', l: 'FRI' }, { k: 'sat', l: 'SAT' }, { k: 'sun', l: 'SUN' },
  ];
  return (
    <div style={{ padding: 20, maxWidth: 720, color: 'var(--text)' }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--mute)' }}>[ SETTINGS ]</div>
      <div className="display" style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Shop configuration</div>

      {/* Theme */}
      <div style={{ marginTop: 22, border: '1px solid var(--line)', background: 'var(--surf)', padding: 16 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--mute)' }}>[ APPEARANCE ]</div>
        <div className="display" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Theme</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ fontSize: 13 }}>Dark mode</span>
          <button onClick={() => setTweak('dark', !dark)} style={{
            width: 64, height: 32, position: 'relative', cursor: 'pointer',
            background: dark ? 'var(--orange)' : 'var(--line)',
            border: '1px solid ' + (dark ? 'var(--orange)' : 'var(--line-2)'),
            padding: 0,
          }}>
            <span style={{
              position: 'absolute', top: 2, left: dark ? 34 : 2,
              width: 26, height: 26, background: dark ? '#0A0A0B' : 'var(--text)',
              transition: 'left .15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} className="mono">
              <span style={{ fontSize: 8, fontWeight: 700, color: dark ? 'var(--orange)' : 'var(--bg)' }}>
                {dark ? 'ON' : 'OFF'}
              </span>
            </span>
          </button>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--mute)', marginBottom: 8 }}>ACCENT COLOR</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['#FF5733', '#007BFF', '#FFD400', '#34C759', '#E5E5E7'].map(c => (
              <button key={c} onClick={() => setTweak('accent', c)} style={{
                width: 28, height: 28, background: c, cursor: 'pointer',
                border: accent === c ? '2px solid var(--text)' : '2px solid transparent',
                outline: accent === c ? '1px solid var(--line)' : 'none',
                outlineOffset: 2,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Holiday Mode */}
      <div style={{ marginTop: 22, border: '1px solid var(--line)', background: 'var(--surf)', overflow: 'hidden' }}>
        <div style={{ padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 9, color: 'var(--orange)', letterSpacing: 0.1 }}>[ KILL SWITCH ]</div>
            <div className="display" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Holiday Mode</div>
            <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 4, lineHeight: 1.5 }}>
              Disables online booking site-wide. Existing appointments remain visible. Customers see your holiday message instead of the form.
            </div>
          </div>
          <button onClick={()=>setSettings({...settings, holidayMode: !settings.holidayMode})} style={{
            width: 64, height: 32, position: 'relative', cursor: 'pointer',
            background: settings.holidayMode ? 'var(--orange)' : 'var(--line)',
            border: '1px solid ' + (settings.holidayMode ? 'var(--orange)' : 'var(--line-2)'),
            padding: 0,
          }}>
            <span style={{
              position: 'absolute', top: 2, left: settings.holidayMode ? 34 : 2,
              width: 26, height: 26, background: settings.holidayMode ? '#0A0A0B' : 'var(--text)',
              transition: 'left .15s', display:'flex', alignItems:'center', justifyContent:'center',
            }} className="mono">
              <span style={{ fontSize: 8, fontWeight: 700, color: settings.holidayMode ? 'var(--orange)' : 'var(--bg)' }}>
                {settings.holidayMode ? 'ON' : 'OFF'}
              </span>
            </span>
          </button>
        </div>
        {settings.holidayMode && (
          <div style={{ padding: 12, borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
            <FieldLabel>CUSTOMER MESSAGE</FieldLabel>
            <input style={{...inputStyle, marginTop: 4}} value={settings.holidayMessage}
                   onChange={e=>setSettings({...settings, holidayMessage: e.target.value})}/>
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{ marginTop: 16, border: '1px solid var(--line)', background: 'var(--surf)', padding: 16 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--mute)' }}>[ LIVE SHOP STATUS ]</div>
        <div className="display" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Customer-facing indicator</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {[
            { k: 'open',   l: 'OPEN',   c: 'var(--green)' },
            { k: 'busy',   l: 'BUSY',   c: 'var(--amber)' },
            { k: 'closed', l: 'CLOSED', c: 'var(--red)' },
          ].map(s => (
            <button key={s.k} onClick={()=>setSettings({...settings, shopStatus: s.k})} className="mono" style={{
              flex: 1, padding: 12, cursor: 'pointer',
              background: settings.shopStatus === s.k ? s.c : 'transparent',
              color: settings.shopStatus === s.k ? '#0A0A0B' : 'var(--text)',
              border: '1px solid ' + (settings.shopStatus === s.k ? s.c : 'var(--line)'),
              fontSize: 11, fontWeight: 600, letterSpacing: 0.1,
            }}>● {s.l}</button>
          ))}
        </div>
      </div>

      {/* Hours */}
      <div style={{ marginTop: 16, border: '1px solid var(--line)', background: 'var(--surf)', padding: 16 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--mute)' }}>[ HOURS ]</div>
        <div className="display" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Business hours</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
          {days.map(d => (
            <div key={d.k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--mute)', width: 36 }}>{d.l}</span>
              <input style={{...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 10px'}}
                     value={settings.hours[d.k]}
                     onChange={e=>setSettings({...settings, hours: {...settings.hours, [d.k]: e.target.value}})}/>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={{ marginTop: 16, border: '1px solid var(--line)', background: 'var(--surf)', padding: 16 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--mute)' }}>[ CONTACT ]</div>
        <div className="display" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Shop info</div>
        <div style={{ marginTop: 12 }}>
          <Field label="ADDRESS"><input style={inputStyle} value={settings.address} onChange={e=>setSettings({...settings, address: e.target.value})}/></Field>
          <Field label="PHONE"><input style={inputStyle} className="mono" value={settings.phone} onChange={e=>setSettings({...settings, phone: e.target.value})}/></Field>
        </div>
      </div>

      {/* Social */}
      <div style={{ marginTop: 16, border: '1px solid var(--line)', background: 'var(--surf)', padding: 16 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--mute)' }}>[ SOCIAL ]</div>
        <div className="display" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Social links</div>
        <div style={{ marginTop: 12 }}>
          <Field label="INSTAGRAM URL">
            <input style={inputStyle} className="mono" value={settings.instagram || ''}
                   placeholder="https://instagram.com/…"
                   onChange={e => setSettings({...settings, instagram: e.target.value})} />
          </Field>
          <Field label="TIKTOK URL">
            <input style={inputStyle} className="mono" value={settings.tiktok || ''}
                   placeholder="https://tiktok.com/@…"
                   onChange={e => setSettings({...settings, tiktok: e.target.value})} />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── SERVICE MANAGER ────────────────────────────────────────────────────────
function AdminServiceManager({ services: serverServices }) {
  const [services, setServices] = useState(serverServices);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', price: '', duration: '', description: '', category: '' });

  // Keep in sync when query refetches
  React.useEffect(() => { setServices(serverServices); }, [serverServices]);

  const toggleHidden = id => setServices(services.map(s => s.id === id ? {...s, hidden: !s.hidden} : s));
  const remove = id => setServices(services.filter(s => s.id !== id));
  const submitAdd = () => {
    if (!draft.name) return;
    setServices([...services, {
      id: 'svc-' + Math.random().toString(36).slice(2,6),
      name: draft.name, price: Number(draft.price) || 0,
      duration: Number(draft.duration) || 30,
      description: draft.description,
      category: draft.category || 'General',
      hidden: false,
      created_at: new Date().toISOString(),
    }]);
    setDraft({ name: '', price: '', duration: '', description: '', category: '' });
    setAdding(false);
  };

  return (
    <div style={{ padding: 20, color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--mute)' }}>[ SERVICES ]</div>
          <div className="display" style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Service manager</div>
        </div>
        <button onClick={()=>setAdding(true)} className="btn-cta" style={{ padding: '10px 16px', fontSize: 11 }}>
          + NEW SERVICE
        </button>
      </div>

      {adding && (
        <div style={{ marginTop: 18, border: '1px solid var(--orange)', background: 'var(--surf)', padding: 16 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--orange)' }}>[ NEW SERVICE / DRAFT ]</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            <Field label="NAME"><input style={inputStyle} value={draft.name} onChange={e=>setDraft({...draft, name: e.target.value})} placeholder="Tire rotation"/></Field>
            <Field label="PRICE $"><input style={inputStyle} className="mono" value={draft.price} onChange={e=>setDraft({...draft, price: e.target.value})}/></Field>
            <Field label="DURATION (MIN)"><input style={inputStyle} className="mono" value={draft.duration} onChange={e=>setDraft({...draft, duration: e.target.value})}/></Field>
            <Field label="CATEGORY"><input style={inputStyle} value={draft.category} onChange={e=>setDraft({...draft, category: e.target.value})} placeholder="Maintenance"/></Field>
          </div>
          <Field label="DESCRIPTION"><input style={inputStyle} value={draft.description} onChange={e=>setDraft({...draft, description: e.target.value})}/></Field>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submitAdd} className="btn-cta" style={{ padding: '10px 18px', fontSize: 11 }}>SAVE</button>
            <button onClick={()=>setAdding(false)} className="btn-ghost" style={{ padding: '10px 18px', fontSize: 11 }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 18, border: '1px solid var(--line)', background: 'var(--surf)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 80px 100px 120px', padding: '10px 14px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
          {['CATEGORY','SERVICE','MIN','PRICE','STATUS','ACTIONS'].map(h=>(
            <div key={h} className="mono" style={{ fontSize: 9, color: 'var(--mute)', letterSpacing: 0.1 }}>{h}</div>
          ))}
        </div>
        {services.map(s => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '90px 1fr 80px 80px 100px 120px',
            padding: '12px 14px', borderBottom: '1px solid var(--line)',
            alignItems: 'center', opacity: s.hidden ? 0.55 : 1,
          }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--orange)' }}>{s.category}</span>
            <div>
              <div className="display" style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>{s.description}</div>
            </div>
            <span className="mono" style={{ fontSize: 11 }}>{s.duration}min</span>
            <span className="mono" style={{ fontSize: 11 }}>${s.price}</span>
            <span><StatusPill status={s.hidden ? 'declined' : 'confirmed'} /></span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={()=>toggleHidden(s.id)} title={s.hidden ? 'Show' : 'Hide'} style={{
                padding: '6px 8px', cursor: 'pointer',
                background: 'transparent', border: '1px solid var(--line)', color: 'var(--mute)',
              }}>
                <Icon name={s.hidden ? 'eyeOff' : 'eye'} size={12} />
              </button>
              <button onClick={()=>remove(s.id)} style={{
                padding: '6px 8px', cursor: 'pointer',
                background: 'transparent', border: '1px solid var(--line)', color: 'var(--red)',
              }}>
                <Icon name="close" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  AdminSidebar, AdminTopBar, AdminDashboard, AppointmentFeed,
  BayPanel, AdminSettings, AdminServiceManager, StatusPill,
};
