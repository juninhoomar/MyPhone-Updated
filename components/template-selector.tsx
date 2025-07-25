"use client"

import type { Template, CustomTemplate } from "@/types/template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TemplateCreator } from "./template-creator"
import { TemplateEditor } from "./template-editor"
import { Trash2, User, Edit } from "lucide-react"
import { useState } from "react"

interface TemplateSelectorProps {
  templates: Template[]
  customTemplates: CustomTemplate[]
  selectedTemplate: Template | null
  onSelectTemplate: (template: Template) => void
  onCreateTemplate: (template: Omit<CustomTemplate, "id" | "isCustom" | "createdAt">) => void
  onUpdateTemplate?: (templateId: string, template: Omit<CustomTemplate, "id" | "isCustom" | "createdAt">) => void
  onDeleteTemplate?: (templateId: string) => void
}

export function TemplateSelector({
  templates,
  customTemplates,
  selectedTemplate,
  onSelectTemplate,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: TemplateSelectorProps) {
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null)
  const allTemplates = [...templates, ...customTemplates]
  const categories = Array.from(new Set(allTemplates.map((t) => t.category)))

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">Escolha um Template</h2>
        <p className="text-muted-foreground text-lg">
          Selecione um template existente ou crie um personalizado para suas necessidades
        </p>
      </div>

      {categories.map((category) => {
        const categoryTemplates = allTemplates.filter((template) => template.category === category)

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold">{category}</h3>
              <Badge variant="secondary" className="text-sm">
                {categoryTemplates.length} template{categoryTemplates.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Add Template Creator Card for each category */}
              {category === categories[0] && <TemplateCreator onCreateTemplate={onCreateTemplate} />}

              {categoryTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                    selectedTemplate?.id === template.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                  }`}
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight flex items-center gap-2">
                          {template.name}
                          {"isCustom" in template && template.isCustom && <User className="w-4 h-4 text-blue-500" />}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {template.variables.length} variáveis
                          </Badge>
                        </div>
                      </div>

                      {"isCustom" in template && template.isCustom && (onUpdateTemplate || onDeleteTemplate) && (
                        <div className="flex gap-1">
                          {onUpdateTemplate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTemplate(template)
                              }}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDeleteTemplate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteTemplate(template.id)
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="text-sm mb-4 line-clamp-2">{template.description}</CardDescription>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable) => (
                          <Badge key={variable.id} variant="outline" className="text-xs">
                            {variable.type}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3}
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                        className="ml-2"
                      >
                        {selectedTemplate?.id === template.id ? "Selecionado" : "Usar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {/* Show creator card if no templates exist */}
      {allTemplates.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <TemplateCreator onCreateTemplate={onCreateTemplate} />
        </div>
      )}

      <TemplateEditor
        template={editingTemplate}
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        onUpdateTemplate={onUpdateTemplate}
      />
    </div>
  )
}
