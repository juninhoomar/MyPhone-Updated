export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

export function formatPriceCompact(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
  }).format(price)
}

export function calculateDiscount(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

// Formatar número para input brasileiro (1.999,99)
export function formatPriceInput(value: number): string {
  if (!value || value === 0) return ""
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Converter string brasileira para número (1.999,99 -> 1999.99)
export function parsePriceInput(value: string): number {
  if (!value) return 0
  // Remove pontos (separadores de milhares) e substitui vírgula por ponto
  const cleanValue = value.replace(/\./g, "").replace(",", ".")
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}
