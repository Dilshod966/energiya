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

// 4. Transformator (To'g'rilangan: hisob qo'shildi)
app.post("/api/transformator", async (req, res) => {
  try {
    const { parentId, name, quvvat, holat, turi, hisob } = req.body;
    await db.query(
      "INSERT INTO transformator (parentId, name, quvvat, holat, turi, hisob) VALUES (?, ?, ?, ?, ?, ?)",
      [parentId, name, quvvat, holat, turi, hisob],
    );
    res.status(201).json({ message: "Transformator qo'shildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Barcha nimstansiyalarni olish (select uchun)
app.get("/api/nimstansiya/all", async (req, res) => {
  const [rows] = await db.query("SELECT id, name FROM nimstansiya");
  res.json(rows);
});

// Barcha liniyalarni olish (select uchun)
app.get("/api/liniya/all", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM liniya");
  res.json(rows);
});

// Barcha transformatorlarni olish
app.get("/api/transformator/all", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM transformator");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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


app.get('/api/ustachilik', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.*, 
                COUNT(n.id) as jami,
                SUM(CASE WHEN n.hisob = 'tet' THEN 1 ELSE 0 END) as tet,
                SUM(CASE WHEN n.hisob = 'istemol' THEN 1 ELSE 0 END) as istemol
            FROM ustachilik u
            LEFT JOIN nimstansiya n ON u.id = n.parentId
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
        -- Jami uzunlikni hisoblash
        ROUND(SUM(CAST(l.uzunlik AS DECIMAL(10,2))), 2) as jami_uzunlik,
        -- TET liniyalar uzunligi
        ROUND(SUM(CASE WHEN l.hisob = 'tet' THEN CAST(l.uzunlik AS DECIMAL(10,2)) ELSE 0 END), 2) as tet_uzunlik,
        -- Iste'molchi liniyalar uzunligi
        ROUND(SUM(CASE WHEN l.hisob = 'istemol' THEN CAST(l.uzunlik AS DECIMAL(10,2)) ELSE 0 END), 2) as istemol_uzunlik
      FROM nimstansiya n
      LEFT JOIN liniya l ON n.id = l.parentId
      WHERE n.parentId = ?
      GROUP BY n.id
    `;
    const [rows] = await db.query(query, [uId]);
    res.json(rows);
  } catch (err) {
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
