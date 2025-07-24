import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey, size = "1024x1024", style = "vivid" } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!apiKey) {
      // Return placeholder if no API key
      const imageUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(prompt)}`
      return NextResponse.json({
        imageUrl,
        description: "Imagem de demonstração - Configure sua chave OpenAI para gerar imagens reais",
        isPlaceholder: true,
      })
    }

    // Generate real image with DALL-E
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        style: style,
        response_format: "url",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to generate image")
    }

    const data = await response.json()
    const imageUrl = data.data[0]?.url

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI")
    }

    return NextResponse.json({
      imageUrl,
      description: "Imagem gerada com DALL-E 3",
      isPlaceholder: false,
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 },
    )
  }
}
