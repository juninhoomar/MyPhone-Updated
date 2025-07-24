"use client"

import type React from "react"

import type { Product } from "@/types"
import { formatPrice } from "@/utils/format-price"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useQuotes } from "@/hooks/use-quotes"

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addProductToQuote } = useQuotes()

  const handleAddToQuote = () => {
    addProductToQuote(product, 1)
    // Você pode adicionar um toast aqui para feedback
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <AspectRatio ratio={4 / 3}>
        <img
          src={product.images[0].url || "/placeholder.svg"}
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </AspectRatio>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="mt-2 text-gray-600">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleAddToQuote} className="flex-1 bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Orçamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
