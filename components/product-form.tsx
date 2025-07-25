"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Upload, Trash2, Palette } from "lucide-react"
import Image from "next/image"
import type { Product, ProductSpecification, ProductCategory, ProductColor } from "@/types/product"
import { PRODUCT_CATEGORIES } from "@/types/product"
import { formatPriceInput, parsePriceInput } from "@/utils/format-price"
import { uploadMultipleProductImages, deleteProductImage } from "@/lib/image-upload"

interface ProductFormProps {
  onSubmit: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void
  initialData?: Partial<Product>
  isEditing?: boolean
}

export function ProductForm({ onSubmit, initialData, isEditing = false }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    sku: initialData?.sku || "",
    category: initialData?.category || ("smartphone" as ProductCategory),
    price: initialData?.price || 0,
    promotionalPrice: initialData?.promotionalPrice || 0,
    stockQuantity: initialData?.stockQuantity || 0,
    description: initialData?.description || "",
    status: initialData?.status || ("available" as const),
  })

  const [priceDisplay, setPriceDisplay] = useState(formatPriceInput(initialData?.price || 0))
  const [promotionalPriceDisplay, setPromotionalPriceDisplay] = useState(formatPriceInput(initialData?.promotionalPrice || 0))

  const [specifications, setSpecifications] = useState<ProductSpecification[]>(initialData?.specifications || [])
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [colors, setColors] = useState<ProductColor[]>(initialData?.colors || [])
  const [newSpec, setNewSpec] = useState({ name: "", value: "" })
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSpecification = () => {
    if (newSpec.name && newSpec.value) {
      setSpecifications((prev) => [...prev, { ...newSpec }])
      setNewSpec({ name: "", value: "" })
    }
  }

  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index))
  }

  const addColor = () => {
    if (newColor.name && newColor.hex) {
      setColors((prev) => [...prev, { ...newColor }])
      setNewColor({ name: "", hex: "#000000" })
    }
  }

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePriceChange = (value: string, field: 'price' | 'promotionalPrice') => {
    // Permitir apenas números, vírgulas e pontos
    const cleanValue = value.replace(/[^0-9.,]/g, '')
    
    if (field === 'price') {
      setPriceDisplay(cleanValue)
      const numericValue = parsePriceInput(cleanValue)
      handleInputChange('price', numericValue)
    } else {
      setPromotionalPriceDisplay(cleanValue)
      const numericValue = parsePriceInput(cleanValue)
      handleInputChange('promotionalPrice', numericValue)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      try {
        // Gerar um ID temporário para o produto se não existir
        const tempProductId = formData.name ? formData.name.replace(/\s+/g, '-').toLowerCase() : 'temp-' + Date.now()
        const uploadResults = await uploadMultipleProductImages(Array.from(files), tempProductId)
        const uploadedUrls = uploadResults.map(result => result.url)
        setImages((prev) => [...prev, ...uploadedUrls])
      } catch (error) {
        console.error('Erro ao fazer upload das imagens:', error)
        // Mostrar mensagem de erro mais detalhada
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        alert(`Erro no upload: ${errorMessage}. As imagens serão exibidas apenas localmente.`)
        // Fallback para preview local em caso de erro
        Array.from(files).forEach((file) => {
          const url = URL.createObjectURL(file)
          setImages((prev) => [...prev, url])
        })
      }
    }
  }

  const removeImage = async (index: number) => {
    const imageUrl = images[index]
    try {
      if (imageUrl && !imageUrl.startsWith('blob:')) {
        // Extrair o path da URL para deletar do storage
        const urlParts = imageUrl.split('/storage/v1/object/public/product-images/')
        if (urlParts.length > 1) {
          await deleteProductImage(urlParts[1])
        }
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error)
    }
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      ...formData,
      specifications,
      images,
      colors,
      promotionalPrice: formData.promotionalPrice || undefined,
    }

    onSubmit(productData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: iPhone 15 Pro Max"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="Ex: Apple"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="Ex: A2848"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Código do Produto) *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Ex: IPH15PM-256-BLK"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ProductCategory) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="out_of_stock">Fora de Estoque</SelectItem>
                  <SelectItem value="discontinued">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Preços</CardTitle>
            <CardDescription>Configuração de preços do produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço Original (R$) *</Label>
              <Input
                id="price"
                type="text"
                value={priceDisplay}
                onChange={(e) => handlePriceChange(e.target.value, 'price')}
                placeholder="1.999,99"
                required
              />
              <p className="text-xs text-muted-foreground">Use o formato brasileiro: 1.999,99</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionalPrice">Preço Promocional (R$)</Label>
              <Input
                id="promotionalPrice"
                type="text"
                value={promotionalPriceDisplay}
                onChange={(e) => handlePriceChange(e.target.value, 'promotionalPrice')}
                placeholder="1.799,99"
              />
              <p className="text-xs text-muted-foreground">Deixe em branco se não houver promoção</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Quantidade em Estoque *</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value) || 0)}
                placeholder="100"
                required
              />
              <p className="text-xs text-muted-foreground">Quantidade disponível para venda</p>
            </div>

            {formData.promotionalPrice > 0 && formData.promotionalPrice < formData.price && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  Desconto: {(((formData.price - formData.promotionalPrice) / formData.price) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição</CardTitle>
          <CardDescription>Descrição detalhada do produto</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Descreva as características e benefícios do produto..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Especificações Técnicas</CardTitle>
          <CardDescription>Adicione as especificações técnicas do produto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Nome da especificação"
              value={newSpec.name}
              onChange={(e) => setNewSpec((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Valor"
              value={newSpec.value}
              onChange={(e) => setNewSpec((prev) => ({ ...prev, value: e.target.value }))}
            />
            <Button type="button" onClick={addSpecification} disabled={!newSpec.name || !newSpec.value}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {specifications.length > 0 && (
            <div className="space-y-2">
              <Label>Especificações Adicionadas:</Label>
              <div className="space-y-2">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{spec.name}:</span> {spec.value}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSpecification(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Cores Disponíveis
          </CardTitle>
          <CardDescription>Adicione as cores disponíveis para este produto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Nome da cor"
              value={newColor.name}
              onChange={(e) => setNewColor((prev) => ({ ...prev, name: e.target.value }))}
            />
            <div className="space-y-2">
              <Label htmlFor="colorPicker">Cor</Label>
              <div className="flex gap-2">
                <input
                  id="colorPicker"
                  type="color"
                  value={newColor.hex}
                  onChange={(e) => setNewColor((prev) => ({ ...prev, hex: e.target.value }))}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={newColor.hex}
                  onChange={(e) => setNewColor((prev) => ({ ...prev, hex: e.target.value }))}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="button" onClick={addColor} disabled={!newColor.name || !newColor.hex} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cor
              </Button>
            </div>
          </div>

          {colors.length > 0 && (
            <div className="space-y-2">
              <Label>Cores Adicionadas:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="font-medium">{color.name}</span>
                      <Badge variant="outline" className="text-xs">{color.hex}</Badge>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeColor(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Imagens</CardTitle>
          <CardDescription>Adicione imagens do produto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Imagens
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-lg border">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Produto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="min-w-[200px]">
          {isEditing ? "Atualizar Produto" : "Cadastrar Produto"}
        </Button>
      </div>
    </form>
  )
}
