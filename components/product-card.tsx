"use client"

import React, { useState } from "react"
import type { Product } from "@/types/product"
import { formatPrice } from "@/utils/format-price"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingCart } from "lucide-react"
import { useQuoteCart } from "@/contexts/quote-cart-context"
import { ProductModal } from "@/components/product-modal"

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToCart, isInCart, getItemQuantity } = useQuoteCart()

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.stopPropagation() // Evita abrir o modal quando clicar no botão
    addToCart(product, 1)
    // Você pode adicionar um toast aqui para feedback
  }

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  const currentPrice = product.promotionalPrice || product.price
  const hasDiscount = product.promotionalPrice && product.promotionalPrice < product.price
  const isProductInCart = isInCart(product.id)
  const cartQuantity = getItemQuantity(product.id)

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 w-[350px] h-[500px] flex flex-col"
        onClick={handleCardClick}
      >
        <div className="relative h-[300px] overflow-hidden">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="object-cover w-full h-full"
          />
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 z-10 text-xs px-2 py-1"
            >
              -{Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)}%
            </Badge>
          )}
          {product.status !== 'available' && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 z-10 text-xs px-2 py-1"
            >
              {product.status === 'out_of_stock' ? 'Sem Estoque' : 'Descontinuado'}
            </Badge>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="mb-2">
              <Badge variant="outline" className="text-xs px-2 py-1">
                {product.brand}
              </Badge>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddToQuote}
              disabled={product.status !== 'available'}
              className="w-full text-sm h-10 px-4"
            >
              {isProductInCart ? (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  No carrinho ({cartQuantity})
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <ProductModal 
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
