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
      className="w-full text-left border-collapse"
    >
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
          <th className="px-6 py-4 font-medium">Nomi / Ma'lumot</th>
          <th className="px-6 py-4 text-left font-medium">Ma'sul hodim</th>
          <th className="px-6 py-4 text-center font-medium">
            Nimstansiyalar Jami
          </th>
          <th className="px-6 py-4 text-center font-medium">TET hisobida</th>
          <th className="px-6 py-4 text-center font-medium">
            Istemochli hisobida
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
            <td className="px-6 py-4 text-white font-medium w-[300px]">
              {item.name}
            </td>
            <td className="px-6 py-4 text-left text-slate-400 text-xs italic w-auto">
              {item.usta}
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono border-r border-slate-700/50 w-24">
              {item.jami} ta
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono border-r border-slate-700/50 w-24">
              {item.tet} ta
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono w-24">
              {item.jami - item.tet} ta
            </td>
          </motion.tr>
        ))}
      </motion.tbody>
    </motion.table>
  );
}
