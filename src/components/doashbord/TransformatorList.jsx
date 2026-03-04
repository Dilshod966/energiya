import { useParams } from "react-router-dom";
import { getTransformatorlar } from "../../services/api";
import { motion } from "framer-motion";

export default function TransformatorList() {
  const { nId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    setLoading(true);
    getTransformatorlar(nId)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [nId]);

  

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
          <th className="px-6 py-4 font-medium">Nomi / Ma'lumot</th>
          <th className="px-6 py-4 text-center font-medium">Turi</th>
          <th className="px-6 py-4 text-right font-medium">Holat</th>
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
            className="border-b transition-all duration-200 hover:bg-slate-700/30 border-slate-800/50"
          >
            <td className="px-6 py-4 text-white font-medium">{item.name}</td>
            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
              Transformator
            </td>
            <td className="px-6 py-4 text-right">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  item.holat === "Ishchi"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {item.holat}
              </span>
            </td>
          </motion.tr>
        ))}
      </motion.tbody>
    </motion.table>
  );
}
