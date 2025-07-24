"use client"

import type React from "react"

import { useRef, useState } from "react"
import type { Template, TemplateVariable, AppSettings } from "@/types/template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Wand2, Upload, X } from "lucide-react"
import Image from "next/image"

interface VariableConfiguratorProps {
  template: Template
  variables: Record<string, string>
  uploadedImages: Record<string, string>
  onUpdateVariable: (variableId: string, value: string) => void
  onUploadImage: (variableId: string, file: File) => void
  onGenerate: (settings: AppSettings) => void
  onBack: () => void
  isGenerating: boolean
  settings: AppSettings
}

export function VariableConfigurator({
  template,
  variables,
  uploadedImages,
  onUpdateVariable,
  onUploadImage,
  onGenerate,
  onBack,
  isGenerating,
  settings,
}: VariableConfiguratorProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [selectedImageSize, setSelectedImageSize] = useState<string>(settings.defaultImageSize)

  const imageSizeOptions = [
    { value: "1024x1024", label: "Quadrado (1024x1024) - Post Instagram/Facebook" },
    { value: "1024x1792", label: "Vertical (1024x1792) - Stories Instagram" },
    { value: "1792x1024", label: "Horizontal (1792x1024) - Post Facebook" },
    { value: "512x512", label: "Quadrado Pequeno (512x512)" },
    { value: "256x256", label: "Miniatura (256x256)" },
  ]

  const handleImageUpload = (variableId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUploadImage(variableId, file)
    }
  }

  const removeImage = (variableId: string) => {
    onUpdateVariable(variableId, "")
    if (fileInputRefs.current[variableId]) {
      fileInputRefs.current[variableId]!.value = ""
    }
  }

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = variables[variable.id] || variable.defaultValue || ""

    switch (variable.type) {
      case "select":
        return (
          <Select value={value} onValueChange={(newValue) => onUpdateVariable(variable.id, newValue)}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${variable.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
            placeholder={variable.placeholder}
            className="min-h-[80px]"
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
            placeholder={variable.placeholder}
          />
        )

      case "color":
        return (
          <div className="flex gap-2">
            <Input
              type="color"
              value={value}
              onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={value}
              onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
              placeholder={variable.placeholder}
              className="flex-1"
            />
          </div>
        )

      case "image":
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRefs.current[variable.id]?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {value ? "Alterar Imagem" : "Selecionar Imagem"}
              </Button>
              {value && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeImage(variable.id)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <input
              ref={(el) => {
                fileInputRefs.current[variable.id] = el
              }}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(variable.id, e)}
              className="hidden"
            />
            {uploadedImages[variable.id] && (
              <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                <Image
                  src={uploadedImages[variable.id] || "/placeholder.svg"}
                  alt={`Preview ${variable.label}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {value && <p className="text-sm text-muted-foreground">Arquivo: {value}</p>}
          </div>
        )

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
            placeholder={variable.placeholder}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{template.name}</h2>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Preencha as variáveis para personalizar seu post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.variables.map((variable) => (
              <div key={variable.id} className="space-y-2">
                <Label htmlFor={variable.id}>
                  {variable.label}
                  {variable.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderVariableInput(variable)}
              </div>
            ))}

            {/* Seleção de tamanho da imagem */}
            <div className="space-y-2">
              <Label>Tamanho da Imagem</Label>
              <Select value={selectedImageSize} onValueChange={setSelectedImageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => onGenerate({...settings, defaultImageSize: selectedImageSize as any})} disabled={isGenerating} className="w-full" size="lg">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {settings.openaiApiKey ? "Gerar com DALL-E" : "Gerar Preview"}
                </>
              )}
            </Button>

            {!settings.openaiApiKey && (
              <p className="text-xs text-amber-600 text-center">
                Configure sua chave OpenAI nas configurações para gerar imagens reais
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview do Prompt</CardTitle>
            <CardDescription>Visualize como ficará o prompt enviado para a IA</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={template.variables.reduce((prompt, variable) => {
                const value = variables[variable.id] || variable.defaultValue || `{${variable.id}}`
                return prompt.replace(new RegExp(`{${variable.id}}`, "g"), value)
              }, template.prompt)}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
