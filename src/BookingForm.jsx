// Booking flow — 4-step form
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "./icons.jsx";
import { MOCK } from "./data.js";
import { supabase } from "@/lib/supabaseClient";
import { useServices } from "@/hooks/useServices.ts";

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
    <div
      style={{
        marginBottom: 14,
        opacity: disabled ? 0.45 : 1,
        transition: "opacity 0.15s",
      }}
    >
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
          <span
            style={{
              color: disabled ? "var(--mute)" : "var(--orange)",
              marginLeft: 2,
            }}
          >
            *
          </span>
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
        style={{
          ...inputStyle,
          cursor: disabled ? "not-allowed" : "text",
          paddingRight: value ? 36 : 14,
        }}
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
          onMouseDown={(e) => {
            e.preventDefault();
            onChange("");
            setOpen(false);
          }}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--mute)",
            fontSize: 16,
            lineHeight: 1,
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

const NHTSA = "https://vpic.nhtsa.dot.gov/api/vehicles";

async function fetchModelsByMakeYear(make, year) {
  const url = `${NHTSA}/getmodelsformakeyear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.Results ?? [])
    .map((r) => r.Model_Name)
    .filter(Boolean)
    .sort();
}

// ─── Step 1: Vehicle ──────────────────────────────────────────────────────────
function StepVehicle({ vehicle, setVehicle }) {
  const [showVin, setShowVin] = useState(false);

  // Make state
  const [topMakes, setTopMakes] = useState([]);
  const [makeOptions, setMakeOptions] = useState([]);
  const [makeSearching, setMakeSearching] = useState(false);
  const makeDebounce = useRef(null);

  // Model state
  const [modelOptions, setModelOptions] = useState([]);
  const [modelSearching, setModelSearching] = useState(false);

  // Load popular makes once on mount
  useEffect(() => {
    supabase
      .from("top_makes")
      .select("mfr_name")
      .order("mfr_name")
      .then(({ data, error }) => {
        if (!error && data) {
          const names = data.map((r) => r.mfr_name);
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
    fetchModelsByMakeYear(vehicle.make, vehicle.year).then((names) => {
      if (!cancelled) {
        setModelOptions(names);
        setModelSearching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [vehicle.make, vehicle.year]);

  const handleYearChange = (v) => {
    setVehicle((prev) => ({ ...prev, year: v, model: "" }));
  };

  const handleMakeChange = (v) => {
    setVehicle((prev) => ({ ...prev, make: v, model: "" }));
    clearTimeout(makeDebounce.current);

    const inTopList = topMakes.some((m) =>
      m.toLowerCase().includes(v.toLowerCase()),
    );

    if (v.length >= 4 && !inTopList) {
      makeDebounce.current = setTimeout(async () => {
        setMakeSearching(true);
        const { data, error } = await supabase
          .from("all_makes")
          .select("make_name")
          .ilike("make_name", `%${v}%`)
          .limit(25);
        if (!error && data) setMakeOptions(data.map((r) => r.make_name));
        setMakeSearching(false);
      }, 350);
    } else {
      setMakeOptions(topMakes);
    }
  };

  const makeReady = !!vehicle.year;
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
          onChange={(v) => setVehicle((prev) => ({ ...prev, model: v }))}
          options={modelOptions}
          placeholder={
            !modelReady
              ? "Select year and make first"
              : modelSearching
                ? "Loading…"
                : "e.g. M340i"
          }
          searching={modelSearching}
          disabled={!modelReady}
        />
      </Field>
    </>
  );
}

// ─── Step 2: Services ─────────────────────────────────────────────────────────
const CATEGORY_ICON = {
  maintenance: "oil",
  diagnostics: "diag",
  diagnostic: "diag",
  cosmetic: "detail",
  tires: "tire",
  tire: "tire",
  brakes: "brake",
  brake: "brake",
  "air conditioning": "ac",
  ac: "ac",
  battery: "battery",
  alignment: "align",
};

function serviceIcon(category) {
  return CATEGORY_ICON[category?.toLowerCase()] ?? "bolt";
}

function ServiceSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            padding: 14,
            border: "1px solid var(--line)",
            background: "var(--surf)",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "var(--line)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{ height: 12, background: "var(--line)", width: "55%" }}
            />
            <div
              style={{ height: 10, background: "var(--line)", width: "80%" }}
            />
            <div
              style={{ height: 10, background: "var(--line)", width: "35%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StepServices({ selected, setSelected }) {
  const { data: services = [], isLoading, isError } = useServices();

  const toggle = (id) =>
    setSelected(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );

  const live = services.filter((s) => !s.hidden);
  const picked = live.filter((s) => selected.includes(s.id));
  const total = picked.reduce((a, b) => a + b.price, 0);
  const mins = picked.reduce((a, b) => a + (b.duration ?? 0), 0);

  // Group by category, preserving insertion order from DB
  const groups = live.reduce((acc, s) => {
    const cat = s.category || "General";
    (acc[cat] = acc[cat] || []).push(s);
    return acc;
  }, {});

  return (
    <>
      {/* Running total bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          marginBottom: 14,
          background: "var(--surf)",
          border: "1px solid var(--line)",
        }}
      >
        <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
          {selected.length} SELECTED
        </span>
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: selected.length ? "var(--text)" : "var(--faint)",
            fontWeight: 600,
          }}
        >
          {selected.length ? `$${total} · ${mins}min` : "—"}
        </span>
      </div>

      {isLoading && <ServiceSkeleton />}

      {isError && (
        <div
          style={{
            padding: 16,
            border: "1px solid var(--line)",
            background: "var(--surf)",
            textAlign: "center",
          }}
        >
          <div className="mono" style={{ fontSize: 10, color: "var(--red)" }}>
            FAILED TO LOAD SERVICES
          </div>
          <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 6 }}>
            Check your connection and try again.
          </div>
        </div>
      )}

      {!isLoading &&
        !isError &&
        Object.entries(groups).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 16 }}>
            {/* Category header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                marginBottom: 6,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ color: "var(--orange)" }}>
                <Icon name={serviceIcon(cat)} size={13} strokeWidth={1.8} />
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 9,
                  color: "var(--mute)",
                  letterSpacing: 0.1,
                }}
              >
                {cat.toUpperCase()}
              </span>
            </div>

            {/* Service rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((s) => {
                const on = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: 14,
                      border:
                        "1px solid " + (on ? "var(--orange)" : "var(--line)"),
                      background: on ? "rgba(255,87,51,0.05)" : "var(--surf)",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        border:
                          "1px solid " + (on ? "var(--orange)" : "var(--line)"),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: on ? "var(--orange)" : "var(--mute)",
                        background: on ? "rgba(255,87,51,0.08)" : "transparent",
                      }}
                    >
                      <Icon
                        name={serviceIcon(cat)}
                        size={18}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
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
                      {s.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--mute)",
                            marginTop: 3,
                            lineHeight: 1.4,
                          }}
                        >
                          {s.description}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                        <span
                          className="mono"
                          style={{ fontSize: 10, color: "var(--mute)" }}
                        >
                          {s.duration}MIN
                        </span>
                        <span
                          className="mono"
                          style={{
                            fontSize: 10,
                            color: on ? "var(--orange)" : "var(--text)",
                            fontWeight: on ? 600 : 400,
                          }}
                        >
                          ${s.price}
                        </span>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                        marginTop: 2,
                        border:
                          "1px solid " + (on ? "var(--orange)" : "var(--line)"),
                        background: on ? "var(--orange)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0A0A0B",
                      }}
                    >
                      {on && <Icon name="check" size={13} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
    </>
  );
}

// ─── Step 3: Time slot ────────────────────────────────────────────────────────
const MAX_DAYS_AHEAD = 365;
const SLOT_START_TIME = "08:00";
const MAX_BOOKING_TIME = "18:00";
const SLOT_INTERVAL_MINS = 60;

function generateTimeSlots() {
  const slots = [];
  const [startH, startM] = SLOT_START_TIME.split(":").map(Number);
  const [endH, endM] = MAX_BOOKING_TIME.split(":").map(Number);
  let h = startH, m = startM;
  while (h < endH || (h === endH && m <= endM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += SLOT_INTERVAL_MINS;
    h += Math.floor(m / 60);
    m = m % 60;
  }
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatTimeDisplay(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatSlotLabel(dateString, time) {
  const [y, mo, d] = dateString.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    date.getDay()
  ];
  const monthName = MONTH_NAMES[mo - 1].slice(0, 3);
  return `${dayName} ${monthName} ${d}, ${y} · ${formatTimeDisplay(time)}`;
}

function StepSlot({ slot, setSlot }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);

  const fetchAvailableSlots = async (dateString) => {
    setFetchingSlots(true);
    setSlotsError(false);
    const { data, error } = await supabase.rpc("get_available_slots", {
      input_date: dateString,
    });
    setFetchingSlots(false);
    if (error) {
      setSlotsError(true);
      setAvailableSlots([]);
      return;
    }
    // Extract "HH:mm" from slot_start ISO timestamps, then sort chronologically
    const slots = (Array.isArray(data) ? data : [])
      .map((s) => {
        const raw = typeof s === "string" ? s : (s.slot_start ?? s.slot_time ?? s.time);
        if (!raw) return null;
        const timePart = String(raw).includes("T")
          ? String(raw).split("T")[1]
          : String(raw);
        return timePart.slice(0, 5); // "HH:mm"
      })
      .filter(Boolean)
      .sort();
    setAvailableSlots(slots);
  };

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const nextViewYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const nextViewMonth = (viewMonth + 1) % 12;
  const canGoNext = new Date(nextViewYear, nextViewMonth, 1) <= maxDate;

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const cells = buildCalendarGrid(viewYear, viewMonth);

  const isDayDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < today || d > maxDate;
  };

  const handleDayClick = (day) => {
    const dk = toDateKey(viewYear, viewMonth, day);
    setSelectedDate(dk);
    setSelectedTime(null);
    setSlot(null);
    fetchAvailableSlots(dk);
  };

  const handleTimeClick = (t) => {
    setSelectedTime(t);
    setSlot(formatSlotLabel(selectedDate, t));
  };

  const navBtnStyle = (enabled) => ({
    background: "transparent",
    border: "1px solid var(--line)",
    color: enabled ? "var(--text)" : "var(--faint)",
    cursor: enabled ? "pointer" : "not-allowed",
    padding: "6px 14px",
    fontFamily: "var(--font-mono)",
    fontSize: 14,
  });

  return (
    <>
      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          style={navBtnStyle(canGoPrev)}
        >
          ←
        </button>
        <span
          className="display"
          style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          style={navBtnStyle(canGoNext)}
        >
          →
        </button>
      </div>

      {/* Day of week labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
          marginBottom: 4,
        }}
      >
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="mono"
            style={{
              fontSize: 8,
              textAlign: "center",
              color: "var(--mute)",
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
          marginBottom: 20,
        }}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dk = toDateKey(viewYear, viewMonth, day);
          const disabled = isDayDisabled(day);
          const isToday = dk === todayKey;
          const sel = selectedDate === dk;
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => handleDayClick(day)}
              className="mono"
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: sel
                  ? "1px solid var(--orange)"
                  : isToday
                    ? "1px solid var(--mute)"
                    : "1px solid transparent",
                background: sel ? "var(--orange)" : "transparent",
                color: disabled ? "var(--faint)" : sel ? "#0A0A0B" : "var(--text)",
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: isToday ? 700 : 400,
                opacity: disabled ? 0.3 : 1,
                padding: 4,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time slots — appears after a date is picked */}
      {selectedDate && (
        <>
          <FieldLabel>AVAILABLE TIMES · BAY ASSIGNED ON CONFIRM</FieldLabel>
          {fetchingSlots ? (
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--mute)", padding: "12px 0" }}
            >
              LOADING AVAILABILITY…
            </div>
          ) : slotsError ? (
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--red, #ff3b30)", padding: "12px 0" }}
            >
              FAILED TO LOAD · TAP DATE TO RETRY
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
                marginTop: 8,
              }}
            >
              {TIME_SLOTS.map((t) => {
                const available = availableSlots.includes(t);
                const on = selectedTime === t;
                return (
                  <button
                    key={t}
                    disabled={!available}
                    onClick={() => available && handleTimeClick(t)}
                    style={{
                      padding: "12px 4px",
                      cursor: available ? "pointer" : "not-allowed",
                      border:
                        "1px solid " + (on ? "var(--orange)" : "var(--line)"),
                      background: on ? "var(--orange)" : "var(--surf)",
                      color: on
                        ? "#0A0A0B"
                        : available
                          ? "var(--text)"
                          : "var(--faint)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: available ? 1 : 0.45,
                      position: "relative",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        textDecoration: available ? "none" : "line-through",
                      }}
                    >
                      {formatTimeDisplay(t)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}

// ─── Step 4: Confirm ──────────────────────────────────────────────────────────
function StepConfirm({ vehicle, selected, slot, customer, setCustomer }) {
  const { data: services = [] } = useServices();
  const items = services.filter((s) => selected.includes(s.id));
  const total = items.reduce((a, b) => a + b.price, 0);
  const mins = items.reduce((a, b) => a + (b.duration ?? 0), 0);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [otpError, setOtpError] = useState(null);

  const sendOtp = async () => {
    setSending(true);
    setSendError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: customer.email,
    });
    setSending(false);
    if (error) {
      setSendError(error.message);
      return;
    }
    setOtpSent(true);
    setOtp("");
    setOtpError(null);
  };

  const verifyOtp = async () => {
    setVerifying(true);
    setOtpError(null);
    const { error } = await supabase.auth.verifyOtp({
      email: customer.email,
      token: otp,
      type: "email",
    });
    setVerifying(false);
    if (error) {
      setOtpError(error.message);
      return;
    }
    setCustomer((c) => ({ ...c, verified: true }));
  };

  const canSendCode = customer.name && customer.email && !customer.verified;

  return (
    <>
      {/* Booking summary */}
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
          <div className="mono" style={{ fontSize: 11, color: "var(--orange)" }}>
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
                  {s.category}
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

      {/* Customer info */}
      <Field label="YOUR NAME">
        <input
          style={inputStyle}
          value={customer.name}
          placeholder="Alex Vasquez"
          disabled={customer.verified}
          onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
        />
      </Field>
      <Field label="EMAIL">
        <input
          style={{ ...inputStyle, opacity: customer.verified ? 0.55 : 1 }}
          className="mono"
          type="email"
          value={customer.email}
          placeholder="alex@example.com"
          disabled={customer.verified || otpSent}
          onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
        />
      </Field>

      {/* OTP flow */}
      {!customer.verified && (
        <>
          {!otpSent ? (
            <>
              <button
                onClick={sendOtp}
                disabled={!canSendCode || sending}
                className="btn-ghost"
                style={{
                  width: "100%",
                  padding: "12px 0",
                  fontSize: 11,
                  opacity: canSendCode ? 1 : 0.4,
                  cursor: canSendCode ? "pointer" : "not-allowed",
                  marginBottom: 6,
                }}
              >
                {sending ? "SENDING…" : "SEND VERIFICATION CODE →"}
              </button>
              {sendError && (
                <div
                  className="mono"
                  style={{ fontSize: 9, color: "var(--red, #ff3b30)", marginBottom: 8 }}
                >
                  {sendError}
                </div>
              )}
            </>
          ) : (
            <>
              <div
                className="mono"
                style={{
                  fontSize: 9,
                  color: "var(--mute)",
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}
              >
                CODE SENT TO {customer.email} · CHECK YOUR INBOX
              </div>
              <Field label="VERIFICATION CODE">
                <input
                  style={{
                    ...inputStyle,
                    letterSpacing: 10,
                    fontSize: 22,
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                  }}
                  value={otp}
                  placeholder="000000"
                  maxLength={6}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </Field>
              {otpError && (
                <div
                  className="mono"
                  style={{
                    fontSize: 9,
                    color: "var(--red, #ff3b30)",
                    marginBottom: 8,
                  }}
                >
                  {otpError}
                </div>
              )}
              <button
                onClick={verifyOtp}
                disabled={otp.length < 6 || verifying}
                className="btn-ghost"
                style={{
                  width: "100%",
                  padding: "12px 0",
                  fontSize: 11,
                  marginBottom: 6,
                  opacity: otp.length < 6 ? 0.4 : 1,
                  cursor: otp.length < 6 ? "not-allowed" : "pointer",
                }}
              >
                {verifying ? "VERIFYING…" : "VERIFY CODE →"}
              </button>
              <button
                onClick={sendOtp}
                disabled={sending}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--mute)",
                  padding: "4px 0",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {sending ? "SENDING…" : "RESEND CODE"}
              </button>
            </>
          )}
        </>
      )}

      {customer.verified && (
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--orange)",
            padding: "12px 14px",
            border: "1px solid var(--orange)",
            background: "rgba(255,87,51,0.05)",
            letterSpacing: 0.05,
          }}
        >
          ✓ EMAIL VERIFIED · {customer.email}
        </div>
      )}
    </>
  );
}

// ─── Booking draft persistence ───────────────────────────────────────────────
const DRAFT_KEY = "rm_booking_draft";

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

// ─── BookingScreen ────────────────────────────────────────────────────────────
export function BookingScreen({
  services,
  blocked,
  onSubmit,
  initialCart,
  settings,
}) {
  const [step, setStep] = useState(() => loadDraft()?.step ?? 0);
  const [vehicle, setVehicle] = useState(
    () => loadDraft()?.vehicle ?? { year: "", make: "", model: "", plate: "", vin: "" },
  );
  const [selected, setSelected] = useState(
    () => initialCart?.length ? initialCart : (loadDraft()?.selected ?? []),
  );
  const [slot, setSlot] = useState(() => loadDraft()?.slot ?? null);
  const [customer, setCustomer] = useState(() => {
    const d = loadDraft()?.customer;
    return { name: d?.name ?? "", email: d?.email ?? "", verified: false };
  });

  // Sync draft to localStorage on every change
  useEffect(() => {
    saveDraft({
      step,
      vehicle,
      selected,
      slot,
      customer: { name: customer.name, email: customer.email },
    });
  }, [step, vehicle, selected, slot, customer]);

  // If the user arrived with an explicit cart (from services page), honour it
  useEffect(() => {
    if (initialCart?.length) setSelected(initialCart);
  }, [initialCart]);

  const steps = ["VEHICLE", "SERVICES", "TIMESLOT", "CONFIRM"];
  const canNext = [
    () => vehicle.year && vehicle.make && vehicle.model,
    () => selected.length > 0,
    () => slot != null,
    () => customer.name && customer.email && customer.verified,
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
    clearDraft();
    onSubmit({ vehicle, services: selected, slot, customer });
  };

  return (
    <div style={{ paddingBottom: 100, maxWidth: 800, margin: "0 auto" }}>
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
          <StepServices selected={selected} setSelected={setSelected} />
        )}
        {step === 2 && (
          <StepSlot slot={slot} setSlot={setSlot} settings={settings} />
        )}
        {step === 3 && (
          <StepConfirm
            vehicle={vehicle}
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
          maxWidth: 800,
          margin: "0 auto",
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
