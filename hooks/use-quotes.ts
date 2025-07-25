"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Quote, QuoteItem, QuoteFormData } from "@/types/quote"
import type { Product } from "@/types/product"

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  // Load quotes from Supabase on mount
  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          items:quote_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar orçamentos:', error)
        return
      }

      setQuotes(data || [])
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const createQuote = async (formData: QuoteFormData, cartItems: { product: Product; quantity: number }[]): Promise<Quote | null> => {
    try {
      // Calcular totais
      const items = cartItems.map(({ product, quantity }) => {
        const unitPrice = product.promotionalPrice || product.price
        return {
          product_id: product.id,
          quantity,
          unit_price: unitPrice,
          total_price: unitPrice * quantity,
        }
      })
const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
      const discountAmount = formData.discount_amount || 0
      const total = subtotal - discountAmount

      // Criar orçamento no Supabase
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          customer_address: formData.customer_address,
          subtotal,
          discount_amount: discountAmount,
          discount_percentage: formData.discount_percentage,
          total,
          status: 'draft',
          notes: formData.notes,
          valid_until: formData.valid_until,
        })
        .select()
        .single()

      if (quoteError) {
        console.error('Erro ao criar orçamento:', quoteError)
        return null
      }

      // Criar itens do orçamento
      const quoteItems = items.map(item => ({
        quote_id: quoteData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems)

      if (itemsError) {
        console.error('Erro ao criar itens do orçamento:', itemsError)
        // Tentar deletar o orçamento criado
        await supabase.from('quotes').delete().eq('id', quoteData.id)
        return null
      }

      // Recarregar orçamentos
      await loadQuotes()
      clearSelectedProducts()

      return quoteData
    } catch (error) {
      console.error('Erro ao criar orçamento:', error)
      return null
    }
  }

  const updateQuoteStatus = async (quoteId: string, status: Quote["status"]) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', quoteId)

      if (error) {
        console.error('Erro ao atualizar status do orçamento:', error)
        return
      }

      // Atualizar estado local
      setQuotes((prev) =>
        prev.map((quote) => 
          quote.id === quoteId 
            ? { ...quote, status, updated_at: new Date().toISOString() } 
            : quote
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar status do orçamento:', error)
    }
  }

  const deleteQuote = async (quoteId: string) => {
    try {
      // Deletar itens primeiro (devido à foreign key)
      await supabase.from('quote_items').delete().eq('quote_id', quoteId)
      
      // Deletar orçamento
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId)

      if (error) {
        console.error('Erro ao deletar orçamento:', error)
        return
      }

      // Atualizar estado local
      setQuotes((prev) => prev.filter((quote) => quote.id !== quoteId))
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error)
    }
  }

  const getQuote = (quoteId: string) => {
    return quotes.find((quote) => quote.id === quoteId)
  }

  return {
    quotes,
    selectedProducts,
    isLoading,
    addProductToQuote,
    removeProductFromQuote,
    updateProductQuantity,
    clearSelectedProducts,
    createQuote,
    updateQuoteStatus,
    deleteQuote,
    getQuote,
    loadQuotes,
  }
}
