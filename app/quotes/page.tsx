"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"

import { useQuotes } from "@/hooks/use-quotes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { FileText, Download, Eye, Edit, Trash2, ShoppingCart, Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function QuotesPage() {
  const { quotes, deleteQuote, updateQuoteStatus, isLoading } = useQuotes()
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  
  // Filtrar orçamentos
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      // Filtro por nome do cliente ou produto
      const matchesSearch = searchTerm === "" || 
        quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.items.some(item => 
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      
      // Filtro por status
      const matchesStatus = statusFilter === "all" || quote.status === statusFilter
      
      // Filtro por data
      let matchesDate = true
      if (quote.created_at) {
        const quoteDate = new Date(quote.created_at)
        const now = new Date()
        
        // Filtros predefinidos
        if (dateFilter !== "all") {
          switch (dateFilter) {
            case "today":
              matchesDate = quoteDate.toDateString() === now.toDateString()
              break
            case "week":
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              matchesDate = quoteDate >= weekAgo
              break
            case "month":
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              matchesDate = quoteDate >= monthAgo
              break
            case "custom":
              // Para filtro customizado, usar as datas selecionadas
              if (startDate && endDate) {
                const start = new Date(startDate)
                start.setHours(0, 0, 0, 0)
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                matchesDate = quoteDate >= start && quoteDate <= end
              } else if (startDate) {
                const start = new Date(startDate)
                start.setHours(0, 0, 0, 0)
                matchesDate = quoteDate >= start
              } else if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                matchesDate = quoteDate <= end
              }
              break
          }
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [quotes, searchTerm, statusFilter, dateFilter])



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

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Busca por nome/produto */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar por nome ou produto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Digite o nome do cliente ou produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Filtro por status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por data */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                    <SelectItem value="custom">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Pickers para filtro customizado */}
                {dateFilter === "custom" && (
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[140px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data início"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>

                    <span className="text-muted-foreground">até</span>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[140px] justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data fim"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>

                    {(startDate || endDate) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStartDate(undefined)
                          setEndDate(undefined)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Contador de resultados */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredQuotes.length} de {quotes.length} orçamentos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Orçamentos */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando orçamentos...</p>
            </div>
          ) : filteredQuotes.length === 0 && quotes.length > 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum orçamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros de busca para encontrar o que procura.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setDateFilter("all")
                }}
              >
                Limpar Filtros
              </Button>
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
            filteredQuotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {quote.quote_number || `ORD-${String(quote.id).padStart(3, '0')}`}
                        </span>
                        <Badge className={getStatusColor(quote.status)}>{getStatusLabel(quote.status)}</Badge>
                      </CardTitle>
                      <CardDescription>
                        <div className="space-y-1">
                          <p className="font-medium">{quote.customer_name}</p>
                          <p>{quote.customer_email} • {quote.customer_phone}</p>
                        </div>
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
                      <Link href={`/quotes/${quote.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
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
