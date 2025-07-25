"use client"

import { useState, useEffect, useMemo } from "react"
import type { Product, ProductFilters } from "@/types/product"
import { supabase, type DatabaseProduct } from "@/lib/supabase"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "all",
    brand: "",
    priceRange: { min: 0, max: 15000 },
    status: "all",
    sortBy: "date",
    sortOrder: "desc",
  })

  // Função para converter produto do banco para o tipo Product
  const convertDatabaseProduct = (dbProduct: any): Product => {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      brand: dbProduct.brand,
      model: dbProduct.model,
      category: dbProduct.category as any, // Assumindo que as categorias no banco são válidas
      price: dbProduct.price,
      promotionalPrice: dbProduct.promotional_price || undefined,
      description: dbProduct.description || "",
      specifications: dbProduct.specifications || [],
      images: dbProduct.images || [],
      colors: dbProduct.colors || [],
      sku: dbProduct.sku || undefined,
      stockQuantity: dbProduct.stock_quantity || 0,
      status: dbProduct.is_active ? "available" : "out_of_stock",
      createdAt: new Date(dbProduct.created_at),
      updatedAt: new Date(dbProduct.updated_at),
    }
  }

  // Carregar produtos do Supabase
  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (supabaseError) {
        throw supabaseError
      }
      
      const convertedProducts = data?.map(convertDatabaseProduct) || []
      setProducts(convertedProducts)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
      setError('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  // Carregar produtos na inicialização
  useEffect(() => {
    loadProducts()
  }, [])

  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          brand: productData.brand,
          model: productData.model,
          category: productData.category,
          price: productData.price,
          promotional_price: productData.promotionalPrice || null,
          discount_percentage: productData.promotionalPrice ? 
            Math.round((1 - productData.promotionalPrice / productData.price) * 100) : 0,
          description: productData.description,
          specifications: productData.specifications || [],
          images: productData.images || [],
          colors: productData.colors || [],
          sku: productData.sku || null,
          stock_quantity: productData.stockQuantity || 0,
          is_active: productData.status === "available",
          is_featured: false,
          rating: 0,
          review_count: 0
        })
        .select()
        .single()
      
      if (error) throw error
      
      const newProduct = convertDatabaseProduct(data)
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao adicionar produto'
      console.error('Erro ao adicionar produto:', errorMessage, err)
      throw new Error(errorMessage)
    }
  }

  const updateProduct = async (id: string, updates: Partial<Omit<Product, "id" | "createdAt">>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          brand: updates.brand,
          model: updates.model,
          category: updates.category,
          price: updates.price,
          promotional_price: updates.promotionalPrice || null,
          discount_percentage: updates.promotionalPrice ? 
            Math.round((1 - updates.promotionalPrice / updates.price!) * 100) : 0,
          description: updates.description,
          specifications: updates.specifications || [],
          images: updates.images || [],
          colors: updates.colors || [],
          sku: updates.sku || null,
          stock_quantity: updates.stockQuantity || 0,
          is_active: updates.status === "available",
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const updatedProduct = convertDatabaseProduct(data)
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? updatedProduct : product
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar produto'
      console.error('Erro ao atualizar produto:', errorMessage, err)
      throw new Error(errorMessage)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setProducts(prev => prev.filter(product => product.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao deletar produto'
      console.error('Erro ao deletar produto:', errorMessage, err)
      throw new Error(errorMessage)
    }
  }

  const duplicateProduct = async (id: string) => {
    const product = products.find(p => p.id === id)
    if (product) {
      try {
        const duplicatedData = {
          ...product,
          name: `${product.name} (Cópia)`,
        }
        delete (duplicatedData as any).id
        delete (duplicatedData as any).createdAt
        delete (duplicatedData as any).updatedAt
        
        return await addProduct(duplicatedData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao duplicar produto'
        console.error('Erro ao duplicar produto:', errorMessage, err)
        throw new Error(errorMessage)
      }
    }
  }

  const getProduct = (id: string) => {
    return products.find((product) => product.id === id)
  }

  // Get unique brands for filter
  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).sort()
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm) ||
          product.model.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category !== "all" && product.category !== filters.category) {
        return false
      }

      // Brand filter
      if (filters.brand && filters.brand !== "all" && product.brand !== filters.brand) {
        return false
      }

      // Price range filter
      const price = product.promotionalPrice || product.price
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false
      }

      // Status filter
      if (filters.status !== "all" && product.status !== filters.status) {
        return false
      }

      return true
    })

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "price":
          const priceA = a.promotionalPrice || a.price
          const priceB = b.promotionalPrice || b.price
          comparison = priceA - priceB
          break
        case "brand":
          comparison = a.brand.localeCompare(b.brand)
          break
        case "date":
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
      }

      return filters.sortOrder === "desc" ? -comparison : comparison
    })

    return filtered
  }, [products, filters])

  return {
    products,
    filteredProducts,
    filters,
    setFilters,
    brands,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    getProduct,
    loading,
    error,
  }
}
