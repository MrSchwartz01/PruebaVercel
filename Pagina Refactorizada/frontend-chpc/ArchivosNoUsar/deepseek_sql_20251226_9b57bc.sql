-- Insertar 25 productos tecnológicos populares
INSERT INTO productos (
  nombre_producto,
  descripcion,
  precio,
  stock,
  imagen_url,
  marca,
  color,
  erpId
) VALUES
-- 1-5: Smartphones
(
  'iPhone 15 Pro',
  'Smartphone Apple con chip A17 Pro, cámara triple de 48MP, Dynamic Island y USB-C',
  1199.99,
  45,
  'https://example.com/images/iphone15-pro.jpg',
  'Apple',
  'Titanio Natural',
  'PROD-APP-001'
),
(
  'Samsung Galaxy S24 Ultra',
  'Teléfono con pantalla Dynamic AMOLED 2X, S Pen integrado, cámara de 200MP y AI integrada',
  1299.99,
  38,
  'https://example.com/images/s24-ultra.jpg',
  'Samsung',
  'Titanio Negro',
  'PROD-SAM-001'
),
(
  'Google Pixel 8 Pro',
  'Smartphone con Tensor G3, cámara con zoom óptico 5x, temperatura corporal y 7 años de updates',
  999.00,
  52,
  'https://example.com/images/pixel8-pro.jpg',
  'Google',
  'Obsidiana',
  'PROD-GOO-001'
),
(
  'OnePlus 12',
  'Pantalla LTPO 120Hz, Snapdragon 8 Gen 3, carga rápida de 100W, cámara Hasselblad',
  799.99,
  67,
  'https://example.com/images/oneplus12.jpg',
  'OnePlus',
  'Verde Bosque',
  'PROD-ONE-001'
),
(
  'Xiaomi 14 Ultra',
  'Cámara Leica quad de 50MP, Snapdragon 8 Gen 3, batería de 5300mAh con carga 90W',
  1099.00,
  42,
  'https://example.com/images/xiaomi14-ultra.jpg',
  'Xiaomi',
  'Blanco',
  'PROD-XIA-001'
),

-- 6-10: Laptops
(
  'MacBook Pro 16" M3 Max',
  'Laptop profesional con chip M3 Max, 48GB RAM, SSD 1TB, pantalla Liquid Retina XDR',
  3499.00,
  22,
  'https://example.com/images/macbook-pro-16.jpg',
  'Apple',
  'Gris Espacial',
  'PROD-APP-002'
),
(
  'Dell XPS 15',
  'Laptop creativa con Intel Core i9, RTX 4070, pantalla OLED 3.5K InfinityEdge',
  2499.99,
  35,
  'https://example.com/images/dell-xps15.jpg',
  'Dell',
  'Plata',
  'PROD-DEL-001'
),
(
  'Microsoft Surface Laptop Studio 2',
  'Convertible con Intel Core i7, RTX 4060, pantalla táctil PixelSense Flow de 120Hz',
  2199.00,
  28,
  'https://example.com/images/surface-studio2.jpg',
  'Microsoft',
  'Platino',
  'PROD-MIC-001'
),
(
  'Asus ROG Zephyrus G16',
  'Gaming laptop con Intel Core Ultra 9, RTX 4090, pantalla Nebula HDR OLED 240Hz',
  2999.99,
  18,
  'https://example.com/images/rog-zephyrus.jpg',
  'Asus',
  'Luna Gris',
  'PROD-ASU-001'
),
(
  'Lenovo Yoga 9i',
  'Convertible 2-en-1 con Intel Core i7, pantalla OLED 4K, sonido Bowers & Wilkins',
  1799.00,
  41,
  'https://example.com/images/yoga9i.jpg',
  'Lenovo',
  'Peltre',
  'PROD-LEN-001'
),

-- 11-15: Tablets
(
  'iPad Pro 12.9" M2',
  'Tablet con chip M2, pantalla Liquid Retina XDR, compatible con Apple Pencil 2',
  1099.00,
  58,
  'https://example.com/images/ipad-pro.jpg',
  'Apple',
  'Gris Espacial',
  'PROD-APP-003'
),
(
  'Samsung Galaxy Tab S9 Ultra',
  'Tablet con Snapdragon 8 Gen 2, S Pen incluido, pantalla Dynamic AMOLED 2X 14.6"',
  1199.99,
  39,
  'https://example.com/images/tabs9-ultra.jpg',
  'Samsung',
  'Grafito',
  'PROD-SAM-002'
),
(
  'Microsoft Surface Pro 10',
  'Tablet convertible con Intel Core Ultra, Windows 11, compatible con Surface Pen',
  1299.00,
  33,
  'https://example.com/images/surface-pro10.jpg',
  'Microsoft',
  'Negro',
  'PROD-MIC-002'
),
(
  'Amazon Fire Max 11',
  'Tablet económica con pantalla de 11", 4GB RAM, soporte para lápiz opcional',
  229.99,
  120,
  'https://example.com/images/fire-max11.jpg',
  'Amazon',
  'Negro Pizarra',
  'PROD-AMA-001'
),
(
  'Xiaomi Pad 6 Max',
  'Tablet de 14" con Snapdragon 8+ Gen 1, pantalla LCD 120Hz, 10000mAh batería',
  599.00,
  47,
  'https://example.com/images/xiaomi-pad6max.jpg',
  'Xiaomi',
  'Negro',
  'PROD-XIA-002'
),

-- 16-20: Wearables
(
  'Apple Watch Ultra 2',
  'Reloj inteligente con doble GPS, resistencia 100m, batería de 36 horas',
  799.00,
  62,
  'https://example.com/images/watch-ultra2.jpg',
  'Apple',
  'Titanio',
  'PROD-APP-004'
),
(
  'Samsung Galaxy Watch 6 Classic',
  'Smartwatch con bisel rotatorio, Wear OS, monitorización de sueño avanzada',
  369.99,
  75,
  'https://example.com/images/watch6-classic.jpg',
  'Samsung',
  'Negro',
  'PROD-SAM-003'
),
(
  'Google Pixel Watch 2',
  'Reloj con Wear OS, Fitbit integrado, chip Snapdragon W5, 24h batería',
  349.99,
  68,
  'https://example.com/images/pixel-watch2.jpg',
  'Google',
  'Obsidiana',
  'PROD-GOO-002'
),
(
  'Fitbit Charge 6',
  'Monitor de actividad con GPS, ECG, Spotify control y 7 días de batería',
  159.95,
  110,
  'https://example.com/images/fitbit-charge6.jpg',
  'Fitbit',
  'Negro Grafito',
  'PROD-FIT-001'
),
(
  'Garmin Epix Pro (Gen 2)',
  'Reloj deportivo con pantalla AMOLED, mapas topográficos, batería de 16 días',
  899.99,
  29,
  'https://example.com/images/garmin-epix.jpg',
  'Garmin',
  'Carbono Gris',
  'PROD-GAR-001'
),

-- 21-25: Audio y Accesorios
(
  'AirPods Pro (2da Gen)',
  'Audífonos inalámbricos con cancelación activa de ruido, audio espacial y MagSafe',
  249.00,
  95,
  'https://example.com/images/airpods-pro2.jpg',
  'Apple',
  'Blanco',
  'PROD-APP-005'
),
(
  'Sony WH-1000XM5',
  'Audífonos over-ear con cancelación de ruido líder, 30h batería, 8 micrófonos',
  399.99,
  54,
  'https://example.com/images/sony-xm5.jpg',
  'Sony',
  'Negro',
  'PROD-SON-001'
),
(
  'Meta Quest 3',
  'Headset de realidad mixta con Snapdragon XR2 Gen 2, 2.5x más potente que Quest 2',
  499.99,
  36,
  'https://example.com/images/quest3.jpg',
  'Meta',
  'Blanco',
  'PROD-MET-001'
),
(
  'PlayStation Portal',
  'Dispositivo remoto para jugar PS5 en cualquier lugar, pantalla LCD 8" 60Hz',
  199.99,
  41,
  'https://example.com/images/ps-portal.jpg',
  'Sony',
  'Blanco',
  'PROD-SON-002'
),
(
  'Logitech MX Master 3S',
  'Mouse inalámbrico avanzado para productividad, sensor 8K DPI, 70 días batería',
  99.99,
  82,
  'https://example.com/images/mx-master3s.jpg',
  'Logitech',
  'Gris Pálido',
  'PROD-LOG-001'
),
(
  'Nintendo Switch OLED',
  'Consola híbrida con pantalla OLED 7", 64GB almacenamiento, dock con LAN',
  349.99,
  57,
  'https://example.com/images/switch-oled.jpg',
  'Nintendo',
  'Blanco',
  'PROD-NIN-001'
);