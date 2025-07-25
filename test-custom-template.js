// Script para adicionar um template customizado de teste
const testTemplate = {
  id: "custom-test-123",
  name: "Template de Teste",
  category: "Teste",
  description: "Template customizado para testar a edição",
  prompt: "Um anúncio de teste com {PRODUTO} em destaque",
  variables: [
    {
      id: "PRODUTO",
      name: "produto",
      type: "text",
      label: "Nome do Produto",
      placeholder: "Digite o nome do produto"
    }
  ],
  isCustom: true,
  createdAt: new Date()
};

// Adicionar ao localStorage
const existingTemplates = JSON.parse(localStorage.getItem('ad-generator-custom-templates') || '[]');
existingTemplates.push(testTemplate);
localStorage.setItem('ad-generator-custom-templates', JSON.stringify(existingTemplates));

console.log('Template customizado adicionado:', testTemplate);
console.log('Templates no localStorage:', JSON.parse(localStorage.getItem('ad-generator-custom-templates')));

// Recarregar a página
window.location.reload();