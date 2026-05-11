// Mobile customer app — Home, Services, Booking flow, Success
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "./icons.jsx";
import { MOCK } from "./data.js";

// ─── Shared chrome ──────────────────────────────────────────────────────────
function PhoneTopBar({ status, settings, onStatus }) {
  const label = { open: "OPEN", busy: "BUSY", closed: "CLOSED" }[status];
  const color = {
    open: "var(--green)",
    busy: "var(--amber)",
    closed: "var(--red)",
  }[status];
  return (
    <div
      style={{
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--line)",
        flexShrink: 0,
      }}
    >
      <div
        className="display"
        style={{ fontWeight: 700, fontSize: 18, letterSpacing: 0.4 }}
      >
        RM<span style={{ color: "var(--orange)" }}>/</span>COLLISION
      </div>
      <div
        className="mono"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 10,
          color: "var(--mute)",
          textTransform: "uppercase",
        }}
      >
        <span className="dot dot-pulse" style={{ background: color, color }} />
        <span>{label}</span>
      </div>
    </div>
  );
}

function PhoneTabBar({ tab, setTab }) {
  const items = [
    { id: "home", icon: "home", label: "Home" },
    { id: "services", icon: "grid", label: "Services" },
    { id: "booking", icon: "bolt", label: "Book" },
    { id: "account", icon: "user", label: "Account" },
  ];
  return (
    <div
      style={{
        flexShrink: 0,
        paddingBottom: 8,
        paddingTop: 6,
        background: "var(--bg)",
        borderTop: "1px solid var(--line)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => setTab(it.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            color: tab === it.id ? "var(--text)" : "var(--faint)",
            padding: "4px 8px",
          }}
        >
          <Icon
            name={it.icon}
            size={20}
            strokeWidth={tab === it.id ? 2 : 1.5}
          />
          <span
            className="mono"
            style={{
              fontSize: 9,
              letterSpacing: 0.05,
              textTransform: "uppercase",
            }}
          >
            {it.label}
          </span>
          <div
            style={{
              width: 14,
              height: 2,
              background: tab === it.id ? "var(--orange)" : "transparent",
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ─── HOME ───────────────────────────────────────────────────────────────────
function HomeScreen({ settings, services, setTab, startBooking, theme }) {
  const live = services.filter((s) => !s.hidden).slice(0, 4);
  const blocked = settings.holidayMode || settings.shopStatus === "closed";

  return (
    <div>
      {/* Hero */}
      <div style={{ position: "relative", height: 340, overflow: "hidden" }}>
        <img
          src={MOCK.photos.hero}
          alt=""
          onError={(e) => {
            e.target.style.display = "none";
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(.45) contrast(1.1) saturate(.8)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 30%, var(--bg) 100%)",
          }}
        />
        <div
          className="stripes"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            "--stripe-color": "rgba(255,87,51,0.7)",
          }}
        />

        <div style={{ position: "absolute", top: 18, left: 18, right: 18 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "#fff",
              opacity: 0.7,
              letterSpacing: 0.1,
              textTransform: "uppercase",
            }}
          >
            [EST. 2008] · BAY 03–07 · INDUSTRIAL WAY
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 18,
            right: 18,
            color: "#fff",
          }}
        >
          <div
            className="display"
            style={{
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 0.92,
              letterSpacing: -0.5,
            }}
          >
            BOOK
            <br />
            YOUR LAP
            <br />
            <span style={{ color: "var(--orange)" }}>IN THE BAY</span>
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              opacity: 0.75,
              lineHeight: 1.4,
            }}
          >
            Performance, daily-driver, EV. Diagnostics in 45 minutes or your
            scan is free.
          </div>
        </div>
      </div>

      {/* Status ticker */}
      <div
        style={{
          background: "var(--surf)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          padding: "10px 0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="ticker-track mono"
          style={{
            fontSize: 11,
            color: "var(--mute)",
            textTransform: "uppercase",
            letterSpacing: 0.08,
          }}
        >
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <React.Fragment key={i}>
                <span>
                  <span style={{ color: "var(--orange)" }}>●</span> NEXT SLOT —{" "}
                  {settings.nextSlot}
                </span>
                <span>
                  {settings.activeBays}/{settings.bays} BAYS ACTIVE
                </span>
                <span>AVG. WAIT — 12 MIN</span>
                <span>OIL CHANGE — FROM $89</span>
                <span>DIAG — 45 MIN GUARANTEED</span>
                <span>EV CERTIFIED</span>
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* Instant book panel */}
      <div style={{ padding: "20px 18px 0 18px" }}>
        <div
          style={{
            border: "1px solid var(--line)",
            background: "var(--surf)",
            padding: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="stripes-faint"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 60,
              opacity: 0.6,
            }}
          />
          <div
            className="mono"
            style={{ fontSize: 9, color: "var(--mute)", letterSpacing: 0.1 }}
          >
            [01] INSTANT BOOK
          </div>
          <div
            className="display"
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginTop: 4,
              lineHeight: 1.1,
            }}
          >
            Reserve a bay in {blocked ? "—" : "60 seconds"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginTop: 6,
            }}
          >
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--mute)" }}
            >
              NEXT AVAILABLE
            </span>
            <span
              className="mono"
              style={{ fontSize: 13, color: "var(--orange)", fontWeight: 600 }}
            >
              {blocked ? "UNAVAILABLE" : settings.nextSlot}
            </span>
          </div>
          <button
            className="btn-cta"
            onClick={() => !blocked && startBooking()}
            disabled={blocked}
            style={{
              marginTop: 14,
              width: "100%",
              padding: "14px 16px",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              {blocked ? "HOLIDAY MODE · BOOKING PAUSED" : "START BOOKING"}
            </span>
            {!blocked && <Icon name="arrow" size={16} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Top services */}
      <div style={{ padding: "24px 18px 0 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
              [02] CATALOG
            </div>
            <div className="display" style={{ fontSize: 18, fontWeight: 600 }}>
              Popular Services
            </div>
          </div>
          <button
            onClick={() => setTab("services")}
            className="mono"
            style={{
              background: "none",
              border: "none",
              color: "var(--orange)",
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: 0.05,
            }}
          >
            ALL →
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 12,
          }}
        >
          {live.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid var(--line)",
                background: "var(--surf)",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ color: "var(--orange)" }}>
                  <Icon name={s.icon} size={22} strokeWidth={1.5} />
                </div>
                <span
                  className="mono"
                  style={{ fontSize: 9, color: "var(--faint)" }}
                >
                  {s.code}
                </span>
              </div>
              <div
                className="display"
                style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}
              >
                {s.name}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginTop: "auto",
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 10, color: "var(--mute)" }}
                >
                  {s.minutes}MIN
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 13,
                    color: "var(--text)",
                    fontWeight: 600,
                  }}
                >
                  ${s.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specs strip */}
      <div style={{ padding: "24px 18px 0 18px" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
          [03] BY THE NUMBERS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            marginTop: 8,
            background: "var(--line)",
          }}
        >
          {[
            { v: "4", l: "BAYS" },
            { v: "24h", l: "TURNAROUND" },
            { v: "4.9★", l: "RATING" },
          ].map((x, i) => (
            <div
              key={i}
              style={{
                background: "var(--surf)",
                padding: "14px 10px",
                textAlign: "center",
              }}
            >
              <div
                className="display"
                style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}
              >
                {x.v}
              </div>
              <div
                className="mono"
                style={{ fontSize: 9, color: "var(--mute)", marginTop: 2 }}
              >
                {x.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address card */}
      <div style={{ padding: "24px 18px 0 18px" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
          [04] LOCATION
        </div>
        <div
          style={{
            border: "1px solid var(--line)",
            background: "var(--surf)",
            padding: 14,
            marginTop: 8,
          }}
        >
          <a
            href="https://www.google.com/maps/place/Rodriguez+Marcelo+Collision+Inc./@25.7662268,-80.3110298,17z/data=!3m1!4b1!4m6!3m5!1s0x88d9b9c69c02fdad:0xd004ce92e947c6ab!8m2!3d25.766222!4d-80.3084549!16s%2Fg%2F11z518nl00?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: "var(--surf)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginTop: 6,
              }}
            >
              <Icon name="pin" size={20} stroke="var(--orange)" />
              <div>
                <div
                  className="display"
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  {settings.address}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}
                >
                  {settings.phone}
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Social links */}
      <div style={{ padding: "24px 18px 120px 18px" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
          [05] SOCIAL
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 8,
          }}
        >
          {[
            {
              key: "instagram",
              icon: "instagram",
              label: "Instagram",
              handle: "@rmcollision",
            },
            {
              key: "tiktok",
              icon: "tiktok",
              label: "TikTok",
              handle: "@rmcollision",
            },
          ].map(({ key, icon, label, handle }) => (
            <a
              key={key}
              href={settings[key]}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                border: "1px solid var(--line)",
                background: "var(--surf)",
                padding: 14,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ color: "var(--orange)" }}>
                <Icon name={icon} size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div
                  className="display"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  {label}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 10, color: "var(--mute)", marginTop: 2 }}
                >
                  {handle}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SERVICES CATALOG ───────────────────────────────────────────────────────
function ServicesScreen({
  services,
  cart,
  toggleCart,
  startBookingWith,
  blocked,
}) {
  const live = services.filter((s) => !s.hidden);
  const groups = useMemo(() => {
    const out = {};
    live.forEach((s) => {
      const g = s.code.split(".")[0];
      (out[g] = out[g] || []).push(s);
    });
    return out;
  }, [live]);
  const groupNames = { A: "MAINTENANCE", B: "DIAGNOSTICS", C: "COSMETIC" };

  return (
    <div style={{ paddingBottom: cart.length ? 180 : 120 }}>
      <div style={{ padding: "14px 18px 8px" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
          [CATALOG / 2025]
        </div>
        <div
          className="display"
          style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, marginTop: 4 }}
        >
          Services
        </div>
      </div>

      {Object.entries(groups).map(([g, list]) => (
        <div key={g} style={{ marginTop: 14 }}>
          <div
            className="mono"
            style={{
              padding: "8px 18px",
              fontSize: 10,
              color: "var(--mute)",
              letterSpacing: 0.1,
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
              background: "var(--bg-2)",
            }}
          >
            CLASS [{g}] · {groupNames[g]}
          </div>
          {list.map((s) => {
            const inCart = cart.includes(s.id);
            return (
              <div
                key={s.id}
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--line)",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: inCart ? "var(--orange)" : "var(--text)",
                  }}
                >
                  <Icon name={s.icon} size={22} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                  >
                    <span
                      className="mono"
                      style={{ fontSize: 9, color: "var(--faint)" }}
                    >
                      {s.code}
                    </span>
                    <span
                      className="display"
                      style={{ fontSize: 15, fontWeight: 600 }}
                    >
                      {s.name}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--mute)",
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {s.desc}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span
                      className="mono"
                      style={{ fontSize: 10, color: "var(--mute)" }}
                    >
                      {s.minutes}MIN
                    </span>
                    <span
                      className="mono"
                      style={{ fontSize: 10, color: "var(--mute)" }}
                    >
                      $ {s.price}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleCart(s.id)}
                  style={{
                    width: 32,
                    height: 32,
                    border:
                      "1px solid " + (inCart ? "var(--orange)" : "var(--line)"),
                    background: inCart ? "var(--orange)" : "transparent",
                    color: inCart ? "#0A0A0B" : "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  aria-label={inCart ? "Remove" : "Add"}
                >
                  <Icon
                    name={inCart ? "check" : "plus"}
                    size={16}
                    strokeWidth={2}
                  />
                </button>
              </div>
            );
          })}
        </div>
      ))}

      {/* Sticky cart bar */}
      {cart.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 80,
            zIndex: 25,
            padding: "0 16px",
          }}
        >
          <button
            disabled={blocked}
            onClick={() => startBookingWith(cart)}
            className="btn-cta"
            style={{
              width: "100%",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 13,
            }}
          >
            <span>
              {blocked
                ? "BOOKING PAUSED"
                : `BOOK ${cart.length} SERVICE${cart.length > 1 ? "S" : ""}`}
            </span>
            <span className="mono" style={{ fontSize: 12 }}>
              ${" "}
              {services
                .filter((s) => cart.includes(s.id))
                .reduce((sum, s) => sum + s.price, 0)}{" "}
              →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── BOOKING FLOW (4-step) ──────────────────────────────────────────────────
function BookingScreen({ services, blocked, onSubmit, initialCart, settings }) {
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState({
    year: "2023",
    make: "BMW",
    model: "M340i",
    plate: "",
  });
  const [selected, setSelected] = useState(initialCart || []);
  const [slot, setSlot] = useState(null);
  const [customer, setCustomer] = useState({ name: "", phone: "" });

  useEffect(() => {
    setSelected(initialCart || []);
  }, [initialCart]);

  const steps = ["VEHICLE", "SERVICES", "TIMESLOT", "CONFIRM"];
  const canNext = [
    () => vehicle.year && vehicle.make && vehicle.model,
    () => selected.length > 0,
    () => slot != null,
    () => customer.name && customer.phone,
  ][step]();

  if (blocked) {
    return (
      <div style={{ padding: 30, textAlign: "center", marginTop: 40 }}>
        <div
          className="stripes"
          style={{ height: 6, "--stripe-color": "rgba(255,87,51,0.7)" }}
        />
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--orange)",
            marginTop: 30,
            letterSpacing: 0.1,
          }}
        >
          [ HOLIDAY MODE ]
        </div>
        <div
          className="display"
          style={{ fontSize: 24, fontWeight: 700, marginTop: 10 }}
        >
          Booking paused
        </div>
        <div
          style={{
            color: "var(--mute)",
            marginTop: 8,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {settings.holidayMessage}
        </div>
      </div>
    );
  }

  const submit = () => {
    onSubmit({ vehicle, services: selected, slot, customer });
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Stepper */}
      <div style={{ padding: "14px 18px 0" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
          [BOOKING / STEP {step + 1} OF 4]
        </div>
        <div
          className="display"
          style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}
        >
          {steps[step].toLowerCase()}.
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                background: i <= step ? "var(--orange)" : "var(--line)",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 18px 0" }}>
        {step === 0 && (
          <StepVehicle vehicle={vehicle} setVehicle={setVehicle} />
        )}
        {step === 1 && (
          <StepServices
            services={services}
            selected={selected}
            setSelected={setSelected}
          />
        )}
        {step === 2 && (
          <StepSlot slot={slot} setSlot={setSlot} settings={settings} />
        )}
        {step === 3 && (
          <StepConfirm
            vehicle={vehicle}
            services={services}
            selected={selected}
            slot={slot}
            customer={customer}
            setCustomer={setCustomer}
          />
        )}
      </div>

      {/* Action bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 80,
          zIndex: 25,
          padding: "0 16px",
          display: "flex",
          gap: 8,
        }}
      >
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="btn-ghost"
            style={{ padding: "14px 16px", fontSize: 13 }}
          >
            ← BACK
          </button>
        )}
        <button
          onClick={() => (step === 3 ? submit() : setStep(step + 1))}
          disabled={!canNext}
          className="btn-cta"
          style={{
            flex: 1,
            padding: "14px 16px",
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{step === 3 ? "CONFIRM BOOKING" : "CONTINUE"}</span>
          <Icon name="arrow" size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export function FieldLabel({ children }) {
  return (
    <div
      className="mono"
      style={{
        fontSize: 9,
        color: "var(--mute)",
        letterSpacing: 0.1,
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}
export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--surf)",
  border: "1px solid var(--line)",
  color: "var(--text)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  borderRadius: 0,
};

function StepVehicle({ vehicle, setVehicle }) {
  return (
    <>
      <div
        style={{
          background: "var(--surf-2)",
          padding: 14,
          marginBottom: 16,
          borderLeft: "2px solid var(--orange)",
        }}
      >
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
          VIN / PLATE WILL UNLOCK SERVICE HISTORY
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Field label="YEAR">
          <input
            style={inputStyle}
            value={vehicle.year}
            onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
          />
        </Field>
        <Field label="PLATE">
          <input
            style={inputStyle}
            className="mono"
            value={vehicle.plate}
            placeholder="—"
            onChange={(e) =>
              setVehicle({ ...vehicle, plate: e.target.value.toUpperCase() })
            }
          />
        </Field>
      </div>
      <Field label="MAKE">
        <select
          style={inputStyle}
          value={vehicle.make}
          onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
        >
          {MOCK.vehicleMakes.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </Field>
      <Field label="MODEL">
        <input
          style={inputStyle}
          value={vehicle.model}
          onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
        />
      </Field>
    </>
  );
}

function StepServices({ services, selected, setSelected }) {
  const toggle = (id) =>
    setSelected(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  const live = services.filter((s) => !s.hidden);
  const total = live
    .filter((s) => selected.includes(s.id))
    .reduce((a, b) => a + b.price, 0);
  const mins = live
    .filter((s) => selected.includes(s.id))
    .reduce((a, b) => a + b.minutes, 0);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
          {selected.length} SELECTED
        </span>
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--text)", fontWeight: 600 }}
        >
          $ {total} · {mins}min
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {live.map((s) => {
          const on = selected.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                border: "1px solid " + (on ? "var(--orange)" : "var(--line)"),
                background: on ? "rgba(255,87,51,0.05)" : "var(--surf)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ color: on ? "var(--orange)" : "var(--text)" }}>
                <Icon name={s.icon} size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  className="display"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {s.name}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 10, color: "var(--mute)" }}
                >
                  {s.minutes}MIN · ${s.price}
                </div>
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  border: "1px solid " + (on ? "var(--orange)" : "var(--line)"),
                  background: on ? "var(--orange)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0A0A0B",
                }}
              >
                {on && <Icon name="check" size={14} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepSlot({ slot, setSlot, settings }) {
  const days = [
    { d: "TUE", n: "12", sub: "TODAY" },
    { d: "WED", n: "13", sub: "TMRW" },
    { d: "THU", n: "14", sub: "" },
    { d: "FRI", n: "15", sub: "" },
    { d: "SAT", n: "16", sub: "" },
  ];
  const [day, setDay] = useState(0);
  const times = ["09:00", "10:30", "11:30", "13:00", "14:00", "15:30", "16:45"];
  const unavailable = ["09:00", "11:30"];
  return (
    <>
      <FieldLabel>SELECT DAY</FieldLabel>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setDay(i)}
            style={{
              flex: 1,
              padding: "10px 4px",
              cursor: "pointer",
              border:
                "1px solid " + (day === i ? "var(--orange)" : "var(--line)"),
              background: day === i ? "var(--orange)" : "var(--surf)",
              color: day === i ? "#0A0A0B" : "var(--text)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <span className="mono" style={{ fontSize: 9, opacity: 0.7 }}>
              {d.d}
            </span>
            <span className="display" style={{ fontSize: 18, fontWeight: 700 }}>
              {d.n}
            </span>
            {d.sub && (
              <span className="mono" style={{ fontSize: 8 }}>
                {d.sub}
              </span>
            )}
          </button>
        ))}
      </div>
      <FieldLabel>AVAILABLE TIMES — BAY ASSIGNED ON CONFIRM</FieldLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
        }}
      >
        {times.map((t) => {
          const off = unavailable.includes(t) && day === 0;
          const on = slot === `${days[day].d} · ${t}`;
          return (
            <button
              key={t}
              disabled={off}
              onClick={() => setSlot(`${days[day].d} · ${t}`)}
              style={{
                padding: "12px 4px",
                cursor: off ? "not-allowed" : "pointer",
                border: "1px solid " + (on ? "var(--orange)" : "var(--line)"),
                background: on
                  ? "var(--orange)"
                  : off
                    ? "transparent"
                    : "var(--surf)",
                color: on ? "#0A0A0B" : off ? "var(--faint)" : "var(--text)",
                textDecoration: off ? "line-through" : "none",
              }}
              className="mono"
            >
              {t}
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepConfirm({
  vehicle,
  services,
  selected,
  slot,
  customer,
  setCustomer,
}) {
  const items = services.filter((s) => selected.includes(s.id));
  const total = items.reduce((a, b) => a + b.price, 0);
  const mins = items.reduce((a, b) => a + b.minutes, 0);
  return (
    <>
      <div
        style={{
          background: "var(--surf)",
          border: "1px solid var(--line)",
          padding: 14,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px dashed var(--line)",
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
              VEHICLE
            </div>
            <div className="display" style={{ fontSize: 14, fontWeight: 600 }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
          </div>
          <div
            className="mono"
            style={{ fontSize: 11, color: "var(--orange)" }}
          >
            {vehicle.plate || "—"}
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
            SLOT
          </div>
          <div className="display" style={{ fontSize: 14, fontWeight: 600 }}>
            {slot || "—"}
          </div>
        </div>
        <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
          <div
            className="mono"
            style={{ fontSize: 9, color: "var(--mute)", marginBottom: 6 }}
          >
            SERVICES — {items.length}
          </div>
          {items.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span>
                <span
                  className="mono"
                  style={{ color: "var(--faint)", marginRight: 6 }}
                >
                  {s.code}
                </span>
                {s.name}
              </span>
              <span className="mono" style={{ color: "var(--mute)" }}>
                ${s.price}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid var(--line)",
            marginTop: 10,
            paddingTop: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>
            EST. {mins}MIN
          </span>
          <span className="display" style={{ fontSize: 18, fontWeight: 700 }}>
            $ {total}
          </span>
        </div>
      </div>

      <Field label="YOUR NAME">
        <input
          style={inputStyle}
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          placeholder="Alex Vasquez"
        />
      </Field>
      <Field label="MOBILE">
        <input
          style={inputStyle}
          className="mono"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          placeholder="+1 415 555 0142"
        />
      </Field>
    </>
  );
}

// ─── SUCCESS MODAL ──────────────────────────────────────────────────────────
function SuccessModal({ data, services, onClose }) {
  if (!data) return null;
  const items = services.filter((s) => data.services.includes(s.id));
  const ref = "RM-" + Math.floor(Math.random() * 9000 + 1000);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          background: "var(--surf)",
          width: "100%",
          borderTop: "1px solid var(--line-2)",
          padding: "20px 18px 110px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="stripes"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            "--stripe-color": "rgba(255,87,51,0.8)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--orange)" }}
            >
              ● CONFIRMED
            </div>
            <div
              className="display"
              style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}
            >
              You're in.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--line)",
              width: 34,
              height: 34,
              cursor: "pointer",
              color: "var(--text)",
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div
          style={{
            marginTop: 16,
            padding: 14,
            border: "1px solid var(--line)",
            background: "var(--bg)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              className="mono"
              style={{ fontSize: 9, color: "var(--mute)" }}
            >
              BOOKING REF
            </span>
            <span
              className="mono"
              style={{ fontSize: 14, color: "var(--orange)", fontWeight: 600 }}
            >
              {ref}
            </span>
          </div>
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div>
              <div
                className="mono"
                style={{ fontSize: 9, color: "var(--mute)" }}
              >
                SLOT
              </div>
              <div
                className="display"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                {data.slot}
              </div>
            </div>
            <div>
              <div
                className="mono"
                style={{ fontSize: 9, color: "var(--mute)" }}
              >
                BAY
              </div>
              <div
                className="display"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                #0{Math.floor(Math.random() * 4) + 1}
              </div>
            </div>
          </div>
        </div>
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--mute)",
            marginTop: 14,
            lineHeight: 1.5,
          }}
        >
          Text confirmation sent to {data.customer.phone}.<br />
          Cancel up to 2h before your slot, no charge.
        </div>
        <button
          onClick={onClose}
          className="btn-cta"
          style={{
            width: "100%",
            padding: "14px 16px",
            marginTop: 16,
            fontSize: 13,
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );
}

// ─── ACCOUNT (stub) ─────────────────────────────────────────────────────────
function AccountScreen({ history }) {
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: "14px 18px 8px" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>
          [ACCOUNT]
        </div>
        <div
          className="display"
          style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, marginTop: 4 }}
        >
          Garage
        </div>
      </div>

      <div style={{ padding: "16px 18px" }}>
        <div
          style={{
            border: "1px solid var(--line)",
            background: "var(--surf)",
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: "var(--orange)",
              color: "#0A0A0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="display"
          >
            <span style={{ fontSize: 18, fontWeight: 700 }}>AV</span>
          </div>
          <div style={{ flex: 1 }}>
            <div className="display" style={{ fontSize: 16, fontWeight: 600 }}>
              Alex Vasquez
            </div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--mute)" }}
            >
              MEMBER · SINCE 2022
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 18px" }}>
        <div
          className="mono"
          style={{ fontSize: 9, color: "var(--mute)", marginBottom: 8 }}
        >
          [ MY VEHICLE ]
        </div>
        <div
          style={{ border: "1px solid var(--line)", background: "var(--surf)" }}
        >
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                className="display"
                style={{ fontSize: 15, fontWeight: 600 }}
              >
                2021 BMW M340i
              </div>
              <span className="mono" style={{ color: "var(--orange)" }}>
                RM·2841
              </span>
            </div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}
            >
              VIN ··· 7K28 · 41,280 MI
            </div>
          </div>
          <div
            style={{
              height: 90,
              background: "#222",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={MOCK.photos.car}
              onError={(e) => {
                e.target.style.display = "none";
              }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(.7)",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 18px" }}>
        <div
          className="mono"
          style={{ fontSize: 9, color: "var(--mute)", marginBottom: 8 }}
        >
          [ HISTORY · {history.length} ]
        </div>
        {history.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--mute)" }}>
            No prior visits.
          </div>
        )}
        {history.map((h, i) => (
          <div
            key={i}
            style={{
              borderTop: "1px solid var(--line)",
              padding: "12px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                className="display"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                {h.slot}
              </div>
              <div
                className="mono"
                style={{ fontSize: 10, color: "var(--mute)" }}
              >
                {h.services.join(", ")}
              </div>
            </div>
            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--orange)" }}
            >
              {h.ref}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  PhoneTopBar,
  PhoneTabBar,
  HomeScreen,
  ServicesScreen,
  BookingScreen,
  SuccessModal,
  AccountScreen,
};
