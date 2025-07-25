"use client"

import { useState, useEffect } from "react"
import { useAppSettings } from "@/hooks/use-app-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Eye,
  EyeOff,
  Palette,
  Globe,
  Bell,
  Save,
  Building,
  Sparkles,
  RotateCcw,
  Shield,
  Zap,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, isLoading } = useAppSettings()
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempSettings, setTempSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...tempSettings, [key]: value }
    setTempSettings(newSettings)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSettings(tempSettings)
      setHasChanges(false)
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      await resetSettings()
      setTempSettings(settings)
      setHasChanges(false)
      toast({
        title: "Configurações resetadas",
        description: "Todas as configurações foram restauradas para o padrão.",
      })
    } catch (error) {
      toast({
        title: "Erro ao resetar",
        description: "Ocorreu um erro ao resetar as configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    setTempSettings(settings)
    setHasChanges(false)
  }

  // Sincroniza tempSettings quando settings mudar (após carregamento)
  useEffect(() => {
    if (!isLoading) {
      setTempSettings(settings)
    }
  }, [settings, isLoading])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600" />
            Configurações
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalize sua experiência e configure as preferências do aplicativo
          </p>
        </div>

        {hasChanges && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDiscard}
              disabled={isSaving || isLoading}
            >
              Descartar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="ai">IA & API</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Preferências Gerais
              </CardTitle>
              <CardDescription>Configure as preferências básicas do aplicativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={tempSettings.language}
                    onValueChange={(value: "pt" | "en" | "es") => handleSettingChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">🇧🇷 Português</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select
                    value={tempSettings.currency}
                    onValueChange={(value: "BRL" | "USD" | "EUR") => handleSettingChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">R$ Real Brasileiro</SelectItem>
                      <SelectItem value="USD">$ Dólar Americano</SelectItem>
                      <SelectItem value="EUR">€ Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notificações
                    </Label>
                    <p className="text-sm text-muted-foreground">Receber notificações sobre atualizações e novidades</p>
                  </div>
                  <Switch
                    checked={tempSettings.notifications}
                    onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvamento Automático
                    </Label>
                    <p className="text-sm text-muted-foreground">Salvar automaticamente as alterações</p>
                  </div>
                  <Switch
                    checked={tempSettings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de IA */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Configurações de IA
              </CardTitle>
              <CardDescription>Configure a integração com OpenAI e preferências de geração</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Chave da API OpenAI
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={tempSettings.openaiApiKey || ""}
                    onChange={(e) => handleSettingChange("openaiApiKey", e.target.value)}
                    placeholder="sk-..."
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sua chave será armazenada localmente e usada para gerar imagens com GPT Image 1
                </p>
                {tempSettings.openaiApiKey && (
                  <Badge variant="secondary" className="w-fit">
                    ✅ Chave configurada
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="imageSize">Tamanho da Imagem</Label>
                  <Select
                    value={tempSettings.defaultImageSize}
                    onValueChange={(value: "256x256" | "512x512" | "1024x1024") =>
                      handleSettingChange("defaultImageSize", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="256x256">256x256 (Rápido)</SelectItem>
                      <SelectItem value="512x512">512x512 (Médio)</SelectItem>
                      <SelectItem value="1024x1024">1024x1024 (Alta Qualidade)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageStyle">Estilo da Imagem</Label>
                  <Select
                    value={tempSettings.imageStyle}
                    onValueChange={(value: "natural" | "vivid") => handleSettingChange("imageStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="vivid">Vibrante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência
              </CardTitle>
              <CardDescription>Personalize a aparência e tema do aplicativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={tempSettings.theme}
                  onValueChange={(value: "light" | "dark" | "system") => handleSettingChange("theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Claro</SelectItem>
                    <SelectItem value="dark">🌙 Escuro</SelectItem>
                    <SelectItem value="system">🖥️ Sistema</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Escolha o tema que será aplicado ao aplicativo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações da Empresa */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>Configure os dados da sua empresa para orçamentos e documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={tempSettings.companyName}
                    onChange={(e) => handleSettingChange("companyName", e.target.value)}
                    placeholder="Sua Empresa Ltda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">E-mail</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={tempSettings.companyEmail}
                    onChange={(e) => handleSettingChange("companyEmail", e.target.value)}
                    placeholder="contato@suaempresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefone</Label>
                  <Input
                    id="companyPhone"
                    value={tempSettings.companyPhone}
                    onChange={(e) => handleSettingChange("companyPhone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultDiscount">Desconto Padrão (%)</Label>
                  <Input
                    id="defaultDiscount"
                    type="number"
                    min="0"
                    max="100"
                    value={tempSettings.defaultDiscount}
                    onChange={(e) => handleSettingChange("defaultDiscount", Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Endereço</Label>
                <Textarea
                  id="companyAddress"
                  value={tempSettings.companyAddress}
                  onChange={(e) => handleSettingChange("companyAddress", e.target.value)}
                  placeholder="Rua Example, 123 - Bairro - Cidade/UF - CEP 00000-000"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>Opções avançadas e gerenciamento de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Resetar Configurações</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Restaura todas as configurações para os valores padrão. Esta ação não pode ser desfeita.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleReset}
                    disabled={isSaving || isLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isSaving ? "Resetando..." : "Resetar Todas as Configurações"}
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Informações do Sistema</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Versão:</span>
                      <Badge variant="outline">1.0.0</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última atualização:</span>
                      <span>Janeiro 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Templates personalizados:</span>
                      <span>0</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
