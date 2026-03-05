import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Pool yaratish
const db = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'test',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 1. Ustachilik
app.post('/api/ustachilik', async (req, res) => {
    try {
        const { name, usta } = req.body;
        await db.query("INSERT INTO ustachilik (name, usta) VALUES (?, ?)", [name, usta]);
        res.status(201).json({ message: "Ustachilik qo'shildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Nimstansiya
app.post('/api/nimstansiya', async (req, res) => {
    try {
        const { parentId, name, quvvat, turi } = req.body; // 'turi' ham qo'shildi
        await db.query("INSERT INTO nimstansiya (parentId, name, quvvat, turi) VALUES (?, ?, ?, ?)", [parentId, name, quvvat, turi]);
        res.status(201).json({ message: "Nimstansiya qo'shildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Liniya
app.post('/api/liniya', async (req, res) => {
    try {
        const { parentId, name, uzunlik, turi } = req.body;
        await db.query("INSERT INTO liniya (parentId, name, uzunlik, turi) VALUES (?, ?, ?, ?)", [parentId, name, uzunlik, turi]);
        res.status(201).json({ message: "Liniya qo'shildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Transformator
app.post('/api/transformator', async (req, res) => {
    try {
        const { parentId, name, quvvat, holat, turi } = req.body;
        await db.query("INSERT INTO transformator (parentId, name, quvvat, holat, turi) VALUES (?, ?, ?, ?, ?)", [parentId, name, quvvat, holat, turi]);
        res.status(201).json({ message: "Transformator qo'shildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
// Barcha transformatorlarni olish
app.get('/api/transformator/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM transformator');
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
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