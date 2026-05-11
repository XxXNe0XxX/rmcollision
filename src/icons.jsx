import React from 'react';

// Iconography — sharp, monoline, technical
function Icon({ name, size = 20, stroke = 'currentColor', strokeWidth = 1.6, fill = 'none' }) {
  const s = strokeWidth;
  const p = { fill, stroke, strokeWidth: s, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    oil:     <><path {...p} d="M5 9h14l-1.5 9a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7L5 9Z"/><path {...p} d="M9 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/><path {...p} d="M12 13v3"/></>,
    brake:   <><circle {...p} cx="12" cy="12" r="8"/><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M12 4v3M12 17v3M4 12h3M17 12h3"/></>,
    tire:    <><circle {...p} cx="12" cy="12" r="9"/><circle {...p} cx="12" cy="12" r="2.5"/><path {...p} d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5"/></>,
    align:   <><path {...p} d="M4 6h16M4 12h16M4 18h16"/><circle {...p} cx="8" cy="6" r="1.5" fill={stroke}/><circle {...p} cx="16" cy="12" r="1.5" fill={stroke}/><circle {...p} cx="10" cy="18" r="1.5" fill={stroke}/></>,
    diag:    <><path {...p} d="M3 12h3l2-5 4 10 2-5h7"/></>,
    ac:      <><path {...p} d="M12 3v18M3 12h18M5 5l14 14M19 5 5 19"/><circle {...p} cx="12" cy="12" r="2"/></>,
    battery: <><rect {...p} x="3" y="7" width="16" height="11" rx="1"/><path {...p} d="M19 11h2v3h-2M8 12h3M9.5 10.5v3M14 12h3"/></>,
    detail:  <><path {...p} d="M4 15c0-3 2-4 4-4h8c2 0 4 1 4 4v3H4v-3Z"/><circle {...p} cx="8" cy="18" r="1.5"/><circle {...p} cx="16" cy="18" r="1.5"/><path {...p} d="M7 11l2-4h6l2 4"/></>,

    plus:    <><path {...p} d="M12 5v14M5 12h14"/></>,
    minus:   <><path {...p} d="M5 12h14"/></>,
    check:   <><path {...p} d="M5 12.5 10 17 19 7"/></>,
    arrow:   <><path {...p} d="M5 12h14M14 6l6 6-6 6"/></>,
    chev:    <><path {...p} d="M9 6l6 6-6 6"/></>,
    chevDown:<><path {...p} d="M6 9l6 6 6-6"/></>,
    close:   <><path {...p} d="M6 6l12 12M18 6 6 18"/></>,
    edit:    <><path {...p} d="M4 20h4l11-11-4-4L4 16v4Z"/></>,
    bolt:    <><path {...p} d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z"/></>,
    car:     <><path {...p} d="M3 14l2-5a3 3 0 0 1 3-2h8a3 3 0 0 1 3 2l2 5v4h-2a2 2 0 1 1-4 0H8a2 2 0 1 1-4 0H3v-4Z"/><path {...p} d="M3 14h18M7 11h10"/></>,
    cal:     <><rect {...p} x="3" y="5" width="18" height="16" rx="1.5"/><path {...p} d="M3 10h18M8 3v4M16 3v4"/></>,
    clock:   <><circle {...p} cx="12" cy="12" r="8.5"/><path {...p} d="M12 7v5l3 2"/></>,
    user:    <><circle {...p} cx="12" cy="8" r="3.5"/><path {...p} d="M5 20c1-4 4-6 7-6s6 2 7 6"/></>,
    home:    <><path {...p} d="M4 11 12 4l8 7v9h-5v-6h-6v6H4v-9Z"/></>,
    grid:    <><rect {...p} x="4" y="4" width="6" height="6"/><rect {...p} x="14" y="4" width="6" height="6"/><rect {...p} x="4" y="14" width="6" height="6"/><rect {...p} x="14" y="14" width="6" height="6"/></>,
    settings:<><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></>,
    wrench:  <><path {...p} d="M14 4a5 5 0 0 1 4 8l-9 9-3-3 9-9a5 5 0 0 1-1-5Z"/></>,
    phone:   <><path {...p} d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z"/></>,
    pin:     <><path {...p} d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z"/><circle {...p} cx="12" cy="10" r="2.5"/></>,
    eye:     <><path {...p} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle {...p} cx="12" cy="12" r="3"/></>,
    eyeOff:  <><path {...p} d="M4 4l16 16M9.9 5.1A11 11 0 0 1 12 5c6 0 10 7 10 7a16 16 0 0 1-3.2 3.7M6.4 7A16 16 0 0 0 2 12s4 7 10 7c1.5 0 2.9-.4 4-1"/><path {...p} d="M9.5 9.5a3 3 0 0 0 4.2 4.2"/></>,
    refresh: <><path {...p} d="M20 4v6h-6"/><path {...p} d="M4 20v-6h6"/><path {...p} d="M5 14a8 8 0 0 0 14 2M19 10A8 8 0 0 0 5 8"/></>,
    bell:    <><path {...p} d="M6 10a6 6 0 1 1 12 0c0 5 2 7 2 7H4s2-2 2-7Z"/><path {...p} d="M10 21a2 2 0 0 0 4 0"/></>,
    bay:     <><rect {...p} x="3" y="7" width="18" height="11"/><path {...p} d="M3 14h18M9 7v11M15 7v11"/></>,
    flag:    <><path {...p} d="M4 4v17"/><path {...p} d="M4 4h14l-2 4 2 4H4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name] || paths.bolt}
    </svg>
  );
}

export { Icon };
