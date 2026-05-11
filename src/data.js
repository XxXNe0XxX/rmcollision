// Mock data — services, appointments, shop settings
export const MOCK = {
  services: [
    { id: 'svc-oil',   code: 'A.01', name: 'Oil & Filter',         minutes: 45,  price: 89,  desc: 'Full synthetic, 5W-30. Includes 21-point inspection.', icon: 'oil',     hidden: false },
    { id: 'svc-brake', code: 'A.02', name: 'Brake Service',        minutes: 90,  price: 249, desc: 'Pad replacement, rotor resurfacing, fluid bleed.',     icon: 'brake',   hidden: false },
    { id: 'svc-tire',  code: 'A.03', name: 'Tire Rotation',        minutes: 30,  price: 49,  desc: 'Cross-rotate, torque to spec, pressure check.',         icon: 'tire',    hidden: false },
    { id: 'svc-align', code: 'A.04', name: 'Wheel Alignment',      minutes: 60,  price: 129, desc: 'Four-wheel laser alignment, printout included.',         icon: 'align',   hidden: false },
    { id: 'svc-diag',  code: 'B.01', name: 'Diagnostic Scan',      minutes: 45,  price: 99,  desc: 'OBD-II + manufacturer-specific fault tree.',            icon: 'diag',    hidden: false },
    { id: 'svc-ac',    code: 'B.02', name: 'A/C Service',          minutes: 75,  price: 169, desc: 'R-1234yf recharge, leak detect, performance test.',    icon: 'ac',      hidden: false },
    { id: 'svc-batt',  code: 'B.03', name: 'Battery & Charging',   minutes: 30,  price: 79,  desc: 'Load test, alternator check, terminal clean.',          icon: 'battery', hidden: false },
    { id: 'svc-det',   code: 'C.01', name: 'Performance Detail',   minutes: 180, price: 299, desc: 'Clay bar, sealant, interior deep clean.',               icon: 'detail',  hidden: true  },
  ],

  appointments: [
    { id: 'apt-2841', plate: 'RM·2841', customer: 'A. Vasquez',    vehicle: '2021 BMW M340i',         services: ['svc-oil','svc-tire'],  slot: 'Today · 14:00', status: 'pending',   bay: '03', mileage: 41280 },
    { id: 'apt-2842', plate: 'GT·9912', customer: 'M. Okafor',     vehicle: '2019 Porsche 718 Cayman',services: ['svc-brake'],            slot: 'Today · 15:30', status: 'pending',   bay: '01', mileage: 22050 },
    { id: 'apt-2843', plate: 'AP·0444', customer: 'L. Bergström',  vehicle: '2023 Audi RS6 Avant',    services: ['svc-align','svc-tire'], slot: 'Tomorrow · 09:00', status: 'pending',bay: '02', mileage: 8901  },
    { id: 'apt-2839', plate: 'EV·7700', customer: 'D. Khoury',     vehicle: '2024 Tesla Model 3 Perf',services: ['svc-diag'],             slot: 'Today · 11:00', status: 'confirmed', bay: '04', mileage: 14000 },
    { id: 'apt-2838', plate: 'KR·5520', customer: 'J. Park',       vehicle: '2020 Subaru WRX STI',    services: ['svc-ac','svc-batt'],    slot: 'Today · 16:45', status: 'in-bay',    bay: '03', mileage: 64500 },
    { id: 'apt-2837', plate: 'TR·1101', customer: 'S. Patel',      vehicle: '2018 Toyota GR86',       services: ['svc-oil'],              slot: 'Today · 10:00', status: 'complete',  bay: '01', mileage: 38200 },
  ],

  settings: {
    name:    'RM/COLLISION',
    address: '4400 Industrial Way, Bay 03–07',
    phone:   '+1 (415) 555-0142',
    hours: {
      mon: '07:00–18:00', tue: '07:00–18:00', wed: '07:00–18:00',
      thu: '07:00–18:00', fri: '07:00–17:00', sat: '08:00–14:00', sun: 'CLOSED',
    },
    holidayMode: false,
    holidayMessage: 'Closed for shop maintenance · back Monday',
    shopStatus: 'open',
    nextSlot: 'Today · 14:00',
    bays: 4,
    activeBays: 2,
    instagram: 'https://instagram.com/rmcollision',
    tiktok: 'https://tiktok.com/@rmcollision',
  },

  vehicleMakes: ['Acura','Audi','BMW','Chevrolet','Dodge','Ford','Honda','Hyundai','Jeep','Kia','Lexus','Mazda','Mercedes','Nissan','Porsche','Subaru','Tesla','Toyota','Volkswagen','Volvo'],

  photos: {
    hero:     'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80&auto=format&fit=crop',
    workshop: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=900&q=80&auto=format&fit=crop',
    engine:   'https://images.unsplash.com/photo-1493031400524-5c102b88cdf3?w=900&q=80&auto=format&fit=crop',
    car:      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80&auto=format&fit=crop',
    tire:     'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=80&auto=format&fit=crop',
  },
};
