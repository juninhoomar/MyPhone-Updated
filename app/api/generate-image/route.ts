import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    let prompt: string
    let apiKey: string
    let size = "1024x1024"
    let style = "vivid"
    let referenceImageFile: File | null = null

    // Check if request contains FormData (with reference image)
    const contentType = req.headers.get('content-type')
    if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData()
      prompt = formData.get('prompt') as string
      apiKey = formData.get('apiKey') as string
      size = (formData.get('size') as string) || "1024x1024"
      style = (formData.get('style') as string) || "vivid"
      
      const referenceImage = formData.get('referenceImage') as File
      if (referenceImage) {
        referenceImageFile = referenceImage
      }
    } else {
      // Regular JSON request
      const body = await req.json()
      prompt = body.prompt
      apiKey = body.apiKey
      size = body.size || "1024x1024"
      style = body.style || "vivid"
    }

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

    console.log("Tentando usar GPT Image 1...")
    
    // Enhance prompt with reference image context if available
    let enhancedPrompt = prompt
    if (referenceImageFile) {
      enhancedPrompt = `${prompt}\n\nUse a imagem de referência fornecida como inspiração para o estilo, composição ou elementos visuais. Mantenha a essência da imagem de referência mas adapte para o contexto do anúncio solicitado.`
    }
    
    let response: Response
    
    // If we have a reference image, use the edits endpoint
    if (referenceImageFile) {
      // Create FormData for the edits endpoint
      const formData = new FormData()
      
      // Use the original file directly
      formData.append('image', referenceImageFile)
      formData.append('prompt', enhancedPrompt)
      formData.append('model', 'gpt-image-1')
      formData.append('size', size)
      formData.append('quality', 'high')
      formData.append('output_format', 'png')
      formData.append('n', '1')
      
      response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Organization": "org-1XNlRt2YHFhu8sYt4uVRClOR",
        },
        body: formData,
      })
    } else {
      // Use the regular generations endpoint for text-only prompts
      const requestBody = {
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        size: size,
        quality: "high",
        output_format: "png",
        n: 1,
      }
      
      response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Organization": "org-1XNlRt2YHFhu8sYt4uVRClOR",
        },
        body: JSON.stringify(requestBody),
      })
    }

    // If GPT Image 1 fails due to verification issues, show helpful message
    if (!response.ok) {
      const error = await response.json()
      console.error("GPT Image 1 Error:", error)
      
      if (response.status === 403 && error.error?.message?.includes("organization must be verified")) {
        return NextResponse.json({
          error: "Organização ainda não verificada para GPT Image 1. Aguarde até 30 minutos após a verificação ou crie uma nova chave API. Detalhes: " + error.error.message,
          verificationRequired: true,
          verificationUrl: "https://platform.openai.com/settings/organization/general"
        }, { status: 403 })
      }
      
      throw new Error(error.error?.message || `API Error: ${response.status} - ${error.error?.type || 'Unknown error'}`)
    }

    const data = await response.json()
    
    // Extract image from response
    const imageData = data.data?.[0]
    
    if (!imageData) {
      throw new Error("No image data returned from GPT Image 1")  
    }
    
    // GPT Image 1 always returns base64 encoded images
    const imageUrl = `data:image/png;base64,${imageData.b64_json}`

    console.log("Imagem gerada com sucesso usando GPT Image 1")
    return NextResponse.json({
      imageUrl,
      description: "Imagem gerada com GPT Image 1",
      isPlaceholder: false,
      modelUsed: 'gpt-image-1'
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 },
    )
  }
}
