// UstachilikList.jsx (Boshqa listlar ham shu mantiqda)
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUstachilik } from "../../services/api";
import { useState, useEffect } from "react";
export default function UstachilikList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUstachilik()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

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

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
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
      className="w-full text-left border-collapse table-fixed"
    >
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
          <th className="px-6 py-4 font-medium">Nomi / Ma'lumot</th>
          <th className="px-6 py-4 text-center font-medium w-34">
            Nimstansiyalar
          </th>
          <th className="px-6 py-4 text-center font-medium w-34">Liniyalar</th>
          <th className="px-6 py-4 text-center font-medium w-34">
            Transformatorlar
          </th>
        </tr>
      </thead>
      <motion.tbody
        variants={container}
        initial="hidden"
        animate="show"
        className="divide-y divide-slate-800"
      >
        {data.map((item) => (
          <motion.tr
            key={item.id}
            variants={itemAnim}
            onClick={() => navigate(`${item.id}`)}
            className="cursor-pointer transition-all hover:bg-slate-700/40 border-b border-slate-800/50"
          >
            {/* 1. Nomi */}
            <td className="px-6 py-4 text-white font-medium w-[300px]">
              {item.name} <br />
              <span className="text-slate-500 text-[11px]">{item.usta}</span>
            </td>

            {/* 2. Nimstansiyalar Ustuni */}
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

            {/* 3. Liniyalar Ustuni */}
            <td className="px-4 py-4 border-r border-slate-700/50">
              <div className="flex items-center justify-center">
                <StatBlock
                  value={item.l_jami}
                  label="Jami"
                  color="text-white"
                  km
                />
                <StatBlock
                  value={item.l_tet}
                  label="TET"
                  color="text-blue-400"
                  border
                  km
                />
                <StatBlock
                  value={item.l_istemol}
                  label="Iste'mol"
                  color="text-amber-400"
                  km
                />
              </div>
            </td>

            {/* 4. Transformatorlar Ustuni */}
            <td className="px-4 py-4">
              <div className="flex items-center justify-center">
                <StatBlock
                  value={item.t_jami}
                  label="Jami"
                  color="text-white"
                />
                <StatBlock
                  value={item.t_tet}
                  label="TET"
                  color="text-blue-400"
                  border
                />
                <StatBlock
                  value={item.t_istemol}
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
