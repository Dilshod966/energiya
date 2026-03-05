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
          <th className="px-6 py-4 text-center font-medium">
            Turi / Kuchlanish
          </th>
          <th className="px-6 py-4 text-center font-medium">Quvvat (kVA)</th>
          <th className="px-6 py-4 text-center font-medium">Liniyalar Jami</th>
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
            <td className="px-6 py-4 text-white font-medium w-[300px]">
              {item.name}
            </td>
            <td className="px-6 py-4 text-center text-slate-400 text-xs italic w-auto">
              Nimstansiya???
            </td>
            <td className="px-6 py-4 text-center text-emerald-400 font-mono">
              {item.quvvat}
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono border-r border-slate-700/50 w-24">
              {item.jami} km
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono border-r border-slate-700/50 w-24">
              {item.tet} km
            </td>
            <td className="px-4 py-4 text-center text-blue-400 font-mono w-24">
              {item.jami - item.tet} km
            </td>
          </motion.tr>
        ))}
      </motion.tbody>
    </motion.table>
  );
}
