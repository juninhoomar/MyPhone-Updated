"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuotes } from "@/hooks/use-quotes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Edit, Trash2 } from "lucide-react"
import { formatPrice } from "@/utils/format-price"

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { quotes, deleteQuote } = useQuotes()
  
  const quoteId = params.id as string
  const quote = quotes.find(q => q.id === quoteId)

  if (!quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Orçamento não encontrado</CardTitle>
            <CardDescription>
              O orçamento solicitado não foi encontrado ou foi removido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/quotes')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Orçamentos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const generatePDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          quoteId: quote.id,
          quoteData: quote 
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
      a.download = `orcamento-${quote.id}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF')
    }
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteQuote(quote.id)
      router.push('/quotes')
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
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/quotes')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Orçamento {quote.quote_number || `#${quote.id}`}
              </h1>
              <p className="text-gray-600">Detalhes do orçamento</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={generatePDF}>
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Dados do Cliente
                <Badge className={getStatusColor(quote.status)}>
                  {getStatusLabel(quote.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-base">{quote.customer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base">{quote.customer_email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p className="text-base">{quote.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Endereço</p>
                <p className="text-base">{quote.customer_address || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                <p className="text-base">{quote.created_at ? new Date(quote.created_at).toLocaleDateString("pt-BR") : "Data não disponível"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Válido até</p>
                <p className="text-base">{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString("pt-BR") : "Não definido"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Itens</p>
                <p className="text-base">{quote.items.length} {quote.items.length === 1 ? "item" : "itens"}</p>
              </div>
              {quote.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Observações</p>
                  <p className="text-base">{quote.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                <span className="text-base">{formatPrice(quote.subtotal)}</span>
              </div>
              {quote.discount_amount && quote.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Desconto</span>
                  <span className="text-base text-red-600">-{formatPrice(quote.discount_amount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(quote.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Produtos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Produtos do Orçamento</CardTitle>
            <CardDescription>
              Lista detalhada dos produtos incluídos neste orçamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Produto</th>
                    <th className="text-left py-3 px-4">Marca/Modelo</th>
                    <th className="text-center py-3 px-4">Qtd</th>
                    <th className="text-right py-3 px-4">Valor Unit.</th>
                    <th className="text-right py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={(item.product.images && item.product.images[0]) || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">{item.product.description || 'Sem descrição'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p>{item.product.brand}</p>
                        <p className="text-sm text-gray-500">{item.product.model}</p>
                      </td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">{formatPrice(item.unit_price)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatPrice(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}