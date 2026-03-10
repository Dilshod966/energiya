import { useParams, useNavigate } from "react-router-dom";
import { getNimstansiyalar } from "../../services/api";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function NimstansiyaList() {
  const { uId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNimstansiyalar(uId)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [uId]);

  function StatBlock({ value, label, color, border, km }) {
    return (
      <div
        className={`flex flex-col items-center w-16 ${border ? "border-x border-slate-700/50" : ""}`}
      >
        <span className={`${color} font-mono text-[13px] leading-none`}>
          {value || 0} {km ? "km" : "ta"}
        </span>
        <span className="text-[10px] uppercase text-slate-500 mt-1">
          {label}
        </span>
      </div>
    );
  }

  if (loading)
    return <div className="p-10 text-center text-blue-400">Yuklanmoqda...</div>;

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

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
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
          <th className="px-6 py-4 font-medium">Tegishli Nimstansiyalar</th>
          <th className="px-6 py-4 text-center font-medium">Liniyalar</th>
          <th className="px-6 py-4 text-center font-medium">Transformatorlar</th>
          <th className="px-6 py-4 text-center font-medium">
            Batafsil Malumot
          </th>
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
            className="cursor-pointer transition-all duration-200 hover:bg-slate-700/30 border-b border-slate-800/50"
          >
            <td className="px-6 py-4 text-white font-medium w-[300px]">
              {item.name}
            </td>
            <td className="px-4 py-4 border-r border-slate-700/50">
              <div className="flex items-center justify-center">
                <StatBlock
                  value={item.n_jami}
                  label="Jami"
                  color="text-white"
                />
                <StatBlock
                  value={item.n_tet}
                  label="TET"
                  color="text-blue-400"
                  border
                />
                <StatBlock
                  value={item.n_istemol}
                  label="Iste'mol"
                  color="text-amber-400"
                />
              </div>
            </td>
            <td className="px-4 py-4 border-r border-slate-700/50">
              <div className="flex items-center justify-center">
                <StatBlock
                  value={item.n_jami}
                  label="Jami"
                  color="text-white"
                />
                <StatBlock
                  value={item.n_tet}
                  label="TET"
                  color="text-blue-400"
                  border
                />
                <StatBlock
                  value={item.n_istemol}
                  label="Iste'mol"
                  color="text-amber-400"
                />
              </div>
            </td>
          </motion.tr>
        ))}
      </motion.tbody>
    </motion.table>
  );
}
