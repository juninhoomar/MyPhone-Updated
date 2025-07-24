"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, GripVertical } from "lucide-react"
import type { TemplateVariable, CustomTemplate } from "@/types/template"

interface TemplateCreatorProps {
  onCreateTemplate: (template: Omit<CustomTemplate, "id" | "isCustom" | "createdAt">) => void
}

export function TemplateCreator({ onCreateTemplate }: TemplateCreatorProps) {
  const [open, setOpen] = useState(false)
  const [templateData, setTemplateData] = useState({
    name: "",
    category: "",
    description: "",
    prompt: "",
  })
  const [variables, setVariables] = useState<TemplateVariable[]>([])

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

  const handleCreate = () => {
    if (!templateData.name || !templateData.prompt) return

    onCreateTemplate({
      ...templateData,
      variables,
      thumbnail: undefined,
    })

    // Reset form
    setTemplateData({ name: "", category: "", description: "", prompt: "" })
    setVariables([])
    setOpen(false)
  }

  const variableTypes = [
    { value: "text", label: "Texto" },
    { value: "textarea", label: "Texto Longo" },
    { value: "number", label: "Número" },
    { value: "color", label: "Cor" },
    { value: "select", label: "Seleção" },
    { value: "image", label: "Imagem" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Plus className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Criar Novo Template</h3>
            <p className="text-sm text-muted-foreground">Crie um template personalizado para suas necessidades</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Template</DialogTitle>
          <DialogDescription>Configure seu template personalizado com variáveis específicas</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Info */}
          <div className="grid grid-cols-2 gap-4">
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
                placeholder="Ex: Eletrônicos"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={templateData.description}
              onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              placeholder="Descreva para que serve este template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt do Template</Label>
            <Textarea
              id="prompt"
              value={templateData.prompt}
              onChange={(e) => setTemplateData({ ...templateData, prompt: e.target.value })}
              placeholder="Descreva o prompt usando variáveis como {NOME_PRODUTO}, {COR_FUNDO}, etc."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Use chaves para definir variáveis: {"{NOME_VARIAVEL}"}. Exemplo: "Uma propaganda de {"{PRODUTO}"} com
              fundo {"{COR}"}..."
            </p>
          </div>

          {/* Variables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Variáveis</Label>
              <Button onClick={addVariable} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Variável
              </Button>
            </div>

            {variables.map((variable, index) => (
              <Card key={variable.id} className="p-4">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-1 flex justify-center">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="col-span-3">
                    <Label className="text-xs">ID da Variável</Label>
                    <Input
                      value={variable.id}
                      onChange={(e) => updateVariable(index, { id: e.target.value.toUpperCase() })}
                      placeholder="NOME_PRODUTO"
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-3">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={variable.label}
                      onChange={(e) => updateVariable(index, { label: e.target.value })}
                      placeholder="Nome do Produto"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Tipo</Label>
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

                  <div className="col-span-2">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={variable.placeholder || ""}
                      onChange={(e) => updateVariable(index, { placeholder: e.target.value })}
                      placeholder="Ex: iPhone 15"
                    />
                  </div>

                  <div className="col-span-1">
                    <Button variant="outline" size="sm" onClick={() => removeVariable(index)} className="w-full">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {variable.type === "select" && (
                  <div className="mt-3">
                    <Label className="text-xs">Opções (separadas por vírgula)</Label>
                    <Input
                      value={variable.options?.join(", ") || ""}
                      onChange={(e) =>
                        updateVariable(index, {
                          options: e.target.value
                            .split(",")
                            .map((opt) => opt.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="opção1, opção2, opção3"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!templateData.name || !templateData.prompt}>
              Criar Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
