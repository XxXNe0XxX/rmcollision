// App — route-level split: mobile at /:tab, admin at /admin/:page
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { MOCK } from "./data.js";
import { useServices } from "./hooks/useServices.ts";
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakToggle,
  TweakColor,
  TweakRadio,
  TweakButton,
} from "./tweaks-panel.jsx";
import {
  PhoneTopBar,
  PhoneTabBar,
  HomeScreen,
  ServicesScreen,
  BookingScreen,
  SuccessModal,
  AccountScreen,
} from "./mobile.jsx";
import {
  AdminSidebar,
  AdminTopBar,
  AdminDashboard,
  AppointmentFeed,
  BayPanel,
  AdminSettings,
  AdminServiceManager,
} from "./admin.jsx";

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  dark: true,
  accent: "#FF5733",
  shopStatus: "open",
  holidayMode: false,
  stripeIntensity: "medium",
}; /*EDITMODE-END*/

// ─── Mobile view ────────────────────────────────────────────────────────────

function MobileView({ services, settings, setSettings, setTweak, t, blocked }) {
  const { tab = "home" } = useParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [bookingInit, setBookingInit] = useState([]);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);

  const setTab = (newTab) => navigate("/" + newTab);

  const toggleCart = (id) =>
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const startBooking = () => {
    setBookingInit([]);
    setTab("booking");
  };
  const startBookingWith = (ids) => {
    setBookingInit(ids);
    setTab("booking");
  };

  const submitBooking = (data) => {
    setSuccess(data);
  };

  const closeSuccess = () => {
    if (success) {
      const items = services.filter((s) => success.services.includes(s.id));
      setHistory((h) => [
        {
          slot: success.slot,
          services: items.map((i) => i.name),
          ref: "RM-" + Math.floor(Math.random() * 9000 + 1000),
        },
        ...h,
      ]);
    }
    setSuccess(null);
    setCart([]);
    setBookingInit([]);
    setTab("home");
  };

  const screen = (() => {
    switch (tab) {
      case "home":
        return (
          <HomeScreen
            settings={settings}
            services={services}
            setTab={setTab}
            startBooking={startBooking}
            theme={t.dark ? "dark" : "light"}
          />
        );
      case "services":
        return (
          <ServicesScreen
            services={services}
            cart={cart}
            toggleCart={toggleCart}
            startBookingWith={startBookingWith}
            blocked={blocked}
          />
        );
      case "booking":
        return (
          <BookingScreen
            services={services}
            blocked={blocked}
            settings={settings}
            onSubmit={submitBooking}
            initialCart={bookingInit.length ? bookingInit : cart}
          />
        );
      case "account":
        return <AccountScreen history={history} />;
      default:
        return <Navigate to="/home" replace />;
    }
  })();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <PhoneTopBar
        status={settings.shopStatus}
        settings={settings}
        onStatus={(v) => setTweak("shopStatus", v)}
      />
      <div
        className="phone-scroll"
        style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}
      >
        {screen}
      </div>
      <PhoneTabBar tab={tab} setTab={setTab} />
      <SuccessModal data={success} services={services} onClose={closeSuccess} />

      {/* <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakToggle
            label="Dark mode"
            value={t.dark}
            onChange={(v) => setTweak("dark", v)}
          />
          <TweakColor
            label="Accent"
            value={t.accent}
            options={["#FF5733", "#007BFF", "#FFD400", "#34C759", "#E5E5E7"]}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
        <TweakSection label="Shop state (live)">
          <TweakRadio
            label="Status"
            value={t.shopStatus}
            options={["open", "busy", "closed"]}
            onChange={(v) => setTweak("shopStatus", v)}
          />
          <TweakToggle
            label="Holiday mode"
            value={t.holidayMode}
            onChange={(v) => setTweak("holidayMode", v)}
          />
        </TweakSection>
        <TweakSection label="Demo">
          <TweakButton
            label="Jump to booking"
            onClick={() => {
              setBookingInit(["svc-oil", "svc-tire"]);
              setTab("booking");
            }}
          />
        </TweakSection>
      </TweaksPanel> */}
    </div>
  );
}

// ─── Admin view ──────────────────────────────────────────────────────────────

function AdminView({
  services,
  appointments,
  setAppointments,
  settings,
  setSettings,
  setTweak,
  t,
}) {
  const { page = "dash" } = useParams();
  const navigate = useNavigate();

  const setPage = (p) => navigate("/admin/" + p);

  const updateAppointment = (id, patch) => {
    setAppointments((a) =>
      a.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  };

  const content = (() => {
    switch (page) {
      case "dash":
        return (
          <AdminDashboard
            appointments={appointments}
            services={services}
            settings={settings}
            updateAppointment={updateAppointment}
          />
        );
      case "feed":
        return (
          <div style={{ padding: 20 }}>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--mute)" }}
            >
              [ APPOINTMENTS ]
            </div>
            <div
              className="display"
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginTop: 4,
                marginBottom: 16,
                color: "var(--text)",
              }}
            >
              All appointments
            </div>
            <AppointmentFeed
              appointments={appointments}
              services={services}
              updateAppointment={updateAppointment}
            />
          </div>
        );
      case "bays":
        return (
          <div style={{ padding: 20 }}>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--mute)" }}
            >
              [ BAYS ]
            </div>
            <div
              className="display"
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginTop: 4,
                marginBottom: 16,
                color: "var(--text)",
              }}
            >
              Shop floor
            </div>
            <div style={{ maxWidth: 500 }}>
              <BayPanel appointments={appointments} settings={settings} />
            </div>
          </div>
        );
      case "svc":
        return <AdminServiceManager services={services} />;
      case "set":
        return (
          <AdminSettings
            settings={settings}
            setSettings={(s) => {
              setSettings(s);
              setTweak({
                holidayMode: s.holidayMode,
                shopStatus: s.shopStatus,
              });
            }}
            dark={t.dark}
            accent={t.accent}
            setTweak={setTweak}
          />
        );
      default:
        return <Navigate to="/admin/dash" replace />;
    }
  })();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background: "var(--bg-2)",
        overflow: "hidden",
      }}
    >
      <AdminSidebar page={page} setPage={setPage} settings={settings} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <AdminTopBar settings={settings} />
        <div style={{ flex: 1, overflowY: "auto" }}>{content}</div>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const [appointments, setAppointments] = useState(MOCK.appointments);
  const [settings, setSettings] = useState(MOCK.settings);

  useEffect(() => {
    setSettings((s) => ({
      ...s,
      holidayMode: t.holidayMode,
      shopStatus: t.shopStatus,
    }));
  }, [t.holidayMode, t.shopStatus]);

  useEffect(() => {
    document.documentElement.style.setProperty("--orange", t.accent);
  }, [t.accent]);

  const themeClass = t.dark ? "theme-dark" : "theme-light";
  const blocked = settings.holidayMode || settings.shopStatus === "closed";

  const sharedProps = {
    services,
    appointments,
    setAppointments,
    settings,
    setSettings,
    setTweak,
    t,
  };

  return (
    <div
      className={themeClass}
      style={{ color: "var(--text)", fontFamily: "var(--font-body)" }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dash" replace />} />
        <Route path="/admin/:page" element={<AdminView {...sharedProps} />} />
        <Route
          path="/:tab"
          element={<MobileView {...sharedProps} blocked={blocked} />}
        />
      </Routes>
    </div>
  );
}

export default App;
