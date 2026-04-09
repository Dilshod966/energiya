import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Wrench,
  Clock, CheckCircle2,
  FileImage, Image as ImageIcon, FileText,
  Calendar,
} from "lucide-react";

const BASE = "http://localhost:5000";

const formatDate = (d) => {
  if (!d) return "";
  const s = String(d).split("T")[0];
  const p = s.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : s;
};

const STATUS_CONFIG = {
  Jarayonda:  { color: "bg-amber-500/10 text-amber-400 border-amber-500/25",       icon: Clock        },
  Tugallandi: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25", icon: CheckCircle2 },
};

// ── Carousel ─────────────────────────────────────────────────────────────────
function Carousel({ images, title, accent }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${accent}`}>
        <FileImage size={11} />
        {title}
        <span className="ml-1 px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[9px] normal-case font-semibold">
          {images.length} ta rasm
        </span>
      </p>

      <div className="relative rounded-2xl overflow-hidden bg-black/30 border border-white/8">
        {/* Asosiy rasm */}
        <div
          className="relative cursor-zoom-in"
          style={{ height: 260 }}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={`${BASE}${images[idx]}`}
              alt=""
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="w-full h-full object-contain"
            />
          </AnimatePresence>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all backdrop-blur-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all backdrop-blur-sm"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Raqam */}
          <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {idx + 1} / {images.length}
          </span>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-1.5 p-2.5 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === idx ? "border-violet-500" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img src={`${BASE}${img}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              onClick={() => setLightbox(false)}
            >
              <X size={16} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-5 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-5 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <motion.img
              key={idx}
              src={`${BASE}${images[idx]}`}
              alt=""
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="absolute bottom-5 text-[11px] text-white/50 font-mono">
              {idx + 1} / {images.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function IshDetailModal({ isOpen, onClose, ish }) {
  if (!ish) return null;

  const status = ish.status || "Jarayonda";
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG["Jarayonda"];
  const StatusIcon = statusCfg.icon;

  const isLiniya = ish.tur === "liniya";

  const ishchilar =
    Array.isArray(ish.ishchilar) && ish.ishchilar.length > 0
      ? ish.ishchilar
      : ish.ism || ish.familiya
      ? [{ lavozim: "", ism_familiya: `${ish.ism || ""} ${ish.familiya || ""}`.trim() }]
      : [];

  const boshKun  = ish.boshlanish_kun  || ish.ish_kun;
  const boshSoat = ish.boshlanish_soat || ish.ish_soat;

  const farmoyishRasmlar = Array.isArray(ish.farmoyish_rasmlar) ? ish.farmoyish_rasmlar : [];
  const ishRasmlar       = Array.isArray(ish.ish_rasmlar)       ? ish.ish_rasmlar       : [];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-16 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-2xl bg-[#0a0f1a] border border-white/10 rounded-[2rem] shadow-2xl z-10 mb-12 overflow-hidden"
            initial={{ scale: 0.94, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            {/* Gradient line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${
              isLiniya
                ? "bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600"
                : "bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600"
            }`} />

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/5 bg-[#0f1829]">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isLiniya ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-500/10 border border-blue-500/20"
                }`}>
                  <Wrench size={16} className={isLiniya ? "text-amber-400" : "text-blue-400"} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      isLiniya
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}>
                      {isLiniya ? "Liniya" : "Transformator"}
                    </span>
                    <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                      <StatusIcon size={9} /> {status}
                    </span>
                  </div>
                  <h3 className="text-white font-black text-lg mt-1 leading-tight">{ish.ob_nomi}</h3>
                  {ish.naryad_raqami && (
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">📋 {ish.naryad_raqami}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[75vh]">

              {/* Ishchilar */}
              {ishchilar.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                    <ImageIcon size={11} /> Ishchilar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ishchilar.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2">
                        {w.lavozim && (
                          <span className="text-[10px] font-black text-violet-500 uppercase tracking-wider">{w.lavozim}</span>
                        )}
                        {w.lavozim && <span className="text-violet-700">·</span>}
                        <span className="text-[12px] text-violet-200 font-semibold">{w.ism_familiya}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vaqtlar */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  <Calendar size={11} /> Vaqt
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0f1829] border border-white/8 rounded-xl px-4 py-3">
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Boshlanish</p>
                    <p className="text-white font-bold text-sm">{formatDate(boshKun)}</p>
                    <p className="text-slate-400 text-[11px] font-mono mt-0.5">{String(boshSoat || "").slice(0, 5)}</p>
                  </div>
                  <div className={`border rounded-xl px-4 py-3 ${
                    ish.tugash_kun
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-[#0f1829] border-white/8"
                  }`}>
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Tugash</p>
                    {ish.tugash_kun ? (
                      <>
                        <p className="text-emerald-400 font-bold text-sm">{formatDate(ish.tugash_kun)}</p>
                        <p className="text-emerald-500 text-[11px] font-mono mt-0.5">{String(ish.tugash_soat || "").slice(0, 5)}</p>
                      </>
                    ) : (
                      <p className="text-slate-600 italic text-sm">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ish matni */}
              {ish.ish_matni && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                    <FileText size={11} /> Qilingan ishlar tavsifi
                  </p>
                  <div className="bg-[#0f1829] border border-white/8 rounded-xl px-4 py-3">
                    <p className="text-slate-300 text-[13px] leading-relaxed whitespace-pre-wrap">{ish.ish_matni}</p>
                  </div>
                </div>
              )}

              {/* Farmoyish rasmlari carousel */}
              {farmoyishRasmlar.length > 0 && (
                <>
                  <div className="h-px bg-white/5" />
                  <Carousel
                    images={farmoyishRasmlar}
                    title="Naryad / Farmoyish rasmlari"
                    accent="text-blue-400"
                  />
                </>
              )}

              {/* Ish rasmlari carousel */}
              {ishRasmlar.length > 0 && (
                <>
                  <div className="h-px bg-white/5" />
                  <Carousel
                    images={ishRasmlar}
                    title="Qilingan ish rasmlari"
                    accent="text-emerald-400"
                  />
                </>
              )}

              {/* Rasm yo'q holat */}
              {farmoyishRasmlar.length === 0 && ishRasmlar.length === 0 && (
                <div className="flex items-center justify-center py-6 rounded-2xl border border-white/5 border-dashed">
                  <p className="text-slate-600 text-xs italic">Rasm yuklanmagan</p>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
