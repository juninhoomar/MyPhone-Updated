"use client"

import { useRouter } from "next/navigation"
import { useProducts } from "@/hooks/use-products"
import { ProductForm } from "@/components/product-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

export default function AddProductPage() {
  const router = useRouter()
  const { addProduct } = useProducts()

  const handleSubmit = (productData: any) => {
    addProduct(productData)
    router.push("/catalog")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/catalog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Catálogo
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Cadastrar Produto</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <ProductForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
