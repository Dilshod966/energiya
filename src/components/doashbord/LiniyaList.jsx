import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLiniyalar } from "../../services/api";

export default function LiniyaList() {
  const { nId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    setLoading(true);
    getLiniyalar(nId)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [nId]);

  

  if (loading)
    return <div className="p-10 text-center text-blue-400">Yuklanmoqda...</div>;

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
          <th className="px-6 py-4 text-center font-medium">Turi</th>
          <th className="px-6 py-4 text-center font-medium">Uzunlik (km)</th>
          <th className="px-6 py-4 text-center font-medium">
            Tranformatorlar Jami
          </th>
          <th className="px-6 py-4 text-center font-medium">TET hisobida</th>
          <th className="px-6 py-4 text-center font-medium">
            Istemochli hisobida
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
            <td className="px-6 py-4 text-white font-medium">{item.name}</td>
            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
              Havo Tarmog'i
            </td>
            <td className="px-6 py-4 text-center text-amber-400 font-mono">
              {item.uzunlik}
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono border-r border-slate-700/50 w-24">
              {item.jami_trafo || 0} ta
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono border-r border-slate-700/50 w-24">
              {item.tet_trafo || 0} ta
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono w-24">
              {item.istemol_trafo || 0} ta
            </td>
          </motion.tr>
        ))}
      </motion.tbody>
    </motion.table>
  );
}
