import React, { useState } from "react";

const DrillDownTable = () => {
  // Bosqichlar: 'ustachilik' | 'nimstansiya' | 'liniya' | 'transformator'
  const [level, setLevel] = useState("ustachilik");
  const [activeParentId, setActiveParentId] = useState(null);
  // Namuna uchun ma'lumotlar (Buni keyinchalik API dan olasiz)
  const database = {
    ustachilik: [
      {
        id: 1,
        name: "1-sonli ustachilik bo'limi",
        usta: "Eshmuradov Nodir",
        ns: 2,
        hl: 25,
        tr: 45,
      },
      {
        id: 2,
        name: "2-sonli ustachilik bo'limi",
        usta: "Jumaniyozov F.",
        ns: 1,
        hl: 15,
        tr: 30,
      },
    ],
    nimstansiya: [
      {
        id: 101,
        parentId: 1,
        name: "PS 110/10 'Yangiariq'",
        quvvat: "25 MVA",
        hl_soni: 2,
        tr_soni: 14,
      },
      {
        id: 102,
        parentId: 1,
        name: "PS 35/10 'G'alaba'",
        quvvat: "6.3 MVA",
        hl_soni: 1,
        tr_soni: 8,
      },
      {
        id: 103,
        parentId: 2,
        name: "PS 110/35/10 'Katta Bog''",
        quvvat: "16 MVA",
        hl_soni: 1,
        tr_soni: 10,
      },
    ],
    liniya: [
      {
        id: 201,
        parentId: 101,
        name: "L-Do'stlik-1",
        uzunlik: "12.4 km",
        tr_soni: 2,
      },
      {
        id: 202,
        parentId: 101,
        name: "L-Navoiy-2",
        uzunlik: "5.8 km",
        tr_soni: 1,
      },
      {
        id: 203,
        parentId: 102,
        name: "L-G'alaba-10",
        uzunlik: "10.2 km",
        tr_soni: 1,
      },
    ],
    transformator: [
      {
        id: 301,
        parentId: 201,
        name: "TP-45",
        quvvat: "400 kVA",
        holat: "Ishchi",
      },
      {
        id: 302,
        parentId: 201,
        name: "TP-112",
        quvvat: "250 kVA",
        holat: "Ta'mirda",
      },
      {
        id: 303,
        parentId: 202,
        name: "TP-88",
        quvvat: "630 kVA",
        holat: "Ishchi",
      },
    ],
  };

  // Ma'lumotlarni filtrlash mantiqi
  const currentData =
    level === "ustachilik"
      ? database.ustachilik
      : database[level].filter((item) => item.parentId === activeParentId);

  const handleNextLevel = (id, nextLevel) => {
    setActiveParentId(id);
    setLevel(nextLevel);
  };

  const goBack = () => {
    if (level === "transformator") setLevel("liniya");
    else if (level === "liniya") setLevel("nimstansiya");
    else if (level === "nimstansiya") setLevel("ustachilik");
  };

  return (
    <div className="w-full bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Navigatsiya Paneli */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">
          {level} bo'yicha hisobot
        </h2>
        {level !== "ustachilik" && (
          <button
            onClick={goBack}
            className="text-blue-400 hover:bg-blue-500/10 px-3 py-1 rounded text-xs transition border border-blue-400/30"
          >
            ← Orqaga
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
              <th className="px-6 py-4">Nomi</th>
              <th className="px-6 py-4 text-center">Xususiyati</th>
              <th className="px-6 py-4 text-center">Hajm/Soni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {currentData.map((item) => (
              <tr
                key={item.id}
                onClick={() => {
                  if (level === "ustachilik")
                    handleNextLevel(item.id, "nimstansiya");
                  else if (level === "nimstansiya")
                    handleNextLevel(item.id, "liniya");
                  else if (level === "liniya")
                    handleNextLevel(item.id, "transformator");
                }}
                className={`transition cursor-pointer ${level === "transformator" ? "hover:bg-transparent cursor-default" : "hover:bg-slate-800/50"}`}
              >
                {/* Dinamik Ustunlar */}
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-100 text-sm">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">
                    {item.usta || item.quvvat || item.uzunlik || "Faol"}
                  </div>
                </td>

                <td className="px-6 py-5 text-center">
                  <span className="text-xs text-slate-400 italic">
                    {level === "ustachilik"
                      ? "Hududiy bo'lim"
                      : level === "nimstansiya"
                        ? "Energiya manbai"
                        : level === "liniya"
                          ? "Havo tarmog'i"
                          : "Iste'molchi"}
                  </span>
                </td>

                <td className="px-6 py-5 text-center">
                  <div className="inline-block bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-sm font-bold border border-blue-500/10">
                    {item.ns || item.hl_soni || item.tr_soni || item.holat}
                  </div>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-10 text-center text-slate-500 text-sm"
                >
                  Ma'lumot topilmadi...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DrillDownTable;
