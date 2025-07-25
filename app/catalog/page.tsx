"use client"

import { useState } from "react"
import { useProducts } from "@/hooks/use-products"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { QuoteCartSidebar } from "@/components/quote-cart-sidebar"
import { FloatingQuoteButton } from "@/components/floating-quote-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Grid3X3, List, Package, Smartphone, Laptop, Tablet, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useQuoteCart } from "@/contexts/quote-cart-context"
import type { ProductFilters as FilterType } from "@/types/product"

export default function CatalogPage() {
  const { products, filteredProducts, filters, setFilters, brands, loading, error } = useProducts()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { getCartSummary } = useQuoteCart()
  const { totalItems } = getCartSummary()

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters)
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "smartphone":
        return <Smartphone className="w-5 h-5" />
      case "laptop":
        return <Laptop className="w-5 h-5" />
      case "tablet":
        return <Tablet className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar produtos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Catálogo de Produtos
            </h1>
            <p className="text-xl text-gray-600">Explore nossa seleção de produtos eletrônicos premium</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <QuoteCartSidebar>
              <Button variant="outline" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Orçamento
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </QuoteCartSidebar>
            
            <Link href="/catalog/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produto
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">categorias diferentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marcas</CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brands.length}</div>
              <p className="text-xs text-muted-foreground">marcas disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.filter((p) => p.status === "available").length}</div>
              <p className="text-xs text-muted-foreground">produtos em estoque</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Quick Access */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Categorias</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                  key={category}
                  variant={filters.category === category ? "default" : "outline"}
                  onClick={() =>
                    handleFiltersChange({
                      ...filters,
                      category: filters.category === category ? "all" : category,
                    })
                  }
                  className="flex items-center gap-2"
                >
                {getCategoryIcon(category)}
                {category}
                <Badge variant="secondary" className="ml-1">
                  {products.filter((p) => p.category === category).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <ProductFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                brands={brands}
                totalProducts={products.length}
                filteredCount={filteredProducts.length}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* View Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">Produtos ({filteredProducts.length})</h3>
                  {filters.search && <Badge variant="secondary">Buscando por: "{filters.search}"</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Products Display */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">Tente ajustar os filtros ou adicionar novos produtos</p>
                  <Link href="/catalog/add">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </Link>
                </div>
              ) : (
                <div
                  className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-[30px] justify-items-center" : "space-y-4"}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Botão Flutuante para Finalizar Orçamento */}
      <FloatingQuoteButton />
    </div>
  )
}
