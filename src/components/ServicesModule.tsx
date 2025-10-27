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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Scissors,
  Clock,
  DollarSign
} from 'lucide-react';
import { User, Service } from '@/lib/types';

interface ServicesModuleProps {
  user: User;
  onBack: () => void;
}

export default function ServicesModule({ user, onBack }: ServicesModuleProps) {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Manicure Simples',
      description: 'Manicure tradicional com esmaltação',
      duration: 60,
      price: 25.00,
      category: 'Manicure',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Pedicure Completa',
      description: 'Pedicure com hidratação e esmaltação',
      duration: 90,
      price: 35.00,
      category: 'Pedicure',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Unha de Gel',
      description: 'Aplicação de unha de gel com decoração',
      duration: 120,
      price: 80.00,
      category: 'Alongamento',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Nail Art',
      description: 'Decoração artística nas unhas',
      duration: 45,
      price: 15.00,
      category: 'Decoração',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: '',
    active: true
  });

  const categories = ['Manicure', 'Pedicure', 'Alongamento', 'Decoração', 'Tratamento', 'Outros'];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingService) {
      // Editar serviço existente
      setServices(services.map(service =>
        service.id === editingService.id
          ? { ...service, ...formData, updatedAt: new Date() }
          : service
      ));
    } else {
      // Criar novo serviço
      const newService: Service = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setServices([...services, newService]);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: '',
      active: true
    });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      active: service.active
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      setServices(services.filter(service => service.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setServices(services.map(service =>
      service.id === id
        ? { ...service, active: !service.active, updatedAt: new Date() }
        : service
    ));
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
                <Scissors className="w-6 h-6 text-pink-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Gerenciamento de Serviços
                </h1>
              </div>
            </div>
            <Badge className="bg-pink-100 text-pink-800">
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
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar serviços..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
              {canEdit && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              )}
            </div>

            {/* Lista de Serviços */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className={`${!service.active ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {service.category}
                        </Badge>
                      </div>
                      <Badge variant={service.active ? "default" : "secondary"}>
                        {service.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{service.duration} minutos</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-green-600">
                          R$ {service.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(service)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={service.active ? "secondary" : "default"}
                          onClick={() => toggleActive(service.id)}
                        >
                          {service.active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <Scissors className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum serviço encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando um novo serviço'}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Formulário */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Serviço *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
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
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duração (minutos) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <Label htmlFor="active">Serviço ativo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingService(null);
                      setFormData({
                        name: '',
                        description: '',
                        duration: 60,
                        price: 0,
                        category: '',
                        active: true
                      });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
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