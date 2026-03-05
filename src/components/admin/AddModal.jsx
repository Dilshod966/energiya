import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  getUstachilik, 
  getNimstansiyalar, 
  getLiniyalar,
  // Bu yerda API da post so'rovlari bor deb faraz qilamiz
} from "../../services/api";

export default function AddModal({ isOpen, onClose, type, refreshData }) {
  const [parentList, setParentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});


  useEffect(() => {
    if (isOpen) {
      setFormData({}); // Formani tozalash
      setParentList([]);
      
      const fetchData = async () => {
        setLoading(true);
        try {
          if (type === 2) {
            const res = await getUstachilik();
            setParentList(res.data);
          } else if (type === 3) {
            // Liniya uchun barcha nimstansiyalar kerak
            // Agar API-da barcha nimstansiyalar yo'q bo'lsa, backendga 'all' so'rovini qo'shing
            const res = await getNimstansiyalar("all"); 
            setParentList(res.data);
          } else if (type === 4) {
            // Transformator uchun barcha liniyalar kerak
            const res = await getLiniyalar("all");
            setParentList(res.data);
          }
        } catch (err) {
          console.error("Ma'lumot yuklashda xato:", err);
        }
        setLoading(false);
      };

      fetchData();
    }
  }, [isOpen, type]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const onSubmit = async (e) => {
  e.preventDefault();
  
  // URL va ma'lumotlarni saralash mantiqi
  const config = {
    1: { url: "/ustachilik", data: { name: formData.name, usta: formData.usta } },
    2: { url: "/nimstansiya", data: { parentId: Number(formData.parentId), name: formData.name, quvvat: formData.quvvat } },
    3: { url: "/liniya", data: { parentId: Number(formData.parentId), name: formData.name, uzunlik: formData.uzunlik } },
    4: { url: "/transformator", data: { parentId: Number(formData.parentId), name: formData.name, quvvat: formData.quvvat, holat: formData.holat } }
  };

  const currentConfig = config[type];

  try {
    // API so'rovi (Sizdagi api.jsx dagi axios instansiyasi orqali)
    const response = await API.post(currentConfig.url, currentConfig.data);

    if (response.status === 200 || response.status === 201) {
      console.log("Muvaffaqiyatli saqlandi!");
      
      // 1. Modalni yopish
      onClose();
      
      // 2. Asosiy sahifadagi fetchData() funksiyasini ishga tushirish
      // Bu props orqali keladi va jadvalni F5 siz yangilaydi
      if (refreshData) {
        refreshData(); 
      }
    }
  } catch (err) {
    console.error("Saqlashda xatolik:", err.response?.data || err.message);
    alert("Xatolik yuz berdi. Ma'lumotlarni tekshirib qaytadan urinib ko'ring.");
  }
};

  const renderForm = () => {
    if (loading) return <div className="text-blue-400 text-center p-10 font-medium">Ma'lumotlar yuklanmoqda...</div>;

    switch (type) {
      case 1: // Ustachilik
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-2 text-blue-500">Ustachilik bo'limi qo'shish</h3>
            <input name="name" onChange={handleInputChange} type="text" placeholder="Bo'lim nomi" className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50" />
            <input name="usta" onChange={handleInputChange} type="text" placeholder="Usta ismi" className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50" />
          </div>
        );
      case 2: // Nimstansiya
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-2 text-emerald-500">Nimstansiya qo'shish</h3>
            <select name="parentId" onChange={handleInputChange} className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none">
              <option value="">Ustachilik bo'limini tanlang</option>
              {parentList.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input name="name" onChange={handleInputChange} type="text" placeholder="Nimstansiya nomi" className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-emerald-500/50" />
            <div className="grid grid-cols-2 gap-4">
              <input name="turi" onChange={handleInputChange} type="text" placeholder="Turi (kV)" className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none" />
              <input name="quvvat" onChange={handleInputChange} type="text" placeholder="Quvvati" className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none" />
            </div>
          </div>
        );
      case 3: // Liniya
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-2 text-purple-500">Liniya qo'shish</h3>
            <select name="parentId" onChange={handleInputChange} className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none">
              <option value="">Nimstansiyani tanlang</option>
              {parentList.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input name="name" onChange={handleInputChange} type="text" placeholder="Liniya nomi" className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-purple-500/50" />
            <div className="grid grid-cols-2 gap-4">
              <input name="turi" onChange={handleInputChange} type="text" placeholder="Turi" className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none" />
              <input name="uzunligi" onChange={handleInputChange} type="text" placeholder="Uzunligi (km)" className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none" />
            </div>
          </div>
        );
      case 4: // Transformator
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-2 text-amber-500">Transformator qo'shish</h3>
            <select name="parentId" onChange={handleInputChange} className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-amber-500/50">
              <option value="">Liniyani tanlang</option>
              {parentList.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input name="name" onChange={handleInputChange} type="text" placeholder="Transformator nomi" className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-amber-500/50" />
            <div className="grid grid-cols-2 gap-4">
              <input name="turi" onChange={handleInputChange} type="text" placeholder="Turi (TM/Tosh)" className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none" />
              <select name="holat" onChange={handleInputChange} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none">
                <option value="">Holati</option>
                <option value="Ishchi">Ishchi</option>
                <option value="Nosoz">Nosoz</option>
                <option value="Zaxira">Zaxira</option>
              </select>
            </div>
          </div>
        );
      default:
        return "null";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.8, opacity: 0, y: 50 }} 
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl"
          >
            <form onSubmit={onSubmit}>
              {renderForm()}

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 hover:text-white transition-all font-semibold">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all font-semibold">
                  Saqlash
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}