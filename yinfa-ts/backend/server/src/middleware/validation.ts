import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

const phoneRegex = /^1[3-9]\d{9}$/;

export const loginSchema = z.object({
  openid: z.string().min(1, 'openid不能为空'),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
  phone: z.string().regex(phoneRegex, '手机号格式不正确').optional().or(z.literal(''))
});

export const createOrderSchema = z.object({
  openid: z.string().min(1, 'openid不能为空'),
  items: z.array(z.object({
    product_id: z.preprocess((v) => Number(v), z.number().positive('product_id必须大于0')),
    quantity: z.preprocess((v) => Number(v), z.number().positive('数量必须大于0'))
  })).min(1, '订单至少需要1项商品')
});

export const createAddressSchema = z.object({
  openid: z.string().min(1, 'openid不能为空'),
  full_name: z.string().min(1, '收货人姓名不能为空'),
  phone: z.string().regex(phoneRegex, '手机号格式不正确'),
  address_line: z.string().min(1, '详细地址不能为空'),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional()
});

export const addCartSchema = z.object({
  openid: z.string().min(1, 'openid不能为空'),
  product_id: z.preprocess((v) => Number(v), z.number().positive('product_id必须大于0')),
  quantity: z.preprocess((v) => Number(v), z.number().positive('数量必须大于0')).optional()
});

export const createEmergencyContactSchema = z.object({
  openid: z.string().min(1, 'openid不能为空'),
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().regex(phoneRegex, '手机号格式不正确'),
  relationship: z.string().optional(),
  is_primary: z.boolean().optional()
});

export const createHealthRecordSchema = z.object({
  openid: z.string().min(1, 'openid不能为空'),
  blood_pressure: z.string().optional(),
  heart_rate: z.string().optional(),
  notes: z.string().optional(),
  record_date: z.string().optional()
});

export const sosAlertSchema = z.object({
  openid: z.string().min(1, 'openid不能为空'),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = (error as ZodError).issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        return res.status(400).json({ code: 1, error: `参数验证失败: ${messages}` });
      }
      return res.status(400).json({ code: 1, error: '请求参数无效' });
    }
  };
}
