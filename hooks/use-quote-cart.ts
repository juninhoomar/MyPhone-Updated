"use client"

import { useState, useCallback } from "react"
import type { Product } from "@/types/product"

export interface QuoteCartItem {
  product: Product
  quantity: number
  addedAt: Date
}

export interface QuoteCart {
  items: QuoteCartItem[]
  totalItems: number
  totalValue: number
}

export function useQuoteCart() {
  const [cart, setCart] = useState<QuoteCartItem[]>([])

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id)
      
      if (existingItemIndex >= 0) {
        // Se o produto já existe, atualiza a quantidade
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity
        }
        return updatedCart
      } else {
        // Se é um novo produto, adiciona ao carrinho
        return [...prevCart, {
          product,
          quantity,
          addedAt: new Date()
        }]
      }
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartSummary = useCallback((): QuoteCart => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = cart.reduce((sum, item) => {
      const price = item.product.promotionalPrice || item.product.price
      return sum + (price * item.quantity)
    }, 0)

    return {
      items: cart,
      totalItems,
      totalValue
    }
  }, [cart])

  const isInCart = useCallback((productId: string) => {
    return cart.some(item => item.product.id === productId)
  }, [cart])

  const getItemQuantity = useCallback((productId: string) => {
    const item = cart.find(item => item.product.id === productId)
    return item?.quantity || 0
  }, [cart])

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSummary,
    isInCart,
    getItemQuantity
  }
}