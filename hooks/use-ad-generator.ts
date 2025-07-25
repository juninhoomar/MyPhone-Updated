"use client"

import { useState, useCallback } from "react"
import type { Template, GeneratedPost, AppSettings } from "@/types/template"

export function useAdGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({})
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPost, setCurrentPost] = useState<GeneratedPost | null>(null)

  const updateVariable = useCallback((variableId: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [variableId]: value,
    }))
  }, [])

  const uploadImage = useCallback(
    (variableId: string, file: File) => {
      const url = URL.createObjectURL(file)
      setUploadedImages((prev) => ({
        ...prev,
        [variableId]: url,
      }))
      updateVariable(variableId, file.name)
    },
    [updateVariable],
  )

  const generatePrompt = useCallback((template: Template, vars: Record<string, string>) => {
    let prompt = template.prompt

    template.variables.forEach((variable) => {
      const value = vars[variable.id] || variable.defaultValue || ""
      prompt = prompt.replace(new RegExp(`{${variable.id}}`, "g"), value)
    })

    return prompt
  }, [])

  const generatePost = useCallback(
    async (settings: AppSettings, referenceImage?: File) => {
      if (!selectedTemplate) return

      setIsGenerating(true)

      try {
        const prompt = generatePrompt(selectedTemplate, variables)

        // Prepare form data if there's a reference image
        let body: string | FormData
        let headers: Record<string, string>

        if (referenceImage) {
          const formData = new FormData()
          formData.append('prompt', prompt)
          formData.append('apiKey', settings.openaiApiKey || '')
          formData.append('size', settings.defaultImageSize)
          formData.append('style', settings.imageStyle)
          formData.append('referenceImage', referenceImage)
          body = formData
          headers = {} // Let browser set Content-Type for FormData
        } else {
          body = JSON.stringify({
            prompt,
            apiKey: settings.openaiApiKey,
            size: settings.defaultImageSize,
            style: settings.imageStyle,
          })
          headers = { "Content-Type": "application/json" }
        }

        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers,
          body,
        })

        const data = await response.json()
        
        if (!response.ok) {
          if (data.verificationRequired) {
            throw new Error(`Verificação necessária: ${data.error}\n\nPor favor, verifique sua organização em: ${data.verificationUrl}`)
          }
          throw new Error(data.error || "Failed to generate image")
        }

        const newPost: GeneratedPost = {
          id: Date.now().toString(),
          templateId: selectedTemplate.id,
          variables: { ...variables },
          imageUrl: data.imageUrl,
          createdAt: new Date(),
        }

        setGeneratedPosts((prev) => [newPost, ...prev])
        setCurrentPost(newPost)
      } catch (error) {
        console.error("Error generating post:", error)
      } finally {
        setIsGenerating(false)
      }
    },
    [selectedTemplate, variables, generatePrompt],
  )

  const resetForm = useCallback(() => {
    setVariables({})
    setUploadedImages({})
    setCurrentPost(null)
  }, [])

  return {
    selectedTemplate,
    setSelectedTemplate,
    variables,
    updateVariable,
    uploadedImages,
    uploadImage,
    generatedPosts,
    currentPost,
    isGenerating,
    generatePost,
    resetForm,
    generatePrompt,
  }
}
