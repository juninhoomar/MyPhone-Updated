"use client"

import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, FileText } from "lucide-react"
import { useQuoteCart } from "@/contexts/quote-cart-context"
import { formatPrice } from "@/utils/format-price"
import Link from "next/link"

interface QuoteCartSidebarProps {
  children: React.ReactNode
}

export function QuoteCartSidebar({ children }: QuoteCartSidebarProps) {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartSummary 
  } = useQuoteCart()
  
  const { items, totalItems, totalValue } = getCartSummary()

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Orçamento Temporário
            {totalItems > 0 && (
              <Badge variant="secondary">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum produto selecionado
              </h3>
              <p className="text-gray-500 mb-4">
                Adicione produtos ao seu orçamento para começar
              </p>
            </div>
          ) : (
            <>
              {/* Lista de Produtos */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {items.map((item) => {
                  const currentPrice = item.product.promotionalPrice || item.product.price
                  const itemTotal = currentPrice * item.quantity
                  
                  return (
                    <Card key={item.product.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                              {item.product.brand}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold">
                                {formatPrice(itemTotal)}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="px-2 text-sm min-w-[2rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => removeFromCart(item.product.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-1">
                              {formatPrice(currentPrice)} cada
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              
              <Separator />
              
              {/* Resumo e Ações */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(totalValue)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Link href="/quotes" className="block">
                    <Button className="w-full" size="lg">
                      <FileText className="w-4 h-4 mr-2" />
                      Gerar Orçamento
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={clearCart}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Orçamento
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  Os produtos ficam salvos temporariamente
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}