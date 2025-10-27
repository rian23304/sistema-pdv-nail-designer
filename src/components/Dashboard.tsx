'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings,
  BarChart3,
  LogOut,
  Store,
  Scissors,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { User } from '@/lib/types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export default function Dashboard({ user, onLogout, onNavigate }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário a cada minuto
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'proprietario': return 'bg-purple-100 text-purple-800';
      case 'gerente': return 'bg-blue-100 text-blue-800';
      case 'funcionario': return 'bg-green-100 text-green-800';
      case 'vendedor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'proprietario': return 'Proprietário';
      case 'gerente': return 'Gerente';
      case 'funcionario': return 'Funcionário';
      case 'vendedor': return 'Vendedor';
      default: return role;
    }
  };

  const canAccess = (module: string) => {
    // Proprietário tem acesso total
    if (user.role === 'proprietario') return true;
    
    // Gerente tem acesso a quase tudo, exceto configurações críticas
    if (user.role === 'gerente') {
      return !['user-management', 'store-config'].includes(module);
    }
    
    // Funcionário pode acessar vendas, serviços, agenda e estoque (consulta)
    if (user.role === 'funcionario') {
      return ['sales', 'services', 'appointments', 'products', 'customers'].includes(module);
    }
    
    // Vendedor só pode acessar vendas e consultar estoque
    if (user.role === 'vendedor') {
      return ['sales', 'products'].includes(module);
    }
    
    return false;
  };

  const modules = [
    {
      id: 'sales',
      title: 'Vendas (PDV)',
      description: 'Realizar vendas e emitir cupons',
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-600',
      priority: 1
    },
    {
      id: 'services',
      title: 'Serviços',
      description: 'Cadastro e venda de serviços',
      icon: Scissors,
      color: 'from-pink-500 to-rose-600',
      priority: 2
    },
    {
      id: 'appointments',
      title: 'Agenda',
      description: 'Gerenciar agendamentos',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
      priority: 3
    },
    {
      id: 'products',
      title: 'Produtos',
      description: 'Cadastro e controle de estoque',
      icon: Package,
      color: 'from-purple-500 to-violet-600',
      priority: 4
    },
    {
      id: 'customers',
      title: 'Clientes',
      description: 'Cadastro e histórico de clientes',
      icon: Users,
      color: 'from-indigo-500 to-blue-600',
      priority: 5
    },
    {
      id: 'financial',
      title: 'Financeiro',
      description: 'Controle de caixa e relatórios',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      priority: 6
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Relatórios de vendas e performance',
      icon: BarChart3,
      color: 'from-teal-500 to-green-600',
      priority: 7
    },
    {
      id: 'user-management',
      title: 'Usuários',
      description: 'Gerenciar usuários e permissões',
      icon: Users,
      color: 'from-gray-500 to-slate-600',
      priority: 8
    },
    {
      id: 'store-config',
      title: 'Configurações',
      description: 'Configurações da loja e sistema',
      icon: Settings,
      color: 'from-red-500 to-pink-600',
      priority: 9
    }
  ];

  const accessibleModules = modules
    .filter(module => canAccess(module.id))
    .sort((a, b) => a.priority - b.priority);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Bruna Godoy Nayls Designer
                </h1>
                <p className="text-sm text-gray-500">Sistema de Gestão</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <Badge className={getRoleColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentTime.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div>{currentTime.toLocaleDateString('pt-BR')}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user.name}!
          </h2>
          <p className="text-gray-600">
            Selecione um módulo para começar a trabalhar
          </p>
        </div>

        {/* Módulos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => onNavigate(module.id)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vendas Hoje</p>
                  <p className="text-2xl font-bold text-green-600">R$ 1.250,00</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agendamentos</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Produtos</p>
                  <p className="text-2xl font-bold text-purple-600">156</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saldo Caixa</p>
                  <p className="text-2xl font-bold text-orange-600">R$ 2.890,50</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Link Público para Agendamentos */}
        <Card className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Link Público para Agendamentos</h3>
                <p className="text-pink-100 mb-4">
                  Compartilhe este link para que clientes possam agendar online
                </p>
                <code className="bg-white/20 px-3 py-1 rounded text-sm">
                  https://sistema.brunagodoynayls.com/agendar
                </code>
              </div>
              <div className="flex flex-col gap-2">
                <Calendar className="w-12 h-12 text-pink-200 mx-auto" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('public-scheduling')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Testar Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}