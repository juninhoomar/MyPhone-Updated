import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface DatabaseProduct {
  id: string
  name: string
  brand: string
  model: string
  category: string
  price: number
  original_price?: number
  discount_percentage: number
  subcategory?: string
  description?: string
  specifications?: any[]
  images: string[]
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}