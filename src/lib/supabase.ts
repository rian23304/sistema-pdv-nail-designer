import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  birth_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Professional {
  id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number // em minutos
  category: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  category: string
  barcode?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  customer_id: string
  professional_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  customer_id?: string
  professional_id?: string
  total_amount: number
  payment_method: string
  status: 'completed' | 'cancelled'
  sale_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  item_type: 'product' | 'service'
  item_id: string
  quantity: number
  unit_price: number
  total_price: number
  professional_id?: string // para serviços
  created_at: string
}

export interface BlockedDate {
  id: string
  date: string
  reason?: string
  all_day: boolean
  start_time?: string
  end_time?: string
  professional_id?: string // null = bloqueia para todos
  created_at: string
}

export interface BusinessHour {
  id: string
  day_of_week: number // 0 = domingo, 1 = segunda, etc
  start_time: string
  end_time: string
  active: boolean
  created_at: string
  updated_at: string
}