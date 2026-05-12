// Booking flow — 4-step form
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "./icons.jsx";
import { MOCK } from "./data.js";
import { supabase } from "@/lib/supabaseClient";

// ─── Shared UI primitives (re-exported for admin.jsx compat) ────────────────
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

export function Field({ label, required, disabled, children }) {
  return (
    <div style={{ marginBottom: 14, opacity: disabled ? 0.45 : 1, transition: 'opacity 0.15s' }}>
      <div
        className="mono"
        style={{
          fontSize: 9,
          color: "var(--mute)",
          letterSpacing: 0.1,
          marginBottom: 4,
        }}
      >
        {label}
        {required && (
          <span style={{ color: disabled ? "var(--mute)" : "var(--orange)", marginLeft: 2 }}>*</span>
        )}
      </div>
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
  boxSizing: "border-box",
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1996 + 1 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

// ─── Suggestion input (combobox) ─────────────────────────────────────────────
function SuggestionInput({
  value,
  onChange,
  options,
  placeholder,
  className,
  searching = false,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = value
    ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
    : options;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        style={{ ...inputStyle, cursor: disabled ? 'not-allowed' : 'text', paddingRight: value ? 36 : 14 }}
        className={className}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        onFocus={() => !disabled && setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
      />
      {value && !disabled && (
        <button
          onMouseDown={(e) => { e.preventDefault(); onChange(''); setOpen(false); }}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--mute)', fontSize: 16, lineHeight: 1,
          }}
          tabIndex={-1}
          aria-label="Clear"
        >
          ×
        </button>
      )}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: 200,
            overflowY: "auto",
            background: "var(--surf)",
            border: "1px solid var(--orange)",
            borderTop: "1px solid var(--line)",
          }}
        >
          {/* "Not listed" always at top */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              textAlign: "left",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--line)",
              cursor: "pointer",
              color: "var(--mute)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: 0.05,
            }}
          >
            ↵ NOT LISTED — ENTER MANUALLY
          </button>

          {filtered.map((o) => (
            <button
              key={o}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(o);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                textAlign: "left",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--line)",
                cursor: "pointer",
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: 13,
              }}
            >
              {o}
            </button>
          ))}

          {searching && (
            <div
              style={{
                padding: "10px 12px",
                color: "var(--orange)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
              }}
            >
              SEARCHING…
            </div>
          )}

          {!searching && filtered.length === 0 && value && (
            <div
              style={{
                padding: "10px 12px",
                color: "var(--faint)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
              }}
            >
              NO MATCHES · TYPE TO ENTER MANUALLY
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const NHTSA = 'https://vpic.nhtsa.dot.gov/api/vehicles';

async function fetchModelsByMakeYear(make, year) {
  const url = `${NHTSA}/getmodelsformakeyear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.Results ?? [])
    .map(r => r.Model_Name)
    .filter(Boolean)
    .sort();
}

// ─── Step 1: Vehicle ──────────────────────────────────────────────────────────
function StepVehicle({ vehicle, setVehicle }) {
  const [showVin, setShowVin] = useState(false);

  // Make state
  const [topMakes, setTopMakes]       = useState([]);
  const [makeOptions, setMakeOptions] = useState([]);
  const [makeSearching, setMakeSearching] = useState(false);
  const makeDebounce = useRef(null);

  // Model state
  const [modelOptions, setModelOptions]   = useState([]);
  const [modelSearching, setModelSearching] = useState(false);

  // Load popular makes once on mount
  useEffect(() => {
    supabase.from('top_makes').select('mfr_name').order('mfr_name')
      .then(({ data, error }) => {
        if (!error && data) {
          const names = data.map(r => r.mfr_name);
          setTopMakes(names);
          setMakeOptions(names);
        }
      });
  }, []);

  // Fetch NHTSA models whenever make + year are both set
  useEffect(() => {
    if (!vehicle.make || !vehicle.year) {
      setModelOptions([]);
      return;
    }
    let cancelled = false;
    setModelSearching(true);
    fetchModelsByMakeYear(vehicle.make, vehicle.year).then(names => {
      if (!cancelled) {
        setModelOptions(names);
        setModelSearching(false);
      }
    });
    return () => { cancelled = true; };
  }, [vehicle.make, vehicle.year]);

  const handleYearChange = (v) => {
    setVehicle(prev => ({ ...prev, year: v, model: '' }));
  };

  const handleMakeChange = (v) => {
    setVehicle(prev => ({ ...prev, make: v, model: '' }));
    clearTimeout(makeDebounce.current);

    const inTopList = topMakes.some(m => m.toLowerCase().includes(v.toLowerCase()));

    if (v.length >= 4 && !inTopList) {
      makeDebounce.current = setTimeout(async () => {
        setMakeSearching(true);
        const { data, error } = await supabase
          .from('all_makes').select('make_name')
          .ilike('make_name', `%${v}%`).limit(25);
        if (!error && data) setMakeOptions(data.map(r => r.make_name));
        setMakeSearching(false);
      }, 350);
    } else {
      setMakeOptions(topMakes);
    }
  };

  const makeReady  = !!vehicle.year;
  const modelReady = !!vehicle.year && !!vehicle.make;

  return (
    <>
      {/* VIN lookup panel */}
      <div
        style={{
          marginBottom: 16,
          border: "1px solid var(--line)",
          background: "var(--bg-2)",
        }}
      >
        <button
          onClick={() => setShowVin((v) => !v)}
          style={{
            width: "100%",
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
            LOOKUP BY VIN
          </span>
          <span
            className="mono"
            style={{ fontSize: 12, color: "var(--orange)" }}
          >
            {showVin ? "−" : "+"}
          </span>
        </button>

        {showVin && (
          <div
            style={{
              padding: "0 14px 14px",
              borderTop: "1px solid var(--line)",
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 9,
                color: "var(--mute)",
                padding: "10px 0 8px",
              }}
            >
              VIN · 17 CHARACTERS · WILL AUTO-FILL DETAILS
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                style={{ ...inputStyle, flex: 1, textTransform: "uppercase" }}
                className="mono"
                value={vehicle.vin || ""}
                placeholder="e.g. 1HGBH41JXMN109186"
                maxLength={17}
                onChange={(e) =>
                  setVehicle({ ...vehicle, vin: e.target.value.toUpperCase() })
                }
              />
              <button
                disabled
                className="btn-ghost"
                style={{
                  padding: "12px 14px",
                  fontSize: 10,
                  opacity: 0.4,
                  whiteSpace: "nowrap",
                  cursor: "not-allowed",
                }}
              >
                LOOKUP
              </button>
            </div>
            <div
              className="mono"
              style={{ fontSize: 9, color: "var(--faint)", marginTop: 6 }}
            >
              AUTO-FILL COMING SOON
            </div>
          </div>
        )}
      </div>

      {/* Year + Plate */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Field label="YEAR" required>
          <SuggestionInput
            value={vehicle.year}
            onChange={handleYearChange}
            options={YEAR_OPTIONS}
            placeholder="e.g. 2021"
            className="mono"
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

      {/* Make — tier-1: top_makes, tier-2: all_makes after 4 chars */}
      <Field label="MAKE" required disabled={!makeReady}>
        <SuggestionInput
          value={vehicle.make}
          onChange={handleMakeChange}
          options={makeOptions}
          placeholder={makeReady ? "e.g. BMW" : "Select year first"}
          searching={makeSearching}
          disabled={!makeReady}
        />
      </Field>

      {/* Model — populated from NHTSA once make + year are set */}
      <Field label="MODEL" required disabled={!modelReady}>
        <SuggestionInput
          value={vehicle.model}
          onChange={(v) => setVehicle(prev => ({ ...prev, model: v }))}
          options={modelOptions}
          placeholder={!modelReady ? "Select year and make first" : modelSearching ? "Loading…" : "e.g. M340i"}
          searching={modelSearching}
          disabled={!modelReady}
        />
      </Field>
    </>
  );
}

// ─── Step 2: Services ─────────────────────────────────────────────────────────
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
    .reduce((a, b) => a + (b.duration ?? b.minutes ?? 0), 0);

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
                <Icon name={s.icon ?? "bolt"} size={22} />
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
                  {s.duration ?? s.minutes}MIN · ${s.price}
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

// ─── Step 3: Time slot ────────────────────────────────────────────────────────
function StepSlot({ slot, setSlot }) {
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
              className="mono"
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
            >
              {t}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Step 4: Confirm ──────────────────────────────────────────────────────────
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
  const mins = items.reduce((a, b) => a + (b.duration ?? b.minutes ?? 0), 0);

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
                  {s.category ?? s.code}
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
          placeholder="Alex Vasquez"
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
      </Field>
      <Field label="MOBILE">
        <input
          style={inputStyle}
          className="mono"
          value={customer.phone}
          placeholder="+1 415 555 0142"
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
      </Field>
    </>
  );
}

// ─── BookingScreen ────────────────────────────────────────────────────────────
export function BookingScreen({
  services,
  blocked,
  onSubmit,
  initialCart,
  settings,
}) {
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState({
    year: "",
    make: "",
    model: "",
    plate: "",
    vin: "",
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

  const submit = () =>
    onSubmit({ vehicle, services: selected, slot, customer });

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Stepper header */}
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

      {/* Step content */}
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
