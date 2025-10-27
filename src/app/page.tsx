'use client';

import { useState } from 'react';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import SalesModule from '@/components/SalesModule';
import ServicesModule from '@/components/ServicesModule';
import AppointmentsModule from '@/components/AppointmentsModule';
import ProductsModule from '@/components/ProductsModule';
import CustomersModule from '@/components/CustomersModule';
import FinancialModule from '@/components/FinancialModule';
import ReportsModule from '@/components/ReportsModule';
import UserManagementModule from '@/components/UserManagementModule';
import StoreConfigModule from '@/components/StoreConfigModule';
import PublicScheduling from '@/components/PublicScheduling';
import { User } from '@/lib/types';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentModule, setCurrentModule] = useState<string>('dashboard');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentModule('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentModule('dashboard');
  };

  const handleNavigate = (module: string) => {
    setCurrentModule(module);
  };

  const handleBack = () => {
    setCurrentModule('dashboard');
  };

  // Página pública de agendamento (sem login necessário)
  if (currentModule === 'public-scheduling') {
    return <PublicScheduling onBack={() => setCurrentModule('dashboard')} />;
  }

  // Se não há usuário logado, mostrar tela de login
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Renderizar módulo atual
  switch (currentModule) {
    case 'sales':
      return <SalesModule user={currentUser} onBack={handleBack} />;
    
    case 'services':
      return <ServicesModule user={currentUser} onBack={handleBack} />;
    
    case 'appointments':
      return <AppointmentsModule user={currentUser} onBack={handleBack} />;
    
    case 'products':
      return <ProductsModule user={currentUser} onBack={handleBack} />;
    
    case 'customers':
      return <CustomersModule user={currentUser} onBack={handleBack} />;
    
    case 'financial':
      return <FinancialModule user={currentUser} onBack={handleBack} />;
    
    case 'reports':
      return <ReportsModule user={currentUser} onBack={handleBack} />;
    
    case 'user-management':
      return <UserManagementModule user={currentUser} onBack={handleBack} />;
    
    case 'store-config':
      return <StoreConfigModule user={currentUser} onBack={handleBack} />;
    
    case 'dashboard':
    default:
      return (
        <Dashboard 
          user={currentUser} 
          onLogout={handleLogout} 
          onNavigate={handleNavigate} 
        />
      );
  }
}