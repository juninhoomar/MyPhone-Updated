"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Label } from "@/components/ui/label"
import { Plus, Minus, ShoppingCart, Star, Check, X, Palette } from "lucide-react"
import type { Product, ProductColor } from "@/types/product"
import { formatPrice } from "@/utils/format-price"
import { useQuoteCart } from "@/contexts/quote-cart-context"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const { addToCart, isInCart, getItemQuantity } = useQuoteCart()

  if (!product) return null

  const currentPrice = product.promotionalPrice || product.price
  const hasDiscount = product.promotionalPrice && product.promotionalPrice < product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)
    : 0

  const handleAddToQuote = () => {
    if (product.colors.length > 0 && !selectedColor) {
      alert('Por favor, selecione uma cor antes de adicionar ao orçamento.')
      return
    }
    addToCart(product, quantity, selectedColor || undefined)
    // Você pode adicionar um toast aqui para feedback
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1))

  const isProductInCart = isInCart(product.id, selectedColor?.name)
  const cartQuantity = getItemQuantity(product.id, selectedColor?.name)

  // Reset selected color when product changes
  React.useEffect(() => {
    if (product && product.colors.length > 0) {
      setSelectedColor(product.colors[0])
    } else {
      setSelectedColor(null)
    }
  }, [product])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <AspectRatio ratio={1}>
              <img
                src={product.images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="object-cover w-full h-full rounded-lg"
              />
            </AspectRatio>
            
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
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

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.brand}</Badge>
                <Badge 
                  variant={product.status === 'available' ? 'default' : 'destructive'}
                >
                  {product.status === 'available' ? 'Disponível' : 
                   product.status === 'out_of_stock' ? 'Fora de Estoque' : 'Descontinuado'}
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.model}</p>
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="destructive">
                      -{discountPercentage}%
                    </Badge>
                  </>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-600 font-medium">
                  Você economiza {formatPrice(product.price - currentPrice)}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Cores Disponíveis */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cores Disponíveis
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        selectedColor?.name === color.name
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Especificações */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Especificações</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {product.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">{spec.name}:</span>
                          <span className="text-sm text-gray-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Separator />

            {/* Controles de Quantidade e Adicionar ao Orçamento */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantidade:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleAddToQuote}
                  className="w-full"
                  size="lg"
                  disabled={product.status !== 'available'}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isProductInCart ? `Adicionar Mais (${cartQuantity} no orçamento)` : 'Adicionar ao Orçamento'}
                </Button>
                
                {product.status !== 'available' && (
                  <p className="text-sm text-red-600 text-center">
                    {product.status === 'out_of_stock' ? 
                      'Produto temporariamente indisponível' : 
                      'Produto descontinuado'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>Garantia do fabricante</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>Suporte técnico especializado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>Orçamento sem compromisso</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}