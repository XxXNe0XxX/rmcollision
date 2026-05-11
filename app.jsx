// App — top-level state + layout (phone + desktop side-by-side)
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": true,
  "accent": "#FF5733",
  "shopStatus": "open",
  "holidayMode": false,
  "showAdmin": true,
  "showPhone": true,
  "stripeIntensity": "medium"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [services, setServices] = useStateApp(MOCK.services);
  const [appointments, setAppointments] = useStateApp(MOCK.appointments);
  const [settings, setSettings] = useStateApp(MOCK.settings);
  const [tab, setTab] = useStateApp('home');
  const [cart, setCart] = useStateApp([]);
  const [bookingInit, setBookingInit] = useStateApp([]);
  const [success, setSuccess] = useStateApp(null);
  const [history, setHistory] = useStateApp([]);
  const [adminPage, setAdminPage] = useStateApp('dash');

  // Sync tweaks → settings
  useEffectApp(() => {
    setSettings(s => ({ ...s, holidayMode: t.holidayMode, shopStatus: t.shopStatus }));
  }, [t.holidayMode, t.shopStatus]);

  // Apply accent globally
  useEffectApp(() => {
    document.documentElement.style.setProperty('--orange', t.accent);
  }, [t.accent]);

  const themeClass = t.dark ? 'theme-dark' : 'theme-light';
  const blocked = settings.holidayMode || settings.shopStatus === 'closed';

  const toggleCart = id => setCart(c => c.includes(id) ? c.filter(x=>x!==id) : [...c, id]);

  const startBooking = () => {
    setBookingInit([]);
    setTab('booking');
  };
  const startBookingWith = (ids) => {
    setBookingInit(ids);
    setTab('booking');
  };

  const submitBooking = (data) => {
    console.log('[BOOKING SUBMIT]', data);
    // add to admin feed
    const newAppt = {
      id: 'apt-' + Math.floor(Math.random()*9000+1000),
      plate: data.vehicle.plate || 'NEW',
      customer: data.customer.name,
      vehicle: `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`,
      services: data.services,
      slot: data.slot,
      status: 'pending', bay: '0' + (Math.floor(Math.random()*4)+1),
      mileage: 0,
    };
    setAppointments(a => [newAppt, ...a]);
    setSuccess(data);
  };

  const closeSuccess = () => {
    if (success) {
      const items = services.filter(s => success.services.includes(s.id));
      setHistory(h => [{ slot: success.slot, services: items.map(i=>i.name), ref: 'RM-' + Math.floor(Math.random()*9000+1000) }, ...h]);
    }
    setSuccess(null);
    setCart([]);
    setBookingInit([]);
    setTab('home');
  };

  const updateAppointment = (id, patch) => {
    setAppointments(a => a.map(x => x.id === id ? {...x, ...patch} : x));
  };

  // Mobile content
  const mobileScreen = (() => {
    switch (tab) {
      case 'home':     return <HomeScreen settings={settings} services={services} setTab={setTab} startBooking={startBooking} theme={t.dark ? 'dark' : 'light'} />;
      case 'services': return <ServicesScreen services={services} cart={cart} toggleCart={toggleCart} startBookingWith={startBookingWith} blocked={blocked} />;
      case 'booking':  return <BookingScreen services={services} blocked={blocked} settings={settings} onSubmit={submitBooking} initialCart={bookingInit.length ? bookingInit : cart} />;
      case 'account':  return <AccountScreen history={history} />;
      default: return null;
    }
  })();

  const adminContent = (() => {
    switch (adminPage) {
      case 'dash':  return <AdminDashboard appointments={appointments} services={services} settings={settings} updateAppointment={updateAppointment} />;
      case 'feed':  return <div style={{padding:20}}><div className="mono" style={{fontSize:10,color:'var(--mute)'}}>[ APPOINTMENTS ]</div><div className="display" style={{fontSize:28,fontWeight:700,marginTop:4,marginBottom:16,color:'var(--text)'}}>All appointments</div><AppointmentFeed appointments={appointments} services={services} updateAppointment={updateAppointment} /></div>;
      case 'bays':  return <div style={{padding:20}}><div className="mono" style={{fontSize:10,color:'var(--mute)'}}>[ BAYS ]</div><div className="display" style={{fontSize:28,fontWeight:700,marginTop:4,marginBottom:16,color:'var(--text)'}}>Shop floor</div><div style={{maxWidth:500}}><BayPanel appointments={appointments} settings={settings} /></div></div>;
      case 'svc':   return <AdminServiceManager services={services} setServices={setServices} />;
      case 'set':   return <AdminSettings settings={settings} setSettings={(s)=>{ setSettings(s); setTweak({ holidayMode: s.holidayMode, shopStatus: s.shopStatus }); }} />;
      default: return null;
    }
  })();

  return (
    <div className={themeClass} style={{
      minHeight: '100vh', background: 'var(--bg-2)', color: 'var(--text)',
      padding: '32px 24px', fontFamily: 'var(--font-body)',
    }}>
      {/* Page header */}
      <div style={{ maxWidth: 1620, margin: '0 auto 24px' }}>
        <div className="stripes" style={{ height: 6, '--stripe-color': t.accent + 'BF' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: 0.1 }}>
              [ PROTOTYPE / 2026.05 ] · CUSTOMER APP × ADMIN COMMAND CENTER
            </div>
            <div className="display" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, marginTop: 6 }}>
              RM<span style={{ color: 'var(--orange)' }}>/</span>COLLISION
              <span style={{ color: 'var(--mute)', fontWeight: 500, marginLeft: 12, fontSize: 18 }}>// performance auto care</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }} className="mono">
            <div style={{ fontSize: 10, color: 'var(--mute)' }}>
              <span style={{ color: 'var(--orange)' }}>●</span> THEME · {t.dark ? 'DARK' : 'LIGHT'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--mute)' }}>SHOP · {settings.shopStatus.toUpperCase()}</div>
            <div style={{ fontSize: 10, color: 'var(--mute)' }}>{appointments.length} APPOINTMENTS</div>
          </div>
        </div>
      </div>

      {/* Stage */}
      <div style={{ maxWidth: 1620, margin: '0 auto', display: 'flex', gap: 32, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
        {t.showPhone && (
          <div style={{ flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--mute)', marginBottom: 10, textAlign: 'center', letterSpacing: 0.1 }}>
              ↳ CUSTOMER · iOS
            </div>
            <div style={{ position: 'relative' }}>
              <IOSDevice dark={t.dark} width={390} height={844}>
                <PhoneTopBar status={settings.shopStatus} settings={settings} onStatus={(v)=>setTweak('shopStatus', v)} />
                <div className="phone-scroll" style={{ height: 'calc(100% - 110px)', overflowY: 'auto', background: 'var(--bg)' }}>
                  {mobileScreen}
                </div>
                <PhoneTabBar tab={tab} setTab={setTab} />
                <SuccessModal data={success} services={services} onClose={closeSuccess} />
              </IOSDevice>
            </div>
          </div>
        )}

        {t.showAdmin && (
          <div style={{ flex: 1, minWidth: 520, maxWidth: 1120 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--mute)', marginBottom: 10, textAlign: 'center', letterSpacing: 0.1 }}>
              ↳ ADMIN · COMMAND CENTER
            </div>
            <ChromeWindow tabs={[{ title: 'RM/COLLISION — Admin' }, { title: 'Bookings' }]}
                          activeIndex={0} url="admin.rmcollision.io/dashboard"
                          width="100%" height={920}>
              <div className={themeClass} style={{ display: 'flex', height: '100%', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
                <AdminSidebar page={adminPage} setPage={setAdminPage} settings={settings} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <AdminTopBar settings={settings} />
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {adminContent}
                  </div>
                </div>
              </div>
            </ChromeWindow>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 1620, margin: '40px auto 0', display: 'flex', justifyContent: 'space-between' }} className="mono">
        <div style={{ fontSize: 10, color: 'var(--faint)' }}>RM/COLLISION · PROTOTYPE · CLIENT-SIDE ONLY · NO DB</div>
        <div style={{ fontSize: 10, color: 'var(--faint)' }}>↳ TOGGLE TWEAKS · TOP RIGHT</div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakToggle label="Dark mode" value={t.dark} onChange={(v)=>setTweak('dark', v)} />
          <TweakColor label="Accent" value={t.accent} options={[
            '#FF5733', '#007BFF', '#FFD400', '#34C759', '#E5E5E7'
          ]} onChange={(v)=>setTweak('accent', v)} />
        </TweakSection>
        <TweakSection label="Shop state (live)">
          <TweakRadio label="Status" value={t.shopStatus} options={['open','busy','closed']} onChange={(v)=>setTweak('shopStatus', v)} />
          <TweakToggle label="Holiday mode" value={t.holidayMode} onChange={(v)=>setTweak('holidayMode', v)} />
        </TweakSection>
        <TweakSection label="Stage">
          <TweakToggle label="Phone" value={t.showPhone} onChange={(v)=>setTweak('showPhone', v)} />
          <TweakToggle label="Admin" value={t.showAdmin} onChange={(v)=>setTweak('showAdmin', v)} />
        </TweakSection>
        <TweakSection label="Demo">
          <TweakButton label="Jump to booking" onClick={()=>{ setTab('booking'); setBookingInit(['svc-oil','svc-tire']); }} />
          <TweakButton secondary label="Reset data" onClick={()=>{
            setServices(MOCK.services);
            setAppointments(MOCK.appointments);
            setSettings(MOCK.settings);
            setCart([]); setHistory([]); setTab('home'); setAdminPage('dash');
          }} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
