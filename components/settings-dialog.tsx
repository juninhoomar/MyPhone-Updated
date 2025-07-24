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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import type { AppSettings } from "@/types/template"

interface SettingsDialogProps {
  settings: AppSettings
  onUpdateSettings: (settings: Partial<AppSettings>) => void
}

export function SettingsDialog({ settings, onUpdateSettings }: SettingsDialogProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(settings.openaiApiKey || "")

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      openaiApiKey: tempApiKey,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configurações Rápidas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações Rápidas</DialogTitle>
          <DialogDescription>
            Configure rapidamente sua chave da API OpenAI ou acesse as configurações completas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da API OpenAI</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sua chave será armazenada localmente e usada para gerar imagens com DALL-E
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageSize">Tamanho da Imagem</Label>
            <Select
              value={settings.defaultImageSize}
              onValueChange={(value: "256x256" | "512x512" | "1024x1024") =>
                onUpdateSettings({ defaultImageSize: value })
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

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar
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
