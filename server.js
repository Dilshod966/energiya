import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import ExcelJS from 'exceljs';

// 1. __dirname ni aniqlab olamiz (ES Modullar uchun)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Yuklanadigan papka manzili
const uploadDir = path.join(__dirname, "public/uploads/");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 4. Storage sozlamalari
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/uploads/"));
  },
  filename: (req, file, cb) => {
    // tp_raqami orqali nom berish
    const tp = req.body.tp_raqami || "noma'lum";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `tp${tp}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Pool yaratish
const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sohiba_edu",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// 1. Ustachilik (Odatda buni 'hisob'i bo'lmaydi, lekin kerak bo'lsa qo'shish mumkin)
app.post("/api/ustachilik", async (req, res) => {
  try {
    const { name, usta } = req.body;
    await db.query("INSERT INTO ustachilik (name, usta) VALUES (?, ?)", [
      name,
      usta,
    ]);
    res.status(201).json({ message: "Ustachilik qo'shildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Nimstansiya (To'g'rilangan: hisob qo'shildi)
app.post("/api/nimstansiya", async (req, res) => {
  try {
    const { parentId, name, quvvat, turi, hisob } = req.body;
    await db.query(
      "INSERT INTO nimstansiya (parentId, name, quvvat, turi, hisob) VALUES (?, ?, ?, ?, ?)",
      [parentId, name, quvvat, turi, hisob],
    );
    res.status(201).json({ message: "Nimstansiya qo'shildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bolimlardan barcha statistikani hisoblash
function calcLiniyaStats(bolimArr) {
  let jami_uzunligi = 0, tet_uzunlik = 0, istemol_uzunlik = 0;
  let jami_izolyator = 0, jami_travers = 0;

  bolimArr.forEach((b) => {
    const km = (b.simlar || []).reduce((s, sim) => s + (parseFloat(sim.sim_uzunligi) || 0), 0);
    jami_uzunligi += km;
    if (b.hisob === "tet") tet_uzunlik += km;
    else istemol_uzunlik += km;
    jami_izolyator += (b.izolyatorlar || []).reduce((s, i) => s + (parseInt(i.soni) || 0), 0);
    jami_travers   += (b.traverslar   || []).reduce((s, t) => s + (parseInt(t.soni) || 0), 0);
  });

  const allTet     = bolimArr.length > 0 && bolimArr.every(b => b.hisob === "tet");
  const allIstemol = bolimArr.length > 0 && bolimArr.every(b => b.hisob === "istemol");
  const hisob = allTet ? "tet" : allIstemol ? "istemol" : "mixed";

  return {
    jami_uzunligi: parseFloat(jami_uzunligi.toFixed(2)),
    tet_uzunlik:   parseFloat(tet_uzunlik.toFixed(2)),
    istemol_uzunlik: parseFloat(istemol_uzunlik.toFixed(2)),
    jami_izolyator,
    jami_travers,
    hisob,
  };
}

app.post("/api/liniya", async (req, res) => {
  try {
    const { parentId, inventar_raqami, fider, kuchlanishi, ishga_tushirilgan_yili, bolimlar } = req.body;
    const bolimArr = Array.isArray(bolimlar) ? bolimlar : [];
    const name = `${fider || ""} ${kuchlanishi || ""}`.trim();
    const stats = calcLiniyaStats(bolimArr);

    await db.query(
      `INSERT INTO liniya (
        parentId, hisob, name, inventar_raqami, fider, kuchlanishi,
        ishga_tushirilgan_yili,
        jami_uzunligi, tet_uzunlik, istemol_uzunlik,
        jami_izolyator, jami_travers, bolimlar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parentId, stats.hisob, name, inventar_raqami, fider, kuchlanishi,
        ishga_tushirilgan_yili || null,
        stats.jami_uzunligi, stats.tet_uzunlik, stats.istemol_uzunlik,
        stats.jami_izolyator, stats.jami_travers,
        JSON.stringify(bolimArr),
      ]
    );

    res.status(201).json({ message: "Liniya muvaffaqiyatli qo'shildi" });
  } catch (err) {
    console.error("SQL XATO:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. Transformator (Barcha 23 ta ustun va ierarxiya uchun moslangan)
// 'images' - frontenddagi FormData name bilan bir xil bo'lishi kerak
app.post("/api/transformator", upload.array("images"), async (req, res) => {
  try {
    // 1. Rasmlar nomlarini yig'ish (database uchun string qilib)
    // Agar rasm yuklanmagan bo'lsa bo'sh string qoladi
    const imageFiles = req.files
      ? req.files.map((f) => f.filename).join(",")
      : "";

    // 2. req.body dan ma'lumotlarni olish
    const {
      parentId,
      tp_raqami,
      inventar_raqami,
      mahalla,
      kocha_nomi,
      quvvat,
      fider,
      kuchlanishi,
      tp_turi,
      ishga_tushgan_sana,
      zavod_raqami,
      ishlab_chiqarilgan_zavod,
      ishlab_chiqarilgan_yili,
      qurilish_tashkiloti,
      trans_ornatilishi,
      razedini,
      razryadniklar,
      predoxrabiteli10,
      predoxrabiteli4,
      proxodny,
      oporny,
      shina,
      rubilniklar,
      vyvody,
      fiderlar_soni,
      toka,
      tip,
      schotId,
      istemolchi_jami,
      axoli,
      ulgurji,
      mukammal_tp,
      mukammal_xl,
      mukammal_km,
      joriy_tp,
      joriy_xl,
      joriy_km,
      yuklama,
      lat,
      lng,
      hisob,
    } = req.body;

    // 3. Majburiy maydonlarni tekshirish
    if (!parentId || !tp_raqami || !lat || !lng) {
      return res.status(400).json({
        error: "Xatolik: Liniya, TP raqami va Koordinatalar bo'lishi shart!",
      });
    }

    // 4. SQL so'rovi (Endi 42 ta ustun: 41 tasi maydon + 1 tasi images)
    const sql = `
      INSERT INTO transformator (
        parentId, tp_raqami, inventar_raqami, mahalla, kocha_nomi,
        quvvat, fider, kuchlanishi, tp_turi, ishga_tushgan_sana,
        zavod_raqami, ishlab_chiqarilgan_zavod, ishlab_chiqarilgan_yili,
        qurilish_tashkiloti, trans_ornatilishi, razedini, razryadniklar,
        predoxrabiteli10, predoxrabiteli4, proxodny, oporny, shina,
        rubilniklar, vyvody, fiderlar_soni, toka, tip, schotId,
        istemolchi_jami, axoli, ulgurji, mukammal_tp, mukammal_xl,
        mukammal_km, joriy_tp, joriy_xl, joriy_km, yuklama, lat, lng, hisob,
        images
      ) VALUES (${new Array(42).fill("?").join(", ")})`;

    // 5. Qiymatlar massivi
    const values = [
      parentId,
      tp_raqami,
      inventar_raqami || null,
      mahalla || null,
      kocha_nomi || null,
      quvvat || null,
      fider || null,
      kuchlanishi || null,
      tp_turi || null,
      ishga_tushgan_sana || null,
      zavod_raqami || null,
      ishlab_chiqarilgan_zavod || null,
      ishlab_chiqarilgan_yili || null,
      qurilish_tashkiloti || null,
      trans_ornatilishi || null,
      razedini || null,
      razryadniklar || null,
      predoxrabiteli10 || null,
      predoxrabiteli4 || null,
      proxodny || null,
      oporny || null,
      shina || null,
      rubilniklar || null,
      vyvody || null,
      fiderlar_soni || 0,
      toka || null,
      tip || null,
      schotId || null,
      istemolchi_jami || 0,
      axoli || 0,
      ulgurji || 0,
      mukammal_tp || null,
      mukammal_xl || null,
      mukammal_km || null,
      joriy_tp || null,
      joriy_xl || null,
      joriy_km || null,
      yuklama || null,
      lat,
      lng,
      hisob || "tet",
      imageFiles, // Eng oxirgi 42-ustun
    ];

    const [result] = await db.query(sql, values);

    res.status(201).json({
      success: true,
      message: "Transformator va rasmlar muvaffaqiyatli saqlandi!",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({
      error: "Bazaga saqlashda server xatoligi: " + err.message,
    });
  }
});

// Barcha nimstansiyalarni olish (aggregated stats bilan)
app.get("/api/nimstansiya/all", async (req, res) => {
  try {
    const query = `
      SELECT
        n.id, n.parentId, n.name, n.quvvat,
        u.name AS parentName,

        ROUND(COALESCE((SELECT SUM(jami_uzunligi) FROM liniya WHERE parentId = n.id), 0), 2) AS jami_uzunlik,
        ROUND(COALESCE((SELECT SUM(tet_uzunlik) FROM liniya WHERE parentId = n.id), 0), 2) AS uzunlik_tet,
        ROUND(COALESCE((SELECT SUM(istemol_uzunlik) FROM liniya WHERE parentId = n.id), 0), 2) AS uzunlik_istemol,

        COALESCE((SELECT COUNT(*) FROM transformator WHERE parentId IN (SELECT id FROM liniya WHERE parentId = n.id)), 0) AS trans_jami,
        COALESCE((SELECT COUNT(*) FROM transformator WHERE hisob = 'tet' AND parentId IN (SELECT id FROM liniya WHERE parentId = n.id)), 0) AS trans_tet,
        COALESCE((SELECT COUNT(*) FROM transformator WHERE hisob = 'istemol' AND parentId IN (SELECT id FROM liniya WHERE parentId = n.id)), 0) AS trans_istemol

      FROM nimstansiya n
      LEFT JOIN ustachilik u ON n.parentId = u.id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("NIMSTANSIYA ALL XATO:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// LINIYALAR UCHUN (transformer stats bilan)
app.get("/api/liniya/all", async (req, res) => {
  try {
    const query = `
      SELECT
        l.*,
        n.name AS parentName,
        COUNT(t.id) AS jami_trafo,
        SUM(CASE WHEN t.hisob = 'tet' THEN 1 ELSE 0 END) AS tet_trafo,
        SUM(CASE WHEN t.hisob = 'istemol' THEN 1 ELSE 0 END) AS istemol_trafo
      FROM liniya l
      LEFT JOIN nimstansiya n ON l.parentId = n.id
      LEFT JOIN transformator t ON l.id = t.parentId
      GROUP BY l.id
    `;
    const [rows] = await db.query(query);
    const parsed = rows.map(r => ({
      ...r,
      bolimlar: r.bolimlar ? JSON.parse(r.bolimlar) : [],
    }));
    res.json(parsed);
  } catch (err) {
    console.error("LINIYA ALL XATO:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// TRANSFORMATORLAR UCHUN (Liniya nomini qo'shib olish)
app.get("/api/transformator/all", async (req, res) => {
  const query = `
    SELECT t.*, l.name AS parentName 
    FROM transformator t
    LEFT JOIN liniya l ON t.parentId = l.id
  `;
  const [rows] = await db.query(query);
  res.json(rows);
});

// API Endpoints
// 1. Ustachilik bo'limlari
// app.get("/api/ustachilik", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM ustachilik");
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get("/api/ustachilik", async (req, res) => {
  try {
    const query = `
    SELECT 
        u.*, 
        COUNT(DISTINCT n.id) as n_jami,
        COUNT(DISTINCT CASE WHEN n.hisob = 'tet' THEN n.id END) as n_tet,
        COUNT(DISTINCT CASE WHEN n.hisob = 'istemol' THEN n.id END) as n_istemol,
        
        ROUND(COALESCE(SUM(DISTINCT l.jami_uzunligi), 0), 1) as l_jami,
        ROUND(COALESCE(SUM(DISTINCT l.tet_uzunlik), 0), 1) as l_tet,
        ROUND(COALESCE(SUM(DISTINCT l.istemol_uzunlik), 0), 1) as l_istemol,
        
        COUNT(DISTINCT t.id) as t_jami,
        COUNT(DISTINCT CASE WHEN t.hisob = 'tet' THEN t.id END) as t_tet,
        COUNT(DISTINCT CASE WHEN t.hisob = 'istemol' THEN t.id END) as t_istemol
        
    FROM ustachilik u
    LEFT JOIN nimstansiya n ON u.id = n.parentId
    LEFT JOIN liniya l ON n.id = l.parentId
    LEFT JOIN transformator t ON l.id = t.parentId
    GROUP BY u.id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("USTACHILIK XATO:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// // 2. Nimstansiyalar (ParentId bo'yicha)
// app.get("/api/nimstansiya/:uId", async (req, res) => {
//   try {
//     const { uId } = req.params;
//     // Bazangizda 'parentId' ustuni bor deb hisoblaymiz
//     const [rows] = await db.query(
//       "SELECT * FROM nimstansiya WHERE parentId = ?",
//       [uId],
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get("/api/nimstansiya/:uId", async (req, res) => {
  try {
    const { uId } = req.params;

    const query = `
      SELECT 
        n.*,

        (SELECT COUNT(*) FROM liniya WHERE parentId = n.id) AS liniya_jami,

        (SELECT ROUND(SUM(jami_uzunligi), 2)
         FROM liniya WHERE parentId = n.id) AS jami_uzunlik,

        (SELECT ROUND(SUM(tet_uzunlik), 2)
         FROM liniya WHERE parentId = n.id) AS uzunlik_tet,

        (SELECT ROUND(SUM(istemol_uzunlik), 2)
         FROM liniya WHERE parentId = n.id) AS uzunlik_istemol,

        (SELECT COUNT(*) FROM transformator 
         WHERE parentId IN (SELECT id FROM liniya WHERE parentId = n.id)) AS trans_jami,
        
        (SELECT COUNT(*) FROM transformator 
         WHERE hisob = 'tet' AND parentId IN (SELECT id FROM liniya WHERE parentId = n.id)) AS trans_tet,
         
        (SELECT COUNT(*) FROM transformator 
         WHERE hisob = 'istemol' AND parentId IN (SELECT id FROM liniya WHERE parentId = n.id)) AS trans_istemol

      FROM nimstansiya n
      WHERE n.parentId = ?
    `;

    const [rows] = await db.query(query, [uId]);
    res.json(rows);
  } catch (err) {
    console.error("SQL Xatolik:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/liniya/:nId", async (req, res) => {
  try {
    const { nId } = req.params;
    const query = `
      SELECT
        l.*,
        COUNT(t.id) as jami_trafo,
        SUM(CASE WHEN t.hisob = 'tet' THEN 1 ELSE 0 END) as tet_trafo,
        SUM(CASE WHEN t.hisob = 'istemol' THEN 1 ELSE 0 END) as istemol_trafo
      FROM liniya l
      LEFT JOIN transformator t ON l.id = t.parentId
      WHERE l.parentId = ?
      GROUP BY l.id
    `;
    const [rows] = await db.query(query, [nId]);
    const parsed = rows.map(r => ({
      ...r,
      bolimlar: r.bolimlar ? JSON.parse(r.bolimlar) : [],
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Transformatorlar (ParentId bo'yicha)
app.get("/api/transformator/:lId", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transformator WHERE parentId = ?",
      [req.params.lId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- O'CHIRISH ENDPOINTLARI ---

// 1. Ustachilikni o'chirish
app.delete("/api/ustachilik/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM ustachilik WHERE id = ?", [id]);
    res.json({ message: "Ustachilik muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Nimstansiyani o'chirish
app.delete("/api/nimstansiya/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM nimstansiya WHERE id = ?", [id]);
    res.json({ message: "Nimstansiya muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Liniyani o'chirish
app.delete("/api/liniya/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM liniya WHERE id = ?", [id]);
    res.json({ message: "Liniya muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Transformatorni o'chirish
app.delete("/api/transformator/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM transformator WHERE id = ?", [id]);
    res.json({ message: "Transformator muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT so'roviga ham upload.array qo'shish shart!
app.put("/api/transformator/:id", upload.array("images"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // 1. Bazadagi joriy (eski) rasmlarni olish
    const [oldRows] = await db.query(
      "SELECT images FROM transformator WHERE id = ?",
      [id],
    );
    const dbImagesString = oldRows[0]?.images || "";
    const dbImagesArray = dbImagesString
      .split(",")
      .filter((img) => img.trim() !== "");

    // 2. Frontenddan kelgan (saqlab qolingan) rasmlar
    const keptImages = data.existing_images
      ? data.existing_images.split(",").filter((img) => img.trim() !== "")
      : [];

    // 3. Jismoniy o'chirish: Bazada bor, lekin keptImages ichida yo'q bo'lsa - o'chiramiz
    const imagesToDelete = dbImagesArray.filter(
      (img) => !keptImages.includes(img),
    );

    imagesToDelete.forEach((imgName) => {
      const filePath = path.join(__dirname, "public/uploads", imgName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Fayl o'chirildi: ${imgName}`);
      }
    });

    // 4. Yangi yuklangan fayllar nomini olamiz
    const newFiles = req.files ? req.files.map((f) => f.filename) : [];

    // 5. Yakuniy rasm stringini yasaymiz
    const finalImages = [...keptImages, ...newFiles].join(",");

    // 6. SQL Update
    const sql = `
      UPDATE transformator SET 
        parentId=?, tp_raqami=?, inventar_raqami=?, mahalla=?, kocha_nomi=?, 
        quvvat=?, fider=?, kuchlanishi=?, tp_turi=?, ishga_tushgan_sana=?, 
        zavod_raqami=?, ishlab_chiqarilgan_zavod=?, ishlab_chiqarilgan_yili=?, 
        qurilish_tashkiloti=?, trans_ornatilishi=?, razedini=?, razryadniklar=?, 
        predoxrabiteli10=?, predoxrabiteli4=?, proxodny=?, oporny=?, shina=?, 
        rubilniklar=?, vyvody=?, fiderlar_soni=?, toka=?, tip=?, schotId=?, 
        istemolchi_jami=?, axoli=?, ulgurji=?, mukammal_tp=?, mukammal_xl=?, 
        mukammal_km=?, joriy_tp=?, joriy_xl=?, joriy_km=?, yuklama=?, lat=?, lng=?, hisob=?,
        images=? 
      WHERE id = ?`;

    const values = [
      data.parentId,
      data.tp_raqami,
      data.inventar_raqami || null,
      data.mahalla || null,
      data.kocha_nomi || null,
      data.quvvat || null,
      data.fider || null,
      data.kuchlanishi || null,
      data.tp_turi || null,
      data.ishga_tushgan_sana || null,
      data.zavod_raqami || null,
      data.ishlab_chiqarilgan_zavod || null,
      data.ishlab_chiqarilgan_yili || null,
      data.qurilish_tashkiloti || null,
      data.trans_ornatilishi || null,
      data.razedini || null,
      data.razryadniklar || null,
      data.predoxrabiteli10 || null,
      data.predoxrabiteli4 || null,
      data.proxodny || null,
      data.oporny || null,
      data.shina || null,
      data.rubilniklar || null,
      data.vyvody || null,
      data.fiderlar_soni || 0,
      data.toka || null,
      data.tip || null,
      data.schotId || null,
      data.istemolchi_jami || 0,
      data.axoli || 0,
      data.ulgurji || 0,
      data.mukammal_tp || null,
      data.mukammal_xl || null,
      data.mukammal_km || null,
      data.joriy_tp || null,
      data.joriy_xl || null,
      data.joriy_km || null,
      data.yuklama || null,
      data.lat,
      data.lng,
      data.hisob,
      finalImages,
      id,
    ];

    await db.query(sql, values);
    res.json({
      success: true,
      message: "Yangilandi va ortiqcha rasmlar o'chirildi!",
    });
  } catch (err) {
    console.error("Update xatoligi:", err);
    res.status(500).json({ error: err.message });
  }
});

// Ustachilikni tahrirlash
app.put("/api/ustachilik/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, usta } = req.body;
    const sql = "UPDATE ustachilik SET name = ?, usta = ? WHERE id = ?";
    await db.query(sql, [name, usta, id]);
    res.json({ success: true, message: "Ustachilik yangilandi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nimstansiyani tahrirlash
app.put("/api/nimstansiya/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, quvvat, turi, hisob } = req.body;
    // DIQQAT: parentId bazada ustachilik_id bo'lishi mumkin
    const sql =
      "UPDATE nimstansiya SET name=?, parentId=?, quvvat=?, turi=?, hisob=? WHERE id=?";
    await db.query(sql, [name, parentId, quvvat, turi, hisob, id]);
    res.json({ success: true, message: "Nimstansiya yangilandi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Liniyani tahrirlash
app.put("/api/liniya/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { parentId, inventar_raqami, fider, kuchlanishi, ishga_tushirilgan_yili, bolimlar } = req.body;
    const bolimArr = Array.isArray(bolimlar) ? bolimlar : [];
    const name = `${fider || ""} ${kuchlanishi || ""}`.trim();
    const stats = calcLiniyaStats(bolimArr);

    await db.query(
      `UPDATE liniya SET
        parentId=?, hisob=?, name=?, inventar_raqami=?, fider=?, kuchlanishi=?,
        ishga_tushirilgan_yili=?,
        jami_uzunligi=?, tet_uzunlik=?, istemol_uzunlik=?,
        jami_izolyator=?, jami_travers=?, bolimlar=?
       WHERE id=?`,
      [
        parentId, stats.hisob, name, inventar_raqami, fider, kuchlanishi,
        ishga_tushirilgan_yili || null,
        stats.jami_uzunligi, stats.tet_uzunlik, stats.istemol_uzunlik,
        stats.jami_izolyator, stats.jami_travers,
        JSON.stringify(bolimArr),
        id,
      ]
    );
    res.json({ success: true, message: "Liniya yangilandi" });
  } catch (err) {
    console.error("Liniya update xato:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// ============================================================
// QILINGAN ISHLAR API
// ============================================================

// GET - Ob'ektga tegishli ishlarni olish (?tur=liniya&ob_id=5)
app.get("/api/ish/filter", async (req, res) => {
  try {
    const { tur, ob_id } = req.query;
    if (!tur || !ob_id) return res.status(400).json({ error: "tur va ob_id kerak" });
    const [rows] = await db.query(
      "SELECT * FROM ish WHERE tur = ? AND ob_id = ? ORDER BY id DESC",
      [tur, Number(ob_id)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Barcha ishlarni yangi → eski tartibda olish
app.get("/api/ish", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ish ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Yangi ish qo'shish
app.post("/api/ish", async (req, res) => {
  try {
    const { tur, ob_id, ob_nomi, ism, familiya, ish_kun, ish_soat, ish_matni } = req.body;
    if (!tur || !ob_id || !ism || !familiya || !ish_kun || !ish_soat || !ish_matni) {
      return res.status(400).json({ error: "Barcha maydonlar to'ldirilishi shart" });
    }
    const [result] = await db.query(
      "INSERT INTO ish (tur, ob_id, ob_nomi, ism, familiya, ish_kun, ish_soat, ish_matni) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [tur, ob_id, ob_nomi, ism, familiya, ish_kun, ish_soat, ish_matni]
    );
    res.status(201).json({ message: "Ish qo'shildi", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Ishni tahrirlash
app.put("/api/ish/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tur, ob_id, ob_nomi, ism, familiya, ish_kun, ish_soat, ish_matni } = req.body;
    await db.query(
      "UPDATE ish SET tur=?, ob_id=?, ob_nomi=?, ism=?, familiya=?, ish_kun=?, ish_soat=?, ish_matni=? WHERE id=?",
      [tur, ob_id, ob_nomi, ism, familiya, ish_kun, ish_soat, ish_matni, id]
    );
    res.json({ success: true, message: "Ish yangilandi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Ishni o'chirish
app.delete("/api/ish/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM ish WHERE id = ?", [id]);
    res.json({ message: "Ish muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// TRANSFORMATOR EXCEL EKSPORT
// ============================================================
app.get('/api/export/transformator/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Transformator ma'lumotlarini olish
    const [tRows] = await db.query('SELECT * FROM transformator WHERE id = ?', [id]);
    if (!tRows.length) return res.status(404).json({ error: 'Transformator topilmadi' });
    const t = tRows[0];

    // 2. Qilingan ishlarni olish (eskidan yangiga tartiblangan)
    const [ishlar] = await db.query(
      "SELECT * FROM ish WHERE tur = 'transformator' AND ob_id = ? ORDER BY id ASC",
      [id]
    );

    // 3. Shablonni yuklash
    const templatePath = path.join(__dirname, 'public', 'template_tp.xlsx');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);

    // 4. '10942' varaqini olish
    const ws = wb.getWorksheet('10942');
    if (!ws) return res.status(500).json({ error: "Shablon varaqi '10942' topilmadi" });

    // Qiymat o'rnatish uchun yordamchi funksiya (formatni saqlab)
    const setVal = (addr, value) => {
      ws.getCell(addr).value = value;
    };

    // 5. Asosiy maydonlarni to'ldirish
    // A2: bo'sh
    ws.getCell('A2').value = null;

    // B2: tp_raqami/quvvat (merged B2:K2, faqat B2 ga)
    const b2Parts = [t.tp_raqami, t.quvvat].filter(Boolean);
    setVal('B2', b2Parts.length ? b2Parts.join('/') + ' kVA' : '');

    // C4: fider
    setVal('C4', t.fider || '');

    // C5: mahalla + kocha_nomi (merged C5:K5, faqat C5 ga)
    setVal('C5', [t.mahalla, t.kocha_nomi].filter(Boolean).join(' '));

    // C6: tp_turi
    setVal('C6', t.tp_turi || '');

    // E6: zavod_raqami
    setVal('E6', t.zavod_raqami || '');

    // I6: ishga_tushgan_sana (sana sifatida)
    if (t.ishga_tushgan_sana) {
      const d = new Date(t.ishga_tushgan_sana);
      setVal('I6', isNaN(d.getTime()) ? t.ishga_tushgan_sana : d);
    } else {
      setVal('I6', '');
    }

    // D7: ishlab_chiqarilgan_zavod
    setVal('D7', t.ishlab_chiqarilgan_zavod || '');

    // I7: ishlab_chiqarilgan_yili
    setVal('I7', t.ishlab_chiqarilgan_yili || '');

    // B8: qurilish_tashkiloti — shablon satrining oxiriga tashkilot nomini qo'yish
    if (t.qurilish_tashkiloti) {
      setVal('B8', `Stroit. Montaj. Organizatsiya  ________${t.qurilish_tashkiloti}_________________________________________________________________`);
    }

    // B9: trans_ornatilishi (merged B9:K9, faqat B9 ga)
    setVal('B9', t.trans_ornatilishi || '');

    // 14-qator — yuqori kuchlanish sektsiyasi
    setVal('B14', t.razedini || '');
    setVal('C14', t.razryadniklar || '');

    // D14: predoxrabiteli10/predoxrabiteli4
    const predParts = [t.predoxrabiteli10, t.predoxrabiteli4].filter(Boolean);
    setVal('D14', predParts.length ? predParts.join('/') : '');

    setVal('E14', t.proxodny || '');
    setVal('F14', t.oporny || '');
    setVal('G14', t.shina || '');
    setVal('H14', t.toka || '');
    setVal('I14', t.kuchlanishi || '');

    // 19-qator — past kuchlanish sektsiyasi
    setVal('B19', t.rubilniklar || '');
    setVal('E19', t.schotId || '');

    // J19: vyvody (merged J19:K19, faqat J19 ga)
    setVal('J19', t.vyvody || '');

    // 6. 30-qatordan boshlab barcha merge va qatorlarni tozalash
    //    ws._merges — ichki object, key = top-left hujayra manzili ('C30' kabi)
    const mergesObj = ws._merges || {};
    for (const key of Object.keys(mergesObj)) {
      const rowNum = parseInt(key.replace(/[A-Za-z]/g, ''));
      if (!isNaN(rowNum) && rowNum >= 30) {
        delete mergesObj[key];
      }
    }
    // Qatorlarni o'chirish (oxiridan boshlab — indeks siljishini oldini olish)
    const lastRow = ws.rowCount;
    for (let r = lastRow; r >= 30; r--) {
      ws.spliceRows(r, 1);
    }

    // 7. Faqat ish soni qadar yangi qatorlar qo'shish (har biri borderli)
    const thin = { style: 'thin' };
    const bord = { top: thin, left: thin, bottom: thin, right: thin };
    const fnt  = { name: 'Times New Roman', size: 11 };
    const alignCC  = { horizontal: 'center', vertical: 'middle', wrapText: true };

    ishlar.forEach((ish, idx) => {
      const r = 30 + idx;
      ws.getRow(r).height = 40.5;

      // B: sana
      const cB = ws.getCell(`B${r}`);
      if (ish.ish_kun) {
        const d = new Date(ish.ish_kun);
        cB.value = isNaN(d.getTime()) ? String(ish.ish_kun) : d;
      } else {
        cB.value = '';
      }
      cB.numFmt = 'DD.MM.YYYY';
      cB.border = bord;
      cB.font = fnt;
      cB.alignment = alignCC;

      // C:I — ish matni (merge)
      ws.mergeCells(`C${r}:I${r}`);
      const cC = ws.getCell(`C${r}`);
      cC.value = ish.ish_matni || '';
      cC.border = bord;
      cC.font = fnt;
      cC.alignment = alignCC;
      ['D','E','F','G','H','I'].forEach(col => {
        ws.getCell(`${col}${r}`).border = bord;
      });

      // J:K — ism familiya (merge)
      ws.mergeCells(`J${r}:K${r}`);
      const cJ = ws.getCell(`J${r}`);
      cJ.value = `${ish.ism || ''} ${ish.familiya || ''}`.trim();
      cJ.border = bord;
      cJ.font = fnt;
      cJ.alignment = alignCC;
      ws.getCell(`K${r}`).border = bord;
    });

    // 8. Faqat '10942' varaqini qoldirish va nomini o'zgartirish
    const sheetsToRemove = wb.worksheets.filter(s => s.name !== '10942');
    sheetsToRemove.forEach(s => wb.removeWorksheet(s.id));
    ws.name = 'Pasport';

    // 9. Javob sarlavhalarini o'rnatish
    const fileName = `TP_${t.tp_raqami || id}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    // 10. Streamga yozish
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Export xatoligi:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Export xatoligi: ' + err.message });
    }
  }
});

// Yangi ustunlarni avtomatik qo'shish
db.query(`ALTER TABLE liniya ADD COLUMN IF NOT EXISTS bolimlar LONGTEXT DEFAULT NULL`).catch(() => {});
db.query(`ALTER TABLE liniya ADD COLUMN IF NOT EXISTS tet_uzunlik DECIMAL(10,2) DEFAULT 0`).catch(() => {});
db.query(`ALTER TABLE liniya ADD COLUMN IF NOT EXISTS istemol_uzunlik DECIMAL(10,2) DEFAULT 0`).catch(() => {});

app.listen(5000, () =>
  console.log("Server 5000-portda MySQL bilan ishga tushdi"),
);
