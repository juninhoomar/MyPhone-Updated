import { supabase, DatabaseTemplate } from './supabase'
import { Template, TemplateVariable } from '@/types/template'

export class TemplateService {
  // Buscar todos os templates
  static async getAllTemplates(): Promise<Template[]> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar templates:', error)
        throw error
      }

      return data?.map(this.mapDatabaseToTemplate) || []
    } catch (error) {
      console.error('Erro no serviço de templates:', error)
      return []
    }
  }

  // Buscar template por ID
  static async getTemplateById(id: string): Promise<Template | null> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar template:', error)
        return null
      }

      return data ? this.mapDatabaseToTemplate(data) : null
    } catch (error) {
      console.error('Erro no serviço de templates:', error)
      return null
    }
  }

  // Criar novo template
  static async createTemplate(template: Omit<Template, 'id'>): Promise<Template | null> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: template.name,
          category: template.category,
          description: template.description,
          prompt: template.prompt,
          variables: template.variables,
          thumbnail: template.thumbnail,
          is_custom: template.isCustom || true
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar template:', error)
        throw error
      }

      return data ? this.mapDatabaseToTemplate(data) : null
    } catch (error) {
      console.error('Erro no serviço de templates:', error)
      throw error
    }
  }

  // Atualizar template
  static async updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null> {
    try {
      const updateData: any = {}
      
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.prompt !== undefined) updateData.prompt = updates.prompt
      if (updates.variables !== undefined) updateData.variables = updates.variables
      if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail
      if (updates.isCustom !== undefined) updateData.is_custom = updates.isCustom
      
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar template:', error)
        throw error
      }

      return data ? this.mapDatabaseToTemplate(data) : null
    } catch (error) {
      console.error('Erro no serviço de templates:', error)
      throw error
    }
  }

  // Deletar template
  static async deleteTemplate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar template:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Erro no serviço de templates:', error)
      return false
    }
  }

  // Buscar templates por categoria
  static async getTemplatesByCategory(category: string): Promise<Template[]> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar templates por categoria:', error)
        throw error
      }

      return data?.map(this.mapDatabaseToTemplate) || []
    } catch (error) {
      console.error('Erro no serviço de templates:', error)
      return []
    }
  }

  // Buscar apenas templates customizados
  static async getCustomTemplates(): Promise<Template[]> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_custom', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar templates customizados:', error)
        throw error
      }

      return data?.map(this.mapDatabaseToTemplate) || []
    } catch (error) {
      console.error('Erro no serviço de templates:', error)
      return []
    }
  }

  // Mapear dados do banco para o tipo Template
  private static mapDatabaseToTemplate(dbTemplate: DatabaseTemplate): Template {
    return {
      id: dbTemplate.id,
      name: dbTemplate.name,
      category: dbTemplate.category,
      description: dbTemplate.description || '',
      prompt: dbTemplate.prompt,
      variables: dbTemplate.variables || [],
      thumbnail: dbTemplate.thumbnail || undefined,
      isCustom: dbTemplate.is_custom || false,
      createdAt: dbTemplate.created_at ? new Date(dbTemplate.created_at) : undefined
    }
  }
}