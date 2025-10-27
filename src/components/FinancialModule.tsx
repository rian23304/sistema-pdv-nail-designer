'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Minus,
  Calculator,
  CreditCard,
  Banknote,
  Smartphone,
  Edit,
  Trash2
} from 'lucide-react';
import { User } from '@/lib/types';

interface FinancialModuleProps {
  user: User;
  onBack: () => void;
}

interface CashMovement {
  id: string;
  type: 'entrada' | 'saida';
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'dinheiro' | 'pix' | 'credito' | 'debito';
  date: Date;
  createdBy: string;
  createdByName: string;
}

export default function FinancialModule({ user, onBack }: FinancialModuleProps) {
  const [movements, setMovements] = useState<CashMovement[]>([
    {
      id: '1',
      type: 'entrada',
      category: 'Venda',
      description: 'Venda #001 - Maria Silva',
      amount: 45.00,
      paymentMethod: 'dinheiro',
      date: new Date(),
      createdBy: '1',
      createdByName: 'Bruna Godoy'
    },
    {
      id: '2',
      type: 'entrada',
      category: 'Venda',
      description: 'Venda #002 - Ana Costa',
      amount: 80.00,
      paymentMethod: 'pix',
      date: new Date(),
      createdBy: '1',
      createdByName: 'Bruna Godoy'
    },
    {
      id: '3',
      type: 'saida',
      category: 'Sangria',
      description: 'Sangria para troco',
      amount: 50.00,
      paymentMethod: 'dinheiro',
      date: new Date(),
      createdBy: '1',
      createdByName: 'Bruna Godoy'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    type: 'entrada' as 'entrada' | 'saida',
    category: '',
    description: '',
    amount: 0,
    paymentMethod: 'dinheiro' as 'dinheiro' | 'pix' | 'credito' | 'debito'
  });

  const entryCategories = ['Venda', 'Aporte', 'Serviço', 'Outros'];
  const exitCategories = ['Sangria', 'Despesa', 'Fornecedor', 'Outros'];

  const todayMovements = movements.filter(movement => {
    const movementDate = movement.date.toISOString().split('T')[0];
    return movementDate === selectedDate;
  });

  const totalEntries = todayMovements
    .filter(m => m.type === 'entrada')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalExits = todayMovements
    .filter(m => m.type === 'saida')
    .reduce((sum, m) => sum + m.amount, 0);

  const cashBalance = totalEntries - totalExits;

  const salesByPaymentMethod = todayMovements
    .filter(m => m.type === 'entrada' && m.category === 'Venda')
    .reduce((acc, m) => {
      acc[m.paymentMethod] = (acc[m.paymentMethod] || 0) + m.amount;
      return acc;
    }, {} as Record<string, number>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMovement: CashMovement = {
      id: Date.now().toString(),
      ...formData,
      date: new Date(),
      createdBy: user.id,
      createdByName: user.name
    };

    setMovements([...movements, newMovement]);
    
    // Reset form
    setFormData({
      type: 'entrada',
      category: '',
      description: '',
      amount: 0,
      paymentMethod: 'dinheiro'
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      setMovements(movements.filter(movement => movement.id !== id));
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'dinheiro': return <Banknote className="w-4 h-4" />;
      case 'pix': return <Smartphone className="w-4 h-4" />;
      case 'credito':
      case 'debito': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro';
      case 'pix': return 'PIX';
      case 'credito': return 'Crédito';
      case 'debito': return 'Débito';
      default: return method;
    }
  };

  const canEdit = user.role === 'proprietario' || user.role === 'gerente';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Controle Financeiro
                </h1>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              {user.name} - {user.role}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!showForm ? (
          <>
            {/* Controles */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
              {canEdit && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Movimentação
                </Button>
              )}
            </div>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Entradas</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {totalEntries.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Saídas</p>
                      <p className="text-2xl font-bold text-red-600">
                        R$ {totalExits.toFixed(2)}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Saldo do Dia</p>
                      <p className={`text-2xl font-bold ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {cashBalance.toFixed(2)}
                      </p>
                    </div>
                    <Calculator className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Vendas</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {todayMovements.filter(m => m.type === 'entrada' && m.category === 'Venda').length}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vendas por Forma de Pagamento */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Vendas por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(salesByPaymentMethod).map(([method, amount]) => (
                    <div key={method} className="text-center p-4 bg-gray-50 rounded">
                      <div className="flex items-center justify-center mb-2">
                        {getPaymentMethodIcon(method)}
                      </div>
                      <p className="text-sm text-gray-600">{getPaymentMethodLabel(method)}</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Movimentações */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Movimentações do Dia ({new Date(selectedDate).toLocaleDateString('pt-BR')})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayMovements.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma movimentação encontrada
                    </h3>
                    <p className="text-gray-500">
                      Não há movimentações para esta data
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayMovements
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((movement) => (
                        <div key={movement.id} className="flex items-center justify-between p-4 border rounded">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {movement.type === 'entrada' ? 
                                <Plus className="w-4 h-4 text-green-600" /> : 
                                <Minus className="w-4 h-4 text-red-600" />
                              }
                            </div>
                            
                            <div>
                              <p className="font-medium">{movement.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{movement.category}</span>
                                <div className="flex items-center gap-1">
                                  {getPaymentMethodIcon(movement.paymentMethod)}
                                  <span>{getPaymentMethodLabel(movement.paymentMethod)}</span>
                                </div>
                                <span>por {movement.createdByName}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold ${
                              movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {movement.type === 'entrada' ? '+' : '-'} R$ {movement.amount.toFixed(2)}
                            </span>
                            
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(movement.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* Formulário */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Nova Movimentação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'entrada' | 'saida') => setFormData({ ...formData, type: value, category: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.type === 'entrada' ? entryCategories : exitCategories).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor (R$) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(value: 'dinheiro' | 'pix' | 'credito' | 'debito') => setFormData({ ...formData, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar forma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="debito">Cartão de Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        type: 'entrada',
                        category: '',
                        description: '',
                        amount: 0,
                        paymentMethod: 'dinheiro'
                      });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Registrar Movimentação
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}