import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { Quote } from '@/types/quote'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

interface CompanyData {
  name: string
  cnpj?: string
  address?: string
  city?: string
  state?: string
  cep?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
}

// Dados padrão da empresa (fallback)
const DEFAULT_COMPANY_DATA: CompanyData = {
  name: "MyPhone Tecnologia",
  cnpj: "12.345.678/0001-90",
  address: "Rua das Tecnologias, 123",
  city: "São Paulo",
  state: "SP",
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
    
    console.log('Generating PDF for quote:', quoteId)
    console.log('Quote data:', JSON.stringify(quoteData, null, 2))
    
    if (!quoteId || !quoteData) {
      console.error('Missing quoteId or quoteData')
      return NextResponse.json({ error: 'Quote ID and data are required' }, { status: 400 })
    }

    // Usar os dados do orçamento fornecidos
    const quote = quoteData as Quote

    // Buscar dados da empresa do banco de dados
    let companyData = DEFAULT_COMPANY_DATA
    try {
      const { data: company, error } = await supabase
        .from('company')
        .select('*')
        .limit(1)
        .single()
      
      if (!error && company) {
        companyData = {
          name: company.name,
          cnpj: company.cnpj,
          address: company.address,
          city: company.city,
          state: company.state,
          cep: company.cep,
          phone: company.phone,
          email: company.email,
          website: company.website,
          logo_url: company.logo_url
        }
      }
    } catch (dbError) {
      console.warn('Erro ao buscar dados da empresa, usando dados padrão:', dbError)
    }

    console.log('Company data:', companyData)

    // Gerar HTML do orçamento
    const html = generateQuoteHTML(quote, companyData)
    console.log('Generated HTML length:', html.length)

    // Configurar Puppeteer para Vercel
    const browser = await puppeteer.launch({
      args: process.env.NODE_ENV === 'production' 
        ? chromium.args
        : [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ],
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      executablePath: process.env.NODE_ENV === 'production'
        ? await chromium.executablePath()
        : puppeteer.executablePath(),
      headless: true
    })

    const page = await browser.newPage()
    
    // Adicionar logs de console da página
    page.on('console', (msg) => {
      console.log('PAGE LOG:', msg.text())
    })
    
    page.on('pageerror', (error) => {
      console.error('PAGE ERROR:', error)
    })
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    console.log('Page content set successfully')
    
    // Gerar PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      timeout: 30000
    })

    console.log('PDF generated successfully, size:', pdf.length)
    
    await browser.close()

    // Retornar PDF
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="orcamento-${quote.id}.pdf"`
      }
    })
  } catch (error) {
    console.error("Erro ao gerar orçamento:", error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ 
      error: "Erro ao gerar orçamento: " + errorMessage,
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

function generateQuoteHTML(quote: Quote, companyData: CompanyData): string {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR')
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Orçamento ${quote.id}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.4;
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
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        .print-button:hover {
          background: #1d4ed8;
        }
      </style>
      <script>
        function printPage() {
          window.print();
        }
      </script>
    </head>
    <body>
      <button class="print-button no-print" onclick="printPage()">🖨️ Imprimir</button>
      
      <div class="header">
        <div class="company-info">
          <div class="company-name">${companyData.name}</div>
          <div class="company-details">
            ${companyData.address}, ${companyData.city} - ${companyData.cep}<br>
            CNPJ: ${companyData.cnpj} | Tel: ${companyData.phone}<br>
            Email: ${companyData.email} | Site: ${companyData.website}
          </div>
        </div>
      </div>

      <div class="quote-title">ORÇAMENTO Nº ${quote.quote_number || quote.id}</div>

      <div class="info-section">
        <div class="info-box">
          <div class="info-title">DADOS DO CLIENTE</div>
          <div class="info-content">
             <strong>Nome:</strong> ${quote.customer_name || 'N/A'}<br>
             <strong>Email:</strong> ${quote.customer_email || 'N/A'}<br>
             <strong>Telefone:</strong> ${quote.customer_phone || 'N/A'}
           </div>
        </div>
        <div class="info-box">
          <div class="info-title">INFORMAÇÕES DO ORÇAMENTO</div>
          <div class="info-content">
             <strong>Data de Emissão:</strong> ${quote.created_at ? formatDate(new Date(quote.created_at)) : 'Data não disponível'}<br>
             <strong>Válido até:</strong> ${quote.valid_until ? formatDate(new Date(quote.valid_until)) : 'N/A'}<br>
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
               <td class="text-right">${formatCurrency(item.unit_price)}</td>
               <td class="text-right">${formatCurrency(item.total_price)}</td>
             </tr>
           `).join('')}
         </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(quote.subtotal)}</span>
        </div>
        ${quote.discount_amount && quote.discount_amount > 0 ? `
          <div class="total-row">
            <span>Desconto:</span>
            <span>-${formatCurrency(quote.discount_amount)}</span>
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
          <strong>${companyData.name}</strong><br>
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
