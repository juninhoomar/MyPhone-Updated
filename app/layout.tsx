import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navigation } from "@/components/navigation"
import { QuoteCartProvider } from "@/contexts/quote-cart-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "MyPhone - Gerador de Posts e Catálogo",
  description: "Sistema completo para geração de posts publicitários e catálogo de produtos eletrônicos",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <QuoteCartProvider>
          <Navigation />
          {children}
        </QuoteCartProvider>
      </body>
    </html>
  )
}
