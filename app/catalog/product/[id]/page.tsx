"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProducts } from "@/hooks/use-products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, ShoppingCart, Share2 } from "lucide-react"
import Link from "next/link"
import { PRODUCT_CATEGORIES } from "@/types/product"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProduct, deleteProduct } = useProducts()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const productId = params.id as string
  const product = getProduct(productId)

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link href="/catalog">
            <Button>Voltar ao Catálogo</Button>
          </Link>
        </div>
      </div>
    )
  }

  const categoryLabel = PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label || product.category
  const hasPromotion = product.promotionalPrice && product.promotionalPrice < product.price
  const displayPrice = hasPromotion ? product.promotionalPrice : product.price
  const discountPercentage = hasPromotion
    ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)
    : 0

  const getStatusColor = (status: typeof product.status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      case "discontinued":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: typeof product.status) => {
    switch (status) {
      case "available":
        return "Disponível"
      case "out_of_stock":
        return "Esgotado"
      case "discontinued":
        return "Descontinuado"
      default:
        return status
    }
  }

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProduct(product.id)
      router.push("/catalog")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/catalog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Catálogo
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg border bg-white">
              <img
                src={product.images[selectedImageIndex] || "/placeholder.svg?height=500&width=500&query=produto"}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              {hasPromotion && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative overflow-hidden rounded border-2 transition-colors ${
                      selectedImageIndex === index ? "border-primary" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{categoryLabel}</Badge>
                <Badge className={getStatusColor(product.status)}>{getStatusLabel(product.status)}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-muted-foreground">
                {product.brand} {product.model && `• ${product.model}`}
              </p>
            </div>

            <div className="space-y-2">
              {hasPromotion && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <Badge variant="destructive">-{discountPercentage}%</Badge>
                </div>
              )}
              <div className="text-3xl font-bold text-primary">
                R$ {(displayPrice || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1" disabled={product.status !== "available"}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.status === "available" ? "Adicionar ao Carrinho" : "Indisponível"}
              </Button>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Especificações Técnicas</CardTitle>
              <CardDescription>Detalhes técnicos do produto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium text-gray-700">{spec.name}:</span>
                    <span className="text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Data de Cadastro:</span>
                <span className="ml-2">{product.createdAt.toLocaleDateString("pt-BR")}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Última Atualização:</span>
                <span className="ml-2">{product.updatedAt.toLocaleDateString("pt-BR")}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">ID do Produto:</span>
                <span className="ml-2 font-mono text-xs">{product.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
