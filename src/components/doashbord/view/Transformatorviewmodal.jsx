import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback, useState } from "react";
import {
  X,
  MapPin,
  Zap,
  Building2,
  Wrench,
  Users,
  CalendarDays,
  FileSpreadsheet,
  ShieldCheck,
  Gauge,
} from "lucide-react";
import * as XLSX from "xlsx";

const formatIshDate = (d) => {
  if (!d) return "";
  const s = String(d).split("T")[0];
  const p = s.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : s;
};

export default function TransformatorViewModal({ isOpen, onClose, data }) {
  const [ishlar, setIshlar] = useState([]);

  // ESC tugmasi va tashqari click
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Transformatorga tegishli ishlarni yuklash
  useEffect(() => {
    if (!isOpen || !data?.id) return;
    fetch(`http://localhost:5000/api/ish/filter?tur=transformator&ob_id=${data.id}`)
      .then((r) => r.json())
      .then((d) => setIshlar(Array.isArray(d) ? d : []))
      .catch(() => setIshlar([]));
  }, [isOpen, data?.id]);

  const handleExport = () => {
    if (!data) return;

    const ws = {};

    const sc = (addr, value) => {
      ws[addr] = { v: value !== null && value !== undefined ? String(value) : "", t: "s" };
    };

    // Asosiy ma'lumotlar
    sc("B2", [data.tp_raqami, data.quvvat].filter(Boolean).join("/"));
    sc("C4", data.fider || "");
    sc("C5", [data.mahalla, data.kocha_nomi].filter(Boolean).join(" "));
    sc("C6", data.tp_turi || "");
    sc("E6", data.zavod_raqami || "");
    sc("I6", data.ishga_tushgan_sana || "");
    sc("D7", data.ishlab_chiqarilgan_zavod || "");
    sc("I7", data.ishlab_chiqarilgan_yili || "");
    sc("D8", data.qurilish_tashkiloti || "");
    sc("B9", data.trans_ornatilishi || "");

    // 14-qator — elektr jihozlari
    sc("B14", data.razedini || "");
    sc("C14", data.razryadniklar || "");
    sc(
      "D14",
      [data.predoxrabiteli10, data.predoxrabiteli4].filter(Boolean).join("/")
    );
    sc("E14", data.proxodny || "");
    sc("F14", data.oporny || "");
    sc("G14", data.shina || "");
    sc("H14", data.toka || "");
    sc("I14", data.kuchlanishi || "");

    // 19-qator — hisoblagich / rubilnik / vyvody
    sc("B19", data.rubilniklar || "");
    sc("E19", data.schotId || "");
    sc("J19", data.vyvody || "");

    // Qilingan ishlar — 30-qatordan boshlab
    ishlar.forEach((ish, idx) => {
      const r = 30 + idx;
      sc(`B${r}`, formatIshDate(ish.ish_kun));
      sc(`C${r}`, ish.ish_matni || "");
      sc(`J${r}`, `${ish.ism || ""} ${ish.familiya || ""}`.trim());
    });

    // Worksheet oraliq
    const lastRow = ishlar.length > 0 ? 30 + ishlar.length - 1 : 30;
    ws["!ref"] = `A1:J${lastRow}`;

    // Ustun kengliklari
    ws["!cols"] = [
      { wch: 4 },  // A
      { wch: 22 }, // B
      { wch: 26 }, // C
      { wch: 26 }, // D
      { wch: 18 }, // E
      { wch: 16 }, // F
      { wch: 14 }, // G
      { wch: 14 }, // H
      { wch: 20 }, // I
      { wch: 26 }, // J
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transformator");
    XLSX.writeFile(wb, `TP_${data.tp_raqami || "malumot"}.xlsx`);
  };

  if (!data) return null;

  const Section = ({ title, icon: Icon, color, children }) => (
    <div className="space-y-3">
      <h4
        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${color}`}
      >
        <Icon size={13} />
        {title}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{children}</div>
    </div>
  );

  const Field = ({ label, value, wide }) => (
    <div
      className={`bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-700/50 ${wide ? "col-span-2 md:col-span-3" : ""}`}
    >
      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-white text-sm font-medium truncate">
        {value || <span className="text-slate-600 italic text-xs">—</span>}
      </p>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[61] flex items-start pt-16 justify-center p-4 overflow-y-auto custom-scrollbar pointer-events-none">
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl mb-12 pointer-events-auto overflow-hidden"
            >
              {/* Header gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />

              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Zap size={18} className="text-blue-400 fill-blue-400/30" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                      Transformator
                    </p>
                    <h3 className="text-xl font-black text-white">
                      TP{" "}
                      <span className="text-blue-400">{data.tp_raqami}</span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Excel tugmasi */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleExport}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs overflow-hidden group"
                    style={{ background: "transparent" }}
                  >
                    {/* Excel green gradient bg */}
                    <span className="absolute inset-0 bg-gradient-to-br from-[#1D6F42] to-[#107C41] rounded-xl" />
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#22864e] to-[#13924d] rounded-xl transition-opacity duration-200" />
                    {/* Excel grid pattern overlay */}
                    <span
                      className="absolute inset-0 opacity-10 rounded-xl"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(255,255,255,0.3) 8px,rgba(255,255,255,0.3) 9px),repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(255,255,255,0.3) 8px,rgba(255,255,255,0.3) 9px)",
                      }}
                    />
                    <FileSpreadsheet
                      size={15}
                      className="relative text-white z-10"
                    />
                    <span className="relative text-white z-10 tracking-wider">
                      EXCEL
                    </span>
                  </motion.button>

                  {/* Yopish */}
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                {/* Hisob badge + koordinata */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      data.hisob === "tet"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}
                  >
                    {data.hisob === "tet" ? "TET" : "ISTE'MOLCHI"}
                  </span>
                  {data.lat && data.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${data.lat},${data.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold hover:bg-blue-500/20 transition-all"
                    >
                      <MapPin size={11} /> Xaritada ko'rish
                    </a>
                  )}
                </div>

                {/* Asosiy */}
                <Section title="Asosiy Ma'lumotlar" icon={Building2} color="text-slate-400">
                  <Field label="Inventar raqami" value={data.inventar_raqami} />
                  <Field label="Mahalla" value={data.mahalla} />
                  <Field label="Ko'cha nomi" value={data.kocha_nomi} />
                </Section>

                <div className="h-px bg-slate-800" />

                {/* Texnik */}
                <Section title="Texnik Jihozlar" icon={Zap} color="text-blue-400">
                  <Field label="Quvvati (kVA)" value={data.quvvat} />
                  <Field label="Fider" value={data.fider} />
                  <Field label="Kuchlanishi" value={data.kuchlanishi} />
                  <Field label="TP turi" value={data.tp_turi} />
                  <Field label="Ishga tushgan yili" value={data.ishga_tushgan_sana} />
                  <Field label="Zavod raqami" value={data.zavod_raqami} />
                  <Field label="Ishlab chiqarilgan zavod" value={data.ishlab_chiqarilgan_zavod} />
                  <Field label="Ishlab chiqarilgan yili" value={data.ishlab_chiqarilgan_yili} />
                  <Field label="Qurilish tashkiloti" value={data.qurilish_tashkiloti} wide />
                  <Field label="Trans o'rnatilishi" value={data.trans_ornatilishi} wide />
                </Section>

                <div className="h-px bg-slate-800" />

                {/* Elektr jihozlari */}
                <Section title="Elektr Jihozlari" icon={ShieldCheck} color="text-violet-400">
                  <Field label="Razedini" value={data.razedini} />
                  <Field label="Razryadniklar" value={data.razryadniklar} />
                  <Field label="Predoxraniteli 10kV" value={data.predoxrabiteli10} />
                  <Field label="Predoxraniteli 0.4kV" value={data.predoxrabiteli4} />
                  <Field label="Proxodnye izolyator" value={data.proxodny} />
                  <Field label="Opornye izolyator" value={data.oporny} />
                  <Field label="Shina" value={data.shina} />
                  <Field label="Rubilniklar/Avtomatlar" value={data.rubilniklar} wide />
                  <Field label="Vyvody" value={data.vyvody} wide />
                  <Field label="Fiderlar soni" value={data.fiderlar_soni} />
                  <Field label="Toka transformator" value={data.toka} />
                  <Field label="Schotchik tip" value={data.tip} />
                  <Field label="Schotchik №" value={data.schotId} />
                </Section>

                <div className="h-px bg-slate-800" />

                {/* Iste'molchilar */}
                <Section title="Iste'molchilar" icon={Users} color="text-amber-400">
                  <Field label="Jami" value={data.istemolchi_jami} />
                  <Field label="Aholi" value={data.axoli} />
                  <Field label="Ulgurji" value={data.ulgurji} />
                </Section>

                <div className="h-px bg-slate-800" />

                {/* Tamirlash */}
                <Section title="Tamirlash" icon={Wrench} color="text-emerald-400">
                  <Field label="Mukammal TP" value={data.mukammal_tp} />
                  <Field label="Mukammal XL" value={data.mukammal_xl} />
                  <Field label="Mukammal km" value={data.mukammal_km} />
                  <Field label="Joriy TP" value={data.joriy_tp} />
                  <Field label="Joriy XL" value={data.joriy_xl} />
                  <Field label="Joriy km" value={data.joriy_km} />
                  <Field label="Yuklama (%)" value={data.yuklama} />
                </Section>

                <div className="h-px bg-slate-800" />

                {/* ── Qilingan Ishlar ────────────────────────────────── */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                    <Wrench size={13} /> Qilingan Ishlar
                    {ishlar.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 text-[9px] font-black">
                        {ishlar.length}
                      </span>
                    )}
                  </h4>

                  {ishlar.length === 0 ? (
                    <div className="flex items-center justify-center py-8 rounded-2xl border border-slate-800 border-dashed">
                      <p className="text-slate-600 text-xs italic">
                        Bu transformator uchun hech qanday ish qayd etilmagan
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ishlar.map((ish, idx) => (
                        <motion.div
                          key={ish.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="flex gap-0 rounded-2xl bg-slate-800/40 border border-slate-700/40 overflow-hidden hover:border-slate-600/50 transition-all"
                        >
                          {/* Blue stripe (transformator rangi) */}
                          <div className="w-1 flex-shrink-0 bg-blue-500" />

                          <div className="flex-1 px-4 py-3 min-w-0">
                            {/* Worker */}
                            <p className="text-violet-400 text-[11px] font-bold mb-1.5">
                              {ish.ism} {ish.familiya}
                            </p>
                            {/* Ish matni */}
                            <p className="text-slate-300 text-[12px] leading-relaxed whitespace-pre-wrap">
                              {ish.ish_matni}
                            </p>
                            {/* Date + time */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded-md">
                                {formatIshDate(ish.ish_kun)}
                              </span>
                              <span className="text-slate-700 text-[9px]">•</span>
                              <span className="text-[9px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded-md">
                                {String(ish.ish_soat || "").slice(0, 5)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}