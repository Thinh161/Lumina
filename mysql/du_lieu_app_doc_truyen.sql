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
    views INT DEFAULT 0,
    unlock_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- 5.1. Dedup lượt xem chương (mỗi user chỉ đếm 1 lần/chương)
CREATE TABLE chapter_views (
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    PRIMARY KEY (user_id, chapter_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
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

-- =============================================
-- DỮ LIỆU MẪU MỞ RỘNG
-- =============================================

-- Thêm tác giả và độc giả
INSERT INTO users (username, password, email, full_name, avatar, balance, is_vip, vip_expires_at, role_id) VALUES
('tacgia_mai', '123456', 'mai.writer@gmail.com', 'Nguyễn Mai Tác Giả', 'https://i.pravatar.cc/150?img=5', 8500, FALSE, NULL, 2),
('tacgia_duc', '123456', 'duc.writer@gmail.com', 'Trần Đức Văn', 'https://i.pravatar.cc/150?img=6', 3200, FALSE, NULL, 2),
('vip_reader1', '123456', 'reader1@gmail.com', 'Phạm Thị Lan', 'https://i.pravatar.cc/150?img=7', 15000, TRUE, DATE_ADD(NOW(), INTERVAL 2 MONTH), 3),
('vip_reader2', '123456', 'reader2@gmail.com', 'Lê Minh Tuấn', 'https://i.pravatar.cc/150?img=8', 9500, TRUE, DATE_ADD(NOW(), INTERVAL 1 YEAR), 3),
('reader_an', '123456', 'an@gmail.com', 'Nguyễn Văn An', 'https://i.pravatar.cc/150?img=9', 2000, FALSE, NULL, 4),
('reader_binh', '123456', 'binh@gmail.com', 'Trần Thị Bình', 'https://i.pravatar.cc/150?img=10', 5000, FALSE, NULL, 4),
('reader_cuong', '123456', 'cuong@gmail.com', 'Lê Văn Cường', 'https://i.pravatar.cc/150?img=11', 1500, FALSE, NULL, 4),
('reader_dung', '123456', 'dung@gmail.com', 'Vũ Thị Dung', 'https://i.pravatar.cc/150?img=12', 3000, FALSE, NULL, 4);

-- Thêm thể loại
INSERT INTO categories (name, description) VALUES
('Dị Giới', 'Xuyên không sang thế giới khác'),
('Huyền Huyễn', 'Ma pháp, dị năng, thế giới kỳ ảo'),
('Đô Thị', 'Bối cảnh hiện đại, cuộc sống thường ngày'),
('Lịch Sử', 'Cổ đại, cung đấu, triều đại');

-- Thêm truyện (mix miễn phí và trả phí, nhiều tác giả)
INSERT INTO stories (title, description, thumbnail, author_id, price_xu, views, status) VALUES
-- Tác giả Lâm (id=2)
('Võ Luyện Đỉnh Phong', 'Thiếu niên bình thường nhận được hệ thống võ học tối thượng, từ đó bước lên con đường xưng bá võ lâm.',
'https://i.pinimg.com/736x/8b/4c/2e/8b4c2e3a1f9d5e7b2c4a6d8e0f1b3c5a.jpg', 2, 200, 850, 'published'),
('Tiên Ma Đồng Tu', 'Cơ duyên kỳ ngộ, tu luyện cả tiên pháp lẫn ma đạo, mở ra con đường chưa ai dám đi.',
'https://i.pinimg.com/736x/1a/2b/3c/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg', 2, 0, 1240, 'published'),
-- Tác giả Mai (id=6)
('Hoa Nhân Mộng', 'Câu chuyện tình yêu xuyên không đầy nước mắt và nụ cười giữa hai thế giới.',
'https://i.pinimg.com/736x/9e/8d/7c/9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b.jpg', 6, 150, 2100, 'published'),
('Cung Tâm Kế', 'Nàng bị hãm hại, xuyên không vào thân phận phi tần thấp kém, quyết tâm lật ngược cục diện.',
'https://i.pinimg.com/736x/ab/cd/ef/abcdef1234567890abcdef1234567890.jpg', 6, 0, 560, 'published'),
-- Tác giả Đức (id=7)
('Hệ Thống Vô Địch', 'Nhận được hệ thống vô địch từ tương lai, anh chàng tầm thường bỗng chốc trở thành người giỏi nhất.',
'https://i.pinimg.com/736x/11/22/33/112233445566778899aabbccddeeff00.jpg', 7, 100, 430, 'published'),
('Đô Thị Cao Thủ', 'Cao thủ ẩn dật trở về thành phố, đối mặt với âm mưu của các thế lực ngầm.',
'https://i.pinimg.com/736x/aa/bb/cc/aabbccddeeff00112233445566778899.jpg', 7, 0, 180, 'pending');

-- story_categories cho truyện mới (id 4–9)
INSERT INTO story_categories (story_id, category_id) VALUES
(4, 1), (4, 4),   -- Võ Luyện Đỉnh Phong: Tiên Hiệp + Hệ Thống
(5, 1), (5, 6),   -- Tiên Ma Đồng Tu: Tiên Hiệp + Huyền Huyễn
(6, 3), (6, 8),   -- Hoa Nhân Mộng: Ngôn Tình + Lịch Sử
(7, 3), (7, 8),   -- Cung Tâm Kế: Ngôn Tình + Lịch Sử
(8, 4), (8, 7),   -- Hệ Thống Vô Địch: Hệ Thống + Đô Thị
(9, 7);            -- Đô Thị Cao Thủ: Đô Thị

-- Thêm chương cho truyện mới
INSERT INTO chapters (story_id, chapter_number, title, content, views) VALUES
-- Võ Luyện Đỉnh Phong (story 4)
(4, 1, 'Hệ thống thức tỉnh',
'Trong một buổi sáng bình thường, Vương Hạo đang tập luyện tại sân thì đột nhiên một luồng ánh sáng xanh xuất hiện trước mắt.

[Hệ thống Võ Học Tối Thượng đã kích hoạt!]
[Chào mừng chủ nhân đến với con đường vô địch!]

Hắn dụi mắt không tin vào những gì đang thấy. Đây là... hệ thống?

Tay run run, Hắn mở bảng thông số của mình. Chỉ số yếu ớt đến thảm hại — sức mạnh 10, tốc độ 8, thể lực 12.

"Bắt đầu từ con số 0 à..." — Hắn thở dài nhưng ánh mắt lại sáng lên. — "Vậy thì ta sẽ luyện từ đầu!"

Lần đầu tiên trong đời, Vương Hạo cảm thấy con đường phía trước rõ ràng đến vậy.', 320),

(4, 2, 'Luyện tập điên cuồng',
'Ba tháng trôi qua như một giấc mộng.

Vương Hạo luyện tập không ngừng nghỉ, từ bình minh đến hoàng hôn. Cơ thể đau nhức đến mức không thể cử động, nhưng hắn không cho phép bản thân dừng lại.

[Chúc mừng! Cấp độ tăng lên 15!]
[Sức mạnh: 89 | Tốc độ: 76 | Thể lực: 94]

Kết quả không phụ người có công. Hắn bây giờ đã có thể một tay vỡ đá tảng, chạy nhanh hơn cả xe máy.

Nhưng điều khiến hắn kinh ngạc hơn là tin tức từ hệ thống — một nhiệm vụ đặc biệt đã mở ra.

[Nhiệm vụ: Đánh bại Đại Sư Huyền Long trong vòng 1 tháng]
[Phần thưởng: Kỹ năng Bạo Phong Thần Quyền]

Vương Hạo ngẩng đầu nhìn về phía ngôi chùa cổ trên núi cao. Đại Sư Huyền Long — cao thủ số một vùng này.

"Được thôi, cứ thử xem sao."', 180),

(4, 3, 'Đối đầu cao thủ',
'Ngôi chùa cổ im lìm trong sương sớm.

Vương Hạo bước vào sân chùa, gặp một ông lão tóc bạc đang quét lá. Trông bề ngoài hiền lành, nhưng hắn cảm nhận được khí tức mạnh mẽ ẩn giấu bên trong.

"Đại Sư, vãn bối muốn xin cầu chiến."

Ông lão chậm rãi đặt chổi xuống, quay lại nhìn Vương Hạo. Ánh mắt như xuyên thấu tâm can.

"Ngươi... đã đạt cảnh giới này ở tuổi đôi mươi?" — Lão nhíu mày. — "Thú vị."

Trận chiến nổ ra. Vương Hạo dốc toàn lực, nhưng Huyền Long vẫn bình thản đối phó với một ngón tay.

Cuối cùng, khi Vương Hạo nằm sõng soài trên mặt đất, lão mỉm cười lần đầu tiên.

"Đến đây học võ cùng lão đi, cậu bé."', 95),

-- Hoa Nhân Mộng (story 6)
(6, 1, 'Xuyên không',
'Tiếng còi xe ô tô, ánh đèn pha chói mắt.

Lâm Hy không kịp phản ứng. Rồi tất cả chìm vào bóng tối.

Khi tỉnh lại, nàng thấy mình đang nằm trên giường gỗ sơn son, xung quanh là bốn bức tường đỏ thắm, ánh nến lung linh.

"Tiểu thư đã tỉnh rồi!" — Một cô hầu nhỏ reo lên mừng rỡ.

Lâm Hy ngồi dậy, nhìn đôi bàn tay mảnh mai trong suốt như ngọc. Đây không phải tay mình.

Ký ức của thân xác này ùa về — Lâm Tiểu Hy, con gái thứ ba của Lâm Thừa Tướng, vừa bị hôn phu phụ bạc, đau lòng mà chết.

"Xuyên không à..." — Nàng thở dài. — "Thôi được, sống tiếp vậy."

Chỉ là nàng chưa biết rằng, người đàn ông nàng sắp gặp sẽ thay đổi tất cả.', 780),

(6, 2, 'Gặp gỡ định mệnh',
'Vườn hoa sau phủ Thừa Tướng rực rỡ trong ánh chiều tà.

Lâm Hy đang ngồi đọc sách thì nghe tiếng bước chân lạ. Ngẩng đầu lên, nàng giật mình.

Trước mặt nàng là một người đàn ông mặc bào phục màu trắng, diện mạo tuấn tú đến mức phi phàm. Nhưng trong đôi mắt ấy lại ẩn chứa nỗi lạnh lùng sâu thẳm.

"Ngươi là..." — Nàng chưa kịp nói hết.

"Tứ hoàng tử Tiêu Nguyên." — Người đó tự giới thiệu, ánh mắt không rời khuôn mặt nàng. — "Trẫm... à, ta đến tìm Lâm Thừa Tướng."

Lâm Hy nhíu mày. Hoàng tử? Sao lại tự đến không báo trước?

Và tại sao ánh mắt hắn lại nhìn nàng như vậy — như thể đang nhìn một bóng ma từ quá khứ.', 540),

-- Hệ Thống Vô Địch (story 8)
(8, 1, 'Hệ thống từ tương lai',
'Ngày tệ nhất trong cuộc đời Minh Quân bắt đầu bằng việc bị đuổi việc lúc 9 giờ sáng.

Xách túi ra khỏi công ty, hắn ngồi bệt xuống vỉa hè, nhìn dòng người qua lại.

"Tôi đã làm gì sai..." — Hắn lẩm bẩm.

Bỗng điện thoại rung lên. Một tin nhắn lạ từ số không xác định:

[Kích hoạt hệ thống thành công. Chào mừng người dùng #0001]
[Bạn đã được chọn để thay đổi lịch sử.]

Minh Quân nhìn màn hình, tưởng mình đang mơ. Nhưng khi giao diện hologram hiện ra ngay trước mắt — thực tế hơn bất cứ thứ gì hắn từng thấy — hắn hiểu rằng cuộc sống của mình vừa rẽ sang một ngã khác.

[Nhiệm vụ đầu tiên: Kiếm 1 triệu đồng trong 24 giờ]
[Phần thưởng: Kỹ năng Đầu Tư Thiên Tài]

Minh Quân cười khẩy. Thách thức à? Được thôi.', 210),

-- Tiếu Ngạo Giang Hồ thêm chương (story 2)
(2, 2, 'Nhậu tiên tửu',
'Lệnh Hồ Xung lang thang đến một quán rượu nhỏ ven đường.

Quán vắng, chỉ có một ông lão ngồi một mình với bình rượu. Mùi rượu thơm lừng, khác hẳn loại rượu tầm thường.

"Lão tiền bối, rượu gì mà thơm vậy?"

Ông lão ngẩng đầu, mắt mờ đục nhưng ánh nhìn sắc bén. "Tiên tửu. Ngươi có muốn uống không?"

Lệnh Hồ Xung không do dự, ngồi xuống. Cuộc gặp gỡ tưởng chừng ngẫu nhiên này lại là khởi đầu cho một nhân duyên định mệnh.

Ông lão chính là Phong Thanh Dương — cao thủ ẩn dật đệ nhất thiên hạ, người sẽ truyền thụ Độc Cô Cửu Kiếm cho hắn.', 290);

-- Lượt xem cũ cho truyện 1, 2, 3
UPDATE stories SET views = 1250 WHERE id = 1;
UPDATE stories SET views = 890 WHERE id = 2;
UPDATE stories SET views = 45 WHERE id = 3;

-- Thư viện
INSERT INTO library (user_id, story_id) VALUES
(3, 1), (3, 2), (3, 4), (3, 6),
(4, 1), (4, 4),
(5, 4), (5, 6), (5, 8),
(8, 6), (8, 7),
(9, 1), (9, 4),
(10, 6), (10, 8),
(11, 4), (11, 5),
(12, 6);

-- Purchased stories (truyện trả phí)
-- story 4: price_xu=200, story 6: price_xu=150, story 8: price_xu=100
INSERT INTO purchased_stories (user_id, story_id) VALUES
(3, 4), (3, 6),
(4, 4),
(5, 6), (5, 8),
(8, 4),
(9, 6),
(10, 4), (10, 8),
(11, 6);

-- Bookmarks
INSERT INTO bookmarks (user_id, chapter_id, scroll_position) VALUES
(3, 2, 150), (3, 8, 320),
(4, 1, 500), (4, 8, 180),
(5, 8, 600), (5, 10, 200),
(8, 10, 450);

-- Bình luận & đánh giá
INSERT INTO comments_reviews (user_id, story_id, content, rating) VALUES
(3, 1, 'Truyện hay quá, mong tác giả ra chương nhanh!', 5),
(4, 1, 'Cốt truyện hơi chậm nhưng lôi cuốn.', 4),
(3, 4, 'Hệ thống xây dựng rất hay, nhân vật có chiều sâu!', 5),
(5, 4, 'Đọc không thể dừng được, chờ chương mới mỏi cổ.', 5),
(8, 4, 'Khá hay nhưng đôi chỗ hơi cliché.', 3),
(3, 6, 'Nước mắt chảy dài từ chương 1 luôn ạ, quá hay!', 5),
(9, 6, 'Tác giả viết cảm xúc rất chân thật.', 4),
(10, 6, 'Plot twist ở chương 2 không ngờ được, xuất sắc!', 5),
(5, 8, 'Vui và hài hước, đọc giải trí rất tốt.', 4),
(11, 8, 'Nhẹ nhàng dễ đọc, phù hợp đọc trước khi ngủ.', 4),
(4, 2, 'Kim Dung viết hay không ai bằng.', 5),
(3, 2, 'Classic không bao giờ lỗi thời.', 5);

-- Lịch sử rút tiền (tác giả Lâm id=2, Mai id=6, Đức id=7)
INSERT INTO withdraw_requests (user_id, amount_xu, amount_vnd, bank_name, bank_account, bank_owner, status, created_at) VALUES
(2, 500, 500000, 'Vietcombank', '1234567890', 'Lâm Tác Giả', 'approved', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 300, 300000, 'Vietcombank', '1234567890', 'Lâm Tác Giả', 'approved', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 200, 200000, 'Vietcombank', '1234567890', 'Lâm Tác Giả', 'pending', NOW()),
(6, 800, 800000, 'Techcombank', '0987654321', 'Nguyễn Mai', 'approved', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6, 400, 400000, 'Techcombank', '0987654321', 'Nguyễn Mai', 'pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 150, 150000, 'MB Bank', '1122334455', 'Trần Đức Văn', 'rejected', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Thông báo mẫu
INSERT INTO notifications (user_id, type, message) VALUES
(2, 'story_approved', 'Truyện "Võ Luyện Đỉnh Phong" của bạn đã được duyệt và phát hành!'),
(2, 'withdraw_approved', 'Yêu cầu rút 500 xu (500.000đ) đã được chuyển khoản thành công.'),
(6, 'story_approved', 'Truyện "Hoa Nhân Mộng" của bạn đã được duyệt và phát hành!'),
(6, 'withdraw_approved', 'Yêu cầu rút 800 xu (800.000đ) đã được chuyển khoản thành công.'),
(7, 'withdraw_rejected', 'Yêu cầu rút 150 xu đã bị từ chối. Xu đã được hoàn lại.'),
(3, 'author_approved', 'Chào mừng bạn trở thành tác giả!'),
(4, 'author_approved', 'Tài khoản VIP của bạn đã được kích hoạt!');
