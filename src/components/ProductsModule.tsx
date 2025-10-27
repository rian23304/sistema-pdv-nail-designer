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
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  AlertTriangle,
  Download,
  Upload,
  Barcode
} from 'lucide-react';
import { User, Product } from '@/lib/types';

interface ProductsModuleProps {
  user: User;
  onBack: () => void;
}

export default function ProductsModule({ user, onBack }: ProductsModuleProps) {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Esmalte Risqué Rosa',
      code: '7891350032123',
      description: 'Esmalte cremoso rosa claro',
      category: 'Esmaltes',
      costPrice: 3.50,
      salePrice: 8.90,
      unit: 'un',
      currentStock: 25,
      minStock: 10,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '1'
    },
    {
      id: '2',
      name: 'Kit Lixa Profissional',
      code: '7891350032124',
      description: 'Kit com 10 lixas profissionais',
      category: 'Lixas',
      costPrice: 12.00,
      salePrice: 25.90,
      unit: 'kit',
      currentStock: 15,
      minStock: 5,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '1'
    },
    {
      id: '3',
      name: 'Gel UV Transparente',
      code: '7891350032125',
      description: 'Gel UV para unhas 15ml',
      category: 'Géis',
      costPrice: 18.00,
      salePrice: 35.00,
      unit: 'ml',
      currentStock: 3,
      minStock: 8,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '1'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showStockEntry, setShowStockEntry] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockEntryQuantity, setStockEntryQuantity] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    costPrice: 0,
    salePrice: 0,
    unit: 'un',
    currentStock: 0,
    minStock: 0,
    active: true
  });

  const categories = ['Esmaltes', 'Lixas', 'Géis', 'Decorações', 'Kits', 'Tratamentos', 'Outros'];
  const units = ['un', 'kit', 'ml', 'g', 'cm', 'par'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.includes(searchTerm) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(product => product.currentStock <= product.minStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      // Editar produto existente
      setProducts(products.map(product =>
        product.id === editingProduct.id
          ? { ...product, ...formData, updatedAt: new Date() }
          : product
      ));
    } else {
      // Criar novo produto
      const newProduct: Product = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      };
      setProducts([...products, newProduct]);
    }

    // Reset form
    setFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      costPrice: 0,
      salePrice: 0,
      unit: 'un',
      currentStock: 0,
      minStock: 0,
      active: true
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description,
      category: product.category,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      unit: product.unit,
      currentStock: product.currentStock,
      minStock: product.minStock || 0,
      active: product.active
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleStockEntry = () => {
    if (!selectedProduct || stockEntryQuantity <= 0) return;

    setProducts(products.map(product =>
      product.id === selectedProduct.id
        ? { 
            ...product, 
            currentStock: product.currentStock + stockEntryQuantity,
            updatedAt: new Date()
          }
        : product
    ));

    setSelectedProduct(null);
    setStockEntryQuantity(0);
    setShowStockEntry(false);
  };

  const toggleActive = (id: string) => {
    setProducts(products.map(product =>
      product.id === id
        ? { ...product, active: !product.active, updatedAt: new Date() }
        : product
    ));
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Nome,Código,Descrição,Categoria,Preço Custo,Preço Venda,Unidade,Estoque Atual,Estoque Mínimo\n" +
      "Exemplo Produto,1234567890123,Descrição do produto,Esmaltes,5.00,12.90,un,50,10";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_produtos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canEdit = user.role === 'proprietario' || user.role === 'gerente';
  const canViewStock = user.role !== 'vendedor' || user.role === 'funcionario';

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
                <Package className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Controle de Produtos e Estoque
                </h1>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              {user.name} - {user.role}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!showForm && !showStockEntry ? (
          <>
            {/* Alertas de Estoque Baixo */}
            {lowStockProducts.length > 0 && (
              <Card className="mb-6 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" />
                    Produtos com Estoque Baixo ({lowStockProducts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            Estoque: {product.currentStock} {product.unit}
                          </p>
                        </div>
                        {canEdit && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowStockEntry(true);
                            }}
                          >
                            Repor
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Controles */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                {canEdit && (
                  <>
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Modelo Excel
                    </Button>
                    <Button variant="outline" onClick={() => setShowStockEntry(true)}>
                      <Package className="w-4 h-4 mr-2" />
                      Entrada Estoque
                    </Button>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Lista de Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className={`${!product.active ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Barcode className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{product.code}</span>
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {product.category}
                        </Badge>
                      </div>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {canViewStock && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Preço Custo:</span>
                            <span>R$ {product.costPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Preço Venda:</span>
                            <span className="font-bold text-green-600">
                              R$ {product.salePrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Margem:</span>
                            <span className="text-blue-600">
                              {(((product.salePrice - product.costPrice) / product.costPrice) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span>Estoque:</span>
                        <Badge 
                          variant={product.currentStock <= (product.minStock || 0) ? "destructive" : "default"}
                        >
                          {product.currentStock} {product.unit}
                        </Badge>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={product.active ? "secondary" : "default"}
                          onClick={() => toggleActive(product.id)}
                        >
                          {product.active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando um novo produto'}
                </p>
              </div>
            )}
          </>
        ) : showStockEntry ? (
          /* Entrada de Estoque */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Entrada de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Produto</Label>
                  <Select 
                    value={selectedProduct?.id || ''} 
                    onValueChange={(value) => {
                      const product = products.find(p => p.id === value);
                      setSelectedProduct(product || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - Estoque atual: {product.currentStock} {product.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-medium mb-2">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{selectedProduct.description}</p>
                    <p className="text-sm">
                      <strong>Estoque atual:</strong> {selectedProduct.currentStock} {selectedProduct.unit}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="quantity">Quantidade a Adicionar</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={stockEntryQuantity}
                    onChange={(e) => setStockEntryQuantity(parseInt(e.target.value) || 0)}
                    min="1"
                    placeholder="0"
                  />
                </div>

                {selectedProduct && stockEntryQuantity > 0 && (
                  <div className="p-4 bg-green-50 rounded">
                    <p className="text-sm text-green-800">
                      <strong>Novo estoque:</strong> {selectedProduct.currentStock + stockEntryQuantity} {selectedProduct.unit}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStockEntry(false);
                      setSelectedProduct(null);
                      setStockEntryQuantity(0);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleStockEntry}
                    disabled={!selectedProduct || stockEntryQuantity <= 0}
                    className="flex-1"
                  >
                    Confirmar Entrada
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Formulário de Produto */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Código/SKU *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
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
                  <div>
                    <Label htmlFor="unit">Unidade *</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costPrice">Preço de Custo (R$) *</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Preço de Venda (R$) *</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Estoque Atual *</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStock">Estoque Mínimo</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                      min="0"
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
                  <Label htmlFor="active">Produto ativo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setFormData({
                        name: '',
                        code: '',
                        description: '',
                        category: '',
                        costPrice: 0,
                        salePrice: 0,
                        unit: 'un',
                        currentStock: 0,
                        minStock: 0,
                        active: true
                      });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
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