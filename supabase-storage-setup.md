# Configuração do Storage no Supabase

Para que o upload de imagens funcione corretamente, você precisa configurar um bucket de storage no Supabase.

## Passos para configurar:

1. **Acesse o painel do Supabase**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Navegue até Storage**
   - No menu lateral, clique em "Storage"
   - Clique em "Buckets"

3. **Criar o bucket 'products'**
   - Clique em "New bucket"
   - Nome: `products`
   - Marque como "Public bucket" (para permitir acesso público às imagens)
   - Clique em "Save"

4. **Configurar políticas RLS (Row Level Security)**
   
   Execute os seguintes comandos SQL no SQL Editor do Supabase:

   ```sql
   -- Permitir upload de imagens (INSERT)
   CREATE POLICY "Allow public uploads" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'products');

   -- Permitir visualização de imagens (SELECT)
   CREATE POLICY "Allow public access" ON storage.objects
   FOR SELECT USING (bucket_id = 'products');

   -- Permitir deletar imagens (DELETE)
   CREATE POLICY "Allow public deletes" ON storage.objects
   FOR DELETE USING (bucket_id = 'products');
   ```

5. **Verificar configuração**
   - Teste o upload de uma imagem através do formulário de produto
   - Verifique se a imagem aparece corretamente na visualização

## Estrutura de pastas

As imagens serão organizadas da seguinte forma:
```
products/
├── produto-1/
│   ├── 1234567890.jpg
│   └── 1234567891.png
├── produto-2/
│   ├── 1234567892.jpg
│   └── 1234567893.webp
└── ...
```

## Formatos suportados

- JPG/JPEG
- PNG
- WebP
- GIF

## Limitações

- Tamanho máximo por arquivo: 50MB (configurável)
- Tipos de arquivo permitidos: imagens apenas
- As imagens são públicas e acessíveis via URL