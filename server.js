import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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

app.post("/api/liniya", async (req, res) => {
  try {
    const {
      parentId,
      hisob,
      inventar_raqami,
      fider,
      kuchlanishi,
      jami_uzunligi,
      jami_izolyator,
      jami_travers,
      simlar,
      izolyatorlar,
      traverslar,
      tb_oddiy,
      tb_bir_tirgakli,
      tb_ikki_tirgakli,
      yg_oddiy,
      yg_bir_tirgakli,
      yg_ikki_tirgakli,
    } = req.body;

    const toInt = (val) => {
      const parsed = parseInt(val);
      return isNaN(parsed) ? null : parsed;
    };

    // name = fider + kuchlanishi
    const name = `${fider || ""} ${kuchlanishi || ""}`.trim();

    const values = [
      parentId,
      hisob,
      name,                              // "Янги Ўзбекистон 10/0,4 кВ"
      inventar_raqami,
      fider,
      kuchlanishi,
      parseFloat(jami_uzunligi) || 0,
      jami_izolyator || 0,
      jami_travers || 0,
      JSON.stringify(simlar),
      JSON.stringify(izolyatorlar),
      JSON.stringify(traverslar),
      toInt(tb_oddiy),
      toInt(tb_bir_tirgakli),
      toInt(tb_ikki_tirgakli),
      toInt(yg_oddiy),
      toInt(yg_bir_tirgakli),
      toInt(yg_ikki_tirgakli),
    ];

    await db.query(
      `INSERT INTO liniya (
        parentId, hisob, name, inventar_raqami, fider, kuchlanishi,
        jami_uzunligi, jami_izolyator, jami_travers,
        simlar, izolyatorlar, traverslar,
        tb_oddiy, tb_bir_tirgakli, tb_ikki_tirgakli,
        yg_oddiy, yg_bir_tirgakli, yg_ikki_tirgakli
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    res.status(201).json({ message: "Liniya muvaffaqiyatli qo'shildi" });
  } catch (err) {
    console.error("SQL XATO:", err.message);
    console.error("SQL:", err.sql);
    res.status(500).json({
      error: err.message,
      sql: err.sql,
    });
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

// Barcha nimstansiyalarni olish (quvvat bilan birga)
app.get("/api/nimstansiya/all", async (req, res) => {
  // quvvat ustunini ham qo'shdik
  const [rows] = await db.query(
    "SELECT id, parentId, name, quvvat FROM nimstansiya",
  );
  res.json(rows);
});

// LINIYALAR UCHUN (Nimstansiya nomini qo'shib olish)
app.get("/api/liniya/all", async (req, res) => {
  const query = `
    SELECT l.*, n.name AS parentName 
    FROM liniya l
    LEFT JOIN nimstansiya n ON l.parentId = n.id
  `;
  const [rows] = await db.query(query);
  res.json(rows);
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
        
        ROUND(SUM(DISTINCT CASE WHEN l.id IS NOT NULL THEN CAST(l.jami_uzunligi AS DECIMAL(10,2)) ELSE 0 END), 1) as l_jami,
        ROUND(SUM(DISTINCT CASE WHEN l.hisob = 'tet' THEN CAST(l.jami_uzunligi AS DECIMAL(10,2)) ELSE 0 END), 1) as l_tet,
        ROUND(SUM(DISTINCT CASE WHEN l.hisob = 'istemol' THEN CAST(l.jami_uzunligi AS DECIMAL(10,2)) ELSE 0 END), 1) as l_istemol,
        
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

        (SELECT ROUND(SUM(jami_uzunligi), 2) 
         FROM liniya WHERE parentId = n.id AND hisob = 'tet') AS uzunlik_tet,

        (SELECT ROUND(SUM(jami_uzunligi), 2) 
         FROM liniya WHERE parentId = n.id AND hisob = 'istemol') AS uzunlik_istemol,

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
    res.json(rows);
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
    const { name, parentId, uzunlik, turi, hisob } = req.body;
    const sql =
      "UPDATE liniya SET name=?, parentId=?, uzunlik=?, turi=?, hisob=? WHERE id=?";
    await db.query(sql, [name, parentId, uzunlik, turi, hisob, id]);
    res.json({ success: true, message: "Liniya yangilandi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(5000, () =>
  console.log("Server 5000-portda MySQL bilan ishga tushdi"),
);
