"use client"

import { useState } from "react"
import { useProducts } from "@/hooks/use-products"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Grid3X3, List, Package, Smartphone, Laptop, Tablet } from "lucide-react"
import Link from "next/link"
import type { ProductFilters as FilterType } from "@/types/product"

export default function CatalogPage() {
  const { products, filteredProducts, applyFilters } = useProducts()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState<FilterType>({
    search: "",
    category: "",
    brand: "",
    minPrice: 0,
    maxPrice: 15000,
    status: "",
    sortBy: "name",
    sortOrder: "asc",
  })

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))
  const brands = Array.from(new Set(products.map((p) => p.brand)))

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
                    category: filters.category === category ? "" : category,
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

        {/* Filters Section - Second Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              brands={brands}
              totalProducts={products.length}
              filteredCount={filteredProducts.length}
            />
          </div>
        </div>

        {/* Products Grid - Full Width */}
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
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
