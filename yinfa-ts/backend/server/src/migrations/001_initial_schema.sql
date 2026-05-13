-- yinfa PostgreSQL 迁移脚本 v001
-- 从 SQL.js 迁移到 Railway PostgreSQL
-- 迁移前请确保 PostgreSQL 连接字符串已配置到环境变量 DATABASE_URL
--
-- 执行方式:
--   psql $DATABASE_URL -f 001_initial_schema.sql
--
-- 或者通过 Node.js 执行（推荐）:
--   npx ts-node -e "require('./migrate').run()"

BEGIN;

-- ============================================================
-- 分类表
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 商品表
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);

-- ============================================================
-- 用户表（微信小程序用户）
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    openid VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(255) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_openid ON user_profiles(openid);

-- ============================================================
-- 收货地址表
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) DEFAULT '',
    postal_code VARCHAR(20) DEFAULT '',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- ============================================================
-- 订单表
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    order_no VARCHAR(100) UNIQUE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    -- 微信支付相关字段
    transaction_id VARCHAR(255) DEFAULT NULL,
    pay_type VARCHAR(20) DEFAULT NULL,
    paid_at TIMESTAMP DEFAULT NULL,
    -- 订单扩展
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================
-- 订单明细表
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================
-- 紧急联系人表
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    relationship VARCHAR(100) DEFAULT '',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);

-- ============================================================
-- 健康记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS health_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    blood_pressure VARCHAR(50) DEFAULT '',
    heart_rate VARCHAR(50) DEFAULT '',
    notes TEXT DEFAULT '',
    record_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_record_date ON health_records(record_date);

-- ============================================================
-- 购物车表
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- ============================================================
-- 微信支付回调记录表（支付流水）
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_callbacks (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(100) UNIQUE NOT NULL,
    transaction_id VARCHAR(255),
    bank_type VARCHAR(50) DEFAULT '',
    total_fee INTEGER DEFAULT 0,          -- 单位：分
    cash_fee INTEGER DEFAULT 0,
    coupon_fee INTEGER DEFAULT 0,
    fee_type VARCHAR(20) DEFAULT 'CNY',
    openid VARCHAR(255) DEFAULT '',
    result_code VARCHAR(50) DEFAULT '',
    return_code VARCHAR(50) DEFAULT '',
    raw_response JSONB DEFAULT '{}',
    processed_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_callbacks_order_no ON payment_callbacks(order_no);
CREATE INDEX idx_payment_callbacks_transaction_id ON payment_callbacks(transaction_id);

-- ============================================================
-- 触发器：自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 初始化示例数据（来自 insertSampleData）
-- ============================================================
INSERT INTO categories (name, slug, sort_order) VALUES
    ('漓江景点', 'scenic', 1),
    ('酒店住宿', 'hotels', 2),
    ('桂林美食', 'food', 3),
    ('旅游线路', 'tours', 4),
    ('桂林特产', 'souvenirs', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES
    (1, '漓江精华游船票', '乘船游览漓江精华段，欣赏黄布倒影、九马画山等经典景观，全程约4小时', 215.00, 200, '/image/b1.jpg', TRUE),
    (1, '象鼻山公园门票', '桂林城徽象鼻山，山形酷似大象饮水，适合老年游客漫步游览，约2小时', 55.00, 300, '/image/b2.jpg', TRUE),
    (1, '阳朔西街自由行', '中西文化交融的古街，石板路两侧店铺林立，可品尝地道桂林美食', 0.00, 999, '/image/b3.jpg', TRUE),
    (1, '龙脊梯田观光', '壮观的梯田景观，建议青壮年游客前往，老年人请量力而行', 180.00, 150, '/image/b1.jpg', TRUE),
    (1, '两江四湖夜游船', '乘船夜游桂林市区水系，灯光璀璨，适合全家出行，约2.5小时', 220.00, 100, '/image/b2.jpg', TRUE),
    (1, '芦笛岩溶洞', '著名溶洞景观，钟乳石千姿百态，洞内恒温约20°C，雨天游览好去处', 90.00, 180, '/image/b3.jpg', TRUE),
    (1, '杨堤码头竹筏漂流', '漓江精华段起点，乘竹筏漂流至九马画山，欣赏两岸如画美景，约2小时', 160.00, 120, '/image/b1.jpg', TRUE),
    (2, '桂林漓江大瀑布酒店', '五星级景观酒店，毗邻两江四湖，提供老年人专属无障碍房间', 680.00, 50, '/image/b2.jpg', TRUE),
    (2, '阳朔悦榕庄', '高端度假酒店，环境清幽，适合静养休闲', 1200.00, 30, '/image/b3.jpg', TRUE),
    (3, '桂林米粉体验套餐', '正宗桂林米粉+锅烧+卤牛肉，配一碗大骨汤', 38.00, 500, '/image/food-icon.webp', TRUE),
    (3, '啤酒鱼套餐', '阳朔名菜，漓江鲜鱼配啤酒烹制，鱼肉鲜嫩', 88.00, 100, '/image/b1.jpg', TRUE),
    (4, '桂林阳朔三日游', '含漓江游船+阳朔西街+龙脊梯田，全程导游陪同，适合老年团', 799.00, 60, '/image/b1.jpg', TRUE),
    (5, '桂林山水画扇', '手工绘制漓江风景折扇，精美雅致', 68.00, 500, '/image/b2.jpg', TRUE)
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================
-- 迁移验证查询
-- ============================================================
-- SELECT 'categories' as table_name, COUNT(*) as count FROM categories
-- UNION ALL SELECT 'products', COUNT(*) FROM products
-- UNION ALL SELECT 'orders', COUNT(*) FROM orders
-- UNION ALL SELECT 'user_profiles', COUNT(*) FROM user_profiles;
