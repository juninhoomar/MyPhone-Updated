import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { Quote } from '@/types/quote'
import puppeteer from 'puppeteer'

// Dados da empresa (normalmente viriam de um banco de dados ou configuração)
const COMPANY_DATA = {
  name: "MyPhone Tecnologia",
  cnpj: "12.345.678/0001-90",
  address: "Rua das Tecnologias, 123",
  city: "São Paulo - SP",
  cep: "01234-567",
  phone: "(11) 99999-9999",
  email: "contato@myphone.com.br",
  website: "www.myphone.com.br"
}

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { quoteId, quoteData } = await request.json()

    if (!quoteData) {
      return NextResponse.json({ error: "Dados do orçamento não fornecidos" }, { status: 400 })
    }

    // Usar os dados do orçamento fornecidos
    const quote = quoteData as Quote

    // Gerar HTML do orçamento
    const htmlContent = generateQuoteHTML(quote)

    // Gerar PDF usando Puppeteer
    let browser
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      
      const page = await browser.newPage()
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      })
      
      await browser.close()
      
      const fileName = `orcamento-${quote.id}-${Date.now()}.pdf`

      try {
        // Salvar PDF no bucket do Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('quotes')
          .upload(`pdfs/${fileName}`, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) {
          console.error('Erro ao fazer upload do PDF:', uploadError)
          // Continuar mesmo se o upload falhar
        } else {
          console.log('PDF salvo no bucket:', uploadData.path)
        }
      } catch (storageError) {
        console.error('Erro no storage:', storageError)
        // Continuar mesmo se o storage falhar
      }

      // Retornar o PDF para download
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      })
    } catch (puppeteerError) {
      if (browser) {
        await browser.close()
      }
      throw puppeteerError
    }
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: "Erro ao gerar PDF: " + errorMessage }, { status: 500 })
  }
}

function generateQuoteHTML(quote: Quote): string {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR')
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      'pix': 'PIX',
      'boleto': 'Boleto Bancário',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'dinheiro': 'Dinheiro',
      'transferencia': 'Transferência Bancária'
    }
    return methods[method] || method
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Orçamento ${quote.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-info {
          text-align: center;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .company-details {
          font-size: 12px;
          color: #666;
        }
        .quote-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin: 30px 0;
          color: #1f2937;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-box {
          width: 48%;
        }
        .info-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          color: #374151;
        }
        .info-content {
          font-size: 12px;
          line-height: 1.5;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #d1d5db;
          padding: 10px;
          text-align: left;
        }
        .items-table th {
          background-color: #f3f4f6;
          font-weight: bold;
          font-size: 12px;
        }
        .items-table td {
          font-size: 11px;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-final {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #2563eb;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #d1d5db;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        .signature {
          margin-top: 40px;
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #333;
          width: 300px;
          margin: 40px auto 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${COMPANY_DATA.name}</div>
          <div class="company-details">
            ${COMPANY_DATA.address}, ${COMPANY_DATA.city} - ${COMPANY_DATA.cep}<br>
            CNPJ: ${COMPANY_DATA.cnpj} | Tel: ${COMPANY_DATA.phone}<br>
            Email: ${COMPANY_DATA.email} | Site: ${COMPANY_DATA.website}
          </div>
        </div>
      </div>

      <div class="quote-title">ORÇAMENTO Nº ${quote.id}</div>

      <div class="info-section">
        <div class="info-box">
          <div class="info-title">DADOS DO CLIENTE</div>
          <div class="info-content">
             <strong>Nome:</strong> ${quote.customerName || 'N/A'}<br>
             <strong>Email:</strong> ${quote.customerEmail || 'N/A'}<br>
             <strong>Telefone:</strong> ${quote.customerPhone || 'N/A'}<br>
             <strong>Forma de Pagamento:</strong> ${getPaymentMethodLabel(quote.paymentMethod || 'N/A')}
           </div>
        </div>
        <div class="info-box">
          <div class="info-title">INFORMAÇÕES DO ORÇAMENTO</div>
          <div class="info-content">
             <strong>Data de Emissão:</strong> ${formatDate(new Date(quote.createdAt))}<br>
             <strong>Válido até:</strong> ${quote.validUntil ? formatDate(new Date(quote.validUntil)) : 'N/A'}<br>
             <strong>Status:</strong> ${quote.status || 'Pendente'}<br>
             <strong>Vendedor:</strong> Sistema MyPhone
           </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Marca/Modelo</th>
            <th class="text-right">Qtd</th>
            <th class="text-right">Valor Unit.</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
           ${quote.items.map((item) => `
             <tr>
               <td>${item.product.name}</td>
               <td>${item.product.brand || ''} ${item.product.model || ''}</td>
               <td class="text-right">${item.quantity}</td>
               <td class="text-right">${formatCurrency(item.unitPrice)}</td>
               <td class="text-right">${formatCurrency(item.totalPrice)}</td>
             </tr>
           `).join('')}
         </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(quote.subtotal)}</span>
        </div>
        ${quote.discount > 0 ? `
          <div class="total-row">
            <span>Desconto:</span>
            <span>-${formatCurrency(quote.discount)}</span>
          </div>
        ` : ''}
        <div class="total-row total-final">
          <span>TOTAL GERAL:</span>
          <span>${formatCurrency(quote.total)}</span>
        </div>
      </div>

      ${quote.notes ? `
        <div style="margin-top: 30px;">
          <div class="info-title">OBSERVAÇÕES</div>
          <div style="font-size: 12px; margin-top: 10px;">${quote.notes}</div>
        </div>
      ` : ''}

      <div class="signature">
        <div class="signature-line"></div>
        <div style="font-size: 12px; margin-top: 10px;">
          <strong>${COMPANY_DATA.name}</strong><br>
          Assinatura e Carimbo
        </div>
      </div>

      <div class="footer">
        Este orçamento foi gerado automaticamente pelo sistema MyPhone em ${formatDate(new Date())}.<br>
        Para dúvidas ou esclarecimentos, entre em contato conosco através dos canais informados acima.
      </div>
    </body>
    </html>
  `
}
