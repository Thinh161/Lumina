var express = require('express');
var bodyParser = require("body-parser");
var cors = require('cors');
var mysql = require('mysql2'); //npm install mysql2
var app = express();
app.use(cors());
app.use(bodyParser.json());

// MYSQL Connection
var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "admin123", 
    database: "AppDocTruyen"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to AppDocTruyen Database!!!");
});

// ================= API ENDPOINTS =================

// 1. Đăng ký tài khoản (Register)
app.post('/api/register', (req, res) => {
    const { username, password, email, full_name } = req.body;
    // Mặc định role_id = 4 (Regular Reader)
    const sql = `INSERT INTO users (username, password, email, full_name, role_id) VALUES (?, ?, ?, ?, 4)`;
    
    con.query(sql, [username, password, email, full_name], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", message: "Đăng ký thành công" });
    });
});

// 2. Đăng nhập (Login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    
    con.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (results.length > 0) {
            const user = results[0];
            res.json({ status: "success", user });
        } else {
            res.status(401).json({ status: "error", message: "Sai tài khoản hoặc mật khẩu" });
        }
    });
});

// 3. Lấy danh sách thể loại truyện
app.get('/api/categories', (req, res) => {
    const sql = "SELECT * FROM categories";
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 4. Lấy danh sách tất cả truyện (đã được duyệt)
app.get('/api/stories', (req, res) => {
    const sql = `
        SELECT s.*, u.full_name as author_name, c.name as category_name 
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.status = 'published'
    `;
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 5. Chi tiết một truyện
app.get('/api/stories/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.*, u.full_name as author_name, c.name as category_name 
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = ?
    `;
    con.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (results.length > 0) {
            res.json({ status: "success", data: results[0] });
        } else {
            res.status(404).json({ status: "error", message: "Không tìm thấy truyện" });
        }
    });
});

// 6. Lấy danh sách chương của một truyện
app.get('/api/stories/:storyId/chapters', (req, res) => {
    const { storyId } = req.params;
    const sql = `SELECT id, chapter_number, title, is_vip, created_at FROM chapters WHERE story_id = ? ORDER BY chapter_number ASC`;
    con.query(sql, [storyId], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 7. Lấy nội dung chi tiết của một chương
app.get('/api/chapters/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM chapters WHERE id = ?`;
    con.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (results.length > 0) {
            res.json({ status: "success", data: results[0] });
        } else {
            res.status(404).json({ status: "error", message: "Không tìm thấy chương" });
        }
    });
});

// Server
var server = app.listen(5555, "0.0.0.0", function () {
    console.log("App listening at port 5555");
});