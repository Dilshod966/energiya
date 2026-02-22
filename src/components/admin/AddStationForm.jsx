import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Upload, Check, AlertCircle } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStation } from "../../context/StationContext";
import MapSection from "../map/MapSection";

// Marker sozlamalari
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
          <AlertCircle size={10} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function AddStationForm() {
  const { addStation, CATEGORIES, setView } = useStation();
  
  // Scroll qilish uchun asosiy konteynerga ref
  const scrollRef = useRef(null);

  const EMPTY = {
    name: "",
    category: "highvoltage",
    lat: "",
    lng: "",
    voltage: "",
    capacity: "",
    commissioned: "",
    description: "",
    status: "active",
  };

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");

  // Success bo'lganda scrollni tepaga chiqarish
  useEffect(() => {
    if (submitted) {
      scrollRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [submitted]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom kiritilishi shart";
    if (!form.lat) e.lat = "Xaritadan nuqtani tanlang";
    if (!form.voltage.trim()) e.voltage = "Kuchlanish kiritilishi shart";
    if (!form.capacity.trim()) e.capacity = "Quvvat kiritilishi shart";
    if (!form.commissioned) e.commissioned = "Sana kiritilishi shart";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      // Xatolik bo'lganda ham tepaga chiqish (ixtiyoriy)
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    addStation({
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      load: 0,
      temp: 25,
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
      specs: { kuchlanish: form.voltage, quvvat: form.capacity },
    });

    setSubmitted(true);
    
    // Formani tozalash
    setTimeout(() => {
      setSubmitted(false);
      setForm(EMPTY);
      setFileName("");
    }, 4000);
  };

  const inputCls = (key) =>
    `w-full bg-[#0f1829] border ${
      errors[key] ? "border-red-500/50" : "border-white/10"
    } rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors`;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#070d18] scroll-smooth">
      <div className="max-w-2xl mx-auto p-8">
        
        <button
          onClick={() => setView("map")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Xaritaga qaytish
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Plus size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Yangi Stansiya Qo'shish</h1>
            <p className="text-slate-400 text-sm">Ma'lumotlarni to'ldiring va saqlang</p>
          </div>
        </div>

        {/* Success banner */}
        {submitted && (
          <div className="mb-6 bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-500 rounded-full p-1">
              <Check size={14} className="text-[#070d18]" />
            </div>
            <p className="text-emerald-400 text-sm font-semibold">
              Stansiya muvaffaqiyatli qo'shildi!
            </p>
          </div>
        )}

        <div className="bg-[#0a0f1a] border border-white/5 rounded-2xl p-6 space-y-5">
          <Field label="Stansiya Nomi" error={errors.name}>
            <input
              className={inputCls("name")}
              placeholder="Masalan: Yangiariq tuman 220kV Podstansiya"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kategoriya">
              <select className={inputCls("category")} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Holat">
              <select className={inputCls("status")} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Faol</option>
                <option value="maintenance">Ta'mirlashda</option>
                <option value="construction">Qurilishda</option>
              </select>
            </Field>
          </div>

          <Field label="Joylashuv (Xaritadan tanlang)" error={errors.lat || errors.lng}>
            <MapSection form={form} set={set} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kuchlanish" error={errors.voltage}>
              <input className={inputCls("voltage")} placeholder="220 kV" value={form.voltage} onChange={(e) => set("voltage", e.target.value)} />
            </Field>
            <Field label="Quvvat" error={errors.capacity}>
              <input className={inputCls("capacity")} placeholder="500 MVA" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
            </Field>
          </div>

          <Field label="Ishga tushirilgan sana" error={errors.commissioned}>
            <input type="date" className={inputCls("commissioned")} value={form.commissioned} onChange={(e) => set("commissioned", e.target.value)} />
          </Field>

          <Field label="Tavsif">
            <textarea className={`${inputCls("description")} resize-none`} rows={3} placeholder="Stansiya haqida..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>

          <Field label="Rasm Yuklash">
            <label className="flex items-center gap-3 w-full bg-[#0f1829] border border-dashed border-white/20 rounded-lg px-4 py-5 cursor-pointer hover:border-blue-500/40 transition-colors group">
              <Upload size={18} className="text-slate-500 group-hover:text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">{fileName || "Rasm tanlash..."}</p>
                <p className="text-xs text-slate-600">PNG, JPG · Maks 10 MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFileName(e.target.files[0]?.name || "")} />
            </label>
          </Field>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Stansiyani Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}