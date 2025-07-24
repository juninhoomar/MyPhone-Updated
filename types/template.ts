export interface TemplateVariable {
  id: string
  name: string
  type: "text" | "color" | "number" | "image" | "select" | "textarea"
  label: string
  defaultValue?: string
  options?: string[]
  placeholder?: string
  required?: boolean
}

export interface Template {
  id: string
  name: string
  category: string
  description: string
  prompt: string
  variables: TemplateVariable[]
  thumbnail?: string
}

export interface GeneratedPost {
  id: string
  templateId: string
  variables: Record<string, string>
  imageUrl?: string
  createdAt: Date
}

export interface CustomTemplate extends Template {
  isCustom: boolean
  createdAt: Date
}

export interface AppSettings {
  openaiApiKey?: string
  defaultImageSize: "256x256" | "512x512" | "1024x1024" | "1024x1792" | "1792x1024"
  imageStyle: "natural" | "vivid"
  theme: "light" | "dark" | "system"
  language: "pt" | "en" | "es"
  notifications: boolean
  autoSave: boolean
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  defaultDiscount: number
  currency: "BRL" | "USD" | "EUR"
}

export interface ImageUpload {
  id: string
  file: File
  url: string
  name: string
}
