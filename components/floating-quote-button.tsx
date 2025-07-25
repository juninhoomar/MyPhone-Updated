"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart, FileText } from "lucide-react"
import { useQuoteCart } from "@/contexts/quote-cart-context"
import { useQuotes } from "@/hooks/use-quotes"
import type { QuoteFormData } from "@/types/quote"

export function FloatingQuoteButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { cart, clearCart, getCartSummary } = useQuoteCart()
  const { createQuote } = useQuotes()

  const [formData, setFormData] = useState<QuoteFormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    notes: "",
    discount_amount: 0,
    discount_percentage: 0,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
  })

  const cartSummary = getCartSummary()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const quote = await createQuote(formData, cart)
      if (quote) {
        clearCart()
        setIsOpen(false)
        setFormData({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          customer_address: "",
          notes: "",
          discount_amount: 0,
          discount_percentage: 0,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
        alert("Orçamento criado com sucesso!")
      } else {
        alert("Erro ao criar orçamento")
      }
    } catch (error) {
      console.error("Erro ao criar orçamento:", error)
      alert("Erro ao criar orçamento")
    } finally {
      setIsLoading(false)
    }
  }

  if (cartSummary.totalItems === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="lg"
        >
          <div className="flex flex-col items-center">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs font-bold">{cartSummary.totalItems}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Finalizar Orçamento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente para gerar o orçamento.
          </DialogDescription>
        </DialogHeader>

        {/* Resumo dos produtos */}
        <div className="border rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Produtos Selecionados</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name}</span>
                <span>{item.quantity}x R$ {(item.product.promotionalPrice || item.product.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>R$ {cartSummary.totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nome do Cliente *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Telefone</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_until">Válido até</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_address">Endereço</Label>
            <Textarea
              id="customer_address"
              value={formData.customer_address}
              onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_amount">Desconto (R$)</Label>
              <Input
                id="discount_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.discount_amount}
                onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_percentage">Desconto (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.customer_name}
              className="flex-1"
            >
              {isLoading ? "Criando..." : "Criar Orçamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}