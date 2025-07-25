"use client"

// Função simples de criptografia usando btoa/atob com uma chave
const CRYPTO_KEY = "myphone-app-2024"

/**
 * Criptografa uma string usando uma codificação simples
 * @param text - Texto a ser criptografado
 * @returns String criptografada
 */
export function encryptText(text: string): string {
  if (!text) return ""
  
  try {
    // Combina o texto com a chave
    const combined = text + CRYPTO_KEY
    // Codifica em base64
    const encoded = btoa(combined)
    // Adiciona um prefixo para identificar que está criptografado
    return `enc_${encoded}`
  } catch (error) {
    console.error('Erro ao criptografar:', error)
    return text
  }
}

/**
 * Descriptografa uma string
 * @param encryptedText - Texto criptografado
 * @returns String descriptografada
 */
export function decryptText(encryptedText: string): string {
  if (!encryptedText) return ""
  
  try {
    // Verifica se tem o prefixo de criptografia
    if (!encryptedText.startsWith('enc_')) {
      return encryptedText // Retorna como está se não estiver criptografado
    }
    
    // Remove o prefixo
    const encoded = encryptedText.substring(4)
    // Decodifica de base64
    const combined = atob(encoded)
    // Remove a chave do final
    const text = combined.substring(0, combined.length - CRYPTO_KEY.length)
    
    return text
  } catch (error) {
    console.error('Erro ao descriptografar:', error)
    return encryptedText
  }
}

/**
 * Verifica se um texto está criptografado
 * @param text - Texto a ser verificado
 * @returns true se estiver criptografado
 */
export function isEncrypted(text: string): boolean {
  return text.startsWith('enc_')
}

/**
 * Mascara uma chave API para exibição
 * @param apiKey - Chave API
 * @returns Chave mascarada
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return ""
  
  if (apiKey.length <= 8) {
    return "*".repeat(apiKey.length)
  }
  
  const start = apiKey.substring(0, 4)
  const end = apiKey.substring(apiKey.length - 4)
  const middle = "*".repeat(apiKey.length - 8)
  
  return `${start}${middle}${end}`
}