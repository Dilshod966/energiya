import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getLiniyalar, getNimstansiyalar, API } from "../../services/api";
// Xarita komponentini import qilamiz
import MapSection from "../map/MapSection";
import { AlertCircle, ArrowDown, X, Upload } from "lucide-react";

export default function AddTransformator({
  isOpen,
  onClose,
  refreshData,
  editData = null,
}) {
  const [nimstansiyalar, setNimstansiyalar] = useState([]);
  const [allLiniyalar, setAllLiniyalar] = useState([]);
  const [filteredLiniyalar, setFilteredLiniyalar] = useState([]);
  const [selectedPs, setSelectedPs] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const initialFormState = {
    // Asosiy bog'liqlik
    parentId: "",

    // Excel dagi asosiy ustunlar
    tp_raqami: "",
    inventar_raqami: "",
    mahalla: "",
    kocha_nomi: "",

    // Texnik jihozlar
    quvvat: "",
    fider: "",
    kuchlanishi: "",
    tp_turi: "",
    ishga_tushgan_sana: "",
    zavod_raqami: "",
    ishlab_chiqarilgan_zavod: "",
    ishlab_chiqarilgan_yili: "",
    qurilish_tashkiloti: "",
    trans_ornatilishi: "",

    // Elektr jihozlari
    razedini: "",
    razryadniklar: "",
    predoxrabiteli10: "",
    predoxrabiteli4: "",

    // Izolyatorlar va shina
    proxodny: "",
    oporny: "",
    shina: "",
    rubilniklar: "", // Rubilniklar / Avtomatlar

    // Vyvody va Schotchik
    vyvody: "",
    fiderlar_soni: "",
    toka: "",
    tip: "",
    schotId: "",

    // Istemolchilar
    istemolchi_jami: "",
    axoli: "",
    ulgurji: "",

    // Tamirlash ma'lumotlari
    mukammal_tp: "",
    mukammal_xl: "",
    mukammal_km: "",
    joriy_tp: "",
    joriy_xl: "",
    joriy_km: "",
    yuklama: "",

    // Koordinatalar (MapSection dan keladi)
    lat: "",
    lng: "",

    // Qo'shimcha (agar kerak bo'lsa)
    hisob: "tet",
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

          const psList = psRes.data || [];
          const lineList = lineRes.data || [];
          setNimstansiyalar(psList);
          setAllLiniyalar(lineList);

          if (editData) {
            setFormData(editData);

            // Rasmlarni qayta tiklash
            if (editData.images) {
              const imageArray =
                typeof editData.images === "string"
                  ? editData.images
                      .split(",")
                      .filter((img) => img.trim() !== "")
                  : [];

              const backendUrl = "http://localhost:5000";
              const fullPaths = imageArray.map((img) => ({
                id: Math.random(), // Unique ID o'chirish uchun
                url: img.startsWith("http")
                  ? img
                  : `${backendUrl}/uploads/${img}`,
                isServer: true,
                name: img, // serverdagi asl nomi
              }));

              setPreviews(fullPaths);
            } else {
              setPreviews([]);
            }

            const line = lineList.find(
              (l) => String(l.id) === String(editData.parentId),
            );
            if (line) {
              const psId = String(line.parentId);
              setSelectedPs(psId);
              setFilteredLiniyalar(
                lineList.filter((l) => String(l.parentId) === psId),
              );
            }
          } else {
            setFormData(initialFormState);
            setSelectedPs("");
            setFilteredLiniyalar([]);
            setPreviews([]);
            setSelectedFiles([]);
          }
        } catch (err) {
          console.error("Xatolik:", err);
        }
      };
      fetchData();
    }
  }, [isOpen, editData]); // allLiniyalar ni dependency dan olib tashlang, fetchData ichida yuklanyapti

  // Xarita uchun maxsus set funksiyasi (Sizning kodingizdagi mantiq bo'yicha)
  const setCoord = (k, v) => {
    setFormData((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleRemoveImage = (imgObject) => {
    setPreviews((prev) => prev.filter((p) => p.id !== imgObject.id));
    // Agar blob bo'lsa, xotirani bo'shatamiz
    if (!imgObject.isServer) {
      URL.revokeObjectURL(imgObject.url);
    }
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const newPreviews = files.map((file) => ({
      id: Math.random(),
      url: URL.createObjectURL(file),
      file: file, // Asl faylni o'zida saqlaymiz
      isServer: false,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();

    // MUHIM: TP raqami images dan oldin qo'shilishi kerak (Multer o'qiy olishi uchun)
    formPayload.append("tp_raqami", formData.tp_raqami);

    // 1. Boshqa matnli maydonlar
    Object.keys(formData).forEach((key) => {
      if (key !== "images" && key !== "tp_raqami") {
        formPayload.append(key, formData[key] === null ? "" : formData[key]);
      }
    });

    // 2. Yangi fayllar
    previews
      .filter((p) => !p.isServer)
      .forEach((p) => {
        formPayload.append("images", p.file);
      });

    // 3. Bazada qolgan rasmlar (X bosilmaganlari)
    const existingImages = previews
      .filter((p) => p.isServer)
      .map((p) => p.name);
    formPayload.append("existing_images", existingImages.join(","));

    try {
      if (editData) {
        await API.put(`/transformator/${editData.id}`, formPayload);
      } else {
        await API.post("/transformator", formPayload);
      }
      refreshData();
      onClose();
    } catch (err) {
      alert("Saqlashda xatolik!");
    }
  };

  const isEdit = !!editData;
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
                  {isEdit
                    ? "Transformatorni Tahrirlash"
                    : "Yangi Transformator Qo'shish"}
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
                  value={formData.tp_raqami}
                  required
                  onChange={handleInputChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none"
                  placeholder="TP raqami:"
                />
                <input
                  name="inventar_raqami"
                  value={formData.inventar_raqami}
                  onChange={handleInputChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none"
                  placeholder="Inventar raqami:"
                />
                <input
                  name="mahalla"
                  value={formData.mahalla}
                  onChange={handleInputChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none"
                  placeholder="Mahalla:"
                />
                <input
                  name="kocha_nomi"
                  value={formData.kocha_nomi}
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
                    value={formData.quvvat || ""}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Quvvati: (kVA)"
                  />
                  <input
                    name="fider"
                    value={formData.fider}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Fider nomi:"
                  />
                  <input
                    name="kuchlanishi"
                    value={formData.kuchlanishi}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Kuchlanishi:"
                  />
                  <select
                    name="tp_turi"
                    value={String(formData.tp_turi || "")}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
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
                    value={formData.ishga_tushgan_sana}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none min-w-0"
                    placeholder="Ishga tushgan yili:"
                  />
                  <input
                    name="zavod_raqami"
                    value={formData.zavod_raqami}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Zavod raqami:"
                  />
                  <input
                    name="ishlab_chiqarilgan_zavod"
                    value={formData.ishlab_chiqarilgan_zavod}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Ishlab chiqarilgan zavod:"
                  />
                  <input
                    name="ishlab_chiqarilgan_yili"
                    value={formData.ishlab_chiqarilgan_yili}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none min-w-0 "
                    placeholder="Yili"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <textarea
                      name="qurilish_tashkiloti"
                      value={formData.qurilish_tashkiloti}
                      onChange={handleInputChange}
                      rows="3"
                      className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 resize-none w-full"
                      placeholder="Qurilish qaysi tashkilot tomonidan amalga oshirilgan:"
                    ></textarea>
                  </div>

                  <div className="flex flex-col gap-2">
                    <textarea
                      name="trans_ornatilishi"
                      value={formData.trans_ornatilishi}
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
                    value={formData.razedini}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Razedini Teli:"
                  />
                  <input
                    name="razryadniklar"
                    value={formData.razryadniklar}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Razryadniklar:"
                  />
                  <input
                    name="predoxrabiteli10"
                    value={formData.predoxrabiteli10}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none"
                    placeholder="Predoxraniteli 10kV:"
                  />
                  <input
                    name="predoxrabiteli4"
                    value={formData.predoxrabiteli4}
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
                        value={formData.proxodny}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Proxodnye:"
                      />
                      <input
                        name="oporny"
                        formvalue={formData.oporny || ""}
                        onChange={handleInputChange}
                        className=" p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Opornye:"
                      />
                      <input
                        name="shina"
                        value={formData.shina}
                        onChange={handleInputChange}
                        className="col-span-2 p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Shina:"
                      />
                    </div>
                  </div>
                  <textarea
                    name="rubilniklar"
                    value={formData.rubilniklar}
                    onChange={handleInputChange}
                    rows="3"
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 resize-none w-full"
                    placeholder="Rubilniklar / Avtomatlar:"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1.3fr] gap-4">
                  <textarea
                    name="vyvody"
                    value={formData.vyvody}
                    onChange={handleInputChange}
                    rows="3"
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 resize-none w-full"
                    placeholder="Vyvody:"
                  ></textarea>

                  <div className="flex flex-col gap-4 min-w-0">
                    <div className="flex gap-4 min-w-0">
                      <input
                        name="fiderlar_soni"
                        value={formData.fiderlar_soni}
                        onChange={handleInputChange}
                        className="flex-1 min-w-0 p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Fiderlar soni:"
                      />
                      <input
                        name="toka"
                        value={formData.toka}
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
                        value={formData.tip}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Tip:"
                      />
                      <input
                        name="schotId"
                        value={formData.schotId}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="№:"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-4">
                  <div className="flex flex-col gap-4 min-w-0">
                    <h4 className="flex  items-center justify-center gap-1 text-blue-400 text-xs font-bold uppercase tracking-wider">
                      Istemolchi Soni
                      <ArrowDown className="w-4 h-4" />{" "}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        name="istemolchi_jami"
                        value={formData.istemolchi_jami}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Jami:"
                      />
                      <input
                        name="axoli"
                        value={formData.axoli}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Axoli:"
                      />
                      <input
                        name="ulgurji"
                        value={formData.ulgurji}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="Ulgurji:"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 row-span-4">
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

                  <div className="flex flex-col gap-4 min-w-0">
                    <h4 className="flex items-center justify-center gap-1 text-blue-400 text-xs font-bold uppercase tracking-wider">
                      Mukammal Tamirlash
                      <ArrowDown className="w-4 h-4" />{" "}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        name="mukammal_tp"
                        value={formData.mukammal_tp}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="TP:"
                      />
                      <input
                        name="mukammal_xl"
                        value={formData.mukammal_xl}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="XL:"
                      />
                      <input
                        name="mukammal_km"
                        value={formData.mukammal_km}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="XL km:"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 min-w-0">
                    <h4 className="flex items-center justify-center gap-1 text-blue-400 text-xs font-bold uppercase tracking-wider">
                      Joriy Tamirlash
                      <ArrowDown className="w-4 h-4" />{" "}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        name="joriy_tp"
                        value={formData.joriy_tp}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="TP:"
                      />
                      <input
                        name="joriy_xl"
                        value={formData.joriy_xl}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="XL:"
                      />
                      <input
                        name="joriy_km"
                        value={formData.joriy_km}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="XL km:"
                      />
                    </div>
                  </div>
                  <input
                    name="yuklama"
                    value={formData.yuklama}
                    onChange={handleInputChange}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                    placeholder="Yuklama: ( %)"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] gap-4 items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-500/50 rounded-xl text-blue-400">
                    <Upload size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">RASM QO'SHISH</span>
                  </label>
                </div>

                <div className="flex gap-2 overflow-x-auto p-1">
                  {previews.map((imgObj) => (
                    <div key={imgObj.id} className="relative flex-shrink-0">
                      <img
                        src={imgObj.url}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-600"
                        alt="preview"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imgObj)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
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
                  {isEdit ? "O'zgarishlarni saqlash" : "Saqlash"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
