"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { type ProductFilters as ProductFiltersType, PRODUCT_CATEGORIES } from "@/types/product"

interface ProductFiltersProps {
  filters: ProductFiltersType
  onFiltersChange: (filters: ProductFiltersType) => void
  brands: string[]
  totalProducts: number
  filteredCount: number
}

/**
 * Garante que `priceRange` exista para evitar erros de acesso a propriedades.
 */
const withDefaultPriceRange = (f: ProductFiltersType): ProductFiltersType => ({
  ...f,
  priceRange: f.priceRange ?? { min: 0, max: 10000 },
})

export function ProductFilters(props: ProductFiltersProps) {
  // Sempre trabalhe com um objeto de filtros seguro
  const { filters, onFiltersChange, brands, totalProducts, filteredCount } = props
  const safeFilters = withDefaultPriceRange(filters)
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof ProductFiltersType, value: any) => {
    onFiltersChange(withDefaultPriceRange({ ...safeFilters, [key]: value }))
  }

  const clearFilters = () => {
    onFiltersChange({
      ...safeFilters,
      search: "",
      category: "all",
      brand: "",
      priceRange: { min: 0, max: 10000 },
      status: "all",
      sortBy: "date",
      sortOrder: "desc",
    })
  }

  const hasActiveFilters =
    safeFilters.search ||
    safeFilters.category !== "all" ||
    safeFilters.brand ||
    safeFilters.status !== "all" ||
    safeFilters.priceRange.min > 0 ||
    safeFilters.priceRange.max < 10000

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredCount} de {totalProducts} produtos
          </p>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
        {/* Busca */}
        <div className="space-y-2">
          <Label>Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nome, marca, modelo..."
              value={safeFilters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={safeFilters.category} onValueChange={(v) => updateFilter("category", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {PRODUCT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Marca */}
        <div className="space-y-2">
          <Label>Marca</Label>
          <Select value={safeFilters.brand} onValueChange={(v) => updateFilter("brand", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as Marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Marcas</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Faixa de preço */}
        <div className="space-y-3">
          <Label>Faixa de Preço</Label>
          <div className="px-2">
            <Slider
              value={[safeFilters.priceRange.min, safeFilters.priceRange.max]}
              onValueChange={([min, max]) => updateFilter("priceRange", { min, max })}
              max={10000}
              min={0}
              step={100}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>R$ {safeFilters.priceRange.min.toLocaleString('pt-BR')}</span>
            <span>R$ {safeFilters.priceRange.max.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={safeFilters.status} onValueChange={(v) => updateFilter("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="out_of_stock">Fora de Estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ordenação */}
        <div className="space-y-2">
          <Label>Ordenar por</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={safeFilters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="price">Preço</SelectItem>
                <SelectItem value="brand">Marca</SelectItem>
                <SelectItem value="date">Data</SelectItem>
              </SelectContent>
            </Select>

            <Select value={safeFilters.sortOrder} onValueChange={(v) => updateFilter("sortOrder", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Crescente</SelectItem>
                <SelectItem value="desc">Decrescente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// Mantém o named export esperado pelas páginas
export default ProductFilters
