'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { User, Customer } from '@/lib/types';

interface CustomersModuleProps {
  user: User;
  onBack: () => void;
}

export default function CustomersModule({ user, onBack }: CustomersModuleProps) {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Maria Silva',
      phone: '(11) 99999-9999',
      email: 'maria@email.com',
      address: 'Rua das Flores, 123',
      birthDate: new Date('1990-05-15'),
      notes: 'Cliente preferencial, gosta de cores vibrantes',
      totalPurchases: 15,
      totalSpent: 450.00,
      lastPurchase: new Date('2024-01-10'),
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '2',
      name: 'Ana Costa',
      phone: '(11) 88888-8888',
      email: 'ana@email.com',
      address: 'Av. Principal, 456',
      birthDate: new Date('1985-08-22'),
      notes: 'Alérgica a alguns produtos, verificar sempre',
      totalPurchases: 8,
      totalSpent: 280.00,
      lastPurchase: new Date('2024-01-05'),
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date('2024-01-05')
    },
    {
      id: '3',
      name: 'Carla Santos',
      phone: '(11) 77777-7777',
      email: 'carla@email.com',
      totalPurchases: 3,
      totalSpent: 95.00,
      lastPurchase: new Date('2023-12-20'),
      createdAt: new Date('2023-11-01'),
      updatedAt: new Date('2023-12-20')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    notes: ''
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      // Editar cliente existente
      setCustomers(customers.map(customer =>
        customer.id === editingCustomer.id
          ? { 
              ...customer, 
              ...formData,
              birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
              updatedAt: new Date() 
            }
          : customer
      ));
    } else {
      // Criar novo cliente
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
        totalPurchases: 0,
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCustomers([...customers, newCustomer]);
    }

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      birthDate: '',
      notes: ''
    });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      birthDate: customer.birthDate ? customer.birthDate.toISOString().split('T')[0] : '',
      notes: customer.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setCustomers(customers.filter(customer => customer.id !== id));
    }
  };

  const canEdit = user.role === 'proprietario' || user.role === 'gerente' || user.role === 'funcionario';

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
                <Users className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Cadastro de Clientes
                </h1>
              </div>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800">
              {user.name} - {user.role}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!showForm && !selectedCustomer ? (
          <>
            {/* Controles */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
              {canEdit && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Clientes</p>
                      <p className="text-2xl font-bold text-indigo-600">{customers.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Clientes Ativos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {customers.filter(c => c.lastPurchase && 
                          (new Date().getTime() - c.lastPurchase.getTime()) < 90 * 24 * 60 * 60 * 1000
                        ).length}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ticket Médio</p>
                      <p className="text-2xl font-bold text-purple-600">
                        R$ {customers.length > 0 ? 
                          (customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / 
                           customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0) || 0).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Faturamento Total</p>
                      <p className="text-2xl font-bold text-orange-600">
                        R$ {customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{customer.email}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant={
                        customer.lastPurchase && 
                        (new Date().getTime() - customer.lastPurchase.getTime()) < 90 * 24 * 60 * 60 * 1000
                          ? "default" : "secondary"
                      }>
                        {customer.lastPurchase && 
                         (new Date().getTime() - customer.lastPurchase.getTime()) < 90 * 24 * 60 * 60 * 1000
                          ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Total Compras:</span>
                        <span className="font-medium">{customer.totalPurchases || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Gasto:</span>
                        <span className="font-medium text-green-600">
                          R$ {(customer.totalSpent || 0).toFixed(2)}
                        </span>
                      </div>
                      {customer.lastPurchase && (
                        <div className="flex justify-between text-sm">
                          <span>Última Compra:</span>
                          <span className="text-gray-600">
                            {customer.lastPurchase.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {customer.birthDate && (
                        <div className="flex justify-between text-sm">
                          <span>Aniversário:</span>
                          <span className="text-purple-600">
                            {customer.birthDate.toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {customer.notes && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          {customer.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(customer)}
                        className="flex-1"
                      >
                        Ver Histórico
                      </Button>
                      {canEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum cliente encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando um novo cliente'}
                </p>
              </div>
            )}
          </>
        ) : selectedCustomer ? (
          /* Histórico do Cliente */
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico - {selectedCustomer.name}</CardTitle>
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalPurchases || 0}</p>
                  <p className="text-sm text-blue-800">Total de Compras</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {(selectedCustomer.totalSpent || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-800">Total Gasto</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {selectedCustomer.totalPurchases ? 
                      ((selectedCustomer.totalSpent || 0) / selectedCustomer.totalPurchases).toFixed(2) : 
                      '0.00'}
                  </p>
                  <p className="text-sm text-purple-800">Ticket Médio</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Informações do Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Telefone:</strong> {selectedCustomer.phone}
                  </div>
                  {selectedCustomer.email && (
                    <div>
                      <strong>Email:</strong> {selectedCustomer.email}
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div>
                      <strong>Endereço:</strong> {selectedCustomer.address}
                    </div>
                  )}
                  {selectedCustomer.birthDate && (
                    <div>
                      <strong>Data de Nascimento:</strong> {selectedCustomer.birthDate.toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  <div>
                    <strong>Cliente desde:</strong> {selectedCustomer.createdAt.toLocaleDateString('pt-BR')}
                  </div>
                  {selectedCustomer.lastPurchase && (
                    <div>
                      <strong>Última compra:</strong> {selectedCustomer.lastPurchase.toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>

                {selectedCustomer.notes && (
                  <div>
                    <strong>Observações:</strong>
                    <p className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedCustomer.notes}</p>
                  </div>
                )}

                <div className="pt-4">
                  <h4 className="font-medium mb-4">Histórico de Compras</h4>
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Histórico de compras será exibido aqui</p>
                    <p className="text-sm">Integração com módulo de vendas em desenvolvimento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Formulário */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Preferências, alergias, etc."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCustomer(null);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        address: '',
                        birthDate: '',
                        notes: ''
                      });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
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