"use client"

import { useState, useEffect } from "react"
import type { Quote, QuoteItem, QuoteFormData } from "@/types/quote"
import type { Product } from "@/types/product"

const QUOTES_KEY = "quotes"

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map())

  // Load quotes from localStorage on mount
  useEffect(() => {
    const savedQuotes = localStorage.getItem(QUOTES_KEY)
    if (savedQuotes) {
      const parsedQuotes = JSON.parse(savedQuotes).map((q: any) => ({
        ...q,
        createdAt: new Date(q.createdAt),
        updatedAt: new Date(q.updatedAt),
        validUntil: new Date(q.validUntil),
      }))
      setQuotes(parsedQuotes)
    }
  }, [])

  // Save quotes to localStorage whenever quotes change
  useEffect(() => {
    if (quotes.length > 0) {
      localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes))
    }
  }, [quotes])

  const addProductToQuote = (product: Product, quantity = 1) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      const currentQuantity = newMap.get(product.id) || 0
      newMap.set(product.id, currentQuantity + quantity)
      return newMap
    })
  }

  const removeProductFromQuote = (productId: string) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      newMap.delete(productId)
      return newMap
    })
  }

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromQuote(productId)
      return
    }

    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      newMap.set(productId, quantity)
      return newMap
    })
  }

  const clearSelectedProducts = () => {
    setSelectedProducts(new Map())
  }

  const createQuote = (formData: QuoteFormData, products: Product[]): Quote => {
    const items: QuoteItem[] = Array.from(selectedProducts.entries()).map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId)!
      const unitPrice = product.promotionalPrice || product.price
      return {
        product,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      }
    })

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const discount = 0 // Pode ser implementado depois
    const total = subtotal - discount

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + formData.validDays)

    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      items,
      subtotal,
      discount,
      total,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      validUntil,
      notes: formData.notes,
    }

    setQuotes((prev) => [newQuote, ...prev])
    clearSelectedProducts()

    return newQuote
  }

  const updateQuoteStatus = (quoteId: string, status: Quote["status"]) => {
    setQuotes((prev) =>
      prev.map((quote) => (quote.id === quoteId ? { ...quote, status, updatedAt: new Date() } : quote)),
    )
  }

  const deleteQuote = (quoteId: string) => {
    setQuotes((prev) => prev.filter((quote) => quote.id !== quoteId))
  }

  const getQuote = (quoteId: string) => {
    return quotes.find((quote) => quote.id === quoteId)
  }

  return {
    quotes,
    selectedProducts,
    addProductToQuote,
    removeProductFromQuote,
    updateProductQuantity,
    clearSelectedProducts,
    createQuote,
    updateQuoteStatus,
    deleteQuote,
    getQuote,
  }
}
