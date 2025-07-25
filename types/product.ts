export interface ProductSpecification {
  name: string
  value: string
}

export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  name: string
  brand: string
  model: string
  category: ProductCategory
  price: number
  promotionalPrice?: number
  description: string
  specifications: ProductSpecification[]
  images: string[]
  colors: ProductColor[]
  sku?: string
  stockQuantity: number
  status: "available" | "out_of_stock" | "discontinued"
  createdAt: Date
  updatedAt: Date
}

export type ProductCategory =
  | "smartphone"
  | "laptop"
  | "tablet"
  | "smartwatch"
  | "headphones"
  | "camera"
  | "gaming"
  | "accessories"
  | "tv"
  | "audio"

export interface ProductFilters {
  search: string
  category: ProductCategory | "all"
  brand: string
  priceRange: {
    min: number
    max: number
  }
  status: "all" | "available" | "out_of_stock"
  sortBy: "name" | "price" | "date" | "brand"
  sortOrder: "asc" | "desc"
}

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "smartphone", label: "Smartphones" },
  { value: "laptop", label: "Laptops" },
  { value: "tablet", label: "Tablets" },
  { value: "smartwatch", label: "Smartwatches" },
  { value: "headphones", label: "Fones de Ouvido" },
  { value: "camera", label: "Câmeras" },
  { value: "gaming", label: "Gaming" },
  { value: "accessories", label: "Acessórios" },
  { value: "tv", label: "TVs" },
  { value: "audio", label: "Áudio" },
]
