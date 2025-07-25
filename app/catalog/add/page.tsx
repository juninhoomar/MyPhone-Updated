"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProducts } from "@/hooks/use-products"
import { ProductForm } from "@/components/product-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Edit, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/types/product"

export default function AddProductPage() {
  const router = useRouter()
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (productData: any) => {
    try {
      setIsSubmitting(true)
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await addProduct(productData)
      }
      setShowForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      // Aqui você pode adicionar um toast de erro
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(productId)
      } catch (error) {
        console.error('Erro ao excluir produto:', error)
      }
    }
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/catalog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Catálogo
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">
                {showForm ? (editingProduct ? 'Editar Produto' : 'Cadastrar Produto') : 'Gerenciar Produtos'}
              </h1>
            </div>
          </div>
          
          {!showForm && (
            <Button onClick={handleNewProduct} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          )}
        </div>

        {showForm ? (
          /* Form */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
            <ProductForm 
              onSubmit={handleSubmit} 
              initialData={editingProduct || undefined}
              isEditing={!!editingProduct}
            />
          </div>
        ) : (
          /* Products List */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Cadastrados ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhum produto cadastrado ainda</p>
                    <Button onClick={handleNewProduct}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Produto
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                              <p className="text-xs text-gray-500 truncate">{product.brand} - {product.model}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                                <Badge 
                                  variant={product.status === 'available' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {product.status === 'available' ? 'Disponível' : 
                                   product.status === 'out_of_stock' ? 'Sem Estoque' : 'Descontinuado'}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium mt-1">
                                R$ {(product.promotionalPrice || product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
