"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, GripVertical } from "lucide-react"
import type { TemplateVariable, CustomTemplate } from "@/types/template"

interface TemplateEditorProps {
  template: CustomTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateTemplate: (templateId: string, template: Omit<CustomTemplate, "id" | "isCustom" | "createdAt">) => void
}

export function TemplateEditor({ template, open, onOpenChange, onUpdateTemplate }: TemplateEditorProps) {
  const [templateData, setTemplateData] = useState({
    name: "",
    category: "",
    description: "",
    prompt: "",
  })
  const [variables, setVariables] = useState<TemplateVariable[]>([])

  // Atualiza os dados quando o template muda
  useEffect(() => {
    if (template) {
      setTemplateData({
        name: template.name,
        category: template.category,
        description: template.description,
        prompt: template.prompt,
      })
      setVariables([...template.variables])
    }
  }, [template])

  const addVariable = () => {
    const newVariable: TemplateVariable = {
      id: `VAR_${Date.now()}`,
      name: `variable${variables.length + 1}`,
      type: "text",
      label: "",
      placeholder: "",
      required: false,
    }
    setVariables([...variables, newVariable])
  }

  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    const updatedVariables = variables.map((variable, i) => (i === index ? { ...variable, ...updates } : variable))
    setVariables(updatedVariables)
  }

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const handleUpdate = () => {
    if (!template || !templateData.name || !templateData.prompt) return

    onUpdateTemplate(template.id, {
      ...templateData,
      variables,
      thumbnail: template.thumbnail,
    })

    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset para os valores originais
    if (template) {
      setTemplateData({
        name: template.name,
        category: template.category,
        description: template.description,
        prompt: template.prompt,
      })
      setVariables([...template.variables])
    }
    onOpenChange(false)
  }

  const variableTypes = [
    { value: "text", label: "Texto" },
    { value: "textarea", label: "Texto Longo" },
    { value: "number", label: "Número" },
    { value: "color", label: "Cor" },
    { value: "select", label: "Seleção" },
    { value: "image", label: "Imagem" },
  ]

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Template</DialogTitle>
          <DialogDescription>Modifique as configurações do seu template personalizado</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                placeholder="Ex: Propaganda de Produto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={templateData.category}
                onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                placeholder="Ex: Eletrônicos, Roupas, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={templateData.description}
              onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              placeholder="Descreva para que serve este template..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={templateData.prompt}
              onChange={(e) => setTemplateData({ ...templateData, prompt: e.target.value })}
              placeholder="Descreva como a imagem deve ser gerada. Use {VARIAVEL} para inserir variáveis..."
              rows={4}
            />
          </div>

          {/* Variables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Variáveis</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Variável
              </Button>
            </div>

            {variables.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8 text-center">
                  <div>
                    <p className="text-muted-foreground mb-2">Nenhuma variável adicionada</p>
                    <p className="text-sm text-muted-foreground">
                      Adicione variáveis para tornar seu template personalizável
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {variables.map((variable, index) => (
                  <Card key={variable.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Variável {index + 1}</CardTitle>
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariable(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>ID da Variável</Label>
                          <Input
                            value={variable.id}
                            onChange={(e) => updateVariable(index, { id: e.target.value })}
                            placeholder="Ex: PRODUTO_NOME"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            value={variable.name}
                            onChange={(e) => updateVariable(index, { name: e.target.value })}
                            placeholder="Ex: productName"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={variable.type}
                            onValueChange={(value: any) => updateVariable(index, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {variableTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={variable.label}
                            onChange={(e) => updateVariable(index, { label: e.target.value })}
                            placeholder="Ex: Nome do Produto"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Placeholder</Label>
                          <Input
                            value={variable.placeholder || ""}
                            onChange={(e) => updateVariable(index, { placeholder: e.target.value })}
                            placeholder="Ex: Digite o nome do produto..."
                          />
                        </div>
                      </div>

                      {variable.type === "select" && (
                        <div className="space-y-2">
                          <Label>Opções (separadas por vírgula)</Label>
                          <Input
                            value={variable.options?.join(", ") || ""}
                            onChange={(e) =>
                              updateVariable(index, {
                                options: e.target.value.split(",").map((opt) => opt.trim()).filter(Boolean),
                              })
                            }
                            placeholder="Ex: vermelho, azul, verde"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Valor Padrão</Label>
                        <Input
                          value={variable.defaultValue || ""}
                          onChange={(e) => updateVariable(index, { defaultValue: e.target.value })}
                          placeholder="Valor padrão para esta variável"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={!templateData.name || !templateData.prompt}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}