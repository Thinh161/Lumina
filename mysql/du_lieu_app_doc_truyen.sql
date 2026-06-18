DROP DATABASE IF EXISTS AppDocTruyen;
CREATE DATABASE AppDocTruyen;
USE AppDocTruyen;

-- 1. Bảng Vai trò
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Bảng Người dùng
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar VARCHAR(255),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    is_vip BOOLEAN DEFAULT FALSE,
    vip_expires_at DATETIME NULL,
    role_id INT,
    status ENUM('active', 'banned') DEFAULT 'active',
    author_request TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Bảng Thể loại
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 4. Bảng Truyện
CREATE TABLE stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(255),
    author_id INT,
    price_xu INT DEFAULT 0,
    status ENUM('pending', 'published', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 4.1. Bảng Thể loại của truyện (nhiều-nhiều)
CREATE TABLE story_categories (
    story_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (story_id, category_id),
    FOREIGN KEY (story_id) REFERENCES stories(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4.2. Bảng Truyện đã mua
CREATE TABLE purchased_stories (
    user_id INT NOT NULL,
    story_id INT NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, story_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- 5. Bảng Chương truyện
CREATE TABLE chapters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    story_id INT,
    chapter_number INT NOT NULL,
    title VARCHAR(255),
    content LONGTEXT NOT NULL,
    unlock_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- 6. Bảng Thư viện
CREATE TABLE library (
    user_id INT,
    story_id INT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, story_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- 7. Bảng Đánh dấu trang / Lịch sử đọc
CREATE TABLE bookmarks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    chapter_id INT,
    scroll_position INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- 8. Bảng Bình luận & Đánh giá
CREATE TABLE comments_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    story_id INT,
    content TEXT,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- 9. Bảng Thông báo
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. Bảng Yêu cầu nạp xu
CREATE TABLE topup_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount_vnd INT NOT NULL,
    amount_xu INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 11. Bảng Yêu cầu mua VIP
CREATE TABLE vip_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount_vnd INT NOT NULL,
    months INT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 12. Bảng Yêu cầu rút tiền
CREATE TABLE withdraw_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount_xu INT NOT NULL,
    amount_vnd INT NOT NULL,
    bank_name VARCHAR(100) DEFAULT '',
    bank_account VARCHAR(100) NOT NULL,
    bank_owner VARCHAR(100) DEFAULT '',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- DỮ LIỆU MẪU
-- =============================================

INSERT INTO roles (role_name) VALUES
('Admin'),
('Author'),
('VIP Reader'),
('Regular Reader');

INSERT INTO users (username, password, email, full_name, avatar, balance, is_vip, role_id) VALUES
('admin_minh', 'hash_pass_123', 'admin@apptruyen.vn', 'Nguyễn Minh Admin', 'https://i.pravatar.cc/150?img=1', 0, FALSE, 1),
('tacgia_lam', 'hash_pass_456', 'lam.writer@gmail.com', 'Lâm Tác Giả', 'https://i.pravatar.cc/150?img=2', 50000, FALSE, 2),
('docgia_vip88', 'hash_pass_789', 'vip.reader@yahoo.com', 'Trần Đại Gia', 'https://i.pravatar.cc/150?img=3', 200000, TRUE, 3),
('test1', '123456', 'user.new@gmail.com', 'Thạch Hạo', 'https://i.pinimg.com/736x/25/a1/89/25a1891986ea33f099b7a69d4348026a.jpg', 10000, FALSE, 4),
('test2', '123456', 'test.new@gmail.com', 'Hàn Lập', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO4WKZPYsBwB_z__B1Va-SoNv11Dk_R3IKEw&s', 10000, FALSE, 4);

INSERT INTO categories (name, description) VALUES
('Tiên Hiệp', 'Tu tiên, luyện khí, huyền huyễn'),
('Kiếm Hiệp', 'Giang hồ, võ lâm trung nguyên'),
('Ngôn Tình', 'Truyện tình cảm lãng mạn'),
('Hệ Thống', 'Nhân vật chính có hệ thống hỗ trợ');

INSERT INTO stories (title, description, thumbnail, author_id, status) VALUES
('Phàm Nhân Tu Tiên', 'Hành trình của một người bình thường tu thành tiên.',
'https://s3.cloud.cmctelecom.vn/2game-vn/pictures/2game/2017/09/25/2game-truyen-pham-nhan-tu-tien-vng-anh-7.jpg', 2, 'published'),
('Tiếu Ngạo Giang Hồ', 'Kiếm hiệp Kim Dung kinh điển.',
'https://307a0e78.vws.vegacdn.vn/view/v2/image/img.book/0/0/0/19289.jpg?v=1&w=480&h=700', 2, 'published'),
('Sống Cùng Hệ Thống', 'Xuyên không và có bàn tay vàng.',
'https://i.imgur.com/7ABCD12.jpg', 2, 'pending');

INSERT INTO story_categories (story_id, category_id) VALUES
(1, 1), -- Phàm Nhân Tu Tiên: Tiên Hiệp
(2, 2), -- Tiếu Ngạo Giang Hồ: Kiếm Hiệp
(3, 4); -- Sống Cùng Hệ Thống: Hệ Thống

INSERT INTO chapters (story_id, chapter_number, title, content) VALUES
(1, 1, 'Khởi đầu',
'Trời chiều dần buông xuống, ánh nắng cuối ngày nhuộm vàng cả một vùng núi non trùng điệp. Trong một thôn làng nhỏ nằm sâu trong núi, có một thiếu niên tên là Hàn Lập.

Hàn Lập sinh ra trong một gia đình nghèo, cha mẹ làm nông, cuộc sống tuy vất vả nhưng y vẫn luôn chăm chỉ học hành và phụ giúp gia đình. Tuy nhiên, trong lòng thiếu niên này luôn ẩn chứa một khát vọng lớn hơn — khát vọng thay đổi vận mệnh.

Một ngày nọ, khi đang lên núi hái thuốc, Hàn Lập tình cờ gặp một đạo sĩ kỳ lạ. Ánh mắt của lão sâu thẳm, như nhìn thấu mọi thứ trong thiên địa.

"Ngươi có muốn tu tiên không?" — lão hỏi.

Câu hỏi đó như một tia sét đánh thẳng vào tâm trí Hàn Lập.

Từ khoảnh khắc đó, vận mệnh của hắn bắt đầu thay đổi...'),

(1, 2, 'Gia nhập tông môn',
'Sau khi rời khỏi ngôi làng nhỏ, Hàn Lập theo chân đạo sĩ đến một tông môn bí ẩn nằm trên đỉnh núi cao.

Con đường lên núi vô cùng hiểm trở, từng bước đi đều phải cẩn thận, chỉ cần sơ sẩy là có thể rơi xuống vực sâu không đáy.

Khi đến nơi, trước mắt hắn hiện ra một khung cảnh hoàn toàn khác — đình đài, lầu các, linh khí dày đặc, người người tu luyện.

"Đây là nơi ngươi sẽ bắt đầu con đường tu tiên của mình."

Nhưng để chính thức trở thành đệ tử, Hàn Lập phải vượt qua một cuộc khảo hạch cực kỳ khắc nghiệt.

Hắn siết chặt nắm tay, ánh mắt kiên định: "Ta nhất định phải vượt qua!"'),

(1, 3, 'Bí mật pháp bảo',
'Đêm xuống, toàn bộ tông môn chìm trong tĩnh lặng.

Hàn Lập ngồi trong phòng, cẩn thận lấy ra một vật mà hắn vô tình nhặt được trong lúc khảo hạch — một chiếc bình nhỏ màu xanh.

Chiếc bình trông rất bình thường, nhưng khi ánh trăng chiếu vào, nó lại phát ra ánh sáng kỳ dị.

Hắn thử nhỏ một giọt nước vào bên trong... Điều không tưởng đã xảy ra.

Nước trong bình bắt đầu phát sáng, sau đó biến đổi thành một loại linh dịch tinh khiết chưa từng thấy.

"Đây... đây là bảo vật!"

Hàn Lập hít sâu một hơi, tim đập dồn dập. Hắn biết rằng, kể từ khoảnh khắc này, con đường tu tiên của hắn sẽ không còn bình thường nữa.'),

(2, 1, 'Lệnh Hồ Xung',
'Gió thổi nhẹ qua đỉnh Hoa Sơn, mang theo tiếng lá xào xạc.

Một bóng người đứng trên vách núi, tay cầm trường kiếm, ánh mắt xa xăm. Đó chính là Lệnh Hồ Xung.

Hắn là đại đệ tử của Hoa Sơn phái, tính tình phóng khoáng, không câu nệ lễ nghi, nhưng lại có thiên phú kiếm thuật hiếm thấy.

Giang hồ rộng lớn, ân oán chồng chất. Một con đường đầy sóng gió đang chờ hắn phía trước...');

INSERT INTO library (user_id, story_id) VALUES
(3, 1),
(4, 1),
(3, 2);

INSERT INTO bookmarks (user_id, chapter_id, scroll_position) VALUES
(3, 2, 150),
(4, 1, 500);

INSERT INTO comments_reviews (user_id, story_id, content, rating) VALUES
(3, 1, 'Truyện hay quá, mong tác giả ra chương nhanh!', 5),
(4, 1, 'Cốt truyện hơi chậm nhưng lôi cuốn.', 4);
