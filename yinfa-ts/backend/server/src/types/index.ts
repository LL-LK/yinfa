export interface Category {
  id?: number;
  name: string;
  slug: string;
  order?: number;
}

export interface Product {
  id?: number;
  category?: Category | null;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
}

export interface UserProfile {
  id?: number;
  openid: string;
  nickname: string;
  avatar_url: string;
  phone: string;
  created_at?: string;
}

export interface Address {
  id?: number;
  user?: number;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  postal_code: string;
  is_default: boolean;
  created_at?: string;
}

export interface Order {
  id?: number;
  user?: number;
  order_no: string;
  total_price: number;
  status: OrderStatus;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  order?: number;
  product?: Partial<Product> | null;
  quantity: number;
  unit_price: number;
  subtotal?: number;
}

export interface CartItem {
  id?: number;
  user_id?: number;
  product_id: number;
  quantity: number;
  created_at?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface EmergencyContact {
  id?: number;
  user_id?: number;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at?: string;
}

export interface HealthRecord {
  id?: number;
  user_id?: number;
  blood_pressure: string;
  heart_rate: string;
  notes: string;
  record_date: string;
  created_at?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  data?: T;
  error?: string;
}