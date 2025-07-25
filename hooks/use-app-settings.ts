"use client"

import { useState, useEffect } from "react"
import type { AppSettings, CustomTemplate } from "@/types/template"
import { encryptText, decryptText } from "@/lib/crypto"
import { supabase } from "@/lib/supabase"

const CUSTOM_TEMPLATES_KEY = "ad-generator-custom-templates"
const USER_ID = "default_user" // Para futuro suporte multi-usuário

const defaultSettings: AppSettings = {
  defaultImageSize: "1024x1024",
  imageStyle: "vivid",
  theme: "system",
  language: "pt",
  notifications: true,
  autoSave: true,
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  defaultDiscount: 0,
  currency: "BRL",
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from Supabase on mount
  useEffect(() => {
    loadSettings()
    loadCustomTemplates()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', USER_ID)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao carregar configurações:', error)
        setIsLoading(false)
        return
      }

      if (data && data.settings) {
        const savedSettings = data.settings
        const loadedSettings: AppSettings = {
          openaiApiKey: savedSettings.openaiApiKey ? decryptText(savedSettings.openaiApiKey) : undefined,
          defaultImageSize: savedSettings.defaultImageSize || defaultSettings.defaultImageSize,
          imageStyle: savedSettings.imageStyle || defaultSettings.imageStyle,
          theme: savedSettings.theme || defaultSettings.theme,
          language: savedSettings.language || defaultSettings.language,
          notifications: savedSettings.notifications ?? defaultSettings.notifications,
          autoSave: savedSettings.autoSave ?? defaultSettings.autoSave,
          companyName: savedSettings.companyName || defaultSettings.companyName,
          companyEmail: savedSettings.companyEmail || defaultSettings.companyEmail,
          companyPhone: savedSettings.companyPhone || defaultSettings.companyPhone,
          companyAddress: savedSettings.companyAddress || defaultSettings.companyAddress,
          defaultDiscount: savedSettings.defaultDiscount || defaultSettings.defaultDiscount,
          currency: savedSettings.currency || defaultSettings.currency,
        }
        setSettings(loadedSettings)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCustomTemplates = () => {
    const savedTemplates = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
    if (savedTemplates) {
      setCustomTemplates(JSON.parse(savedTemplates))
    }
  }

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    if (settings.theme === "dark") {
      root.classList.add("dark")
    } else if (settings.theme === "light") {
      root.classList.remove("dark")
    } else {
      // System theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      if (mediaQuery.matches) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }, [settings.theme])

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    try {
      // Prepara os dados para salvar no Supabase
      const settingsToSave = {
        openaiApiKey: updatedSettings.openaiApiKey ? encryptText(updatedSettings.openaiApiKey) : undefined,
        defaultImageSize: updatedSettings.defaultImageSize,
        imageStyle: updatedSettings.imageStyle,
        theme: updatedSettings.theme,
        language: updatedSettings.language,
        notifications: updatedSettings.notifications,
        autoSave: updatedSettings.autoSave,
        companyName: updatedSettings.companyName,
        companyEmail: updatedSettings.companyEmail,
        companyPhone: updatedSettings.companyPhone,
        companyAddress: updatedSettings.companyAddress,
        defaultDiscount: updatedSettings.defaultDiscount,
        currency: updatedSettings.currency,
      }

      const dataToSave = {
        user_id: USER_ID,
        settings: settingsToSave,
      }

      // Tenta fazer upsert (insert ou update)
      const { error } = await supabase
        .from('app_settings')
        .upsert(dataToSave, { onConflict: 'user_id' })

      if (error) {
        console.error('Erro ao salvar configurações:', error)
        throw error
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      // Em caso de erro, reverte as configurações locais
      setSettings(settings)
      throw error
    }
  }

  const resetSettings = async () => {
    try {
      // Remove as configurações do Supabase
      const { error } = await supabase
        .from('app_settings')
        .delete()
        .eq('user_id', USER_ID)

      if (error) {
        console.error('Erro ao resetar configurações:', error)
        throw error
      }

      setSettings(defaultSettings)
    } catch (error) {
      console.error('Erro ao resetar configurações:', error)
      throw error
    }
  }

  const addCustomTemplate = (template: Omit<CustomTemplate, "id" | "isCustom" | "createdAt">) => {
    const newTemplate: CustomTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date(),
    }
    const updatedTemplates = [...customTemplates, newTemplate]
    setCustomTemplates(updatedTemplates)
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates))
    return newTemplate
  }

  const updateCustomTemplate = (templateId: string, updatedTemplate: Omit<CustomTemplate, "id" | "isCustom" | "createdAt">) => {
    const updatedTemplates = customTemplates.map((t) => 
      t.id === templateId 
        ? { ...t, ...updatedTemplate }
        : t
    )
    setCustomTemplates(updatedTemplates)
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates))
  }

  const deleteCustomTemplate = (templateId: string) => {
    const updatedTemplates = customTemplates.filter((t) => t.id !== templateId)
    setCustomTemplates(updatedTemplates)
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates))
  }

  return {
    settings,
    customTemplates,
    isLoading,
    updateSettings,
    resetSettings,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
  }
}
