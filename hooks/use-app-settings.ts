"use client"

import { useState, useEffect } from "react"
import type { AppSettings, CustomTemplate } from "@/types/template"

const SETTINGS_KEY = "ad-generator-settings"
const CUSTOM_TEMPLATES_KEY = "ad-generator-custom-templates"

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

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
    }

    const savedTemplates = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
    if (savedTemplates) {
      setCustomTemplates(JSON.parse(savedTemplates))
    }
  }, [])

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

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem(SETTINGS_KEY)
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

  const deleteCustomTemplate = (templateId: string) => {
    const updatedTemplates = customTemplates.filter((t) => t.id !== templateId)
    setCustomTemplates(updatedTemplates)
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates))
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    customTemplates,
    addCustomTemplate,
    deleteCustomTemplate,
  }
}
