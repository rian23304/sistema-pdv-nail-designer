'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, LogIn, Store } from 'lucide-react';
import { User as UserType } from '@/lib/types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

// Dados mockados para demonstração
const mockUsers: UserType[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Bruna Godoy',
    role: 'proprietario',
    permissions: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    username: 'gerente1',
    name: 'Maria Silva',
    role: 'gerente',
    permissions: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    username: 'vendedor1',
    name: 'João Santos',
    role: 'vendedor',
    permissions: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function LoginScreen({ onLogin }: LoginProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedUser || !password) {
      setError('Selecione um usuário e digite a senha');
      return;
    }

    // Simulação de autenticação (senha padrão: 123456)
    if (password === '123456') {
      const user = mockUsers.find(u => u.id === selectedUser);
      if (user) {
        onLogin(user);
      }
    } else {
      setError('Senha incorreta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Bruna Godoy Nayls Designer
            </CardTitle>
            <p className="text-gray-600 mt-2">Sistema de Gestão e PDV</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Selecionar Usuário</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha seu usuário" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{user.name} ({user.role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <Button 
            onClick={handleLogin} 
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Entrar no Sistema
          </Button>

          <div className="text-xs text-gray-500 text-center mt-4">
            <p>Usuários de demonstração:</p>
            <p>Senha padrão: <strong>123456</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}