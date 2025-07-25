"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { Product, ProductColor } from "@/types/product"

export interface QuoteCartItem {
  product: Product
  quantity: number
  selectedColor?: ProductColor
  addedAt: Date
}

export interface QuoteCart {
  items: QuoteCartItem[]
  totalItems: number
  totalValue: number
}

interface QuoteCartContextType {
  cart: QuoteCartItem[]
  addToCart: (product: Product, quantity?: number, selectedColor?: ProductColor) => void
  removeFromCart: (productId: string, colorName?: string) => void
  updateQuantity: (productId: string, quantity: number, colorName?: string) => void
  clearCart: () => void
  getCartSummary: () => QuoteCart
  isInCart: (productId: string, colorName?: string) => boolean
  getItemQuantity: (productId: string, colorName?: string) => number
}

const QuoteCartContext = createContext<QuoteCartContextType | undefined>(undefined)

interface QuoteCartProviderProps {
  children: ReactNode
}

export function QuoteCartProvider({ children }: QuoteCartProviderProps) {
  const [cart, setCart] = useState<QuoteCartItem[]>([])

  const addToCart = useCallback((product: Product, quantity: number = 1, selectedColor?: ProductColor) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => 
        item.product.id === product.id && 
        item.selectedColor?.name === selectedColor?.name
      )
      
      if (existingItemIndex >= 0) {
        // Se o produto já existe com a mesma cor, atualiza a quantidade
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity
        }
        return updatedCart
      } else {
        // Se é um novo produto ou cor diferente, adiciona ao carrinho
        return [...prevCart, {
          product,
          quantity,
          selectedColor,
          addedAt: new Date()
        }]
      }
    })
  }, [])

  const removeFromCart = useCallback((productId: string, colorName?: string) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.product.id === productId && 
        (colorName ? item.selectedColor?.name === colorName : true))
    ))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number, colorName?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, colorName)
      return
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId && 
        (colorName ? item.selectedColor?.name === colorName : true)
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

  const isInCart = useCallback((productId: string, colorName?: string) => {
    return cart.some(item => 
      item.product.id === productId && 
      (colorName ? item.selectedColor?.name === colorName : true)
    )
  }, [cart])

  const getItemQuantity = useCallback((productId: string, colorName?: string) => {
    const item = cart.find(item => 
      item.product.id === productId && 
      (colorName ? item.selectedColor?.name === colorName : true)
    )
    return item?.quantity || 0
  }, [cart])

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSummary,
    isInCart,
    getItemQuantity
  }

  return (
    <QuoteCartContext.Provider value={value}>
      {children}
    </QuoteCartContext.Provider>
  )
}

export function useQuoteCart() {
  const context = useContext(QuoteCartContext)
  if (context === undefined) {
    throw new Error('useQuoteCart must be used within a QuoteCartProvider')
  }
  return context
}