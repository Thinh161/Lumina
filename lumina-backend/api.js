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

// 2.1. Lấy thông tin người dùng theo ID
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT id, username, email, full_name, avatar, balance, is_vip, role_id, status, created_at
        FROM users
        WHERE id = ?
    `;

    con.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (results.length > 0) {
            res.json({ status: "success", user: results[0] });
        } else {
            res.status(404).json({ status: "error", message: "Không tìm thấy người dùng" });
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
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name, c.name as category_name
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

// 4.1. Tìm kiếm truyện (phải đặt TRƯỚC /api/stories/:id)
app.get('/api/stories/search', (req, res) => {
    const { q = '', category_id } = req.query;
    let sql = `
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name, c.name as category_name
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.status = 'published'
        AND (s.title LIKE ? OR u.full_name LIKE ?)
    `;
    const params = [`%${q}%`, `%${q}%`];
    if (category_id) {
        sql += ` AND s.category_id = ?`;
        params.push(category_id);
    }
    con.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 5. Chi tiết một truyện
app.get('/api/stories/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name, c.name as category_name 
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

// 9. Lấy thư viện của người dùng
app.get('/api/library/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name, c.name as category_name, l.added_at
        FROM library l
        JOIN stories s ON l.story_id = s.id
        LEFT JOIN users u ON s.author_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE l.user_id = ?
        ORDER BY l.added_at DESC
    `;
    con.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 10. Thêm truyện vào thư viện
app.post('/api/library', (req, res) => {
    const { user_id, story_id } = req.body;
    const sql = `INSERT IGNORE INTO library (user_id, story_id) VALUES (?, ?)`;
    con.query(sql, [user_id, story_id], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", message: "Đã thêm vào thư viện" });
    });
});

// 11. Xóa truyện khỏi thư viện
app.delete('/api/library/:userId/:storyId', (req, res) => {
    const { userId, storyId } = req.params;
    const sql = `DELETE FROM library WHERE user_id = ? AND story_id = ?`;
    con.query(sql, [userId, storyId], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", message: "Đã xóa khỏi thư viện" });
    });
});

// ========== BÌNH LUẬN / ĐÁNH GIÁ ==========

// 12. Lấy bình luận của truyện
app.get('/api/stories/:id/comments', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT cr.*, u.username, u.full_name, u.avatar
        FROM comments_reviews cr
        JOIN users u ON cr.user_id = u.id
        WHERE cr.story_id = ?
        ORDER BY cr.created_at DESC
    `;
    con.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 13. Thêm bình luận
app.post('/api/comments', (req, res) => {
    const { user_id, story_id, content, rating } = req.body;
    const sql = `INSERT INTO comments_reviews (user_id, story_id, content, rating) VALUES (?, ?, ?, ?)`;
    con.query(sql, [user_id, story_id, content, rating || null], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", id: result.insertId });
    });
});

// 14. Xóa bình luận (chỉ của chính mình)
app.delete('/api/comments/:id/:userId', (req, res) => {
    const { id, userId } = req.params;
    const sql = `DELETE FROM comments_reviews WHERE id = ? AND user_id = ?`;
    con.query(sql, [id, userId], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (result.affectedRows === 0) return res.status(403).json({ status: "error", message: "Không có quyền xóa" });
        res.json({ status: "success" });
    });
});

// ========== BOOKMARK / TIẾP TỤC ĐỌC ==========

// 15. Lấy bookmark của user cho một truyện
app.get('/api/bookmarks/:userId/:storyId', (req, res) => {
    const { userId, storyId } = req.params;
    const sql = `
        SELECT b.*, c.chapter_number, c.title as chapter_title
        FROM bookmarks b
        JOIN chapters c ON b.chapter_id = c.id
        WHERE b.user_id = ? AND c.story_id = ?
        ORDER BY b.updated_at DESC LIMIT 1
    `;
    con.query(sql, [userId, storyId], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results[0] || null });
    });
});

// 16. Lưu bookmark
app.post('/api/bookmarks', (req, res) => {
    const { user_id, chapter_id, scroll_position } = req.body;
    const sql = `
        INSERT INTO bookmarks (user_id, chapter_id, scroll_position)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE scroll_position = VALUES(scroll_position), updated_at = CURRENT_TIMESTAMP
    `;
    con.query(sql, [user_id, chapter_id, scroll_position || 0], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// ========== CẬP NHẬT HỒ SƠ ==========

// 17. Cập nhật thông tin cá nhân
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { full_name, avatar } = req.body;
    const sql = `UPDATE users SET full_name = ?, avatar = ? WHERE id = ?`;
    con.query(sql, [full_name, avatar, id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", message: "Cập nhật thành công" });
    });
});

// 18. Đổi mật khẩu
app.put('/api/users/:id/password', (req, res) => {
    const { id } = req.params;
    const { old_password, new_password } = req.body;
    const check = `SELECT id FROM users WHERE id = ? AND password = ?`;
    con.query(check, [id, old_password], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (results.length === 0) return res.status(400).json({ status: "error", message: "Mật khẩu cũ không đúng" });
        const update = `UPDATE users SET password = ? WHERE id = ?`;
        con.query(update, [new_password, id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            res.json({ status: "success", message: "Đổi mật khẩu thành công" });
        });
    });
});

// ========== TÁC GIẢ ==========

// 19. Lấy truyện của tác giả
app.get('/api/author/stories/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT s.*, c.name as category_name,
            (SELECT COUNT(*) FROM chapters ch WHERE ch.story_id = s.id) as chapter_count
        FROM stories s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.author_id = ?
        ORDER BY s.updated_at DESC
    `;
    con.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 20. Đăng truyện mới
app.post('/api/stories', (req, res) => {
    const { title, description, thumbnail, author_id, category_id } = req.body;
    const sql = `INSERT INTO stories (title, description, thumbnail, author_id, category_id, status) VALUES (?, ?, ?, ?, ?, 'pending')`;
    con.query(sql, [title, description, thumbnail, author_id, category_id], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", id: result.insertId, message: "Đã gửi truyện để kiểm duyệt" });
    });
});

// 21. Thêm chương vào truyện
app.post('/api/stories/:storyId/chapters', (req, res) => {
    const { storyId } = req.params;
    const { chapter_number, title, content, is_vip } = req.body;
    const sql = `INSERT INTO chapters (story_id, chapter_number, title, content, is_vip) VALUES (?, ?, ?, ?, ?)`;
    con.query(sql, [storyId, chapter_number, title, content, is_vip || false], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", id: result.insertId });
    });
});

// 22. Xóa chương
app.delete('/api/chapters/:id', (req, res) => {
    const { id } = req.params;
    con.query(`DELETE FROM chapters WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// ========== ADMIN ==========

// 23. Lấy truyện chờ duyệt
app.get('/api/admin/stories/pending', (req, res) => {
    const sql = `
        SELECT s.*, u.full_name as author_name, c.name as category_name
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.status = 'pending'
        ORDER BY s.created_at ASC
    `;
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 24. Duyệt / từ chối truyện
app.put('/api/admin/stories/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'published' hoặc 'rejected'
    con.query(`UPDATE stories SET status = ? WHERE id = ?`, [status, id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// 25. Lấy danh sách người dùng
app.get('/api/admin/users', (req, res) => {
    const sql = `
        SELECT u.id, u.username, u.email, u.full_name, u.avatar, u.balance, u.is_vip, u.status, u.created_at, r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
    `;
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 26. Ban / unban người dùng
app.put('/api/admin/users/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' hoặc 'banned'
    con.query(`UPDATE users SET status = ? WHERE id = ?`, [status, id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// Server
var server = app.listen(5555, "0.0.0.0", function () {
    console.log("App listening at port 5555");
});