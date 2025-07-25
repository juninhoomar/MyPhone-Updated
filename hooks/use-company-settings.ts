"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface CompanyData {
  id?: string
  name: string
  cnpj: string
  address: string
  phone: string
  email: string
  defaultDiscount: number
  created_at?: string
  updated_at?: string
}

const defaultCompanyData: CompanyData = {
  name: "",
  cnpj: "",
  address: "",
  phone: "",
  email: "",
  defaultDiscount: 0,
}

export function useCompanySettings() {
  const [companyData, setCompanyData] = useState<CompanyData>(defaultCompanyData)
  const [isLoading, setIsLoading] = useState(true)

  // Carrega os dados da empresa do Supabase
  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('company')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao carregar dados da empresa:', error)
        setIsLoading(false)
        return
      }

      if (data) {
        // Mapeia o campo default_discount do banco para defaultDiscount no frontend
        const mappedData = {
          ...data,
          defaultDiscount: data.default_discount || 0
        }
        setCompanyData(mappedData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCompanyData = async (newData: Partial<CompanyData>) => {
    const updatedData = { ...companyData, ...newData }
    setCompanyData(updatedData)
    
    try {
      // Remove campos que não devem ser enviados para o banco e ajusta nomes
      const { id, created_at, defaultDiscount, ...dataToSave } = updatedData
      const finalData = {
        ...dataToSave,
        default_discount: defaultDiscount
      }
      
      let result
      if (companyData.id) {
        // Atualiza registro existente
        result = await supabase
          .from('company')
          .update(finalData)
          .eq('id', companyData.id)
          .select()
          .single()
      } else {
        // Cria novo registro
        result = await supabase
          .from('company')
          .insert([finalData])
          .select()
          .single()
      }

      if (result.error) {
        console.error('Erro ao salvar dados da empresa:', result.error)
        throw result.error
      }

      if (result.data) {
        // Mapeia o campo default_discount do banco para defaultDiscount no frontend
        const mappedData = {
          ...result.data,
          defaultDiscount: result.data.default_discount || 0
        }
        setCompanyData(mappedData)
      }
    } catch (error) {
      console.error('Erro ao atualizar dados da empresa:', error)
      // Em caso de erro, reverte os dados locais
      setCompanyData(companyData)
      throw error
    }
  }

  const resetCompanyData = async () => {
    try {
      if (companyData.id) {
        // Remove os dados da empresa do Supabase
        const { error } = await supabase
          .from('company')
          .delete()
          .eq('id', companyData.id)

        if (error) {
          console.error('Erro ao resetar dados da empresa:', error)
          throw error
        }
      }

      setCompanyData(defaultCompanyData)
    } catch (error) {
      console.error('Erro ao resetar dados da empresa:', error)
      throw error
    }
  }

  return {
    companyData,
    isLoading,
    updateCompanyData,
    resetCompanyData,
    loadCompanyData,
  }
}