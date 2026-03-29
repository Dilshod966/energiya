import { useParams } from "react-router-dom";
import { getTransformatorlar } from "../../services/api";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import TransformatorViewModal from "./view/Transformatorviewmodal";

export default function TransformatorList() {
  const { lId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState(null);
  useEffect(() => {
    setLoading(true);
    getTransformatorlar(lId)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [lId]);

  if (loading)
    return <div className="p-10 text-center text-blue-400">Yuklanmoqda...</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };
  return (
    <motion.table
      variants={pageVariants} // Dashboarddan kelayotgan page animatsiyasi
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full text-left border-collapse"
    >
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
          <th className="px-6 py-4 font-medium">TP Raqami</th>
          <th className="px-6 py-4 text-center font-medium">Quvvati</th>
          <th className="px-6 py-4 text-center font-medium">Manzili</th>
          <th className="px-6 py-4 text-center font-medium">
            Mukammal Tamirlash
          </th>
          <th className="px-6 py-4 text-center font-medium">Joriy Tamirlash</th>
          <th className="px-6 py-4 text-center font-medium">Balans</th>
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
            onClick={() => setViewData(item)}
            variants={rowVariants}
            className="cursor-pointer border-b transition-all duration-200 hover:bg-slate-700/30 border-slate-800/50"
          >
            <td className="px-6 py-4 text-white font-medium">
              TP {item.tp_raqami}
            </td>
            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
              {item.quvvat}
            </td>
            <td className="flex gap-2 px-6 py-4 text-center justify-center text-slate-400 text-xs italic">
              <a
                href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all duration-200 active:scale-95"
                title="Google Maps-da ko'rish"
              >
                <MapPin size={20} />
              </a>
            </td>
            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
              {item.mukammal_tp}
            </td>
            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
              {item.joriy_tp}
            </td>

            <td className="px-6 py-4 text-center">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  item.hisob === "tet"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-orange-400 border border-slate-700/50"
                }`}
              >
                {item.hisob}
              </span>
            </td>
          </motion.tr>
        ))}
        <TransformatorViewModal
          isOpen={!!viewData}
          onClose={() => setViewData(null)}
          data={viewData}
        />
      </motion.tbody>
    </motion.table>
  );
}
