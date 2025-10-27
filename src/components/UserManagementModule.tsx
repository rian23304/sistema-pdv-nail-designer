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
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  UserX
} from 'lucide-react';
import { User } from '@/lib/types';

interface UserManagementModuleProps {
  user: User;
  onBack: () => void;
}

export default function UserManagementModule({ user, onBack }: UserManagementModuleProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'bruna.godoy',
      name: 'Bruna Godoy',
      role: 'proprietario',
      active: true,
      createdAt: new Date('2023-01-01'),
      lastLogin: new Date()
    },
    {
      id: '2',
      username: 'maria.silva',
      name: 'Maria Silva',
      role: 'funcionario',
      active: true,
      createdAt: new Date('2023-06-15'),
      lastLogin: new Date('2024-01-10')
    },
    {
      id: '3',
      username: 'ana.costa',
      name: 'Ana Costa',
      role: 'vendedor',
      active: true,
      createdAt: new Date('2023-08-20'),
      lastLogin: new Date('2024-01-08')
    },
    {
      id: '4',
      username: 'carlos.santos',
      name: 'Carlos Santos',
      role: 'gerente',
      active: false,
      createdAt: new Date('2023-03-10'),
      lastLogin: new Date('2023-12-15')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: 'vendedor' as 'proprietario' | 'gerente' | 'funcionario' | 'vendedor',
    password: '',
    confirmPassword: '',
    active: true
  });

  const roles = [
    { value: 'proprietario', label: 'Proprietário', description: 'Acesso total ao sistema' },
    { value: 'gerente', label: 'Gerente', description: 'Acesso a vendas, relatórios e configurações' },
    { value: 'funcionario', label: 'Funcionário', description: 'Acesso a vendas, serviços e agenda' },
    { value: 'vendedor', label: 'Vendedor', description: 'Acesso apenas a vendas e consulta de estoque' }
  ];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    if (editingUser) {
      // Editar usuário existente
      setUsers(users.map(u =>
        u.id === editingUser.id
          ? { 
              ...u, 
              username: formData.username,
              name: formData.name,
              role: formData.role,
              active: formData.active
            }
          : u
      ));
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        name: formData.name,
        role: formData.role,
        active: formData.active,
        createdAt: new Date()
      };
      setUsers([...users, newUser]);
    }

    // Reset form
    setFormData({
      username: '',
      name: '',
      role: 'vendedor',
      password: '',
      confirmPassword: '',
      active: true
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      name: userToEdit.name,
      role: userToEdit.role,
      password: '',
      confirmPassword: '',
      active: userToEdit.active
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (id === user.id) {
      alert('Você não pode excluir seu próprio usuário!');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    if (id === user.id) {
      alert('Você não pode desativar seu próprio usuário!');
      return;
    }

    setUsers(users.map(u =>
      u.id === id
        ? { ...u, active: !u.active }
        : u
    ));
  };

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
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const canEdit = user.role === 'proprietario';

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Apenas proprietários podem gerenciar usuários.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Users className="w-6 h-6 text-gray-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Gerenciamento de Usuários
                </h1>
              </div>
            </div>
            <Badge className="bg-gray-100 text-gray-800">
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
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Usuários</p>
                      <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Usuários Ativos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {users.filter(u => u.active).length}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Usuários Inativos</p>
                      <p className="text-2xl font-bold text-red-600">
                        {users.filter(u => !u.active).length}
                      </p>
                    </div>
                    <UserX className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Administradores</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {users.filter(u => u.role === 'proprietario' || u.role === 'gerente').length}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Usuários */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((userItem) => (
                <Card key={userItem.id} className={`${!userItem.active ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{userItem.name}</CardTitle>
                        <p className="text-sm text-gray-500">@{userItem.username}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getRoleColor(userItem.role)}>
                          {getRoleLabel(userItem.role)}
                        </Badge>
                        <Badge variant={userItem.active ? "default" : "secondary"}>
                          {userItem.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Criado em:</span>
                        <span>{userItem.createdAt.toLocaleDateString('pt-BR')}</span>
                      </div>
                      {userItem.lastLogin && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Último acesso:</span>
                          <span>{userItem.lastLogin.toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 text-xs text-gray-600">
                      <p><strong>Permissões:</strong></p>
                      <p>{roles.find(r => r.value === userItem.role)?.description}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(userItem)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={userItem.active ? "secondary" : "default"}
                        onClick={() => toggleActive(userItem.id)}
                        disabled={userItem.id === user.id}
                      >
                        {userItem.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(userItem.id)}
                        disabled={userItem.id === user.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando um novo usuário'}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Formulário */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                    <Label htmlFor="username">Nome de Usuário *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Função *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: 'proprietario' | 'gerente' | 'funcionario' | 'vendedor') => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">
                      {editingUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      {editingUser ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required={!editingUser || formData.password !== ''}
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
                  <Label htmlFor="active">Usuário ativo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingUser(null);
                      setFormData({
                        username: '',
                        name: '',
                        role: 'vendedor',
                        password: '',
                        confirmPassword: '',
                        active: true
                      });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
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