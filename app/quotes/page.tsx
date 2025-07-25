"use client"

import type React from "react"

import { useQuotes } from "@/hooks/use-quotes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Trash2, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function QuotesPage() {
  const { quotes, deleteQuote, updateQuoteStatus, isLoading } = useQuotes()



  const generatePDF = async (quoteId: string) => {
    try {
      // Buscar os dados do orçamento
      const quote = quotes.find(q => q.id === quoteId)
      if (!quote) {
        throw new Error('Orçamento não encontrado')
      }

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          quoteId,
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
      a.download = `orcamento-${quoteId}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF')
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
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Orçamentos Criados
            </h1>
            <p className="text-xl text-gray-600">Gerencie todos os orçamentos criados</p>
          </div>
          
          <Link href="/catalog">
            <Button>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ir para Catálogo
            </Button>
          </Link>
        </div>


        {/* Lista de Orçamentos */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando orçamentos...</p>
            </div>
          ) : quotes.length === 0 ? (
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
                        {quote.customer_name}
                        <Badge className={getStatusColor(quote.status)}>{getStatusLabel(quote.status)}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {quote.customer_email} • {quote.customer_phone}
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
                      <p>Criado em: {quote.created_at ? new Date(quote.created_at).toLocaleDateString("pt-BR") : "Data não disponível"}</p>
                      {quote.valid_until && <p>Válido até: {new Date(quote.valid_until).toLocaleDateString("pt-BR")}</p>}
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
