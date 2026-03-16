import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Pool yaratish
const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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

// 3. Liniya (To'g'rilangan: hisob qo'shildi)
app.post("/api/liniya", async (req, res) => {
  try {
    const { parentId, name, uzunlik, turi, hisob } = req.body;
    await db.query(
      "INSERT INTO liniya (parentId, name, uzunlik, turi, hisob) VALUES (?, ?, ?, ?, ?)",
      [parentId, name, uzunlik, turi, hisob],
    );
    res.status(201).json({ message: "Liniya qo'shildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Transformator (Barcha 23 ta ustun va ierarxiya uchun moslangan)
app.post("/api/transformator", async (req, res) => {
  try {
    // Frontenddan kelayotgan barcha 20 ta maydonni destrukturizatsiya qilamiz
    const {
      parentId,               // Tanlangan Liniya ID-si
      tp_raqami,
      inventar_raqami,
      hisob,                  // 'tet' yoki 'istemol'
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
      razryadniklar,
      izolyatorlar,
      rubilniklar,
      fiderlar_soni,
      lat,
      lng
    } = req.body;

    // 1. Majburiy maydonlarni tekshirish
    // parentId (Liniya) tanlanishi shart, aks holda ierarxiya buziladi
    if (!parentId || !tp_raqami || !lat || !lng) {
      return res.status(400).json({
        error: "Xatolik: Liniya, TP raqami va Koordinatalar yuborilmadi!"
      });
    }

    // 2. SQL so'rovi (Jadvalingizdagi ustunlar nomiga mos)
    const sql = `
      INSERT INTO transformator (
        parentId, tp_raqami, inventar_raqami, hisob, mahalla, 
        kocha_nomi, quvvat, fider, kuchlanishi, tp_turi, 
        ishga_tushgan_sana, zavod_raqami, ishlab_chiqarilgan_zavod, 
        ishlab_chiqarilgan_yili, razryadniklar, izolyatorlar, 
        rubilniklar, fiderlar_soni, lat, lng
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // 3. Qiymatlarni tartib bilan joylashtirish
    // Agar ixtiyoriy maydonlar bo'sh kelsa, bazaga NULL yoki default qiymat tushishi uchun || null ishlatamiz
    const values = [
      parentId,
      tp_raqami,
      inventar_raqami || null,
      hisob || 'tet',
      mahalla || null,
      kocha_nomi || null,
      quvvat || null,
      fider || null,
      kuchlanishi || '10/0.4 kV',
      tp_turi || 'KTPM',
      ishga_tushgan_sana || null,
      zavod_raqami || null,
      ishlab_chiqarilgan_zavod || null,
      ishlab_chiqarilgan_yili || null,
      razryadniklar || null,
      izolyatorlar || null,
      rubilniklar || null,
      fiderlar_soni || 2,
      lat,
      lng
    ];

    const [result] = await db.query(sql, values);

    // Muvaffaqiyatli javob
    res.status(201).json({
      success: true,
      message: "Transformator muvaffaqiyatli saqlandi!",
      id: result.insertId
    });

  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({
      error: "Bazaga saqlashda server xatoligi yuz berdi: " + err.message
    });
  }
});

// Barcha nimstansiyalarni olish (quvvat bilan birga)
app.get("/api/nimstansiya/all", async (req, res) => {
  // quvvat ustunini ham qo'shdik
  const [rows] = await db.query("SELECT id, name, quvvat FROM nimstansiya");
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
        -- Nimstansiyalar (Soni) - DISTINCT id orqali faqat noyoblarini sanaymiz
        COUNT(DISTINCT n.id) as n_jami,
        COUNT(DISTINCT CASE WHEN n.hisob = 'tet' THEN n.id END) as n_tet,
        COUNT(DISTINCT CASE WHEN n.hisob = 'istemol' THEN n.id END) as n_istemol,
        
        -- Liniyalar (Uzunligi km) - SUM ishlatganda takrorlanishni oldini olish
        ROUND(SUM(DISTINCT CASE WHEN l.id IS NOT NULL THEN CAST(l.uzunlik AS DECIMAL(10,2)) ELSE 0 END), 1) as l_jami,
        ROUND(SUM(DISTINCT CASE WHEN l.hisob = 'tet' THEN CAST(l.uzunlik AS DECIMAL(10,2)) ELSE 0 END), 1) as l_tet,
        ROUND(SUM(DISTINCT CASE WHEN l.hisob = 'istemol' THEN CAST(l.uzunlik AS DECIMAL(10,2)) ELSE 0 END), 1) as l_istemol,
        
        -- Transformatorlar (Soni)
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

        -- LINIYALAR SONI (O'zgarishsiz qoladi)
        (SELECT COUNT(*) FROM liniya WHERE parentId = n.id) AS liniya_jami,

        -- LINIYALAR UZUNLIGI (HISOBLAR BO'YICHA)
        -- 1. Jami uzunlik
        (SELECT ROUND(SUM(CAST(uzunlik AS DECIMAL(10,2))), 2) 
         FROM liniya WHERE parentId = n.id) AS jami_uzunlik,

        -- 2. TET hisobidagi liniyalar uzunligi
        (SELECT ROUND(SUM(CAST(uzunlik AS DECIMAL(10,2))), 2) 
         FROM liniya WHERE parentId = n.id AND hisob = 'tet') AS uzunlik_tet,

        -- 3. Iste'molchi hisobidagi liniyalar uzunligi
        (SELECT ROUND(SUM(CAST(uzunlik AS DECIMAL(10,2))), 2) 
         FROM liniya WHERE parentId = n.id AND hisob = 'istemol') AS uzunlik_istemol,

        -- TRANSFORMATORLAR STATISTIKASI (Liniyalar orqali)
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
    console.error("SQL Xatolik:", err);
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

app.listen(5000, () =>
  console.log("Server 5000-portda MySQL bilan ishga tushdi"),
);
