"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuotes } from "@/hooks/use-quotes"
import { useProducts } from "@/hooks/use-products"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Minus, Trash2, Save } from "lucide-react"
import Link from "next/link"
import type { QuoteFormData, Quote } from "@/types/quote"
import type { Product } from "@/types/product"

export default function EditQuotePage() {
  const router = useRouter()
  const params = useParams()
  const quoteId = params.id as string
  const { updateQuote } = useQuotes()
  const { products } = useProducts()
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([])
  const [formData, setFormData] = useState<QuoteFormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    discount_amount: 0,
    discount_percentage: 0,
    notes: "",
    valid_until: "",
  })

  // Carregar orçamento do Supabase
  useEffect(() => {
    const loadQuote = async () => {
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
          .eq('id', quoteId)
          .single()

        if (error) {
          console.error('Erro ao carregar orçamento:', error)
          return
        }

        setQuote(data)
      } catch (error) {
        console.error('Erro ao carregar orçamento:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (quoteId) {
      loadQuote()
    }
  }, [quoteId])

  useEffect(() => {
    if (quote) {
      setFormData({
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        customer_phone: quote.customer_phone,
        customer_address: quote.customer_address || "",
        discount_amount: quote.discount_amount || 0,
        discount_percentage: quote.discount_percentage || 0,
        notes: quote.notes || "",
        valid_until: quote.valid_until ? new Date(quote.valid_until).toISOString().split('T')[0] : "",
      })

      // Carregar itens do orçamento
      const items = quote.items.map((item: any) => ({
        product: item.product as Product,
        quantity: item.quantity
      }))
      setCartItems(items)
    }
  }, [quote])

  const handleInputChange = (field: keyof QuoteFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId))
  }

  const addProduct = (product: Product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id)
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      setCartItems(prev => [...prev, { product, quantity: 1 }])
    }
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.promotionalPrice || item.product.price
      return sum + (price * item.quantity)
    }, 0)
    const discountAmount = formData.discount_amount || 0
    const total = subtotal - discountAmount
    return { subtotal, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.length === 0) {
      alert("Adicione pelo menos um produto ao orçamento")
      return
    }

    setIsLoading(true)
    try {
      const result = await updateQuote(quoteId, formData, cartItems)
      if (result) {
        router.push(`/quotes/${quoteId}`)
      } else {
        alert("Erro ao atualizar orçamento")
      }
    } catch (error) {
      console.error("Erro ao atualizar orçamento:", error)
      alert("Erro ao atualizar orçamento")
    } finally {
      setIsLoading(false)
    }
  }

  const { subtotal, total } = calculateTotals()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Carregando orçamento...</h2>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Orçamento não encontrado</h2>
          <Link href="/quotes">
            <Button>Voltar para Orçamentos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/quotes/${quoteId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Editar Orçamento {quote.quote_number || `#${quote.id}`}
              </h1>
              <p className="text-gray-600">Modifique os dados do orçamento</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Nome *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => handleInputChange("customer_name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">E-mail *</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => handleInputChange("customer_email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_phone">Telefone *</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_until">Válido até</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => handleInputChange("valid_until", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customer_address">Endereço</Label>
                  <Textarea
                    id="customer_address"
                    value={formData.customer_address}
                    onChange={(e) => handleInputChange("customer_address", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Produtos Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      <p className="text-lg font-bold text-blue-600">
                        R$ {(product.promotionalPrice || product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addProduct(product)}
                        className="w-full mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Observações e Desconto */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="discount_amount">Desconto (R$)</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_amount}
                    onChange={(e) => handleInputChange("discount_amount", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                    placeholder="Observações sobre o orçamento..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Orçamento */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Itens */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-xs text-gray-600">
                          R$ {(item.product.promotionalPrice || item.product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {cartItems.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Nenhum produto adicionado</p>
                )}

                {/* Totais */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {(formData.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Desconto:</span>
                      <span>- R$ {(formData.discount_amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Botão de Salvar */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || cartItems.length === 0}
                >
                  {isLoading ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Orçamento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}