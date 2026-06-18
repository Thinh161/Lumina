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
    // Dọn bảng không dùng
    con.query(`DROP TABLE IF EXISTS purchased_chapters`, (e) => { if (e) console.log('drop purchased_chapters:', e.message); });
    con.query(`DROP TABLE IF EXISTS transactions`, (e) => { if (e) console.log('drop transactions:', e.message); });
    con.query(`ALTER TABLE chapters DROP COLUMN is_vip`, (e) => {
        if (e && !e.message.includes("check that column/key exists") && !e.message.includes("Can't DROP")) console.log('drop is_vip col:', e.message);
    });
    con.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            is_read TINYINT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (e) => { if (e) console.log('notifications table:', e.message); });
    // Thêm cột unlock_at vào chapters nếu chưa có
    con.query(`ALTER TABLE chapters ADD COLUMN unlock_at DATETIME NULL`, (e) => {
        if (e && !e.message.includes('Duplicate column')) console.log('unlock_at col:', e.message);
    });
    // Thêm cột author_request vào users nếu chưa có
    con.query(`ALTER TABLE users ADD COLUMN author_request TINYINT DEFAULT 0`, (e) => {
        if (e && !e.message.includes('Duplicate column')) console.log('author_request col:', e.message);
    });
    // Thêm cột vip_expires_at vào users nếu chưa có
    con.query(`ALTER TABLE users ADD COLUMN vip_expires_at DATETIME NULL`, (e) => {
        if (e && !e.message.includes('Duplicate column')) console.log('vip_expires_at col:', e.message);
    });
    // Thêm cột price_xu vào stories nếu chưa có
    con.query(`ALTER TABLE stories ADD COLUMN price_xu INT DEFAULT 0`, (e) => {
        if (e && !e.message.includes('Duplicate column')) console.log('price_xu col:', e.message);
    });
    con.query(`
        CREATE TABLE IF NOT EXISTS purchased_stories (
            user_id INT NOT NULL,
            story_id INT NOT NULL,
            purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, story_id)
        )
    `, (e) => { if (e) console.log('purchased_stories table:', e.message); });
    // Thêm cột rejection_reason vào stories nếu chưa có
    con.query(`ALTER TABLE stories ADD COLUMN rejection_reason TEXT NULL`, (e) => {
        if (e && !e.message.includes('Duplicate column')) console.log('rejection_reason col:', e.message);
    });
    con.query(`
        CREATE TABLE IF NOT EXISTS topup_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            amount_vnd INT NOT NULL,
            amount_xu INT NOT NULL,
            status ENUM('pending','approved','rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (e) => { if (e) console.log('topup_requests table:', e.message); });
    con.query(`
        CREATE TABLE IF NOT EXISTS vip_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            amount_vnd INT NOT NULL,
            months INT NULL,
            status ENUM('pending','approved','rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (e) => { if (e) console.log('vip_requests table:', e.message); });
    con.query(`
        CREATE TABLE IF NOT EXISTS withdraw_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            amount_xu INT NOT NULL,
            amount_vnd INT NOT NULL,
            bank_name VARCHAR(100) DEFAULT '',
            bank_account VARCHAR(100) NOT NULL,
            bank_owner VARCHAR(100) DEFAULT '',
            status ENUM('pending','approved','rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (e) => { if (e) console.log('withdraw_requests table:', e.message); });
    con.query(`ALTER TABLE chapters ADD COLUMN views INT DEFAULT 0`, (e) => {
        if (e && !e.message.includes('Duplicate column')) console.log('chapters.views col:', e.message);
    });
    con.query(`
        CREATE TABLE IF NOT EXISTS story_categories (
            story_id INT NOT NULL,
            category_id INT NOT NULL,
            PRIMARY KEY (story_id, category_id)
        )
    `, (e) => {
        if (e) { console.log('story_categories table:', e.message); return; }
        // Migrate dữ liệu cũ từ stories.category_id sang story_categories
        con.query(`
            INSERT IGNORE INTO story_categories (story_id, category_id)
            SELECT id, category_id FROM stories WHERE category_id IS NOT NULL
        `, (e2) => { if (e2) console.log('migrate story_categories:', e2.message); });
    });
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
            if (user.status === 'banned') {
                return res.status(403).json({ status: "error", message: "Tài khoản của bạn đã bị khóa." });
            }
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
        SELECT id, username, email, full_name, avatar, balance, is_vip, vip_expires_at, role_id, status, created_at, author_request
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
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names,
            (SELECT GROUP_CONCAT(sc.category_id ORDER BY sc.category_id) FROM story_categories sc WHERE sc.story_id = s.id) as category_ids
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
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
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names,
            (SELECT GROUP_CONCAT(sc.category_id ORDER BY sc.category_id) FROM story_categories sc WHERE sc.story_id = s.id) as category_ids
        FROM stories s LEFT JOIN users u ON s.author_id = u.id
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
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names,
            (SELECT GROUP_CONCAT(sc.category_id ORDER BY sc.category_id) FROM story_categories sc WHERE sc.story_id = s.id) as category_ids
        FROM stories s LEFT JOIN users u ON s.author_id = u.id
        WHERE s.status = 'published' ORDER BY s.views DESC LIMIT 8
    `;
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 4.1. Tìm kiếm truyện (phải đặt TRƯỚC /api/stories/:id)
app.get('/api/stories/search', (req, res) => {
    const { q = '', category_id, sort } = req.query;
    let sql = `
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names,
            (SELECT GROUP_CONCAT(sc.category_id ORDER BY sc.category_id) FROM story_categories sc WHERE sc.story_id = s.id) as category_ids
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
        WHERE s.status = 'published'
        AND (s.title LIKE ? OR u.full_name LIKE ?)
    `;
    const params = [`%${q}%`, `%${q}%`];
    if (category_id) {
        sql += ` AND EXISTS (SELECT 1 FROM story_categories sc WHERE sc.story_id = s.id AND sc.category_id = ?)`;
        params.push(category_id);
    }
    sql += sort === 'views' ? ' ORDER BY s.views DESC' : ' ORDER BY s.created_at DESC';
    con.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 4.4b. Tăng lượt xem chương (chỉ gọi khi đọc ≥80%) — cộng vào story.views + doanh thu tác giả
app.put('/api/chapters/:id/view', (req, res) => {
    const { id } = req.params;
    con.query(`SELECT story_id FROM chapters WHERE id = ?`, [id], (err, rows) => {
        if (err || !rows[0]) return res.status(404).json({ status: "error" });
        const storyId = rows[0].story_id;
        con.query(`UPDATE chapters SET views = views + 1 WHERE id = ?`, [id], (err2) => {
            if (err2) return res.status(500).json({ status: "error" });
            // Cập nhật story.views = tổng views của các chương
            con.query(`UPDATE stories SET views = (SELECT COALESCE(SUM(views),0) FROM chapters WHERE story_id = ?) WHERE id = ?`, [storyId, storyId], () => {});
            // Doanh thu tác giả: 1 xu mỗi 10 lượt xem chapter
            con.query(`SELECT views, author_id FROM stories WHERE id = ?`, [storyId], (err3, sRows) => {
                if (!err3 && sRows[0] && sRows[0].views % 10 === 0 && sRows[0].views > 0) {
                    con.query(`UPDATE users SET balance = balance + 1 WHERE id = ?`, [sRows[0].author_id], () => {});
                }
            });
            res.json({ status: "success" });
        });
    });
});

// 4.5. Trạng thái mua truyện của user
app.get('/api/stories/:id/purchase-status', (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;
    con.query(`SELECT price_xu FROM stories WHERE id = ?`, [id], (err, rows) => {
        if (err || !rows[0]) return res.status(404).json({ status: "error" });
        const price_xu = rows[0].price_xu || 0;
        if (!user_id || price_xu === 0) return res.json({ status: "success", price_xu, has_purchased: false });
        con.query(`SELECT 1 FROM purchased_stories WHERE user_id = ? AND story_id = ?`, [user_id, id], (err2, bought) => {
            res.json({ status: "success", price_xu, has_purchased: !!(bought && bought.length > 0) });
        });
    });
});

// 4.6. Mua truyện trả phí
app.post('/api/stories/:id/purchase', (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    con.query(`SELECT price_xu, author_id, title FROM stories WHERE id = ?`, [id], (err, rows) => {
        if (err || !rows[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy truyện" });
        const story = rows[0];
        if (!story.price_xu) return res.json({ status: "error", message: "Truyện này miễn phí." });
        con.query(`SELECT 1 FROM purchased_stories WHERE user_id = ? AND story_id = ?`, [user_id, id], (err2, existing) => {
            if (existing && existing.length > 0) return res.json({ status: "error", message: "Bạn đã mua truyện này rồi." });
            con.query(`SELECT balance FROM users WHERE id = ?`, [user_id], (err3, users) => {
                if (err3 || !users[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy user" });
                if (users[0].balance < story.price_xu) return res.json({ status: "error", message: `Không đủ xu. Cần ${story.price_xu} xu.` });
                con.query(`UPDATE users SET balance = balance - ? WHERE id = ?`, [story.price_xu, user_id], (err4) => {
                    if (err4) return res.status(500).json({ status: "error", message: err4.message });
                    con.query(`UPDATE users SET balance = balance + ? WHERE id = ?`, [story.price_xu, story.author_id], () => {});
                    con.query(`INSERT INTO purchased_stories (user_id, story_id) VALUES (?, ?)`, [user_id, id], (err5) => {
                        if (err5) return res.status(500).json({ status: "error", message: err5.message });
                        res.json({ status: "success", message: `Đã mua "${story.title}" thành công!` });
                    });
                });
            });
        });
    });
});

// 4.4. (deprecated - view tính từ chapters, không dùng nữa)

// 5. Chi tiết một truyện
app.get('/api/stories/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names,
            (SELECT GROUP_CONCAT(sc.category_id ORDER BY sc.category_id) FROM story_categories sc WHERE sc.story_id = s.id) as category_ids
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
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
    const sql = `SELECT id, chapter_number, title, unlock_at, created_at FROM chapters WHERE story_id = ? ORDER BY chapter_number ASC`;
    con.query(sql, [storyId], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 7. Lấy nội dung chi tiết của một chương
app.get('/api/chapters/:id', (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;
    con.query(
        `SELECT c.*, s.author_id, s.price_xu, s.id as story_id FROM chapters c JOIN stories s ON c.story_id = s.id WHERE c.id = ?`,
        [id], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (!results[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy chương" });
        const chapter = results[0];
        const isTimeLocked = chapter.unlock_at && new Date(chapter.unlock_at) > new Date();
        const isPaid = chapter.price_xu > 0;

        // Không cần check gì thêm
        if (!isPaid && !isTimeLocked) return res.json({ status: "success", data: chapter });

        // Chưa đăng nhập
        if (!user_id) {
            if (isPaid) return res.status(403).json({ status: "error", code: "PURCHASE_REQUIRED", message: "Truyện này có phí. Vui lòng mua để đọc.", price_xu: chapter.price_xu, story_id: chapter.story_id });
            const d = new Date(chapter.unlock_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return res.status(403).json({ status: "error", code: "VIP_REQUIRED", message: `Chương mở khóa ${d}. VIP đọc ngay.`, unlock_at: chapter.unlock_at });
        }

        con.query(`SELECT is_vip, vip_expires_at, role_id FROM users WHERE id = ?`, [user_id], (err2, users) => {
            if (err2 || !users[0]) return res.status(403).json({ status: "error", code: "PURCHASE_REQUIRED", message: "Vui lòng đăng nhập lại." });
            const u = users[0];
            const vipActive = u.is_vip && (!u.vip_expires_at || new Date(u.vip_expires_at) > new Date());
            const isPrivileged = vipActive || u.role_id === 1 || u.role_id === 2 || chapter.author_id === parseInt(user_id);

            // VIP / admin / chính tác giả: đọc tất cả
            if (isPrivileged) return res.json({ status: "success", data: chapter });

            if (isPaid) {
                // Kiểm tra đã mua chưa
                con.query(`SELECT 1 FROM purchased_stories WHERE user_id = ? AND story_id = ?`, [user_id, chapter.story_id], (err3, rows) => {
                    if (err3 || !rows[0]) return res.status(403).json({ status: "error", code: "PURCHASE_REQUIRED", message: "Truyện này có phí. Vui lòng mua để đọc.", price_xu: chapter.price_xu, story_id: chapter.story_id });
                    // Đã mua → đọc tất cả kể cả chương time-locked
                    return res.json({ status: "success", data: chapter });
                });
                return;
            }

            // Truyện free nhưng chương time-locked
            const d = new Date(chapter.unlock_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return res.status(403).json({ status: "error", code: "VIP_REQUIRED", message: `Chương mở khóa ${d}. VIP đọc ngay.`, unlock_at: chapter.unlock_at });
        });
    });
});

// 9. Lấy thư viện của người dùng
app.get('/api/library/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT s.*, s.thumbnail as cover_image, u.full_name as author_name,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names,
            l.added_at
        FROM library l
        JOIN stories s ON l.story_id = s.id
        LEFT JOIN users u ON s.author_id = u.id
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
        SELECT s.*,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names,
            (SELECT GROUP_CONCAT(sc.category_id ORDER BY sc.category_id) FROM story_categories sc WHERE sc.story_id = s.id) as category_ids,
            (SELECT COUNT(*) FROM chapters ch WHERE ch.story_id = s.id) as chapter_count,
            s.rejection_reason
        FROM stories s
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
    const { title, description, thumbnail, author_id, category_ids, price_xu } = req.body;
    con.query(
        `INSERT INTO stories (title, description, thumbnail, author_id, price_xu, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
        [title, description, thumbnail, author_id, price_xu || 0],
        (err, result) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            const storyId = result.insertId;
            const ids = Array.isArray(category_ids) ? category_ids : [];
            if (ids.length === 0) return res.json({ status: "success", id: storyId, message: "Đã gửi truyện để kiểm duyệt" });
            const values = ids.map(cid => [storyId, cid]);
            con.query(`INSERT IGNORE INTO story_categories (story_id, category_id) VALUES ?`, [values], (err2) => {
                if (err2) return res.status(500).json({ status: "error", message: err2.message });
                res.json({ status: "success", id: storyId, message: "Đã gửi truyện để kiểm duyệt" });
            });
        }
    );
});

// 21. Thêm chương vào truyện (chapter_number tự động)
app.post('/api/stories/:storyId/chapters', (req, res) => {
    const { storyId } = req.params;
    const { title, content, unlock_at } = req.body;
    con.query(`SELECT COALESCE(MAX(chapter_number), 0) + 1 as next_num FROM chapters WHERE story_id = ?`, [storyId], (err, rows) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        const chapter_number = rows[0].next_num;
        const sql = `INSERT INTO chapters (story_id, chapter_number, title, content, unlock_at) VALUES (?, ?, ?, ?, ?)`;
        con.query(sql, [storyId, chapter_number, title, content, unlock_at || null], (err2, result) => {
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
    const { title, content, unlock_at } = req.body;
    con.query(
        `UPDATE chapters SET title = ?, content = ?, unlock_at = ? WHERE id = ?`,
        [title, content, unlock_at || null, id],
        (err) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success" });
        }
    );
});

// 20.1. Sửa thông tin truyện (tác giả)
app.put('/api/stories/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, thumbnail, category_ids, price_xu } = req.body;
    con.query(
        `UPDATE stories SET title = ?, description = ?, thumbnail = ?, price_xu = ?, updated_at = NOW() WHERE id = ?`,
        [title, description, thumbnail, price_xu ?? 0, id],
        (err) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            const ids = Array.isArray(category_ids) ? category_ids : [];
            con.query(`DELETE FROM story_categories WHERE story_id = ?`, [id], (err2) => {
                if (err2) return res.status(500).json({ status: "error", message: err2.message });
                if (ids.length === 0) return res.json({ status: "success" });
                const values = ids.map(cid => [id, cid]);
                con.query(`INSERT IGNORE INTO story_categories (story_id, category_id) VALUES ?`, [values], (err3) => {
                    if (err3) return res.status(500).json({ status: "error", message: err3.message });
                    res.json({ status: "success" });
                });
            });
        }
    );
});

// ========== LỊCH SỬ ĐỌC ==========

// 27. Lịch sử đọc của user — deduplicate by story (latest chapter per story)
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT b.chapter_id, b.scroll_position, b.updated_at,
               c.chapter_number, c.title as chapter_title, c.story_id,
               s.title as story_title, s.thumbnail as cover_image, s.author_id,
               u.full_name as author_name
        FROM bookmarks b
        JOIN chapters c ON b.chapter_id = c.id
        JOIN stories s ON c.story_id = s.id
        LEFT JOIN users u ON s.author_id = u.id
        WHERE b.user_id = ?
          AND b.updated_at = (
              SELECT MAX(b2.updated_at) FROM bookmarks b2
              JOIN chapters c2 ON b2.chapter_id = c2.id
              WHERE b2.user_id = b.user_id AND c2.story_id = c.story_id
          )
        ORDER BY b.updated_at DESC
        LIMIT 20
    `;
    con.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

// 29. Mua VIP bằng xu
app.put('/api/users/:id/buy-vip', (req, res) => {
    const { id } = req.params;
    const { xu, months } = req.body; // months = null => vĩnh viễn
    if (!xu || xu <= 0) return res.status(400).json({ status: "error", message: "Thiếu thông tin gói VIP." });
    con.query(`SELECT balance, is_vip, vip_expires_at FROM users WHERE id = ?`, [id], (err, results) => {
        if (err || !results[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy user" });
        const u = results[0];
        if (u.balance < xu) return res.json({ status: "error", message: `Không đủ xu. Cần ${xu} xu.` });
        // Tính ngày hết hạn: nếu months null => vĩnh viễn (vip_expires_at = null)
        // Nếu đang còn VIP, gia hạn từ ngày hết hạn cũ, không từ hôm nay
        let expiresAt = null;
        if (months) {
            const base = (u.is_vip && u.vip_expires_at && new Date(u.vip_expires_at) > new Date())
                ? new Date(u.vip_expires_at)
                : new Date();
            base.setMonth(base.getMonth() + months);
            expiresAt = base.toISOString().slice(0, 19).replace('T', ' ');
        }
        con.query(
            `UPDATE users SET balance = balance - ?, is_vip = 1, vip_expires_at = ? WHERE id = ?`,
            [xu, expiresAt, id],
            (err2) => {
                if (err2) return res.status(500).json({ status: "error", message: err2.message });
                res.json({ status: "success", message: "Đã kích hoạt VIP thành công!", vip_expires_at: expiresAt });
            }
        );
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
        con.query(
            `INSERT INTO notifications (user_id, type, message) VALUES (?, 'author_approved', 'Yêu cầu trở thành tác giả của bạn đã được chấp thuận! Bạn có thể đăng truyện ngay bây giờ.')`,
            [id], (e2) => { if (e2) console.log('notif insert:', e2.message); }
        );
        res.json({ status: "success" });
    });
});

// Admin: Từ chối yêu cầu tác giả
app.put('/api/admin/users/:id/reject-author', (req, res) => {
    const { id } = req.params;
    con.query(`UPDATE users SET author_request = 0 WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        con.query(
            `INSERT INTO notifications (user_id, type, message) VALUES (?, 'author_rejected', 'Yêu cầu trở thành tác giả của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm chi tiết.')`,
            [id], (e2) => { if (e2) console.log('notif insert:', e2.message); }
        );
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
        SELECT s.*, u.full_name as author_name,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
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
        SELECT s.*, u.full_name as author_name,
            (SELECT GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR ', ') FROM story_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.story_id = s.id) as category_names
        FROM stories s
        LEFT JOIN users u ON s.author_id = u.id
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
    con.query(`SELECT title, author_id FROM stories WHERE id = ?`, [id], (err, stories) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (!stories[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy truyện" });
        const story = stories[0];
        con.query(
            `UPDATE stories SET status = ?, rejection_reason = ? WHERE id = ?`,
            [status, rejection_reason || null, id],
            (err2) => {
                if (err2) return res.status(500).json({ status: "error", message: err2.message });
                let type, msg;
                if (status === 'published') {
                    type = 'story_approved';
                    msg = `Truyện "${story.title}" của bạn đã được duyệt và phát hành!`;
                } else if (status === 'rejected') {
                    type = 'story_rejected';
                    msg = `Truyện "${story.title}" của bạn đã bị từ chối.${rejection_reason ? ' Lý do: ' + rejection_reason : ''}`;
                }
                if (type) {
                    con.query(`INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)`,
                        [story.author_id, type, msg],
                        (e3) => { if (e3) console.log('notif insert:', e3.message); }
                    );
                }
                res.json({ status: "success" });
            }
        );
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

// ========== NẠP XU ==========

app.post('/api/topup/request', (req, res) => {
    const { user_id, amount_vnd, amount_xu } = req.body;
    if (!user_id || !amount_vnd || !amount_xu)
        return res.status(400).json({ status: "error", message: "Thiếu thông tin." });
    con.query(
        `INSERT INTO topup_requests (user_id, amount_vnd, amount_xu) VALUES (?, ?, ?)`,
        [user_id, amount_vnd, amount_xu],
        (err, result) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success", id: result.insertId });
        }
    );
});

app.get('/api/admin/topup', (req, res) => {
    const status = req.query.status || 'pending';
    const validStatuses = ['pending', 'approved', 'rejected'];
    const s = validStatuses.includes(status) ? status : 'pending';
    const sql = `
        SELECT t.*, u.username, u.full_name, u.avatar
        FROM topup_requests t
        JOIN users u ON t.user_id = u.id
        WHERE t.status = ?
        ORDER BY t.created_at DESC
    `;
    con.query(sql, [s], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

app.put('/api/admin/topup/:id/approve', (req, res) => {
    const { id } = req.params;
    con.query(`SELECT * FROM topup_requests WHERE id = ? AND status = 'pending'`, [id], (err, rows) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (!rows[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy yêu cầu." });
        const r = rows[0];
        con.query(`UPDATE topup_requests SET status = 'approved' WHERE id = ?`, [id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            con.query(`UPDATE users SET balance = balance + ? WHERE id = ?`, [r.amount_xu, r.user_id], (err3) => {
                if (err3) return res.status(500).json({ status: "error", message: err3.message });
                con.query(
                    `INSERT INTO notifications (user_id, type, message) VALUES (?, 'topup_approved', ?)`,
                    [r.user_id, `Yêu cầu nạp xu của bạn đã được xác nhận. ${r.amount_xu} xu đã được cộng vào tài khoản!`],
                    (e4) => { if (e4) console.log('notif insert:', e4.message); }
                );
                res.json({ status: "success" });
            });
        });
    });
});

app.put('/api/admin/topup/:id/reject', (req, res) => {
    const { id } = req.params;
    con.query(`SELECT user_id FROM topup_requests WHERE id = ? AND status = 'pending'`, [id], (err, rows) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (!rows[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy yêu cầu." });
        con.query(`UPDATE topup_requests SET status = 'rejected' WHERE id = ?`, [id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            con.query(
                `INSERT INTO notifications (user_id, type, message) VALUES (?, 'topup_rejected', 'Yêu cầu nạp xu của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm.')`,
                [rows[0].user_id],
                (e3) => { if (e3) console.log('notif insert:', e3.message); }
            );
            res.json({ status: "success" });
        });
    });
});

// ========== QUÊN MẬT KHẨU ==========

app.post('/api/reset-password', (req, res) => {
    const { username, email, new_password } = req.body;
    if (!username || !email || !new_password)
        return res.status(400).json({ status: "error", message: "Thiếu thông tin." });
    con.query(`SELECT id FROM users WHERE username = ? AND LOWER(email) = LOWER(?)`, [username, email], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        if (results.length === 0)
            return res.status(400).json({ status: "error", message: "Tên đăng nhập hoặc email không đúng." });
        con.query(`UPDATE users SET password = ? WHERE id = ?`, [new_password, results[0].id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            res.json({ status: "success" });
        });
    });
});

// ========== THÔNG BÁO ==========

// Phải đặt TRƯỚC /:userId để tránh conflict
app.get('/api/notifications/:userId/unread-count', (req, res) => {
    const { userId } = req.params;
    con.query(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`, [userId], (err, r) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", count: r[0].count });
    });
});

app.get('/api/notifications/:userId', (req, res) => {
    const { userId } = req.params;
    con.query(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, [userId], (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: results });
    });
});

app.put('/api/notifications/read/:userId', (req, res) => {
    const { userId } = req.params;
    con.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success" });
    });
});

// ========== VIP REQUEST ==========

app.post('/api/vip/request', (req, res) => {
    const { user_id, amount_vnd, months } = req.body;
    if (!user_id || !amount_vnd) return res.status(400).json({ status: "error", message: "Thiếu thông tin." });
    con.query(
        `INSERT INTO vip_requests (user_id, amount_vnd, months) VALUES (?, ?, ?)`,
        [user_id, amount_vnd, months || null],
        (err, result) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success", id: result.insertId });
        }
    );
});

app.get('/api/admin/vip-requests', (req, res) => {
    const status = req.query.status || 'pending';
    con.query(
        `SELECT v.*, u.username, u.full_name, u.avatar FROM vip_requests v
         JOIN users u ON v.user_id = u.id WHERE v.status = ? ORDER BY v.created_at DESC`,
        [status],
        (err, results) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success", data: results });
        }
    );
});

app.put('/api/admin/vip/:id/approve', (req, res) => {
    const { id } = req.params;
    con.query(`SELECT * FROM vip_requests WHERE id = ? AND status = 'pending'`, [id], (err, rows) => {
        if (err || !rows[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy yêu cầu." });
        const r = rows[0];
        con.query(`UPDATE vip_requests SET status = 'approved' WHERE id = ?`, [id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            con.query(`UPDATE users SET is_vip = 1 WHERE id = ?`, [r.user_id], (err3) => {
                if (err3) return res.status(500).json({ status: "error", message: err3.message });
                con.query(
                    `INSERT INTO notifications (user_id, type, message) VALUES (?, 'vip_approved', 'Yêu cầu VIP của bạn đã được xác nhận! Chúc mừng bạn trở thành thành viên VIP.')`,
                    [r.user_id], () => {}
                );
                res.json({ status: "success" });
            });
        });
    });
});

app.put('/api/admin/vip/:id/reject', (req, res) => {
    const { id } = req.params;
    con.query(`SELECT user_id FROM vip_requests WHERE id = ? AND status = 'pending'`, [id], (err, rows) => {
        if (err || !rows[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy yêu cầu." });
        con.query(`UPDATE vip_requests SET status = 'rejected' WHERE id = ?`, [id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            con.query(
                `INSERT INTO notifications (user_id, type, message) VALUES (?, 'vip_rejected', 'Yêu cầu VIP của bạn đã bị từ chối. Vui lòng liên hệ Admin.')`,
                [rows[0].user_id], () => {}
            );
            res.json({ status: "success" });
        });
    });
});

// ========== WITHDRAW (TÁC GIẢ RÚT TIỀN) ==========

app.post('/api/withdraw/request', (req, res) => {
    const { user_id, amount_xu, bank_name, bank_account, bank_owner } = req.body;
    if (!user_id || !amount_xu || !bank_account) return res.status(400).json({ status: "error", message: "Thiếu thông tin." });
    if (amount_xu < 10) return res.json({ status: "error", message: "Cần ít nhất 10 xu để rút." });
    con.query(`SELECT balance FROM users WHERE id = ?`, [user_id], (err, rows) => {
        if (err || !rows[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy user." });
        if (rows[0].balance < amount_xu) return res.json({ status: "error", message: "Số xu không đủ." });
        const amount_vnd = amount_xu * 1000;
        con.query(
            `INSERT INTO withdraw_requests (user_id, amount_xu, amount_vnd, bank_name, bank_account, bank_owner) VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, amount_xu, amount_vnd, bank_name || '', bank_account, bank_owner || ''],
            (err2, result) => {
                if (err2) return res.status(500).json({ status: "error", message: err2.message });
                con.query(`UPDATE users SET balance = balance - ? WHERE id = ?`, [amount_xu, user_id], () => {});
                res.json({ status: "success", id: result.insertId, amount_vnd });
            }
        );
    });
});

app.get('/api/admin/withdrawals', (req, res) => {
    const status = req.query.status || 'pending';
    con.query(
        `SELECT w.*, u.username, u.full_name, u.avatar FROM withdraw_requests w
         JOIN users u ON w.user_id = u.id WHERE w.status = ? ORDER BY w.created_at DESC`,
        [status],
        (err, results) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success", data: results });
        }
    );
});

app.put('/api/admin/withdraw/:id/approve', (req, res) => {
    const { id } = req.params;
    con.query(`SELECT * FROM withdraw_requests WHERE id = ? AND status = 'pending'`, [id], (err, rows) => {
        if (err || !rows[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy yêu cầu." });
        con.query(`UPDATE withdraw_requests SET status = 'approved' WHERE id = ?`, [id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            con.query(
                `INSERT INTO notifications (user_id, type, message) VALUES (?, 'withdraw_approved', ?)`,
                [rows[0].user_id, `Yêu cầu rút ${rows[0].amount_xu} xu (${rows[0].amount_vnd.toLocaleString()}đ) đã được chuyển khoản thành công.`],
                () => {}
            );
            res.json({ status: "success" });
        });
    });
});

app.put('/api/admin/withdraw/:id/reject', (req, res) => {
    const { id } = req.params;
    con.query(`SELECT * FROM withdraw_requests WHERE id = ? AND status = 'pending'`, [id], (err, rows) => {
        if (err || !rows[0]) return res.status(404).json({ status: "error", message: "Không tìm thấy yêu cầu." });
        con.query(`UPDATE withdraw_requests SET status = 'rejected' WHERE id = ?`, [id], (err2) => {
            if (err2) return res.status(500).json({ status: "error", message: err2.message });
            // Hoàn xu lại
            con.query(`UPDATE users SET balance = balance + ? WHERE id = ?`, [rows[0].amount_xu, rows[0].user_id], () => {});
            con.query(
                `INSERT INTO notifications (user_id, type, message) VALUES (?, 'withdraw_rejected', ?)`,
                [rows[0].user_id, `Yêu cầu rút ${rows[0].amount_xu} xu đã bị từ chối. Xu đã được hoàn lại.`],
                () => {}
            );
            res.json({ status: "success" });
        });
    });
});

// Server
var server = app.listen(5555, "0.0.0.0", function () {
    console.log("App listening at port 5555");
});