// Tipos de usuário e permissões
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'proprietario' | 'gerente' | 'funcionario' | 'vendedor';
  active: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Produtos
export interface Product {
  id: string;
  name: string;
  code: string; // SKU/Código de barras
  description: string;
  category: string;
  costPrice: number;
  salePrice: number;
  unit: string; // un, kit, ml, g, etc.
  currentStock: number;
  minStock?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Serviços
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  category: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Clientes
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  birthDate?: Date;
  notes?: string;
  totalPurchases?: number;
  totalSpent?: number;
  lastPurchase?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Agendamentos
export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  date: Date;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vendas
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleService {
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  price: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  services?: SaleService[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  paymentMethod: 'dinheiro' | 'pix' | 'credito' | 'debito';
  amountPaid: number;
  change: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  createdBy: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancelReason?: string;
}

// Movimentações financeiras
export interface CashMovement {
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

// Configurações da loja
export interface StoreConfig {
  fantasyName: string;
  companyName?: string;
  cnpj?: string;
  address: string;
  phone: string;
  email?: string;
  logo?: string;
  printSettings: {
    autoprint: boolean;
    printerName?: string;
    paperType: 'thermal' | 'a4';
    paperSize: '58mm' | '80mm' | 'a4';
  };
}

// Relatórios
export interface SalesReport {
  period: string;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  salesByPayment: Record<string, number>;
}

export interface ServicesReport {
  period: string;
  totalServices: number;
  totalRevenue: number;
  servicesByProfessional: Array<{
    name: string;
    services: number;
    revenue: number;
  }>;
  topServices: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface StockReport {
  lowStockProducts: Array<{
    name: string;
    currentStock: number;
    minStock: number;
  }>;
  topSellingProducts: Array<{
    name: string;
    sold: number;
  }>;
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}