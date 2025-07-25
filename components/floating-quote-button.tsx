"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, FileText } from "lucide-react"
import { useQuoteCart, type QuoteCartItem } from "@/contexts/quote-cart-context"
import type { QuoteFormData } from "@/types/quote"

interface FloatingQuoteButtonProps {
  onQuoteGenerated?: () => void
}

export function FloatingQuoteButton({ onQuoteGenerated }: FloatingQuoteButtonProps) {
  const { cart, getCartSummary, clearCart } = useQuoteCart()
  const { items, totalItems, totalValue } = getCartSummary()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<QuoteFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    paymentMethod: "",
    notes: "",
    validDays: 30,
  })

  if (totalItems === 0) {
    return null
  }

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Preparar dados do orçamento no formato correto
      const quoteData = {
        id: `quote-${Date.now()}`,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        paymentMethod: formData.paymentMethod,
        items: items.map((item: QuoteCartItem) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.product.promotionalPrice || item.product.price,
          totalPrice: (item.product.promotionalPrice || item.product.price) * item.quantity
        })),
        subtotal: totalValue,
        discount: 0,
        total: totalValue,
        status: "draft" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        validUntil: new Date(Date.now() + formData.validDays * 24 * 60 * 60 * 1000),
        notes: formData.notes
      }

      // Gerar PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          quoteData
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `orcamento-${formData.customerName.replace(/\s+/g, '-')}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Limpar carrinho e fechar modal
      clearCart()
      setIsDialogOpen(false)
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        paymentMethod: "",
        notes: "",
        validDays: 30,
      })

      onQuoteGenerated?.()
      alert('Orçamento gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar orçamento:', error)
      alert('Erro ao gerar orçamento')
    }
  }

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 h-14 px-6"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Finalizar Orçamento
          <Badge 
            variant="secondary" 
            className="ml-2 bg-white text-primary"
          >
            {totalItems}
          </Badge>
        </Button>
      </div>

      {/* Modal de Criação de Orçamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gerar Orçamento
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente para gerar o orçamento em PDF
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateQuote} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerPhone">Telefone *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validDays">Válido por (dias)</Label>
                <Select
                  value={formData.validDays.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, validDays: Number.parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            {/* Resumo dos Produtos */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Produtos Selecionados ({totalItems} {totalItems === 1 ? 'item' : 'itens'}):</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item: QuoteCartItem) => {
                  const price = item.product.promotionalPrice || item.product.price
                  return (
                    <div key={item.product.id} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                      <div>
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium">
                        R$ {(price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between items-center font-semibold text-lg">
                <span>Total Geral:</span>
                <span className="text-primary">
                  R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <FileText className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}