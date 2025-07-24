"use client"

import type React from "react"

import { useState } from "react"
import { useQuotes } from "@/hooks/use-quotes"
import { useProducts } from "@/hooks/use-products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Download, Eye, Trash2, ShoppingCart } from "lucide-react"
import Link from "next/link"
import type { QuoteFormData } from "@/types/quote"

export default function QuotesPage() {
  const { quotes, selectedProducts, createQuote, deleteQuote, updateQuoteStatus } = useQuotes()
  const { products } = useProducts()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<QuoteFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
    validDays: 30,
  })

  const selectedProductsList = Array.from(selectedProducts.entries())
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId)
      return product ? { product, quantity } : null
    })
    .filter(Boolean)

  const totalSelectedValue = selectedProductsList.reduce((sum, item) => {
    if (!item) return sum
    const price = item.product.promotionalPrice || item.product.price
    return sum + price * item.quantity
  }, 0)

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProducts.size === 0) {
      alert("Selecione pelo menos um produto para criar o orçamento")
      return
    }

    const newQuote = createQuote(formData, products)
    setIsCreateDialogOpen(false)
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      notes: "",
      validDays: 30,
    })

    // Aqui você pode gerar o PDF
    generatePDF(newQuote.id)
  }

  const generatePDF = async (quoteId: string) => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quoteId }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `orcamento-${quoteId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar PDF")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Rascunho"
      case "sent":
        return "Enviado"
      case "approved":
        return "Aprovado"
      case "rejected":
        return "Rejeitado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Orçamentos</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/catalog">
              <Button variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Selecionar Produtos
              </Button>
            </Link>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={selectedProducts.size === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Orçamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Orçamento</DialogTitle>
                  <DialogDescription>Preencha os dados do cliente para gerar o orçamento</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateQuote} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Nome do Cliente</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email</Label>
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
                      <Label htmlFor="customerPhone">Telefone</Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                        required
                      />
                    </div>
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
                    />
                  </div>

                  {/* Produtos Selecionados */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Produtos Selecionados:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedProductsList.map((item) => {
                        if (!item) return null
                        const price = item.product.promotionalPrice || item.product.price
                        return (
                          <div key={item.product.id} className="flex justify-between text-sm">
                            <span>
                              {item.product.name} x{item.quantity}
                            </span>
                            <span>
                              R$ {(price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t mt-2 pt-2 font-semibold">
                      Total: R$ {totalSelectedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Criar Orçamento</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Produtos Selecionados */}
        {selectedProducts.size > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Produtos Selecionados ({selectedProducts.size})</CardTitle>
              <CardDescription>
                Total: R$ {totalSelectedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProductsList.map((item) => {
                  if (!item) return null
                  const price = item.product.promotionalPrice || item.product.price
                  return (
                    <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}x R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {(price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Orçamentos */}
        <div className="grid grid-cols-1 gap-6">
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum orçamento criado</h3>
              <p className="text-muted-foreground mb-4">
                Selecione produtos no catálogo e crie seu primeiro orçamento.
              </p>
              <Link href="/catalog">
                <Button>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Ir para Catálogo
                </Button>
              </Link>
            </div>
          ) : (
            quotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {quote.customerName}
                        <Badge className={getStatusColor(quote.status)}>{getStatusLabel(quote.status)}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {quote.customerEmail} • {quote.customerPhone}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        R$ {quote.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quote.items.length} {quote.items.length === 1 ? "item" : "itens"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>Criado em: {quote.createdAt.toLocaleDateString("pt-BR")}</p>
                      <p>Válido até: {quote.validUntil.toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => generatePDF(quote.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Link href={`/quotes/${quote.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteQuote(quote.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
