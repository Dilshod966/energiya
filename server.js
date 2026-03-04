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

// API Endpoints
// 1. Ustachilik bo'limlari
app.get('/api/ustachilik', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM ustachilik');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Nimstansiyalar (ParentId bo'yicha)
app.get('/api/nimstansiya', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM nimstansiya');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
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