import { X, Calendar, MapPin, Zap, Activity, Gauge, Info, Settings } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import LoadRing from "../ui/LoadRing";

export default function StationDetail({ station, onClose }) {
  if (!station) return null;

  // Rasmlar massivini tayyorlaymiz
  const imageList = station.images 
    ? station.images.split(',').map(img => `http://localhost:5000/uploads/${img}`)
    : ["/default-tp.jpg"]; // Default rasm agar rasm bo'lmasa

  const mainColor = station.hisob === 'tet' ? '#3b82f6' : '#ea580c';

  return (
    <div className="flex flex-col h-full bg-[#0a0f1a]">
      {/* ── Header image (Slider bo'lishi ham mumkin) ── */}
      <div className="relative h-56 flex-shrink-0 overflow-hidden">
        <img
          src={imageList[0]} 
          alt={station.tp_raqami}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-red-500/80 transition-all z-10"
        >
          <X size={18} />
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} style={{ color: mainColor }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: mainColor }}>
              {station.hisob === 'tet' ? "TET Balansida" : "ISTE'MOLCHI"}
            </span>
          </div>
          <h2 className="text-white font-black text-2xl tracking-tight">№ {station.tp_raqami}</h2>
          <p className="text-slate-300 text-sm opacity-80">{station.mahalla}, {station.kocha_nomi}</p>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        
        {/* Asosiy ko'rsatkichlar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Quvvat", value: `${station.quvvat} kVA`, icon: Activity, color: "#10b981" },
            { label: "Kuchlanish", value: station.kuchlanishi, icon: Zap, color: "#f59e0b" },
            { label: "Yuklama", value: `${station.yuklama}%`, icon: Gauge, color: mainColor },
          ].map((s) => (
            <div key={s.label} className="bg-[#111a2e] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
              <s.icon size={16} style={{ color: s.color }} className="mb-2" />
              <div className="text-white font-bold text-sm">{s.value}</div>
              <div className="text-slate-500 text-[10px] uppercase font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Texnik ma'lumotlar jadvali */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Settings size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">Pasport ma'lumotlari</span>
          </div>
          
          <div className="bg-[#111a2e] rounded-2xl p-4 border border-white/5 space-y-3">
            {[
              { label: "Liniya (Fider)", value: station.parentName },
              { label: "Invertar №", value: station.inventar_raqami },
              { label: "TP Turi", value: station.tp_turi },
              { label: "Zavod №", value: station.zavod_raqami },
              { label: "Ishga tushgan yili", value: station.ishga_tushgan_sana },
              { label: "Fiderlar soni", value: station.fiderlar_soni },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-slate-400 text-xs">{item.label}</span>
                <span className="text-white text-xs font-semibold">{item.value || "---"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Iste'molchilar */}
        <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
          <div className="flex items-center gap-2 text-blue-400 mb-3">
            <Info size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">Iste'molchilar</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Aholi soni</p>
              <p className="text-white font-bold text-lg">{station.axoli || 0}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Ulgurji</p>
              <p className="text-white font-bold text-lg">{station.ulgurji || 0}</p>
            </div>
          </div>
        </div>

        {/* Manzil va Koordinata */}
        <div className="flex items-start gap-3 bg-[#111a2e] rounded-2xl p-4 border border-white/5">
          <MapPin className="text-slate-500 mt-1" size={18} />
          <div>
            <p className="text-slate-400 text-xs font-medium">Joylashuv</p>
            <p className="text-white text-sm mt-1">{station.mahalla}, {station.kocha_nomi}</p>
            <p className="text-slate-500 text-[11px] font-mono mt-1">
              {station.lat.toFixed(6)}, {station.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}