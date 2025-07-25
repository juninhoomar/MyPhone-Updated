"use client"

import { useState, useEffect } from "react"
import { TemplateService } from "@/lib/template-service"
import { Template, CustomTemplate } from "@/types/template"
import { useAdGenerator } from "@/hooks/use-ad-generator"
import { useAppSettings } from "@/hooks/use-app-settings"
import { TemplateSelector } from "@/components/template-selector"
import { VariableConfigurator } from "@/components/variable-configurator"
import { GeneratedResult } from "@/components/generated-result"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Zap, Target, Globe } from "lucide-react"

export default function PromptsPage() {
  const {
    selectedTemplate,
    setSelectedTemplate,
    variables,
    updateVariable,
    uploadedImages,
    uploadImage,
    currentPost,
    isGenerating,
    generatePost,
    resetForm,
  } = useAdGenerator()

  const { settings } = useAppSettings()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar templates do banco de dados
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true)
        const dbTemplates = await TemplateService.getAllTemplates()
        setTemplates(dbTemplates)
      } catch (error) {
        console.error('Erro ao carregar templates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  // Funções CRUD para templates
  const handleCreateTemplate = async (template: Omit<Template, 'id'>) => {
    try {
      const newTemplate = await TemplateService.createTemplate(template)
      if (newTemplate) {
        setTemplates(prev => [newTemplate, ...prev])
      }
    } catch (error) {
      console.error('Erro ao criar template:', error)
    }
  }

  const handleUpdateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const updatedTemplate = await TemplateService.updateTemplate(id, updates)
      if (updatedTemplate) {
        setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t))
      }
    } catch (error) {
      console.error('Erro ao atualizar template:', error)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const success = await TemplateService.deleteTemplate(id)
      if (success) {
        setTemplates(prev => prev.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Erro ao deletar template:', error)
    }
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    // Initialize variables with default values
    const initialVariables: Record<string, string> = {}
    template.variables.forEach((variable) => {
      if (variable.defaultValue) {
        initialVariables[variable.id] = variable.defaultValue
      }
    })
    template.variables.forEach((variable) => {
      updateVariable(variable.id, initialVariables[variable.id] || "")
    })
  }

  const handleBack = () => {
    setSelectedTemplate(null)
    resetForm()
  }

  const handleGenerateNew = () => {
    generatePost(settings)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gerador de Posts Publicitários
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Crie posts publicitários profissionais em segundos usando IA. Personalize templates, configure variáveis e
            gere conteúdo único para sua marca.
          </p>
        </div>

        {/* Features */}
        {!selectedTemplate && !currentPost && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="text-center">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Gere posts em segundos com templates otimizados
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Configure variáveis específicas para sua marca
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">IA traduz contexto mantendo textos originais</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">Resultados de qualidade para suas campanhas</CardDescription>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentPost ? (
            <GeneratedResult post={currentPost} onGenerateNew={handleGenerateNew} onReset={resetForm} />
          ) : selectedTemplate ? (
            <VariableConfigurator
              template={selectedTemplate}
              variables={variables}
              uploadedImages={uploadedImages}
              onUpdateVariable={updateVariable}
              onUploadImage={uploadImage}
              onGenerate={generatePost}
              onBack={handleBack}
              isGenerating={isGenerating}
              settings={settings}
            />
          ) : (
            <TemplateSelector
              templates={templates.filter(t => !t.isCustom)}
              customTemplates={templates.filter(t => t.isCustom) as CustomTemplate[]}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onCreateTemplate={handleCreateTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
