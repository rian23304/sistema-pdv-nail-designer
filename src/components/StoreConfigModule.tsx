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
  Settings, 
  Store,
  Printer,
  Save,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { User } from '@/lib/types';

interface StoreConfigModuleProps {
  user: User;
  onBack: () => void;
}

interface StoreConfig {
  fantasyName: string;
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  printSettings: {
    autoprint: boolean;
    printerName: string;
    paperType: 'thermal' | 'a4';
    paperSize: '58mm' | '80mm' | 'a4';
  };
}

export default function StoreConfigModule({ user, onBack }: StoreConfigModuleProps) {
  const [config, setConfig] = useState<StoreConfig>({
    fantasyName: 'Bruna Godoy Nayls Designer',
    companyName: 'Bruna Godoy Nayls Designer LTDA',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
    phone: '(11) 99999-9999',
    email: 'contato@brunagodoynayls.com',
    printSettings: {
      autoprint: false,
      printerName: '',
      paperType: 'thermal',
      paperSize: '80mm'
    }
  });

  const [activeTab, setActiveTab] = useState<'store' | 'print'>('store');

  const handleSave = () => {
    // Simular salvamento
    alert('Configurações salvas com sucesso!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simular upload da logo
      const reader = new FileReader();
      reader.onload = (e) => {
        setConfig({ ...config, logo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const canEdit = user.role === 'proprietario';

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Settings className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Apenas proprietários podem acessar as configurações da loja.
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
                <Settings className="w-6 h-6 text-red-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Configurações da Loja
                </h1>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800">
              {user.name} - {user.role}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'store' ? 'default' : 'outline'}
            onClick={() => setActiveTab('store')}
          >
            <Store className="w-4 h-4 mr-2" />
            Dados da Loja
          </Button>
          <Button
            variant={activeTab === 'print' ? 'default' : 'outline'}
            onClick={() => setActiveTab('print')}
          >
            <Printer className="w-4 h-4 mr-2" />
            Configurações de Impressão
          </Button>
        </div>

        {activeTab === 'store' ? (
          /* Dados da Loja */
          <Card>
            <CardHeader>
              <CardTitle>Informações da Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Logo */}
                <div>
                  <Label>Logo da Loja</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {config.logo ? (
                      <div className="w-24 h-24 border rounded-lg overflow-hidden">
                        <img 
                          src={config.logo} 
                          alt="Logo" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {config.logo ? 'Alterar Logo' : 'Enviar Logo'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos aceitos: JPG, PNG, GIF (máx. 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fantasyName">Nome Fantasia *</Label>
                    <Input
                      id="fantasyName"
                      value={config.fantasyName}
                      onChange={(e) => setConfig({ ...config, fantasyName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Razão Social</Label>
                    <Input
                      id="companyName"
                      value={config.companyName}
                      onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={config.cnpj}
                      onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={config.phone}
                      onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    value={config.address}
                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Configurações de Impressão */
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Impressão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoprint"
                    checked={config.printSettings.autoprint}
                    onChange={(e) => setConfig({
                      ...config,
                      printSettings: { ...config.printSettings, autoprint: e.target.checked }
                    })}
                  />
                  <Label htmlFor="autoprint">Impressão automática do comprovante após finalizar venda</Label>
                </div>

                <div>
                  <Label htmlFor="printerName">Nome da Impressora Padrão</Label>
                  <Input
                    id="printerName"
                    value={config.printSettings.printerName}
                    onChange={(e) => setConfig({
                      ...config,
                      printSettings: { ...config.printSettings, printerName: e.target.value }
                    })}
                    placeholder="Ex: Impressora Térmica, HP LaserJet, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe vazio para usar a impressora padrão do sistema
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paperType">Tipo de Papel</Label>
                    <Select 
                      value={config.printSettings.paperType} 
                      onValueChange={(value: 'thermal' | 'a4') => setConfig({
                        ...config,
                        printSettings: { ...config.printSettings, paperType: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermal">Papel Térmico (Bobina)</SelectItem>
                        <SelectItem value="a4">Papel A4 (Impressora Comum)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paperSize">Tamanho do Papel</Label>
                    <Select 
                      value={config.printSettings.paperSize} 
                      onValueChange={(value: '58mm' | '80mm' | 'a4') => setConfig({
                        ...config,
                        printSettings: { ...config.printSettings, paperSize: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config.printSettings.paperType === 'thermal' ? (
                          <>
                            <SelectItem value="58mm">58mm (Bobina Pequena)</SelectItem>
                            <SelectItem value="80mm">80mm (Bobina Padrão)</SelectItem>
                          </>
                        ) : (
                          <SelectItem value="a4">A4 (210 x 297mm)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview do Comprovante */}
                <div>
                  <Label>Preview do Comprovante</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded border">
                    <div className="max-w-xs mx-auto bg-white p-4 shadow-sm" style={{
                      width: config.printSettings.paperSize === 'a4' ? '100%' : 
                             config.printSettings.paperSize === '80mm' ? '240px' : '180px'
                    }}>
                      <div className="text-center mb-4">
                        {config.logo && (
                          <img src={config.logo} alt="Logo" className="w-16 h-16 mx-auto mb-2 object-cover" />
                        )}
                        <h3 className="font-bold text-sm">{config.fantasyName}</h3>
                        <p className="text-xs text-gray-600">{config.address}</p>
                        <p className="text-xs text-gray-600">{config.phone}</p>
                        {config.cnpj && <p className="text-xs text-gray-600">CNPJ: {config.cnpj}</p>}
                      </div>
                      
                      <div className="border-t border-dashed border-gray-300 pt-2 mb-2">
                        <p className="text-xs text-center">CUPOM NÃO FISCAL</p>
                        <p className="text-xs text-center">Venda #001</p>
                        <p className="text-xs text-center">{new Date().toLocaleString('pt-BR')}</p>
                      </div>
                      
                      <div className="text-xs space-y-1 mb-2">
                        <div className="flex justify-between">
                          <span>Manicure Simples</span>
                          <span>R$ 25,00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Esmalte Rosa</span>
                          <span>R$ 8,90</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-dashed border-gray-300 pt-2">
                        <div className="flex justify-between font-bold text-sm">
                          <span>TOTAL:</span>
                          <span>R$ 33,90</span>
                        </div>
                        <p className="text-xs text-center mt-2">Pagamento: PIX</p>
                      </div>
                      
                      <div className="text-center mt-4 text-xs text-gray-600">
                        <p>Obrigado pela preferência!</p>
                        <p>Volte sempre!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}