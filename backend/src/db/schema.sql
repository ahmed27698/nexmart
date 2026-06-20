-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  brand VARCHAR(255),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  payment_method VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Seed categories
INSERT INTO categories (name, slug, image_url) VALUES
  ('Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
  ('Gaming', 'gaming', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400'),
  ('Clothing', 'clothing', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'),
  ('Books', 'books', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'),
  ('Home & Kitchen', 'home-kitchen', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
  ('Sports', 'sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400'),
  ('PS5 Games', 'ps5-games', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'),
  ('Toys', 'toys', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400')
ON CONFLICT (slug) DO NOTHING;

-- Always ensure PS5 Games uses the correct image (old photo-1607016284318 was 404)
UPDATE categories
SET image_url = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'
WHERE slug = 'ps5-games';

-- Seed products (only if products table is empty)
DO $$
DECLARE
  cat_electronics INTEGER;
  cat_gaming      INTEGER;
  cat_clothing    INTEGER;
  cat_books       INTEGER;
  cat_home        INTEGER;
  cat_sports      INTEGER;
  cat_ps5         INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM products) = 0 THEN
    SELECT id INTO cat_electronics FROM categories WHERE slug = 'electronics';
    SELECT id INTO cat_gaming      FROM categories WHERE slug = 'gaming';
    SELECT id INTO cat_clothing    FROM categories WHERE slug = 'clothing';
    SELECT id INTO cat_books       FROM categories WHERE slug = 'books';
    SELECT id INTO cat_home        FROM categories WHERE slug = 'home-kitchen';
    SELECT id INTO cat_sports      FROM categories WHERE slug = 'sports';
    SELECT id INTO cat_ps5         FROM categories WHERE slug = 'ps5-games';

    INSERT INTO products (name, description, price, original_price, stock, category_id, image_url, rating, review_count, is_featured, brand, tags) VALUES
    (
      'Sony WH-1000XM5 Wireless Headphones',
      'Industry-leading noise cancellation with 8 microphones and Auto NC Optimizer. Crystal-clear hands-free calling and up to 30-hour battery life with quick charging.',
      279.99, 349.99, 45, cat_electronics,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      4.8, 2847, true, 'Sony',
      ARRAY['headphones', 'wireless', 'noise-cancelling', 'audio']
    ),
    (
      'PS5 DualSense Edge Wireless Controller',
      'Ultra-customizable pro controller for PlayStation 5. Replaceable stick modules, remappable back buttons, adaptive triggers and immersive haptic feedback.',
      199.99, 249.99, 28, cat_gaming,
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80',
      4.7, 1563, true, 'Sony',
      ARRAY['controller', 'ps5', 'wireless', 'gaming', 'playstation']
    ),
    (
      'Nike Air Force 1 ''07 Sneakers',
      'The radically restyled, low-profile AF-1 brings you just what you need: durability and comfort with clean, classic style. Premium leather upper and Air cushioning.',
      110.00, 130.00, 120, cat_clothing,
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      4.6, 4291, true, 'Nike',
      ARRAY['sneakers', 'casual', 'leather', 'footwear']
    ),
    (
      'Clean Code: A Handbook of Agile Software',
      'Even bad code can function. But if code isn''t clean, it can bring a development organization to its knees. Robert C. Martin''s timeless handbook on writing clean, readable code.',
      35.99, 49.99, 200, cat_books,
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
      4.9, 3120, false, 'Prentice Hall',
      ARRAY['programming', 'software', 'agile', 'development']
    ),
    (
      'Instant Pot Duo 7-in-1 Pressure Cooker',
      'Replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and food warmer. 6 Qt capacity.',
      79.99, 99.99, 85, cat_home,
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      4.7, 18924, true, 'Instant Pot',
      ARRAY['kitchen', 'cooking', 'pressure-cooker', 'appliance']
    ),
    (
      'Bowflex SelectTech 552 Adjustable Dumbbells',
      'Replaces 15 sets of weights. Adjusts from 5 to 52.5 lbs with a simple turn of a dial. Ideal for 30+ different exercises. Space-saving design.',
      349.00, 429.00, 18, cat_sports,
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      4.8, 2104, false, 'Bowflex',
      ARRAY['dumbbells', 'fitness', 'adjustable', 'weights', 'gym']
    ),
    (
      'Elden Ring — PlayStation 5',
      'Rise, Tarnished. An open-world action RPG from FromSoftware and George R. R. Martin. Explore the Lands Between and forge your own legend in this breathtaking universe.',
      39.99, 69.99, 150, cat_ps5,
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80',
      4.9, 8856, true, 'FromSoftware',
      ARRAY['rpg', 'action', 'open-world', 'ps5', 'fromsoftware']
    );
  END IF;
END $$;
