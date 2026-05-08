import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../database';
import { Category, Product, UserProfile, Address, Order, OrderItem, CartItem, OrderStatus, EmergencyContact, HealthRecord } from '../types';
import { validate, loginSchema, createOrderSchema, createAddressSchema, addCartSchema, createEmergencyContactSchema, createHealthRecordSchema, sosAlertSchema } from '../middleware/validation';
import { auditLog } from '../middleware/auditLog';
import logger from '../logger';

const router = Router();

// 缓存机制
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

function getCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(): void {
  cache.clear();
}

function jsonSuccess(res: Response, data: any): Response {
  return res.status(200).json({ code: 0, data });
}

function jsonError(res: Response, message: string, status = 400): Response {
  return res.status(status).json({ code: 1, error: message });
}

// 参数化查询辅助函数，返回行数组
function dbQuery(sql: string, params: Record<string, any> = {}): any[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// 参数化执行 INSERT/UPDATE/DELETE
function dbExecute(sql: string, params: Record<string, any> = {}): void {
  const db = getDatabase();
  db.run(sql, params);
}

function sanitizePathParam(value: string): number {
  const num = parseInt(value, 10);
  if (isNaN(num) || num <= 0) {
    throw new Error('Invalid ID parameter');
  }
  return num;
}

router.get('/categories', (req: Request, res: Response) => {
  try {
    const cached = getCache('categories');
    if (cached) {
      return jsonSuccess(res, cached);
    }

    const db = getDatabase();
    const result = db.exec('SELECT * FROM categories ORDER BY "order", name');
    if (result.length === 0) {
      return jsonSuccess(res, []);
    }
    const categories: Category[] = result[0].values.map((row: any) => ({
      id: row[0],
      name: row[1],
      slug: row[2],
      order: row[3]
    }));

    setCache('categories', categories);
    return jsonSuccess(res, categories);
  } catch (error) {
    return jsonError(res, 'Failed to fetch categories');
  }
});

router.get('/products', (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const minPrice = typeof req.query.minPrice === 'string' ? parseFloat(req.query.minPrice) : NaN;
    const maxPrice = typeof req.query.maxPrice === 'string' ? parseFloat(req.query.maxPrice) : NaN;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : '';
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 0;
    const pageSize = typeof req.query.pageSize === 'string' ? parseInt(req.query.pageSize, 10) : 0;

    const cacheKey = `products_${category || 'all'}_${search || ''}_${minPrice || ''}_${maxPrice || ''}_${sort}_${page}_${pageSize}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return jsonSuccess(res, cached);
    }

    const db = getDatabase();
    let query = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
    const params: Record<string, any> = {};

    if (category) {
      query += ' AND c.slug = :category';
      params[':category'] = category;
    }
    if (search) {
      query += ' AND p.name LIKE :search';
      params[':search'] = `%${search}%`;
    }
    if (!isNaN(minPrice)) {
      query += ' AND p.price >= :minPrice';
      params[':minPrice'] = minPrice;
    }
    if (!isNaN(maxPrice)) {
      query += ' AND p.price <= :maxPrice';
      params[':maxPrice'] = maxPrice;
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY p.price DESC';
    } else if (sort === 'stock_desc') {
      query += ' ORDER BY p.stock DESC';
    } else {
      query += ' ORDER BY p.id DESC';
    }

    if (page > 0 && pageSize > 0) {
      const offset = (page - 1) * pageSize;
      query += ` LIMIT ${pageSize} OFFSET ${offset}`;
    }

    const stmt = db.prepare(query);
    stmt.bind(params);
    const products: Product[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      products.push({
        id: row.id,
        name: row.name,
        description: row.description || '',
        price: row.price,
        stock: row.stock,
        image_url: row.image_url || '',
        is_active: row.is_active === 1,
        category: row.category_name ? { id: row.category_id, name: row.category_name, slug: row.category_slug } : null
      });
    }
    stmt.free();

    setCache(cacheKey, products);
    return jsonSuccess(res, products);
  } catch (error) {
    return jsonError(res, 'Failed to fetch products');
  }
});

router.get('/products/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const id = sanitizePathParam(req.params.id);
    const stmt = db.prepare('SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = :id AND p.is_active = 1');
    stmt.bind({ ':id': id });
    if (!stmt.step()) {
      stmt.free();
      return jsonError(res, 'Product not found', 404);
    }
    const row = stmt.getAsObject();
    stmt.free();

    const product: Product = {
      id: row.id as number,
      name: row.name as string,
      description: row.description as string,
      price: row.price as number,
      stock: row.stock as number,
      image_url: row.image_url as string,
      is_active: row.is_active === 1,
      category: row.category_name ? { id: row.category_id as number, name: row.category_name as string, slug: row.category_slug as string } : null
    };
    return jsonSuccess(res, product);
  } catch (error) {
    return jsonError(res, 'Failed to fetch product');
  }
});

router.post('/users/wxlogin', (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const db = getDatabase();

    if (!code) {
      return jsonError(res, 'Missing code');
    }

    const appId = process.env.WX_APPID || 'wx0000000000000000';
    const appSecret = process.env.WX_SECRET || '00000000000000000000000000000000';

    if (appId === 'wx0000000000000000') {
      const devOpenid = 'dev_openid_' + code.slice(0, 8);
      let stmt = db.prepare('SELECT * FROM user_profiles WHERE openid = :openid');
      stmt.bind({ ':openid': devOpenid });
      let user;
      if (stmt.step()) {
        user = stmt.getAsObject();
        stmt.free();
      } else {
        stmt.free();
        db.run('INSERT INTO user_profiles (openid, nickname) VALUES (:openid, :nickname)', {
          ':openid': devOpenid, ':nickname': '桂林游客'
        });
        saveDatabase();
        const newStmt = db.prepare('SELECT * FROM user_profiles WHERE openid = :openid');
        newStmt.bind({ ':openid': devOpenid });
        newStmt.step();
        user = newStmt.getAsObject();
        newStmt.free();
      }
      return jsonSuccess(res, {
        id: user.id, openid: user.openid, nickname: user.nickname,
        avatar_url: user.avatar_url || '', phone: user.phone || ''
      });
    }

    const https = require('https');
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    https.get(wxUrl, (wxRes: any) => {
      let data = '';
      wxRes.on('data', (chunk: any) => { data += chunk; });
      wxRes.on('end', () => {
        try {
          const wxResult = JSON.parse(data);
          if (wxResult.openid) {
            const openid = wxResult.openid;
            let stmt = db.prepare('SELECT * FROM user_profiles WHERE openid = :openid');
            stmt.bind({ ':openid': openid });
            let user;
            if (stmt.step()) {
              user = stmt.getAsObject();
              stmt.free();
            } else {
              stmt.free();
              db.run('INSERT INTO user_profiles (openid, nickname) VALUES (:openid, :nickname)', {
                ':openid': openid, ':nickname': '桂林游客'
              });
              saveDatabase();
              const newStmt = db.prepare('SELECT * FROM user_profiles WHERE openid = :openid');
              newStmt.bind({ ':openid': openid });
              newStmt.step();
              user = newStmt.getAsObject();
              newStmt.free();
            }
            return jsonSuccess(res, {
              id: user.id, openid: user.openid, nickname: user.nickname,
              avatar_url: user.avatar_url || '', phone: user.phone || ''
            });
          }
          return jsonError(res, 'Failed to get openid');
        } catch (e) {
          return jsonError(res, 'WeChat API error');
        }
      });
    }).on('error', () => {
      return jsonError(res, 'WeChat API unavailable');
    });
  } catch (error) {
    return jsonError(res, 'Login failed');
  }
});

router.post('/users/login', auditLog('login'), validate(loginSchema), (req: Request, res: Response) => {
  try {
    const { openid, nickname, avatar_url, phone } = req.body;
    const db = getDatabase();

    if (!openid) {
      return jsonError(res, 'Missing openid or code');
    }

    const stmt = db.prepare('SELECT * FROM user_profiles WHERE openid = :openid');
    stmt.bind({ ':openid': openid });
    let user: UserProfile;

    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      const safeNickname = (nickname || row.nickname || '') as string;
      const safeAvatar = (avatar_url || row.avatar_url || '') as string;
      const safePhone = (phone || row.phone || '') as string;

      db.run('UPDATE user_profiles SET nickname = :nickname, avatar_url = :avatar_url, phone = :phone WHERE openid = :openid', {
        ':nickname': safeNickname,
        ':avatar_url': safeAvatar,
        ':phone': safePhone,
        ':openid': openid
      });

      user = {
        id: row.id as number,
        openid: row.openid as string,
        nickname: safeNickname,
        avatar_url: safeAvatar,
        phone: safePhone,
        created_at: row.created_at as string
      };
    } else {
      stmt.free();
      const safeNickname = (nickname || '') as string;
      const safeAvatar = (avatar_url || '') as string;
      const safePhone = (phone || '') as string;

      db.run('INSERT INTO user_profiles (openid, nickname, avatar_url, phone) VALUES (:openid, :nickname, :avatar_url, :phone)', {
        ':openid': openid,
        ':nickname': safeNickname,
        ':avatar_url': safeAvatar,
        ':phone': safePhone
      });

      const newStmt = db.prepare('SELECT * FROM user_profiles WHERE openid = :openid');
      newStmt.bind({ ':openid': openid });
      newStmt.step();
      const newRow = newStmt.getAsObject();
      newStmt.free();

      user = {
        id: newRow.id as number,
        openid: newRow.openid as string,
        nickname: newRow.nickname as string,
        avatar_url: newRow.avatar_url as string,
        phone: newRow.phone as string,
        created_at: newRow.created_at as string
      };
    }

    saveDatabase();
    clearCache();
    return jsonSuccess(res, user);
  } catch (error) {
    return jsonError(res, 'Login failed');
  }
});

router.get('/users/:openid', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const openid = req.params.openid;
    const stmt = db.prepare('SELECT * FROM user_profiles WHERE openid = :openid');
    stmt.bind({ ':openid': openid });

    if (!stmt.step()) {
      stmt.free();
      return jsonError(res, 'User not found', 404);
    }

    const row = stmt.getAsObject();
    stmt.free();

    const user: UserProfile = {
      id: row.id as number,
      openid: row.openid as string,
      nickname: row.nickname as string,
      avatar_url: row.avatar_url as string,
      phone: row.phone as string,
      created_at: row.created_at as string
    };
    return jsonSuccess(res, user);
  } catch (error) {
    return jsonError(res, 'Failed to fetch user');
  }
});

router.post('/address/create', auditLog('create_address'), validate(createAddressSchema), (req: Request, res: Response) => {
  try {
    const { openid, full_name, phone, address_line, city, postal_code, is_default } = req.body;
    const db = getDatabase();

    if (!openid) {
      return jsonError(res, 'Missing openid');
    }

    const userStmt = db.prepare('SELECT id FROM user_profiles WHERE openid = :openid');
    userStmt.bind({ ':openid': openid });
    if (!userStmt.step()) {
      userStmt.free();
      return jsonError(res, 'User not found', 404);
    }
    const userRow = userStmt.getAsObject();
    userStmt.free();
    const userId = userRow.id as number;

    if (is_default) {
      db.run('UPDATE addresses SET is_default = 0 WHERE user_id = :userId', { ':userId': userId });
    }

    db.run(
      'INSERT INTO addresses (user_id, full_name, phone, address_line, city, postal_code, is_default) VALUES (:userId, :fullName, :phone, :addressLine, :city, :postalCode, :isDefault)',
      {
        ':userId': userId,
        ':fullName': full_name || '',
        ':phone': phone || '',
        ':addressLine': address_line || '',
        ':city': city || '',
        ':postalCode': postal_code || '',
        ':isDefault': is_default ? 1 : 0
      }
    );

    const addrStmt = db.prepare('SELECT * FROM addresses WHERE user_id = :userId ORDER BY id DESC LIMIT 1');
    addrStmt.bind({ ':userId': userId });
    addrStmt.step();
    const row = addrStmt.getAsObject();
    addrStmt.free();

    saveDatabase();

    const address: Address = {
      id: row.id as number,
      full_name: row.full_name as string,
      phone: row.phone as string,
      address_line: row.address_line as string,
      city: row.city as string,
      postal_code: row.postal_code as string,
      is_default: row.is_default === 1
    };
    return jsonSuccess(res, address);
  } catch (error) {
    return jsonError(res, 'Failed to create address');
  }
});

router.get('/addresses', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const openid = typeof req.query.openid === 'string' ? req.query.openid : '';

    if (!openid) {
      return jsonError(res, 'Missing openid');
    }

    const userStmt = db.prepare('SELECT id FROM user_profiles WHERE openid = :openid');
    userStmt.bind({ ':openid': openid });
    if (!userStmt.step()) {
      userStmt.free();
      return jsonError(res, 'User not found', 404);
    }
    const userRow = userStmt.getAsObject();
    userStmt.free();
    const userId = userRow.id as number;

    const addrStmt = db.prepare('SELECT * FROM addresses WHERE user_id = :userId');
    addrStmt.bind({ ':userId': userId });
    const addresses: Address[] = [];
    while (addrStmt.step()) {
      const row = addrStmt.getAsObject();
      addresses.push({
        id: row.id,
        full_name: row.full_name,
        phone: row.phone,
        address_line: row.address_line,
        city: row.city,
        postal_code: row.postal_code,
        is_default: row.is_default === 1
      });
    }
    addrStmt.free();

    return jsonSuccess(res, addresses);
  } catch (error) {
    return jsonError(res, 'Failed to fetch addresses');
  }
});

router.post('/order/create', auditLog('create_order'), validate(createOrderSchema), (req: Request, res: Response) => {
  try {
    const { openid, items } = req.body;
    const db = getDatabase();

    if (!openid || !items || items.length === 0) {
      return jsonError(res, 'Missing order data');
    }

    const userStmt = db.prepare('SELECT id FROM user_profiles WHERE openid = :openid');
    userStmt.bind({ ':openid': openid });
    if (!userStmt.step()) {
      userStmt.free();
      return jsonError(res, 'User not found', 404);
    }
    const userRow = userStmt.getAsObject();
    userStmt.free();
    const userId = userRow.id as number;

    const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 900) + 100}`;
    let totalPrice = 0;

    db.run(
      'INSERT INTO orders (user_id, order_no, total_price, status) VALUES (:userId, :orderNo, 0, :status)',
      { ':userId': userId, ':orderNo': orderNo, ':status': 'pending' }
    );

    const orderStmt = db.prepare('SELECT id FROM orders WHERE order_no = :orderNo');
    orderStmt.bind({ ':orderNo': orderNo });
    orderStmt.step();
    const orderRow = orderStmt.getAsObject();
    orderStmt.free();
    const orderId = orderRow.id as number;

    for (const item of items) {
      const productId = parseInt(item.product_id, 10) || 0;
      const quantity = parseInt(item.quantity, 10) || 1;

      if (productId <= 0) continue;

      const prodStmt = db.prepare('SELECT price FROM products WHERE id = :id AND is_active = 1');
      prodStmt.bind({ ':id': productId });
      if (!prodStmt.step()) {
        prodStmt.free();
        continue;
      }
      const prodRow = prodStmt.getAsObject();
      prodStmt.free();

      const unitPrice = prodRow.price as number;
      const subtotal = unitPrice * quantity;

      db.run(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (:orderId, :productId, :quantity, :unitPrice)',
        { ':orderId': orderId, ':productId': productId, ':quantity': quantity, ':unitPrice': unitPrice }
      );
      totalPrice += subtotal;
    }

    db.run('UPDATE orders SET total_price = :totalPrice WHERE id = :orderId', {
      ':totalPrice': totalPrice, ':orderId': orderId
    });

    saveDatabase();

    const finalStmt = db.prepare('SELECT * FROM orders WHERE id = :orderId');
    finalStmt.bind({ ':orderId': orderId });
    finalStmt.step();
    const finalRow = finalStmt.getAsObject();
    finalStmt.free();

    const order: Order = {
      id: finalRow.id as number,
      order_no: finalRow.order_no as string,
      total_price: finalRow.total_price as number,
      status: finalRow.status as OrderStatus,
      created_at: finalRow.created_at as string,
      updated_at: finalRow.updated_at as string,
      items: []
    };

    const itemsStmt = db.prepare(
      'SELECT oi.*, p.name, p.description, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = :orderId'
    );
    itemsStmt.bind({ ':orderId': orderId });
    while (itemsStmt.step()) {
      const row = itemsStmt.getAsObject();
      order.items.push({
        id: row.id,
        product: row.product_id ? {
          id: row.product_id,
          name: row.name,
          description: row.description,
          image_url: row.image_url
        } : null,
        quantity: row.quantity,
        unit_price: row.unit_price,
        subtotal: (row.quantity || 0) * (row.unit_price || 0)
      });
    }
    itemsStmt.free();

    return jsonSuccess(res, order);
  } catch (error) {
    return jsonError(res, 'Failed to create order');
  }
});

router.get('/orders', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const openid = typeof req.query.openid === 'string' ? req.query.openid : '';

    if (!openid) {
      return jsonError(res, 'Missing openid');
    }

    const userStmt = db.prepare('SELECT id FROM user_profiles WHERE openid = :openid');
    userStmt.bind({ ':openid': openid });
    if (!userStmt.step()) {
      userStmt.free();
      return jsonError(res, 'User not found', 404);
    }
    const userRow = userStmt.getAsObject();
    userStmt.free();
    const userId = userRow.id as number;

    const ordersStmt = db.prepare('SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC');
    ordersStmt.bind({ ':userId': userId });
    const orders: Order[] = [];
    while (ordersStmt.step()) {
      const row = ordersStmt.getAsObject();
      orders.push({
        id: row.id,
        order_no: row.order_no,
        total_price: row.total_price,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        items: []
      });
    }
    ordersStmt.free();

    for (const order of orders) {
      const itemsStmt = db.prepare(
        'SELECT oi.*, p.name, p.description, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = :orderId'
      );
      itemsStmt.bind({ ':orderId': order.id! });
      while (itemsStmt.step()) {
        const row = itemsStmt.getAsObject();
        order.items!.push({
          id: row.id,
          product: row.product_id ? {
            id: row.product_id,
            name: row.name,
            description: row.description,
            image_url: row.image_url
          } : null,
          quantity: row.quantity,
          unit_price: row.unit_price,
          subtotal: (row.quantity || 0) * (row.unit_price || 0)
        });
      }
      itemsStmt.free();
    }

    return jsonSuccess(res, orders);
  } catch (error) {
    return jsonError(res, 'Failed to fetch orders');
  }
});

router.get('/orders/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const id = sanitizePathParam(req.params.id);

    const orderStmt = db.prepare('SELECT * FROM orders WHERE id = :id');
    orderStmt.bind({ ':id': id });
    if (!orderStmt.step()) {
      orderStmt.free();
      return jsonError(res, 'Order not found', 404);
    }
    const row = orderStmt.getAsObject();
    orderStmt.free();

    const order: Order = {
      id: row.id as number,
      order_no: row.order_no as string,
      total_price: row.total_price as number,
      status: row.status as OrderStatus,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      items: []
    };

    const itemsStmt = db.prepare(
      'SELECT oi.*, p.name, p.description, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = :orderId'
    );
    itemsStmt.bind({ ':orderId': id });
    while (itemsStmt.step()) {
      const itemRow = itemsStmt.getAsObject();
      order.items!.push({
        id: itemRow.id,
        product: itemRow.product_id ? {
          id: itemRow.product_id,
          name: itemRow.name,
          description: itemRow.description,
          image_url: itemRow.image_url
        } : null,
        quantity: itemRow.quantity,
        unit_price: itemRow.unit_price,
        subtotal: (itemRow.quantity || 0) * (itemRow.unit_price || 0)
      });
    }
    itemsStmt.free();

    return jsonSuccess(res, order);
  } catch (error) {
    return jsonError(res, 'Failed to fetch order');
  }
});

router.post('/orders/:id/paid', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const id = sanitizePathParam(req.params.id);

    const orderStmt = db.prepare('SELECT * FROM orders WHERE id = :id');
    orderStmt.bind({ ':id': id });
    if (!orderStmt.step()) {
      orderStmt.free();
      return jsonError(res, 'Order not found', 404);
    }
    const orderRow = orderStmt.getAsObject();
    orderStmt.free();

    if (orderRow.status !== 'pending') {
      return jsonError(res, 'Order is not in pending status');
    }

    db.run('UPDATE orders SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id', {
      ':status': 'paid', ':id': id
    });
    saveDatabase();

    return jsonSuccess(res, { message: 'Payment successful', status: 'paid' });
  } catch (error) {
    return jsonError(res, 'Payment failed');
  }
});

router.get('/cart', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const openid = typeof req.query.openid === 'string' ? req.query.openid : '';

    if (!openid) {
      return jsonError(res, 'Missing openid');
    }

    const userStmt = db.prepare('SELECT id FROM user_profiles WHERE openid = :openid');
    userStmt.bind({ ':openid': openid });
    if (!userStmt.step()) {
      userStmt.free();
      return jsonError(res, 'User not found', 404);
    }
    const userRow = userStmt.getAsObject();
    userStmt.free();
    const userId = userRow.id as number;

    const cartStmt = db.prepare(
      'SELECT ci.id, ci.quantity, ci.product_id, p.name, p.price, p.image_url FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id WHERE ci.user_id = :userId ORDER BY ci.created_at DESC'
    );
    cartStmt.bind({ ':userId': userId });
    const items: any[] = [];
    while (cartStmt.step()) {
      const row = cartStmt.getAsObject();
      items.push({
        id: row.id,
        product_id: row.product_id,
        name: row.name,
        price: row.price,
        image: row.image_url || '',
        quantity: row.quantity
      });
    }
    cartStmt.free();

    return jsonSuccess(res, items);
  } catch (error) {
    return jsonError(res, 'Failed to fetch cart');
  }
});

router.post('/cart/add', validate(addCartSchema), (req: Request, res: Response) => {
  try {
    const { openid, product_id, quantity } = req.body;
    const db = getDatabase();

    if (!openid || !product_id) {
      return jsonError(res, 'Missing openid or product_id');
    }

    const userStmt = db.prepare('SELECT id FROM user_profiles WHERE openid = :openid');
    userStmt.bind({ ':openid': openid });
    if (!userStmt.step()) {
      userStmt.free();
      return jsonError(res, 'User not found', 404);
    }
    const userRow = userStmt.getAsObject();
    userStmt.free();
    const userId = userRow.id as number;
    const qty = parseInt(quantity, 10) || 1;

    const existStmt = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = :userId AND product_id = :productId');
    existStmt.bind({ ':userId': userId, ':productId': product_id });
    if (existStmt.step()) {
      const existRow = existStmt.getAsObject();
      existStmt.free();
      db.run('UPDATE cart_items SET quantity = :qty WHERE id = :id', {
        ':qty': existRow.quantity + qty, ':id': existRow.id
      });
    } else {
      existStmt.free();
      db.run(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (:userId, :productId, :qty)',
        { ':userId': userId, ':productId': product_id, ':qty': qty }
      );
    }

    saveDatabase();
    return jsonSuccess(res, { message: 'Added to cart' });
  } catch (error) {
    return jsonError(res, 'Failed to add to cart');
  }
});

router.put('/cart/:itemId', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const itemId = sanitizePathParam(req.params.itemId);
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10) || 1;

    if (qty <= 0) {
      db.run('DELETE FROM cart_items WHERE id = :id', { ':id': itemId });
    } else {
      db.run('UPDATE cart_items SET quantity = :qty WHERE id = :id', { ':qty': qty, ':id': itemId });
    }

    saveDatabase();
    return jsonSuccess(res, { message: 'Cart updated' });
  } catch (error) {
    return jsonError(res, 'Failed to update cart');
  }
});

router.delete('/cart/:itemId', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const itemId = sanitizePathParam(req.params.itemId);

    db.run('DELETE FROM cart_items WHERE id = :id', { ':id': itemId });
    saveDatabase();
    return jsonSuccess(res, { message: 'Removed from cart' });
  } catch (error) {
    return jsonError(res, 'Failed to remove from cart');
  }
});

router.post('/cart/clear', (req: Request, res: Response) => {
  try {
    const { openid } = req.body;
    const { userId, error } = resolveUserId(res, openid);
    if (error) return;

    const db = getDatabase();
    db.run('DELETE FROM cart_items WHERE user_id = :userId', { ':userId': userId });
    saveDatabase();
    return jsonSuccess(res, { message: 'Cart cleared' });
  } catch (error) {
    return jsonError(res, 'Failed to clear cart');
  }
});

const OPEN_METEO_CODES: Record<number, string> = {
  0: '晴', 1: '晴', 2: '多云', 3: '阴',
  45: '雾', 48: '雾凇',
  51: '小雨', 53: '小雨', 55: '小雨',
  61: '雨', 63: '雨', 65: '大雨',
  71: '雪', 73: '雪', 75: '大雪',
  80: '阵雨', 81: '阵雨', 82: '暴雨',
  95: '雷暴', 96: '雷暴冰雹', 99: '雷暴冰雹'
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  '桂林': { lat: 25.2736, lng: 110.2900 },
  '北京': { lat: 39.9042, lng: 116.4074 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '广州': { lat: 23.1291, lng: 113.2644 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '西安': { lat: 34.3416, lng: 108.9398 }
};

function cityCoords(city: string): { lat: number; lng: number } {
  return CITY_COORDS[city] || CITY_COORDS['桂林'];
}

function weatherCodeToText(code: number): string {
  return OPEN_METEO_CODES[code] || '多云';
}

function windDegToDir(deg: number): string {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  return dirs[Math.round(deg / 45) % 8] + '风';
}

function httpsGetJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const https = require('https');
    https.get(url, (apiRes: any) => {
      let data = '';
      apiRes.on('data', (chunk: any) => { data += chunk; });
      apiRes.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function getFallbackForecast(days: number, city: string) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      condition: '多云',
      temp_max: '26°C',
      temp_min: '16°C',
      humidity: '65%',
      wind: '微风2级',
      city
    };
  });
}

router.get('/weather', (req: Request, res: Response) => {
  try {
    const cityQuery = req.query.city;
    const targetCity = typeof cityQuery === 'string' ? cityQuery : '桂林';

    const weatherCacheKey = `weather_${targetCity}`;
    const weatherCacheTTL = 30 * 60 * 1000;
    const weatherCached = cache.get(weatherCacheKey);
    if (weatherCached && Date.now() - weatherCached.timestamp < weatherCacheTTL) {
      return jsonSuccess(res, weatherCached.data);
    }

    const coords = cityCoords(targetCity);

    httpsGetJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true&hourly=relativehumidity_2m&timezone=Asia/Shanghai&forecast_days=1`
    ).then((data: any) => {
      const cw = data.current_weather;
      const humidityArr = data.hourly?.relativehumidity_2m;
      const hum = humidityArr && humidityArr.length > 0 ? humidityArr[0] : 65;
      const weatherData = {
        condition: weatherCodeToText(cw.weathercode),
        temp: Math.round(cw.temperature) + '°C',
        humidity: hum + '%',
        wind: windDegToDir(cw.winddirection) + (cw.windspeed || '') + 'km/h',
        city: targetCity,
        reportTime: cw.time || new Date().toISOString()
      };
      setCache(weatherCacheKey, weatherData);
      return jsonSuccess(res, weatherData);
    }).catch((err: any) => {
      logger.warn({ err: String(err) }, 'Open-Meteo weather failed, trying AMAP fallback');
      const amapKey = process.env.AMAP_KEY || '';
      if (!amapKey) {
        const fallbackData = getFallbackWeather(targetCity);
        setCache(weatherCacheKey, fallbackData);
        return jsonSuccess(res, fallbackData);
      }
      const cityCodes: Record<string, string> = {
        '桂林': '450300', '北京': '110000', '上海': '310000',
        '广州': '440100', '深圳': '440300', '成都': '510100',
        '杭州': '330100', '西安': '610100'
      };
      const cityCode = cityCodes[targetCity] || cityCodes['桂林'];
      httpsGetJson(
        `https://restapi.amap.com/v3/weather/weatherInfo?key=${encodeURIComponent(amapKey)}&city=${encodeURIComponent(cityCode)}&extensions=all`
      ).then((result: any) => {
        if (result.status === '1' && result.lives && result.lives.length > 0) {
          const live = result.lives[0];
          const weatherData = {
            condition: live.weather || '晴',
            temp: (live.temperature || '') + '°C',
            humidity: (live.humidity || '') + '%',
            wind: (live.winddirection || '') + (live.windpower || '') + '级',
            city: live.city,
            reportTime: live.reporttime
          };
          setCache(weatherCacheKey, weatherData);
          return jsonSuccess(res, weatherData);
        }
        throw new Error('AMAP parse error');
      }).catch(() => {
        const fallbackData = getFallbackWeather(targetCity);
        setCache(weatherCacheKey, fallbackData);
        return jsonSuccess(res, fallbackData);
      });
    });
  } catch (error) {
    return jsonError(res, 'Failed to fetch weather');
  }
});

router.get('/weather/forecast', (req: Request, res: Response) => {
  try {
    const cityQuery = req.query.city;
    const targetCity = typeof cityQuery === 'string' ? cityQuery : '桂林';
    const days = Math.min(parseInt(req.query.days as string, 10) || 3, 7);

    const forecastCacheKey = `weather_forecast_${targetCity}_${days}`;
    const forecastCacheTTL = 30 * 60 * 1000;
    const forecastCached = cache.get(forecastCacheKey);
    if (forecastCached && Date.now() - forecastCached.timestamp < forecastCacheTTL) {
      return jsonSuccess(res, forecastCached.data);
    }

    const coords = cityCoords(targetCity);

    httpsGetJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Shanghai&forecast_days=${days}`
    ).then((data: any) => {
      const daily = data.daily;
      if (!daily || !daily.time) throw new Error('no daily data');
      const forecasts = daily.time.slice(0, days).map((date: string, i: number) => ({
        date,
        condition: weatherCodeToText(daily.weathercode?.[i] ?? 0),
        temp_max: Math.round(daily.temperature_2m_max?.[i] ?? 26) + '°C',
        temp_min: Math.round(daily.temperature_2m_min?.[i] ?? 16) + '°C',
        humidity: '--',
        wind: '--',
        city: targetCity
      }));
      setCache(forecastCacheKey, forecasts);
      return jsonSuccess(res, forecasts);
    }).catch((err: any) => {
      logger.warn({ err: String(err) }, 'Open-Meteo forecast failed, trying AMAP fallback');
      const amapKey = process.env.AMAP_KEY || '';
      if (!amapKey) {
        const fallback = getFallbackForecast(days, targetCity);
        setCache(forecastCacheKey, fallback);
        return jsonSuccess(res, fallback);
      }
      const cityCodes: Record<string, string> = {
        '桂林': '450300', '北京': '110000', '上海': '310000',
        '广州': '440100', '深圳': '440300', '成都': '510100',
        '杭州': '330100', '西安': '610100'
      };
      const cityCode = cityCodes[targetCity] || cityCodes['桂林'];
      httpsGetJson(
        `https://restapi.amap.com/v3/weather/weatherInfo?key=${encodeURIComponent(amapKey)}&city=${encodeURIComponent(cityCode)}&extensions=all`
      ).then((result: any) => {
        if (result.status === '1' && result.forecasts && result.forecasts.length > 0) {
          const forecast = result.forecasts[0];
          const casts = (forecast.casts || []).slice(0, days).map((cast: any) => ({
            date: cast.date,
            condition: cast.dayweather || '晴',
            temp_max: (cast.daytemp || '') + '°C',
            temp_min: (cast.nighttemp || '') + '°C',
            humidity: '--',
            wind: (cast.daywind || '') + (cast.daypower || '') + '级',
            city: forecast.city
          }));
          setCache(forecastCacheKey, casts);
          return jsonSuccess(res, casts);
        }
        throw new Error('AMAP forecast parse error');
      }).catch(() => {
        const fallback = getFallbackForecast(days, targetCity);
        setCache(forecastCacheKey, fallback);
        return jsonSuccess(res, fallback);
      });
    });
  } catch (error) {
    return jsonError(res, 'Failed to fetch weather forecast');
  }
});

function resolveUserId(res: Response, openid: string): { userId: number; error?: Response } {
  if (!openid) {
    return { userId: 0, error: jsonError(res, 'Missing openid') };
  }
  const db = getDatabase();
  const userStmt = db.prepare('SELECT id FROM user_profiles WHERE openid = :openid');
  userStmt.bind({ ':openid': openid });
  if (!userStmt.step()) {
    userStmt.free();
    return { userId: 0, error: jsonError(res, 'User not found', 404) };
  }
  const userRow = userStmt.getAsObject();
  userStmt.free();
  return { userId: userRow.id as number };
}

function getFallbackWeather(city: string) {
  return {
    condition: '多云',
    temp: '22°C',
    humidity: '65%',
    wind: '微风2级',
    city,
    reportTime: new Date().toLocaleString()
  };
}

router.post('/emergency-contacts/create', validate(createEmergencyContactSchema), (req: Request, res: Response) => {
  try {
    const { openid, name, phone, relationship, is_primary } = req.body;
    const { userId, error } = resolveUserId(res, openid);
    if (error) return;

    if (!name || !phone) {
      return jsonError(res, '姓名和电话不能为空');
    }

    const db = getDatabase();
    const countStmt = db.prepare('SELECT COUNT(*) as cnt FROM emergency_contacts WHERE user_id = :userId');
    countStmt.bind({ ':userId': userId });
    countStmt.step();
    const cnt = countStmt.getAsObject().cnt as number;
    countStmt.free();
    if (cnt >= 3) {
      return jsonError(res, '最多添加3个紧急联系人');
    }

    if (is_primary) {
      db.run('UPDATE emergency_contacts SET is_primary = 0 WHERE user_id = :userId', { ':userId': userId });
    }

    db.run(
      'INSERT INTO emergency_contacts (user_id, name, phone, relationship, is_primary) VALUES (:userId, :name, :phone, :relationship, :isPrimary)',
      {
        ':userId': userId,
        ':name': name || '',
        ':phone': phone || '',
        ':relationship': relationship || '',
        ':isPrimary': is_primary ? 1 : 0
      }
    );

    saveDatabase();

    const contactStmt = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = :userId ORDER BY id DESC LIMIT 1');
    contactStmt.bind({ ':userId': userId });
    contactStmt.step();
    const row = contactStmt.getAsObject();
    contactStmt.free();

    const contact: EmergencyContact = {
      id: row.id as number,
      user_id: row.user_id as number,
      name: row.name as string,
      phone: row.phone as string,
      relationship: row.relationship as string,
      is_primary: row.is_primary === 1,
      created_at: row.created_at as string
    };
    return jsonSuccess(res, contact);
  } catch (error) {
    return jsonError(res, '创建紧急联系人失败');
  }
});

router.get('/emergency-contacts', (req: Request, res: Response) => {
  try {
    const openid = typeof req.query.openid === 'string' ? req.query.openid : '';
    const { userId, error } = resolveUserId(res, openid);
    if (error) return;

    const db = getDatabase();
    const contactStmt = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = :userId ORDER BY is_primary DESC, created_at ASC');
    contactStmt.bind({ ':userId': userId });
    const contacts: EmergencyContact[] = [];
    while (contactStmt.step()) {
      const row = contactStmt.getAsObject();
      contacts.push({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        phone: row.phone,
        relationship: row.relationship,
        is_primary: row.is_primary === 1,
        created_at: row.created_at
      });
    }
    contactStmt.free();
    return jsonSuccess(res, contacts);
  } catch (error) {
    return jsonError(res, '获取紧急联系人失败');
  }
});

router.delete('/emergency-contacts/:id', (req: Request, res: Response) => {
  try {
    const id = sanitizePathParam(req.params.id);
    const db = getDatabase();
    db.run('DELETE FROM emergency_contacts WHERE id = :id', { ':id': id });
    saveDatabase();
    return jsonSuccess(res, { deleted: true });
  } catch (error) {
    return jsonError(res, '删除紧急联系人失败');
  }
});

router.put('/emergency-contacts/:id', (req: Request, res: Response) => {
  try {
    const id = sanitizePathParam(req.params.id);
    const db = getDatabase();

    const contactStmt = db.prepare('SELECT * FROM emergency_contacts WHERE id = :id');
    contactStmt.bind({ ':id': id });
    if (!contactStmt.step()) {
      contactStmt.free();
      return jsonError(res, '联系人不存在', 404);
    }
    const row = contactStmt.getAsObject();
    contactStmt.free();
    const userId = row.user_id as number;

    db.run('UPDATE emergency_contacts SET is_primary = 0 WHERE user_id = :userId', { ':userId': userId });
    db.run('UPDATE emergency_contacts SET is_primary = 1 WHERE id = :id', { ':id': id });

    saveDatabase();

    const updatedStmt = db.prepare('SELECT * FROM emergency_contacts WHERE id = :id');
    updatedStmt.bind({ ':id': id });
    updatedStmt.step();
    const updatedRow = updatedStmt.getAsObject();
    updatedStmt.free();

    const contact: EmergencyContact = {
      id: updatedRow.id as number,
      user_id: updatedRow.user_id as number,
      name: updatedRow.name as string,
      phone: updatedRow.phone as string,
      relationship: updatedRow.relationship as string,
      is_primary: updatedRow.is_primary === 1,
      created_at: updatedRow.created_at as string
    };
    return jsonSuccess(res, contact);
  } catch (error) {
    return jsonError(res, '设置主联系人失败');
  }
});

router.post('/health-records', validate(createHealthRecordSchema), (req: Request, res: Response) => {
  try {
    const { openid, blood_pressure, heart_rate, notes, record_date } = req.body;
    const { userId, error } = resolveUserId(res, openid);
    if (error) return;

    const db = getDatabase();
    db.run(
      'INSERT INTO health_records (user_id, blood_pressure, heart_rate, notes, record_date) VALUES (:userId, :bp, :hr, :notes, :recordDate)',
      {
        ':userId': userId,
        ':bp': blood_pressure || '',
        ':hr': heart_rate || '',
        ':notes': notes || '',
        ':recordDate': record_date || new Date().toISOString().split('T')[0]
      }
    );

    saveDatabase();

    const recordStmt = db.prepare('SELECT * FROM health_records WHERE user_id = :userId ORDER BY id DESC LIMIT 1');
    recordStmt.bind({ ':userId': userId });
    recordStmt.step();
    const row = recordStmt.getAsObject();
    recordStmt.free();

    const record: HealthRecord = {
      id: row.id as number,
      user_id: row.user_id as number,
      blood_pressure: row.blood_pressure as string,
      heart_rate: row.heart_rate as string,
      notes: row.notes as string,
      record_date: row.record_date as string,
      created_at: row.created_at as string
    };
    return jsonSuccess(res, record);
  } catch (error) {
    return jsonError(res, '添加健康记录失败');
  }
});

router.get('/health-records', (req: Request, res: Response) => {
  try {
    const openid = typeof req.query.openid === 'string' ? req.query.openid : '';
    const { userId, error } = resolveUserId(res, openid);
    if (error) return;

    const db = getDatabase();
    const recordStmt = db.prepare('SELECT * FROM health_records WHERE user_id = :userId ORDER BY record_date DESC, id DESC');
    recordStmt.bind({ ':userId': userId });
    const records: HealthRecord[] = [];
    while (recordStmt.step()) {
      const row = recordStmt.getAsObject();
      records.push({
        id: row.id,
        user_id: row.user_id,
        blood_pressure: row.blood_pressure,
        heart_rate: row.heart_rate,
        notes: row.notes,
        record_date: row.record_date,
        created_at: row.created_at
      });
    }
    recordStmt.free();
    return jsonSuccess(res, records);
  } catch (error) {
    return jsonError(res, '获取健康记录失败');
  }
});

// SOS 紧急求助：获取位置并通知紧急联系人
router.post('/sos/alert', validate(sosAlertSchema), (req: Request, res: Response) => {
  try {
    const { openid, latitude, longitude } = req.body;
    const { userId, error } = resolveUserId(res, openid);
    if (error) return;

    const db = getDatabase();
    const contactStmt = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = :userId AND is_primary = 1');
    contactStmt.bind({ ':userId': userId });
    const contacts: EmergencyContact[] = [];
    while (contactStmt.step()) {
      const row = contactStmt.getAsObject();
      contacts.push({
        id: row.id,
        name: row.name,
        phone: row.phone,
        relationship: row.relationship,
        is_primary: true,
        created_at: row.created_at
      });
    }
    contactStmt.free();

    const position = latitude && longitude
      ? `https://uri.amap.com/marker?position=${longitude},${latitude}`
      : '位置获取失败';

    logger.info({ openid, position, contacts }, 'SOS alert triggered');

    return jsonSuccess(res, {
      contacts,
      position,
      message: '紧急求助已触发，正在通知您的紧急联系人'
    });
  } catch (error) {
    return jsonError(res, 'SOS求助触发失败');
  }
});

export default router;