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
    const { username, password, email, full_name, want_author } = req.body;
    const sql = `INSERT INTO users (username, password, email, full_name, role_id, author_request) VALUES (?, ?, ?, ?, 4, ?)`;
    con.query(sql, [username, password, email, full_name, want_author ? 1 : 0], (err, result) => {
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
        SELECT id, username, email, full_name, avatar, balance, is_vip, role_id, status, created_at, author_request
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

// 4.2. Truyện mới nhất (phải đặt TRƯỚC /api/stories/:id)
app.get('/api/stories/latest', (req, res) => {
    const sql = `
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name, c.name as category_name
        FROM stories s LEFT JOIN users u ON s.author_id = u.id LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.status = 'published' ORDER BY s.created_at DESC LIMIT 8
    `;
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 4.3. Truyện xem nhiều nhất (phải đặt TRƯỚC /api/stories/:id)
app.get('/api/stories/top', (req, res) => {
    const sql = `
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name, c.name as category_name
        FROM stories s LEFT JOIN users u ON s.author_id = u.id LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.status = 'published' ORDER BY s.views DESC LIMIT 8
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

// 4.4. Tăng lượt xem (kể cả guest)
app.put('/api/stories/:id/view', (req, res) => {
    const { id } = req.params;
    con.query(`UPDATE stories SET views = views + 1 WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ status: "error" });
        res.json({ status: "success" });
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

// 7. Lấy nội dung chi tiết của một chương (VIP enforcement)
app.get('/api/chapters/:id', (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;
    con.query(`SELECT * FROM chapters WHERE id = ?`, [id], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (results.length === 0) return res.status(404).json({ status: "error", message: "Không tìm thấy chương" });
        const chapter = results[0];
        if (!chapter.is_vip) return res.json({ status: "success", data: chapter });
        if (!user_id) return res.status(403).json({ status: "error", code: "VIP_REQUIRED", message: "Chương này dành riêng cho thành viên VIP." });
        con.query(`SELECT is_vip, role_id FROM users WHERE id = ?`, [user_id], (err2, users) => {
            if (err2 || !users[0]) return res.status(403).json({ status: "error", code: "VIP_REQUIRED", message: "Chương này dành riêng cho thành viên VIP." });
            const u = users[0];
            // VIP users, Authors (role_id=2), Admins (role_id=1) đều được đọc
            if (!u.is_vip && u.role_id !== 1 && u.role_id !== 2)
                return res.status(403).json({ status: "error", code: "VIP_REQUIRED", message: "Chương này dành riêng cho thành viên VIP." });
            res.json({ status: "success", data: chapter });
        });
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

// 13.1. Sửa bình luận (chỉ của chính mình)
app.put('/api/comments/:id/:userId', (req, res) => {
    const { id, userId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ status: "error", message: "Nội dung không được trống." });
    con.query(`UPDATE comments_reviews SET content = ? WHERE id = ? AND user_id = ?`,
        [content.trim(), id, userId],
        (err, result) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            if (result.affectedRows === 0) return res.status(403).json({ status: "error", message: "Không có quyền sửa." });
            res.json({ status: "success" });
        }
    );
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
            (SELECT COUNT(*) FROM chapters ch WHERE ch.story_id = s.id) as chapter_count,
            s.rejection_reason
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

// 21. Thêm chương vào truyện (chapter_number tự động)
app.post('/api/stories/:storyId/chapters', (req, res) => {
    const { storyId } = req.params;
    const { title, content, is_vip } = req.body;
    con.query(`SELECT COALESCE(MAX(chapter_number), 0) + 1 as next_num FROM chapters WHERE story_id = ?`, [storyId], (err, rows) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        const chapter_number = rows[0].next_num;
        const sql = `INSERT INTO chapters (story_id, chapter_number, title, content, is_vip) VALUES (?, ?, ?, ?, ?)`;
        con.query(sql, [storyId, chapter_number, title, content, is_vip || false], (err2, result) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            res.json({ status: "success", id: result.insertId, chapter_number });
        });
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

// 22.1. Sửa chương
app.put('/api/chapters/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, is_vip } = req.body;
    con.query(
        `UPDATE chapters SET title = ?, content = ?, is_vip = ? WHERE id = ?`,
        [title, content, is_vip ? 1 : 0, id],
        (err) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success" });
        }
    );
});

// 20.1. Sửa thông tin truyện (tác giả)
app.put('/api/stories/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, thumbnail, category_id } = req.body;
    con.query(
        `UPDATE stories SET title = ?, description = ?, thumbnail = ?, category_id = ?, updated_at = NOW() WHERE id = ?`,
        [title, description, thumbnail, category_id, id],
        (err) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success" });
        }
    );
});

// ========== LỊCH SỬ ĐỌC ==========

// 27. Lịch sử đọc của user (từ bookmarks)
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT b.id, b.chapter_id, b.scroll_position, b.updated_at,
               c.chapter_number, c.title as chapter_title, c.story_id,
               s.title as story_title, s.thumbnail as cover_image, s.author_id,
               u.full_name as author_name
        FROM bookmarks b
        JOIN chapters c ON b.chapter_id = c.id
        JOIN stories s ON c.story_id = s.id
        LEFT JOIN users u ON s.author_id = u.id
        WHERE b.user_id = ?
        ORDER BY b.updated_at DESC
        LIMIT 20
    `;
    con.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 29. Mua VIP bằng xu (1000 xu, vĩnh viễn)
app.put('/api/users/:id/buy-vip', (req, res) => {
    const { id } = req.params;
    con.query(`SELECT balance, is_vip FROM users WHERE id = ?`, [id], (err, results) => {
        if (err || !results[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy user" });
        const u = results[0];
        if (u.is_vip) return res.json({ status: "error", message: "Bạn đã là VIP rồi" });
        if (u.balance < 1000) return res.json({ status: "error", message: "Không đủ xu. Cần 1000 xu." });
        con.query(`UPDATE users SET balance = balance - 1000, is_vip = 1 WHERE id = ?`, [id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            res.json({ status: "success", message: "Đã kích hoạt VIP thành công!" });
        });
    });
});

// 30. Gửi yêu cầu trở thành tác giả
app.put('/api/users/:id/request-author', (req, res) => {
    const { id } = req.params;
    con.query(`UPDATE users SET author_request = 1 WHERE id = ? AND role_id = 4`, [id], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (result.affectedRows === 0) return res.json({ status: "error", message: "Không hợp lệ hoặc đã gửi rồi" });
        res.json({ status: "success", message: "Đã gửi yêu cầu. Chờ Admin phê duyệt." });
    });
});

// 28. Nạp xu
app.put('/api/users/:id/balance', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ status: "error", message: "Số xu không hợp lệ" });
    con.query(`UPDATE users SET balance = balance + ? WHERE id = ?`, [amount, id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        con.query(`SELECT balance FROM users WHERE id = ?`, [id], (e2, r2) => {
            res.json({ status: "success", balance: r2?.[0]?.balance });
        });
    });
});

// ========== ADMIN ==========

// Admin: Lấy danh sách yêu cầu tác giả
app.get('/api/admin/author-requests', (req, res) => {
    const sql = `
        SELECT u.id, u.username, u.full_name, u.email, u.avatar, u.created_at, r.role_name
        FROM users u LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.author_request = 1
        ORDER BY u.created_at ASC
    `;
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// Admin: Phê duyệt tác giả
app.put('/api/admin/users/:id/approve-author', (req, res) => {
    const { id } = req.params;
    con.query(`UPDATE users SET role_id = 2, author_request = 0 WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// Admin: Từ chối yêu cầu tác giả
app.put('/api/admin/users/:id/reject-author', (req, res) => {
    const { id } = req.params;
    con.query(`UPDATE users SET author_request = 0 WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// Admin: Cấp VIP cho user
app.put('/api/admin/users/:id/vip', (req, res) => {
    const { id } = req.params;
    con.query(`UPDATE users SET is_vip = 1 WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// Admin: Thu hồi VIP
app.put('/api/admin/users/:id/revoke-vip', (req, res) => {
    const { id } = req.params;
    con.query(`UPDATE users SET is_vip = 0 WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// Admin: Lấy truyện theo status (published / rejected)
app.get('/api/admin/stories', (req, res) => {
    const { status = 'published' } = req.query;
    const sql = `
        SELECT s.*, u.full_name as author_name, c.name as category_name
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.status = ?
        ORDER BY s.updated_at DESC
    `;
    con.query(sql, [status], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

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
    const { status, rejection_reason } = req.body;
    con.query(
        `UPDATE stories SET status = ?, rejection_reason = ? WHERE id = ?`,
        [status, rejection_reason || null, id],
        (err) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success" });
        }
    );
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