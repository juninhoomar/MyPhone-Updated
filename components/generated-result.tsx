"use client"

import type { GeneratedPost } from "@/types/template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Copy, RotateCcw } from "lucide-react"
import Image from "next/image"

interface GeneratedResultProps {
  post: GeneratedPost
  onGenerateNew: () => void
  onReset: () => void
}

export function GeneratedResult({ post, onGenerateNew, onReset }: GeneratedResultProps) {
  const handleDownload = () => {
    if (post.imageUrl) {
      const link = document.createElement("a")
      link.href = post.imageUrl
      link.download = `post-${post.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCopyLink = async () => {
    if (post.imageUrl) {
      await navigator.clipboard.writeText(post.imageUrl)
      // You could add a toast notification here
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Post Gerado</h2>
          <p className="text-muted-foreground">Seu post publicitário está pronto!</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
          <Button onClick={onGenerateNew}>Gerar Novamente</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Imagem Gerada</CardTitle>
            <CardDescription>Criado em {post.createdAt.toLocaleString("pt-BR")}</CardDescription>
          </CardHeader>
          <CardContent>
            {post.imageUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border">
                  <Image src={post.imageUrl || "/placeholder.svg"} alt="Post gerado" fill className="object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={handleCopyLink} size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/2] w-full flex items-center justify-center border rounded-lg bg-muted">
                <p className="text-muted-foreground">Imagem não disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variáveis Utilizadas</CardTitle>
            <CardDescription>Configurações aplicadas neste post</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(post.variables).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{key}:</span>
                  <Badge variant="secondary" className="max-w-[200px] truncate">
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
