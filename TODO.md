# RM/COLLISION — Feature TODO

## Mobile · Home

- [ ] Make the stats strip (`4 BAYS`, `24h TURNAROUND`, `4.9★`) read from `settings` instead of hardcoded literals
- [ ] Compute next available slot dynamically from appointments instead of using `settings.nextSlot`
- [ ] Wire the address card "get directions" intent (maps URL on the address line)
- [ ] Add a photo gallery section using `MOCK.photos.workshop` and `MOCK.photos.engine`

## Mobile · Services

- [ ] Add a category filter bar (CLASS A / B / C tabs or pills) so users can narrow the list
- [ ] Show estimated total time and price on the cart bar in addition to the price
- [ ] Add an expanded service detail view (tap a row → slide-in or modal with full description and photo)

## Mobile · Booking flow

- [ ] Replace the hardcoded day picker dates (TUE 12, WED 13…) with a real rolling 7-day window from today
- [ ] Derive unavailable time slots from existing appointments instead of the hardcoded `['09:00','11:30']` array
- [ ] Add email field to Step 4 (Confirm) alongside name and phone
- [ ] Add phone number format validation on Step 4
- [ ] Add VIN field to Step 1 and wire a placeholder "lookup" that pre-fills make/model/year from the VIN
- [ ] Persist booking step progress in component state so navigating away and back doesn't reset the form

## Mobile · Success modal

- [ ] Generate the booking ref once and store it (currently generated separately in the modal and in `closeSuccess`, so they differ)
- [ ] Add a "Add to calendar" button that builds a calendar link from the confirmed slot

## Mobile · Account

- [ ] Replace the hardcoded "Alex Vasquez / 2021 BMW M340i" stub with state driven by the last completed booking
- [ ] Support multiple saved vehicles (list with add/remove)
- [ ] Add a "Cancel booking" action to upcoming appointments in the history list
- [ ] Add appointment status indicators to history items (pending, confirmed, complete)

## Admin · Dashboard

- [ ] Replace the hardcoded `VS YEST · +12% / +1` KPI deltas with values computed from the appointments array
- [ ] Add a revenue breakdown chart (by service category) below the KPI grid
- [ ] Make the dashboard auto-refresh the live clock without a full re-render

## Admin · Top bar

- [ ] Replace the hardcoded `TUE · MAY 12` date string with `new Date()` formatted live — update every minute
- [ ] Make shift label and manager name come from `settings` instead of hardcoded `SHIFT — A · MGR: M.LOWRY`

## Admin · Appointments feed

- [ ] Wire the FILTER button — at minimum filter by status (pending / confirmed / in-bay / complete / declined)
- [ ] Add a search input that filters by plate, customer name, or vehicle
- [ ] Wire the VIEW button for completed and declined appointments (slide-in detail panel or modal)
- [ ] Add a mileage edit field inside the appointment detail view
- [ ] Add a free-text notes field per appointment
- [ ] Add a bay reassignment control (dropdown to move an appointment to a different bay)

## Admin · Bay panel

- [ ] Show the service name(s) being performed in each active bay, not just the plate and slot
- [ ] Add an estimated completion time per bay derived from the service duration(s)
- [ ] Allow dragging/reassigning an appointment to a different bay from this view

## Admin · Service manager

- [ ] Add an inline edit mode for existing services (currently you can only add or remove, not edit price/duration/description)
- [ ] Add an icon picker for new services instead of always defaulting to `bolt`
- [ ] Generate the service code from the class prefix automatically when a new service is created (e.g. next `A.05` instead of `X.XX`)

## Admin · Settings

- [ ] Add a bay count field so `settings.bays` can be changed from the UI
- [ ] Add a `nextSlot` field so the admin can manually set the displayed next-available time
- [ ] Add a save/discard confirmation so edits are not applied immediately on every keystroke

## Navigation & routing

- [ ] Add a link in the admin sidebar footer (or top bar) to open the mobile preview at `/home`
- [ ] Add a back/home button in the mobile top bar that works as a breadcrumb when deep in the booking flow

## Tweaks panel

- [ ] Wire `stripeIntensity` tweak (present in `TWEAK_DEFAULTS` but not connected to any CSS property)
- [ ] Remove the `stripeIntensity` tweak from defaults if it will not be implemented

## Data & state

- [ ] Move `nextSlot` and `activeBays` to be computed values rather than static fields in `MOCK.settings`
- [ ] When a booking is submitted, add the new appointment to the admin feed (currently done) and also update `nextSlot` to the next open time
- [ ] Persist tweaks to `localStorage` so the panel state survives a page refresh (the `useTweaks` hook posts to parent frame but doesn't read from storage)
