"use client"

import type React from "react"
import { useState } from "react"
import { useProducts } from "@/hooks/use-products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, Search, Filter } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Product } from "@/types/product"

interface ProductSelectorProps {
  selectedProducts: Map<string, number>
  onProductAdd: (product: Product, quantity?: number) => void
  onProductRemove: (productId: string) => void
  onQuantityUpdate: (productId: string, quantity: number) => void
}

export function ProductSelector({
  selectedProducts,
  onProductAdd,
  onProductRemove,
  onQuantityUpdate,
}: ProductSelectorProps) {
  const { filteredProducts, filters, setFilters, brands, loading } = useProducts()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleQuantityChange = (productId: string, change: number) => {
    const currentQuantity = selectedProducts.get(productId) || 0
    const newQuantity = Math.max(0, currentQuantity + change)
    
    if (newQuantity === 0) {
      onProductRemove(productId)
    } else {
      onQuantityUpdate(productId, newQuantity)
    }
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.has(productId)
  }

  const getProductQuantity = (productId: string) => {
    return selectedProducts.get(productId) || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Selecionar Produtos</h3>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Nome, marca, modelo..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="smartphone">Smartphones</SelectItem>
                  <SelectItem value="tablet">Tablets</SelectItem>
                  <SelectItem value="laptop">Laptops</SelectItem>
                  <SelectItem value="desktop">Desktops</SelectItem>
                  <SelectItem value="accessory">Acessórios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Select
                value={filters.brand}
                onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const isSelected = isProductSelected(product.id)
          const quantity = getProductQuantity(product.id)
          const price = product.promotionalPrice || product.price
          
          return (
            <Card key={product.id} className={`transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {product.brand} • {product.model}
                    </CardDescription>
                  </div>
                  <Badge variant={product.status === 'available' ? 'default' : 'secondary'}>
                    {product.status === 'available' ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {product.promotionalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary">
                        R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {!isSelected ? (
                      <Button
                        onClick={() => onProductAdd(product, 1)}
                        disabled={product.status !== 'available'}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium min-w-[2rem] text-center">{quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium">
                          R$ {(price * quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum produto encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}