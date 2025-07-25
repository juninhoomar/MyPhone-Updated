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
  promotional_price?: number
  discount_percentage: number
  subcategory?: string
  description?: string
  specifications?: any[]
  images: string[]
  colors?: any[]
  sku?: string
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface DatabaseTemplate {
  id: string
  name: string
  category: string
  description: string | null
  prompt: string
  variables: any
  thumbnail: string | null
  is_custom: boolean | null
  created_at: string | null
  updated_at: string | null
}

export type Database = {
  public: {
    Tables: {
      templates: {
        Row: DatabaseTemplate
        Insert: Omit<DatabaseTemplate, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<DatabaseTemplate, 'id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: DatabaseProduct
        Insert: Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}