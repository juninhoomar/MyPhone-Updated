"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Eye, EyeOff, Shield, Check } from "lucide-react"
import Link from "next/link"
import type { AppSettings } from "@/types/template"
import { maskApiKey } from "@/lib/crypto"

interface SettingsDialogProps {
  settings: AppSettings
  onUpdateSettings: (settings: Partial<AppSettings>) => Promise<void>
  isLoading?: boolean
}

export function SettingsDialog({ settings, onUpdateSettings, isLoading = false }: SettingsDialogProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(settings.openaiApiKey || "")
  const [isOpen, setIsOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdateSettings({
        ...settings,
        openaiApiKey: tempApiKey,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUseProvidedKey = () => {
    const providedKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""
    setTempApiKey(providedKey)
  }

  // Sincroniza tempApiKey quando settings mudar
  useEffect(() => {
    setTempApiKey(settings.openaiApiKey || "")
  }, [settings.openaiApiKey])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configurações Rápidas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações Rápidas</DialogTitle>
          <DialogDescription>
            Configure rapidamente sua chave da API OpenAI ou acesse as configurações completas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="apiKey">Chave da API OpenAI</Label>
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Criptografada</span>
            </div>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Botão para usar chave fornecida */}
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleUseProvidedKey}
                className="text-xs"
              >
                Usar Chave Fornecida
              </Button>
              {tempApiKey && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Chave atual: {maskApiKey(tempApiKey)}</span>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Segurança:</p>
                  <ul className="space-y-1">
                    <li>• Sua chave é criptografada antes de ser salva</li>
                    <li>• Armazenada com segurança no banco de dados</li>
                    <li>• Usada exclusivamente para gerar imagens com GPT Image 1</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageSize">Tamanho da Imagem</Label>
            <Select
              value={settings.defaultImageSize}
              onValueChange={(value) =>
                onUpdateSettings({ defaultImageSize: value as "1024x1024" | "1024x1536" | "1536x1024" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x1024">1024x1024 (Quadrado)</SelectItem>
                <SelectItem value="1024x1536">1024x1536 (Retrato)</SelectItem>
                <SelectItem value="1536x1024">1536x1024 (Paisagem)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              className="flex-1" 
              disabled={saved || isSaving || isLoading}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvo!
                </>
              ) : isSaving ? (
                "Salvando..."
              ) : (
                "Salvar"
              )}
            </Button>
            <Link href="/settings">
              <Button variant="outline" className="flex-1 bg-transparent">
                Configurações Completas
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
