import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// MySQL ulanish sozlamalari
const db = await mysql.createPool({
    host: 'localhost',
    user: 'root', // O'zingizni useringiz
    password: '', // O'zingizni parolingiz
    database: 'test'
});


// 1. Ustachilik
app.post('/api/ustachilik', (req, res) => {
  const { name, usta } = req.body;
  db.query("INSERT INTO ustachilik (name, usta) VALUES (?, ?)", [name, usta], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).send("Ustachilik qo'shildi");
  });
});

// 2. Nimstansiya
app.post('/api/nimstansiya', (req, res) => {
  const { parentId, name, quvvat } = req.body;
  db.query("INSERT INTO nimstansiya (parentId, name, quvvat) VALUES (?, ?, ?)", [parentId, name, quvvat], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).send("Nimstansiya qo'shildi");
  });
});

// 3. Liniya
app.post('/api/liniya', (req, res) => {
  const { parentId, name, uzunlik } = req.body;
  db.query("INSERT INTO liniya (parentId, name, uzunlik) VALUES (?, ?, ?)", [parentId, name, uzunlik], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).send("Liniya qo'shildi");
  });
});

// 4. Transformator
app.post('/api/transformator', (req, res) => {
  const { parentId, name, quvvat, holat } = req.body;
  db.query("INSERT INTO transformator (parentId, name, quvvat, holat) VALUES (?, ?, ?, ?)", [parentId, name, quvvat, holat], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).send("Transformator qo'shildi");
  });
});




// Barcha nimstansiyalarni olish (select uchun)
app.get('/api/nimstansiya/all', async (req, res) => {
    const [rows] = await db.query('SELECT id, name FROM nimstansiya');
    res.json(rows);
});

// Barcha liniyalarni olish (select uchun)
app.get('/api/liniya/all', async (req, res) => {
    const [rows] = await db.query('SELECT id, name FROM liniya');
    res.json(rows);
});


// API Endpoints
// 1. Ustachilik bo'limlari
app.get('/api/ustachilik', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM ustachilik');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Nimstansiyalar (ParentId bo'yicha)
app.get('/api/nimstansiya/:uId', async (req, res) => {
    try {
        const { uId } = req.params;
        // Bazangizda 'parentId' ustuni bor deb hisoblaymiz
        const [rows] = await db.query('SELECT * FROM nimstansiya WHERE parentId = ?', [uId]);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 3. Liniyalar (ParentId bo'yicha)
app.get('/api/liniya/:nId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM liniya WHERE parentId = ?', [req.params.nId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Transformatorlar (ParentId bo'yicha)
app.get('/api/transformator/:lId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM transformator WHERE parentId = ?', [req.params.lId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(5000, () => console.log('Server 5000-portda MySQL bilan ishga tushdi'));