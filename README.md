# RM/COLLISION — Prototype

Interactive prototype for a performance auto shop: a customer-facing mobile app and an admin command center, rendered side-by-side in the browser. Client-side only — no backend, no database.

## Stack

- **Vite** — dev server and bundler
- **React 18** — all UI components
- No routing library, no state manager, no CSS framework

## Running locally

```bash
npm install
npm run dev
```

## Project structure

```
rmcollision/
├── index.html          # Vite entry point
├── tokens.css          # Design tokens, global CSS, utility classes
├── src/
│   ├── main.jsx        # React root — mounts <App />, imports tokens.css
│   ├── app.jsx         # Top-level state, layout, view orchestration
│   ├── data.js         # Mock data (services, appointments, settings, photos)
│   ├── mobile.jsx      # Customer-facing mobile view
│   ├── admin.jsx       # Admin command center
│   ├── icons.jsx       # Icon component (inline SVG, ~30 icons)
│   ├── tweaks-panel.jsx # Floating tweaks panel + useTweaks hook
│   ├── ios-frame.jsx   # iOS device frame components (unused in layout, kept as reference)
│   └── browser-window.jsx # Chrome browser frame components (unused in layout, kept as reference)
```

### `app.jsx`

Owns all shared state: services, appointments, settings, cart, booking flow, history. Renders a full-viewport layout with two panels controlled by the tweaks panel toggles:

- **Phone panel** (390px fixed width) — shows the active mobile screen
- **Admin panel** (flex, remaining width) — shows the active admin page

Both panels are rendered directly in the DOM with no device-frame wrappers.

### `mobile.jsx`

The customer app. Four screens driven by a `tab` state prop from `app.jsx`:

| Tab | Component | Description |
|-----|-----------|-------------|
| `home` | `HomeScreen` | Hero, status ticker, instant book, top services |
| `services` | `ServicesScreen` | Full catalog grouped by class, cart bar |
| `booking` | `BookingScreen` | 4-step flow: vehicle → services → timeslot → confirm |
| `account` | `AccountScreen` | Stub profile, vehicle card, booking history |

Also exports `FieldLabel`, `Field`, and `inputStyle` — shared by `admin.jsx`.

### `admin.jsx`

The admin command center. Five pages driven by a `adminPage` state prop from `app.jsx`:

| Page | Component | Description |
|------|-----------|-------------|
| `dash` | `AdminDashboard` | KPI grid, live appointment feed, bay status |
| `feed` | `AppointmentFeed` | Full appointment list with status actions |
| `bays` | `BayPanel` | Per-bay occupancy status |
| `svc` | `AdminServiceManager` | Add/hide/remove services |
| `set` | `AdminSettings` | Holiday mode, shop status, hours, contact |

### `tweaks-panel.jsx`

A floating UI panel (bottom-right, draggable) for live-editing prototype values. Exports:

- `useTweaks(defaults)` — hook that manages tweak state and posts changes to the parent frame for edit-mode persistence
- Control components: `TweakToggle`, `TweakRadio`, `TweakColor`, `TweakSlider`, `TweakNumber`, `TweakText`, `TweakButton`, `TweakSelect`

### `data.js`

Static mock data exported as `MOCK`:

- `MOCK.services` — 8 services with id, code, name, price, duration, icon
- `MOCK.appointments` — 6 sample appointments across all statuses
- `MOCK.settings` — shop config: hours, status, holiday mode, bay count
- `MOCK.vehicleMakes` — dropdown options for the booking form
- `MOCK.photos` — Unsplash image URLs used in the mobile UI

### `tokens.css`

All design tokens and global utility classes. The CSS custom properties are scoped to `.theme-dark` and `.theme-light` so components inherit the active theme via class on the root element.

Key tokens: `--orange`, `--bg`, `--surf`, `--line`, `--text`, `--mute`, `--faint`, `--green`, `--amber`, `--red`.

Key classes: `.mono` (JetBrains Mono), `.display` (Space Grotesk), `.btn-cta`, `.btn-ghost`, `.stripes`, `.dot-pulse`, `.ticker-track`.
