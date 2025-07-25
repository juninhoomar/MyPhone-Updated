export interface Quote {
  id: string;
  quote_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  items: QuoteItem[];
  subtotal: number;
  discount_percentage?: number;
  discount_amount?: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  notes?: string;
  created_at: string;
  updated_at: string;
  valid_until?: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    brand?: string;
    model?: string;
    price: number;
    images?: string[];
    description?: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface QuoteFormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  discount_percentage?: number;
  discount_amount?: number;
  notes?: string;
  valid_until?: string;
}
