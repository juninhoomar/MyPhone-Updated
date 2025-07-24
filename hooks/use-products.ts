"use client"

import { useState, useEffect, useMemo } from "react"
import type { Product, ProductFilters } from "@/types/product"
import { SAMPLE_PRODUCTS } from "@/data/sample-products"

const PRODUCTS_KEY = "catalog-products"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "all",
    brand: "",
    priceRange: { min: 0, max: 15000 },
    status: "all",
    sortBy: "date",
    sortOrder: "desc",
  })

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem(PRODUCTS_KEY)
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }))
      setProducts(parsedProducts)
    } else {
      // Se não há produtos salvos, usar os produtos de exemplo
      setProducts(SAMPLE_PRODUCTS)
    }
  }, [])

  // Save products to localStorage whenever products change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
    }
  }, [products])

  const addProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setProducts((prev) => [newProduct, ...prev])
    return newProduct
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...updates, updatedAt: new Date() } : product)),
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
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
      if (filters.brand && product.brand !== filters.brand) {
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
    getProduct,
  }
}
