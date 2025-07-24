import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { quoteId } = await request.json()

    // Aqui você implementaria a geração real do PDF
    // Por enquanto, vamos simular com um delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulando um PDF simples
    const pdfContent = `
      %PDF-1.4
      1 0 obj
      <<
      /Type /Catalog
      /Pages 2 0 R
      >>
      endobj
      
      2 0 obj
      <<
      /Type /Pages
      /Kids [3 0 R]
      /Count 1
      >>
      endobj
      
      3 0 obj
      <<
      /Type /Page
      /Parent 2 0 R
      /MediaBox [0 0 612 792]
      /Contents 4 0 R
      >>
      endobj
      
      4 0 obj
      <<
      /Length 44
      >>
      stream
      BT
      /F1 12 Tf
      100 700 Td
      (Orçamento ${quoteId}) Tj
      ET
      endstream
      endobj
      
      xref
      0 5
      0000000000 65535 f 
      0000000009 00000 n 
      0000000058 00000 n 
      0000000115 00000 n 
      0000000206 00000 n 
      trailer
      <<
      /Size 5
      /Root 1 0 R
      >>
      startxref
      299
      %%EOF
    `

    return new NextResponse(pdfContent, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orcamento-${quoteId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
