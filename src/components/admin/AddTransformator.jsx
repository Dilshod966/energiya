import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getLiniyalar, getNimstansiyalar, API } from "../../services/api";
// Xarita komponentini import qilamiz
import MapSection from "../map/MapSection";
import { AlertCircle, ArrowDown } from "lucide-react";

export default function AddTransformator({ isOpen, onClose, refreshData }) {
  const [nimstansiyalar, setNimstansiyalar] = useState([]);
  const [allLiniyalar, setAllLiniyalar] = useState([]);
  const [filteredLiniyalar, setFilteredLiniyalar] = useState([]);
  const [selectedPs, setSelectedPs] = useState("");

  const initialFormState = {
    parentId: "",
    tp_raqami: "",
    inventar_raqami: "",
    hisob: "tet",
    mahalla: "",
    kocha_nomi: "",
    quvvat: "",
    fider: "",
    kuchlanishi: "10/0.4 kV",
    tp_turi: "KTPM",
    ishga_tushgan_sana: "",
    zavod_raqami: "",
    ishlab_chiqarilgan_zavod: "",
    ishlab_chiqarilgan_yili: "",
    razryadniklar: "",
    izolyatorlar: "",
    rubilniklar: "",
    fiderlar_soni: "2",
    lat: "",
    lng: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [psRes, lineRes] = await Promise.all([
            getNimstansiyalar("all"),
            getLiniyalar("all"),
          ]);
          setNimstansiyalar(psRes.data || []);
          setAllLiniyalar(lineRes.data || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Xarita uchun maxsus set funksiyasi (Sizning kodingizdagi mantiq bo'yicha)
  const setCoord = (k, v) => {
    setFormData((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handlePsChange = (e) => {
    const psId = e.target.value;
    setSelectedPs(psId);
    setFilteredLiniyalar(
      allLiniyalar.filter((l) => String(l.parentId) === String(psId)),
    );
    setFormData({ ...formData, parentId: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      setErrors({ lat: "Xaritadan nuqtani tanlang!" });
      return;
    }
    try {
      await API.post("/transformator", formData);
      setFormData(initialFormState);
      refreshData();
      onClose();
    } catch (err) {
      alert("Xatolik yuz berdi");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start pt-16 justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md custom-scrollbar">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl mb-12"
          >
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-2xl font-bold text-blue-500">
                  Yangi Transformator Qo'shish
                </h3>
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {["tet", "istemol"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, hisob: t })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                        formData.hisob === t
                          ? t === "tet"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" // TET uchun ko'k
                            : "bg-orange-600 text-white shadow-lg shadow-orange-900/40" // Iste'molchi uchun to'q sariq
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t === "tet" ? "TET" : "ISTE'MOLCHI"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ierarxiya: PS -> Liniya */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                <select
                  required
                  value={selectedPs}
                  onChange={handlePsChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500"
                >
                  <option value="">-- Nimstansiyani tanlang --</option>
                  {nimstansiyalar.map((ps) => (
                    <option key={ps.id} value={ps.id}>
                      {ps.name}
                    </option>
                  ))}
                </select>
                <select
                  name="parentId"
                  required
                  disabled={!selectedPs}
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500"
                >
                  <option value="">-- Liniyani tanlang --</option>
                  {filteredLiniyalar.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Excel dagi asosiy ustunlar */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1.4fr_1.6fr] gap-4">
                <input
                  name="tp_raqami"
                  required
                  onChange={handleInputChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none"
                  placeholder="TP raqami:"
                />
                <input
                  name="inventar_raqami"
                  onChange={handleInputChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none"
                  placeholder="Inventar raqami:"
                />
                <input
                  name="mahalla"
                  onChange={handleInputChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none"
                  placeholder="Mahalla:"
                />
                <input
                  name="kocha_nomi"
                  onChange={handleInputChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none"
                  placeholder="Ko'cha nomi:"
                />
              </div>

              {/* Texnik Jihozlar Bloki (Rubilniklar, Razryadniklar va h.k.) */}
              <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl space-y-4">
                <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                  Texnik Jihozlar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-[0.3fr_1.9fr_1.9fr_0.3fr] gap-4">
                  <input
                    name="quvvat"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Quvvati: (kVA)"
                  />
                  <input
                    name="fider"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Fider nomi:"
                  />
                  <input
                    name="kuchlanishi"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Kuchlanishi:"
                  />
                  <select
                    name="tp_turi"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled hidden>
                      TP turini tanlang
                    </option>
                    <option value="КТПМ" className="bg-slate-900">
                      КТПМ
                    </option>
                    <option value="СКТП" className="bg-slate-900">
                      СКТП
                    </option>
                    <option value="ГКТП" className="bg-slate-900">
                      ГКТП
                    </option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[0.8fr_0.8fr_2fr_0.7fr] gap-4">
                  <input
                    name="ishga_tushgan_sana"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none min-w-0"
                    placeholder="Ishga tushgan yili:"
                  />
                  <input
                    name="zavod_raqami"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Zavod raqami:"
                  />
                  <input
                    name="ishlab_chiqarilgan_zavod"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Ishlab chiqarilgan zavod:"
                  />
                  <input
                    name="ishlab_chiqarilgan_yili"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none min-w-0 "
                    placeholder="Yili"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <textarea
                      name="qurilish_tashkiloti"
                      onChange={handleInputChange}
                      rows="3"
                      className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 resize-none w-full"
                      placeholder="Qurilish qaysi tashkilot tomonidan amalga oshirilgan:"
                    ></textarea>
                  </div>

                  <div className="flex flex-col gap-2">
                    <textarea
                      name="trans_ornatilishi"
                      onChange={handleInputChange}
                      rows="3"
                      className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 resize-none w-full"
                      placeholder="Transformatorning urnatilishi va balandligi:"
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    name="razedini"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Razedini Teli:"
                  />
                  <input
                    name="razryadniklar"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Razryadniklar:"
                  />
                  <input
                    name="predoxrabiteli10"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Predoxraniteli 10kV:"
                  />
                  <input
                    name="predoxrabiteli4"
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Predoxraniteli 0.4kV:"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                  <div className="flex flex-col gap-3">
                    <h4 className="flex items-center justify-center gap-1 text-blue-400 text-xs font-bold uppercase tracking-wider">
                      Izolatori
                      <ArrowDown className="w-4 h-4" />{" "}
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="proxodny"
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Proxodnye:"
                      />
                      <input
                        name="oporny"
                        onChange={handleInputChange}
                        className=" p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Opornye:"
                      />
                      <input
                        name="shina"
                        onChange={handleInputChange}
                        className="col-span-2 p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Shina:"
                      />
                    </div>
                  </div>
                  <textarea
                    name="rubilniklar"
                    onChange={handleInputChange}
                    rows="3"
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 resize-none w-full"
                    placeholder="Rubilniklar / Avtomatlar:"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1.3fr] gap-4">
                  <textarea
                    name="vyvody"
                    onChange={handleInputChange}
                    rows="3"
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 resize-none w-full"
                    placeholder="Vyvody:"
                  ></textarea>

                  <div className="flex flex-col gap-4 min-w-0">
                    <div className="flex gap-4 min-w-0">
                      <input
                        name="fiderlar_soni"
                        onChange={handleInputChange}
                        className="flex-1 min-w-0 p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Fiderlar soni:"
                      />
                      <input
                        name="toka"
                        onChange={handleInputChange}
                        className="flex-1 min-w-0 p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Toka Transformator:"
                      />
                    </div>

                    <h4 className="flex items-center justify-center gap-1 text-blue-400 text-xs font-bold uppercase tracking-wider">
                      Schotchik
                      <ArrowDown className="w-4 h-4" />{" "}
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="tip"
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Tip:"
                      />
                      <input
                        name="schotId"
                        onChange={handleInputChange}
                        className=" p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="№:"
                      />
                    </div>
                  </div>
                </div>

                <input
                  name="izolyatorlar"
                  onChange={handleInputChange}
                  className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                  placeholder="Izolyatorlar (IO-10)"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
              </div>

              {/* Zavod ma'lumotlari */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4"></div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">
                  Joylashuv (Xaritadan nuqtani tanlang)
                </label>
                <div className="rounded-2xl overflow-hidden border border-emerald-500/20 h-84 shadow-inner relative">
                  {/* MapSection integratsiyasi */}
                  <MapSection form={formData} set={setCoord} />

                  {/* Agar koordinata tanlanmagan bo'lsa xatolik xabari */}
                  {errors.lat && (
                    <div className="absolute top-2 right-2 z-[1000] bg-red-500/90 text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1 animate-bounce">
                      <AlertCircle size={12} /> {errors.lat}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                >
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
