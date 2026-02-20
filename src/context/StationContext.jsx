import { createContext, useContext, useState } from "react";
import { Zap, Sun, Wind, Building2 } from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
export const INITIAL_STATIONS = [
  // HIGH VOLTAGE
  {
    id: 1, category: "highvoltage", name: "Xorazm 220kV Podstansiya",
    lat: 41.3775, lng: 60.3639, commissioned: "2005-06-15",
    voltage: "220 kV", capacity: "500 MVA", status: "active", load: 78, temp: 42,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
    description: "Asosiy uzatuvchi podstansiya. Xorazm viloyatining shimoliy qismini ta'minlaydi.",
    specs: { transformer: "ATD-500000/220", lines: 12, employees: 45 },
  },
  {
    id: 2, category: "highvoltage", name: "Yangiariq 110kV PS",
    lat: 41.4102, lng: 60.5081, commissioned: "2009-03-20",
    voltage: "110 kV", capacity: "250 MVA", status: "active", load: 65, temp: 38,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    description: "Yangiariq tumanining markaziy elektr ta'minot manbai.",
    specs: { transformer: "TDTN-160000/110", lines: 8, employees: 32 },
  },
  {
    id: 3, category: "highvoltage", name: "Urganch 110kV Markaziy PS",
    lat: 41.5477, lng: 60.6333, commissioned: "1998-11-01",
    voltage: "110 kV", capacity: "320 MVA", status: "active", load: 89, temp: 51,
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=80",
    description: "Urganch shahri markaziy ta'minot tizimi.",
    specs: { transformer: "TDTN-200000/110", lines: 10, employees: 58 },
  },
  {
    id: 4, category: "highvoltage", name: "Hazorasp 110kV PS",
    lat: 41.3197, lng: 61.0742, commissioned: "2012-07-30",
    voltage: "110 kV", capacity: "160 MVA", status: "maintenance", load: 0, temp: 22,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
    description: "Hazorasp tumani. Hozirda texnik ko'rikda.",
    specs: { transformer: "TDTN-100000/110", lines: 6, employees: 24 },
  },
  {
    id: 5, category: "highvoltage", name: "Pitnak 35kV PS",
    lat: 41.4950, lng: 60.9540, commissioned: "2015-02-14",
    voltage: "35 kV", capacity: "80 MVA", status: "active", load: 55, temp: 33,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    description: "Pitnak shahri va atrofi uchun ta'minot. Modernizatsiya o'tkazilgan.",
    specs: { transformer: "TDTN-63000/35", lines: 5, employees: 18 },
  },
  {
    id: 6, category: "highvoltage", name: "Xonqa 35kV PS",
    lat: 41.5270, lng: 60.8100, commissioned: "2001-08-22",
    voltage: "35 kV", capacity: "63 MVA", status: "active", load: 61, temp: 35,
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=80",
    description: "Xonqa tumani ta'minot markazi.",
    specs: { transformer: "TDN-40000/35", lines: 4, employees: 15 },
  },
  {
    id: 7, category: "highvoltage", name: "Bog'ot 35kV PS",
    lat: 41.2650, lng: 60.5280, commissioned: "2003-05-10",
    voltage: "35 kV", capacity: "40 MVA", status: "active", load: 44, temp: 29,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
    description: "Bog'ot tumani kichik ta'minot tizimi.",
    specs: { transformer: "TDN-25000/35", lines: 3, employees: 12 },
  },
  // SOLAR
  {
    id: 8, category: "solar", name: "Yangiariq Quyosh Stansiyasi",
    lat: 41.3900, lng: 60.4900, commissioned: "2022-04-01",
    voltage: "10 kV", capacity: "150 MW", status: "active", load: 72, temp: 27,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
    description: "O'zbekistondagi yirik quyosh elektr stansiyalaridan biri. 450,000 panel.",
    specs: { panels: "450,000", area: "280 ha", efficiency: "21.4%" },
  },
  {
    id: 9, category: "solar", name: "Shovot Quyosh Parki",
    lat: 41.4330, lng: 60.6720, commissioned: "2023-01-15",
    voltage: "10 kV", capacity: "100 MW", status: "active", load: 68, temp: 25,
    image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&q=80",
    description: "Shovot tumani, yangi avlod quyosh panellari.",
    specs: { panels: "300,000", area: "190 ha", efficiency: "22.1%" },
  },
  {
    id: 10, category: "solar", name: "Gurlan Quyosh FS",
    lat: 41.4980, lng: 60.4120, commissioned: "2021-09-20",
    voltage: "10 kV", capacity: "80 MW", status: "active", load: 55, temp: 24,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
    description: "Gurlan tumani, birinchi quyosh loyihasi.",
    specs: { panels: "240,000", area: "145 ha", efficiency: "20.8%" },
  },
  {
    id: 11, category: "solar", name: "Xo'jayli Quyosh Fermasi",
    lat: 41.4650, lng: 60.3820, commissioned: "2023-06-10",
    voltage: "10 kV", capacity: "60 MW", status: "construction", load: 0, temp: 18,
    image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&q=80",
    description: "Qurilish bosqichida. 2024-yil yakuniga qadar ishga tushiriladi.",
    specs: { panels: "180,000", area: "110 ha", efficiency: "23.0%" },
  },
  // WIND
  {
    id: 12, category: "wind", name: "Qo'ng'irot Shamol Parki",
    lat: 41.5670, lng: 60.2730, commissioned: "2020-11-05",
    voltage: "35 kV", capacity: "200 MW", status: "active", load: 82, temp: 15,
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80",
    description: "Xorazm viloyatining eng yirik shamol energiyasi loyihasi. 50 ta turbina.",
    specs: { turbines: 50, hubHeight: "120 m", rotorDia: "150 m" },
  },
  {
    id: 13, category: "wind", name: "Urganch Shamol FS",
    lat: 41.5810, lng: 60.5890, commissioned: "2022-03-18",
    voltage: "35 kV", capacity: "120 MW", status: "active", load: 76, temp: 14,
    image: "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&q=80",
    description: "Urganch atrofi shamol energiyasi tizimi.",
    specs: { turbines: 30, hubHeight: "110 m", rotorDia: "140 m" },
  },
  {
    id: 14, category: "wind", name: "Beruniy Shamol Stansiyasi",
    lat: 41.6100, lng: 60.7530, commissioned: "2023-08-22",
    voltage: "35 kV", capacity: "80 MW", status: "active", load: 59, temp: 13,
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80",
    description: "Beruniy tumani shamol elektr stansiyasi.",
    specs: { turbines: 20, hubHeight: "100 m", rotorDia: "130 m" },
  },
  // SUBSTATIONS
  {
    id: 15, category: "substation", name: "Yangiariq TP-1 Qozon xonasi",
    lat: 41.4070, lng: 60.5230, commissioned: "1995-01-10",
    voltage: "6/0.4 kV", capacity: "1600 kVA", status: "active", load: 48, temp: 32,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    description: "Shahar markazidagi kichik tarmoq taqsimlash punkti.",
    specs: { transformers: 2, consumers: 850, type: "Taqsimlash" },
  },
  {
    id: 16, category: "substation", name: "Yangiariq TP-4 Sanoat",
    lat: 41.4180, lng: 60.5390, commissioned: "2000-07-08",
    voltage: "6/0.4 kV", capacity: "2500 kVA", status: "active", load: 71, temp: 40,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
    description: "Sanoat zonasi uchun mo'ljallangan kuchlanish tushuruvchi punkt.",
    specs: { transformers: 3, consumers: 45, type: "Sanoat" },
  },
  {
    id: 17, category: "substation", name: "Yangiariq TP-7 Turar-joy",
    lat: 41.3990, lng: 60.5070, commissioned: "2010-03-25",
    voltage: "10/0.4 kV", capacity: "1000 kVA", status: "active", load: 62, temp: 36,
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=80",
    description: "Yangi turar-joy massivi uchun elektr ta'minot tizimi.",
    specs: { transformers: 1, consumers: 1200, type: "Turar-joy" },
  },
];

export const CATEGORIES = [
  { id: "highvoltage", label: "Yuqori Kuchlanish", icon: Zap,      color: "#f59e0b", accent: "#fbbf24" },
  { id: "solar",       label: "Quyosh Energiyasi", icon: Sun,      color: "#10b981", accent: "#34d399" },
  { id: "wind",        label: "Shamol Energiyasi", icon: Wind,     color: "#3b82f6", accent: "#60a5fa" },
  { id: "substation",  label: "Kichik Podstansiyalar", icon: Building2, color: "#8b5cf6", accent: "#a78bfa" },
];

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
export const StationContext = createContext(null);

export function StationProvider({ children }) {
  const [stations, setStations]               = useState(INITIAL_STATIONS);
  const [selected, setSelected]               = useState(null);
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [view, setView]                       = useState("map"); // "map" | "admin"
  const [expandedCategories, setExpandedCategories] = useState({ highvoltage: true });

  const addStation    = (s) => setStations((prev) => [...prev, { ...s, id: Date.now() }]);
  const toggleCategory = (id) => setExpandedCategories((p) => ({ ...p, [id]: !p[id] }));

  return (
    <StationContext.Provider
      value={{
        stations, selected, setSelected,
        sidebarOpen, setSidebarOpen,
        view, setView,
        expandedCategories, toggleCategory,
        addStation,
        CATEGORIES,
      }}
    >
      {children}
    </StationContext.Provider>
  );
}

export const useStation = () => useContext(StationContext);
