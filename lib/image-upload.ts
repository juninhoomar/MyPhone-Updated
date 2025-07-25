import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
}

export async function uploadProductImage(file: File, productId: string): Promise<UploadResult> {
  try {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}/${Date.now()}.${fileExt}`
    
    // Upload do arquivo para o bucket 'product-images'
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw error
    }
    
    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path)
    
    return {
      url: publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error)
    // Fornecer mais detalhes sobre o erro
    if (error instanceof Error) {
      throw new Error(`Falha no upload da imagem: ${error.message}`)
    }
    throw new Error('Erro desconhecido no upload da imagem')
  }
}

export async function deleteProductImage(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([path])
    
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    // Fornecer mais detalhes sobre o erro
    if (error instanceof Error) {
      throw new Error(`Falha ao deletar imagem: ${error.message}`)
    }
    throw new Error('Erro desconhecido ao deletar imagem')
  }
}

export async function uploadMultipleProductImages(
  files: File[], 
  productId: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadProductImage(file, productId))
  return Promise.all(uploadPromises)
}