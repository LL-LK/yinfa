import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../database';
import { Category, Product, UserProfile, Address, Order, OrderItem } from '../types';

const router = Router();

function jsonSuccess(res: Response, data: any): Response {
  return res.status(200).json({ code: 0, data });
}

function jsonError(res: Response, message: string, status = 400): Response {
  return res.status(status).json({ code: 1, error: message });
}

router.get('/categories', (req: Request, res: Response) => {
  try {
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
    return jsonSuccess(res, categories);
  } catch (error) {
    return jsonError(res, 'Failed to fetch categories');
  }
});

router.get('/products', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { category, search } = req.query;
    let query = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';

    if (category) {
      query += ` AND c.slug = '${category}'`;
    }
    if (search) {
      query += ` AND p.name LIKE '%${search}%'`;
    }

    const result = db.exec(query);
    if (result.length === 0) {
      return jsonSuccess(res, []);
    }
    const products: Product[] = result[0].values.map((row: any) => ({
      id: row[0],
      name: row[2],
      description: row[3],
      price: row[4],
      stock: row[5],
      image_url: row[6],
      is_active: row[7] === 1,
      category: row[8] ? { id: row[8], name: row[9], slug: row[10] } : null
    }));
    return jsonSuccess(res, products);
  } catch (error) {
    return jsonError(res, 'Failed to fetch products');
  }
});

router.get('/products/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const result = db.exec(`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ${id} AND p.is_active = 1`);
    if (result.length === 0 || result[0].values.length === 0) {
      return jsonError(res, 'Product not found', 404);
    }
    const row = result[0].values[0];
    const product: Product = {
      id: row[0] as number,
      name: row[2] as string,
      description: row[3] as string,
      price: row[4] as number,
      stock: row[5] as number,
      image_url: row[6] as string,
      is_active: row[7] === 1,
      category: row[8] ? { id: row[8] as number, name: row[9] as string, slug: row[10] as string } : null
    };
    return jsonSuccess(res, product);
  } catch (error) {
    return jsonError(res, 'Failed to fetch product');
  }
});

router.post('/users/login', (req: Request, res: Response) => {
  try {
    const { openid, nickname, avatar_url, phone } = req.body;
    const db = getDatabase();

    if (!openid) {
      return jsonError(res, 'Missing openid or code');
    }

    let result = db.exec(`SELECT * FROM user_profiles WHERE openid = '${openid}'`);
    let user: UserProfile;

    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0];
      db.run(`UPDATE user_profiles SET nickname = '${nickname || ''}', avatar_url = '${avatar_url || ''}', phone = '${phone || ''}' WHERE openid = '${openid}'`);
      user = {
        id: row[0] as number,
        openid: row[1] as string,
        nickname: nickname || row[2] as string,
        avatar_url: avatar_url || row[3] as string,
        phone: phone || row[4] as string,
        created_at: row[5] as string
      };
    } else {
      db.run(`INSERT INTO user_profiles (openid, nickname, avatar_url, phone) VALUES ('${openid}', '${nickname || ''}', '${avatar_url || ''}', '${phone || ''}')`);
      const newResult = db.exec(`SELECT * FROM user_profiles WHERE openid = '${openid}'`);
      const newRow = newResult[0].values[0];
      user = {
        id: newRow[0] as number,
        openid: newRow[1] as string,
        nickname: newRow[2] as string,
        avatar_url: newRow[3] as string,
        phone: newRow[4] as string,
        created_at: newRow[5] as string
      };
    }

    saveDatabase();
    return jsonSuccess(res, user);
  } catch (error) {
    return jsonError(res, 'Login failed');
  }
});

router.get('/users/:openid', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { openid } = req.params;
    const result = db.exec(`SELECT * FROM user_profiles WHERE openid = '${openid}'`);
    if (result.length === 0 || result[0].values.length === 0) {
      return jsonError(res, 'User not found', 404);
    }
    const row = result[0].values[0];
    const user: UserProfile = {
      id: row[0] as number,
      openid: row[1] as string,
      nickname: row[2] as string,
      avatar_url: row[3] as string,
      phone: row[4] as string,
      created_at: row[5] as string
    };
    return jsonSuccess(res, user);
  } catch (error) {
    return jsonError(res, 'Failed to fetch user');
  }
});

router.post('/address/create', (req: Request, res: Response) => {
  try {
    const { openid, full_name, phone, address_line, city, postal_code, is_default } = req.body;
    const db = getDatabase();

    if (!openid) {
      return jsonError(res, 'Missing openid');
    }

    const userResult = db.exec(`SELECT id FROM user_profiles WHERE openid = '${openid}'`);
    if (userResult.length === 0 || userResult[0].values.length === 0) {
      return jsonError(res, 'User not found', 404);
    }
    const user_id = userResult[0].values[0][0];

    if (is_default) {
      db.run(`UPDATE addresses SET is_default = 0 WHERE user_id = ${user_id}`);
    }

    db.run(`INSERT INTO addresses (user_id, full_name, phone, address_line, city, postal_code, is_default) VALUES (${user_id}, '${full_name}', '${phone}', '${address_line}', '${city}', '${postal_code}', ${is_default ? 1 : 0})`);

    const newResult = db.exec(`SELECT * FROM addresses WHERE user_id = ${user_id} ORDER BY id DESC LIMIT 1`);
    const row = newResult[0].values[0];

    saveDatabase();

    const address: Address = {
      id: row[0] as number,
      full_name: row[2] as string,
      phone: row[3] as string,
      address_line: row[4] as string,
      city: row[5] as string,
      postal_code: row[6] as string,
      is_default: row[7] === 1
    };
    return jsonSuccess(res, address);
  } catch (error) {
    return jsonError(res, 'Failed to create address');
  }
});

router.get('/addresses', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { openid } = req.query;

    if (!openid) {
      return jsonError(res, 'Missing openid');
    }

    const userResult = db.exec(`SELECT id FROM user_profiles WHERE openid = '${openid}'`);
    if (userResult.length === 0 || userResult[0].values.length === 0) {
      return jsonError(res, 'User not found', 404);
    }
    const user_id = userResult[0].values[0][0];

    const result = db.exec(`SELECT * FROM addresses WHERE user_id = ${user_id}`);
    if (result.length === 0) {
      return jsonSuccess(res, []);
    }

    const addresses: Address[] = result[0].values.map((row: any) => ({
      id: row[0],
      full_name: row[2],
      phone: row[3],
      address_line: row[4],
      city: row[5],
      postal_code: row[6],
      is_default: row[7] === 1
    }));
    return jsonSuccess(res, addresses);
  } catch (error) {
    return jsonError(res, 'Failed to fetch addresses');
  }
});

router.post('/order/create', (req: Request, res: Response) => {
  try {
    const { openid, items } = req.body;
    const db = getDatabase();

    if (!openid || !items || items.length === 0) {
      return jsonError(res, 'Missing order data');
    }

    const userResult = db.exec(`SELECT id FROM user_profiles WHERE openid = '${openid}'`);
    if (userResult.length === 0 || userResult[0].values.length === 0) {
      return jsonError(res, 'User not found', 404);
    }
    const user_id = userResult[0].values[0][0];

    const order_no = `ORD${Date.now()}${Math.floor(Math.random() * 900) + 100}`;
    let total_price = 0;

    db.run(`INSERT INTO orders (user_id, order_no, total_price, status) VALUES (${user_id}, '${order_no}', 0, 'pending')`);
    const orderResult = db.exec(`SELECT id FROM orders WHERE order_no = '${order_no}'`);
    const order_id = orderResult[0].values[0][0];

    for (const item of items) {
      const product_id = item.product_id;
      const quantity = parseInt(item.quantity) || 1;

      const productResult = db.exec(`SELECT price FROM products WHERE id = ${product_id} AND is_active = 1`);
      if (productResult.length === 0 || productResult[0].values.length === 0) {
        continue;
      }

      const unit_price = productResult[0].values[0][0] as number;
      const subtotal = unit_price * quantity;

      db.run(`INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (${order_id}, ${product_id}, ${quantity}, ${unit_price})`);
      total_price += subtotal;
    }

    db.run(`UPDATE orders SET total_price = ${total_price} WHERE id = ${order_id}`);

    saveDatabase();

    const orderData = db.exec(`SELECT * FROM orders WHERE id = ${order_id}`);
    const orderRow = orderData[0].values[0];

    const order: Order = {
      id: orderRow[0] as number,
      order_no: orderRow[2] as string,
      total_price: orderRow[3] as number,
      status: orderRow[4] as 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled',
      created_at: orderRow[5] as string,
      updated_at: orderRow[6] as string,
      items: []
    };

    const itemsResult = db.exec(`SELECT oi.*, p.name, p.description, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ${order_id}`);
    if (itemsResult.length > 0) {
      order.items = itemsResult[0].values.map((row: any) => ({
        id: row[0],
        product: row[2] ? {
          id: row[2],
          name: row[9],
          description: row[10],
          image_url: row[11]
        } : null,
        quantity: row[3],
        unit_price: row[4],
        subtotal: row[3] * row[4]
      }));
    }

    return jsonSuccess(res, order);
  } catch (error) {
    return jsonError(res, 'Failed to create order');
  }
});

router.get('/orders', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { openid } = req.query;

    if (!openid) {
      return jsonError(res, 'Missing openid');
    }

    const userResult = db.exec(`SELECT id FROM user_profiles WHERE openid = '${openid}'`);
    if (userResult.length === 0 || userResult[0].values.length === 0) {
      return jsonError(res, 'User not found', 404);
    }
    const user_id = userResult[0].values[0][0];

    const ordersResult = db.exec(`SELECT * FROM orders WHERE user_id = ${user_id} ORDER BY created_at DESC`);
    if (ordersResult.length === 0) {
      return jsonSuccess(res, []);
    }

    const orders: Order[] = ordersResult[0].values.map((row: any) => ({
      id: row[0],
      order_no: row[2],
      total_price: row[3],
      status: row[4],
      created_at: row[5],
      updated_at: row[6],
      items: []
    }));

    for (const order of orders) {
      const itemsResult = db.exec(`SELECT oi.*, p.name, p.description, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ${order.id}`);
      if (itemsResult.length > 0) {
        order.items = itemsResult[0].values.map((itemRow: any) => ({
          id: itemRow[0],
          product: itemRow[2] ? {
            id: itemRow[2],
            name: itemRow[9],
            description: itemRow[10],
            image_url: itemRow[11]
          } : null,
          quantity: itemRow[3],
          unit_price: itemRow[4],
          subtotal: itemRow[3] * itemRow[4]
        }));
      }
    }

    return jsonSuccess(res, orders);
  } catch (error) {
    return jsonError(res, 'Failed to fetch orders');
  }
});

router.get('/orders/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const orderResult = db.exec(`SELECT * FROM orders WHERE id = ${id}`);
    if (orderResult.length === 0 || orderResult[0].values.length === 0) {
      return jsonError(res, 'Order not found', 404);
    }

    const row = orderResult[0].values[0];
    const order: Order = {
      id: row[0] as number,
      order_no: row[2] as string,
      total_price: row[3] as number,
      status: row[4] as 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled',
      created_at: row[5] as string,
      updated_at: row[6] as string,
      items: []
    };

    const itemsResult = db.exec(`SELECT oi.*, p.name, p.description, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ${id}`);
    if (itemsResult.length > 0) {
      order.items = itemsResult[0].values.map((itemRow: any) => ({
        id: itemRow[0],
        product: itemRow[2] ? {
          id: itemRow[2],
          name: itemRow[9],
          description: itemRow[10],
          image_url: itemRow[11]
        } : null,
        quantity: itemRow[3],
        unit_price: itemRow[4],
        subtotal: itemRow[3] * itemRow[4]
      }));
    }

    return jsonSuccess(res, order);
  } catch (error) {
    return jsonError(res, 'Failed to fetch order');
  }
});

export default router;