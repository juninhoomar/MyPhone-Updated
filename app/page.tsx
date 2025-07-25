'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, FileText, Settings, Package } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const menuItems = [
    {
      title: 'Catálogo de Produtos',
      description: 'Visualize e gerencie produtos disponíveis',
      icon: Package,
      href: '/catalog',
      color: 'bg-blue-500'
    },
    {
      title: 'Orçamentos',
      description: 'Crie e gerencie orçamentos para clientes',
      icon: FileText,
      href: '/quotes',
      color: 'bg-green-500'
    },
    {
       title: 'Prompts',
       description: 'Geração de conteúdo com IA para marketing',
       icon: Lightbulb,
       href: '/prompts',
       color: 'bg-purple-500'
     },
    {
      title: 'Configurações',
      description: 'Configure preferências e dados da empresa',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MyPhone - Sistema de Gestão
        </h1>
        <p className="text-lg text-gray-600">
          Gerencie produtos, orçamentos e vendas de forma eficiente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.href} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={item.href} className="w-full">
                  <Button className="w-full" variant="outline">
                    Acessar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
