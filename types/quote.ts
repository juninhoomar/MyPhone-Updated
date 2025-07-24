import type { Product } from "./product"

export interface QuoteItem {
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Quote {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: QuoteItem[]
  subtotal: number
  discount: number
  total: number
  status: "draft" | "sent" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
  validUntil: Date
  notes?: string
}

export interface QuoteFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  notes?: string
  validDays: number
}
