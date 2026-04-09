import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLiniyalar } from "../../services/api";
import LiniyaViewModal from "./view/LiniyaViewModal";
export default function LiniyaList() {
  const { nId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState(null);
  useEffect(() => {
    setLoading(true);
    getLiniyalar(nId)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [nId]);

  if (loading)
    return (
      <div className="p-10 text-center text-blue-400 font-mono italic">
        Yuklanmoqda...
      </div>
    );

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  function StatBlock({ value, label, color, border }) {
    return (
      <div
        className={`flex flex-col items-center w-16 ${border ? "border-x border-slate-700/50" : ""}`}
      >
        <span className={`${color} font-mono text-[13px] leading-none`}>
          {value || 0} ta
        </span>
        <span className="text-[10px] uppercase text-slate-500 mt-1">
          {label}
        </span>
      </div>
    );
  }

  return (
    <motion.table
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full text-left border-collapse"
    >
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
          <th className="px-6 py-4 font-medium">Liniya Nomi</th>
          <th className="px-6 py-4 text-center font-medium">Inventar Raqami</th>
          <th className="px-6 py-4 text-center font-medium">Uzunlik (km)</th>
          <th className="px-6 py-4 text-center font-medium">
            Transformatorlar
          </th>
          <th className="px-6 py-4 text-center font-medium w-[150px]"></th>
        </tr>
      </thead>
      <motion.tbody
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="divide-y divide-slate-800"
      >
        {data.map((item) => (
          <motion.tr
            key={item.id}
            variants={rowVariants}
            onClick={() => navigate(`${item.id}`)}
            /* 'group' klassi hover effektini ichkariga uzatish uchun kerak */
            className="group cursor-pointer transition-all duration-200 hover:bg-slate-700/30 border-b border-slate-800/50"
          >
            <td className="px-6 py-4 text-white font-medium">
              {item.name}
              {/* <div className="text-[10px] text-slate-500 mt-0.5">ID: #00{item.id}</div> */}
            </td>

            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
              {item.inventar_raqami || "Mavjud emas"}
            </td>

            <td className="px-4 py-4 text-center">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-amber-400 font-mono font-bold text-sm">{item.jami_uzunligi || 0}</span>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-blue-400">TET: {item.tet_uzunlik || 0}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-orange-400">Ist: {item.istemol_uzunlik || 0}</span>
                </div>
              </div>
            </td>

            {/* TRANSFORMATORLAR STATISTIKASI */}
            <td className="px-4 py-4 border-slate-700/50">
              <div className="flex items-center justify-center">
                <StatBlock
                  value={item.jami_trafo}
                  label="Jami"
                  color="text-white"
                />
                <StatBlock
                  value={item.tet_trafo}
                  label="TET"
                  color="text-blue-400"
                  border
                />
                <StatBlock
                  value={item.istemol_trafo}
                  label="Iste'mol"
                  color="text-amber-400"
                />
              </div>
            </td>

            <td className="px-6 py-4 text-right">
              {/* Hover bo'lganda opacity va surilish animatsiyasi */}
              <div className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewData(item);
                  }}
                  className="text-[10px] text-blue-400 border border-blue-400/40 px-4 py-2 rounded-md bg-blue-500/5 hover:bg-blue-500/20 font-bold whitespace-nowrap uppercase tracking-tighter"
                >
                  Batafsil →
                </button>
              </div>
            </td>
          </motion.tr>
        ))}
        <LiniyaViewModal
          isOpen={!!viewData}
          onClose={() => setViewData(null)}
          data={viewData}
        />
      </motion.tbody>
    </motion.table>
  );
}
