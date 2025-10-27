'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, CreditCard, DollarSign, Calendar, X, AlertTriangle, Eye } from 'lucide-react'
import { useProducts, useSales, useServices, useProfessionals, useCustomers } from '@/lib/hooks'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'product' | 'service'
  professionalId?: string
  professionalName?: string
}

export default function SalesModule() {
  const [activeTab, setActiveTab] = useState<'pdv' | 'daily-sales'>('pdv')
  const [productTab, setProductTab] = useState<'products' | 'services'>('products')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('dinheiro')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null)
  const [showSaleDetails, setShowSaleDetails] = useState<string | null>(null)

  const { products, loading: loadingProducts } = useProducts()
  const { services, loading: loadingServices } = useServices()
  const { professionals, loading: loadingProfessionals } = useProfessionals()
  const { customers, loading: loadingCustomers } = useCustomers()
  const { sales, loading: loadingSales, addSale, cancelSale, refetch: refetchSales } = useSales()

  // Buscar vendas do dia selecionado
  useEffect(() => {
    if (activeTab === 'daily-sales') {
      refetchSales(selectedDate)
    }
  }, [activeTab, selectedDate, refetchSales])

  const addToCart = (item: any, type: 'product' | 'service') => {
    if (type === 'service' && !selectedProfessional) {
      alert('Selecione um profissional antes de adicionar serviços!')
      return
    }

    const existingItem = cart.find(cartItem => 
      cartItem.id === item.id && 
      cartItem.type === type &&
      (type === 'service' ? cartItem.professionalId === selectedProfessional : true)
    )

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id && cartItem.type === type &&
        (type === 'service' ? cartItem.professionalId === selectedProfessional : true)
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      const professional = professionals.find(p => p.id === selectedProfessional)
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        type,
        professionalId: type === 'service' ? selectedProfessional : undefined,
        professionalName: type === 'service' ? professional?.name : undefined
      }])
    }
  }

  const updateQuantity = (id: string, type: string, professionalId: string | undefined, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id && item.type === type && item.professionalId === professionalId) {
        const newQuantity = Math.max(0, item.quantity + change)
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean) as CartItem[])
  }

  const removeFromCart = (id: string, type: string, professionalId: string | undefined) => {
    setCart(cart.filter(item => !(item.id === id && item.type === type && item.professionalId === professionalId)))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getProductsTotal = () => {
    return cart.filter(item => item.type === 'product')
      .reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getServicesTotal = () => {
    return cart.filter(item => item.type === 'service')
      .reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      alert('Adicione itens ao carrinho!')
      return
    }

    try {
      const saleData = {
        customer_id: selectedCustomer || null,
        professional_id: selectedProfessional || null,
        total_amount: getTotalAmount(),
        payment_method: paymentMethod,
        status: 'completed' as const,
        sale_date: new Date().toISOString()
      }

      const saleItems = cart.map(item => ({
        item_type: item.type,
        item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        professional_id: item.professionalId || null
      }))

      await addSale(saleData, saleItems)
      
      // Limpar carrinho
      setCart([])
      setSelectedCustomer('')
      alert('Venda finalizada com sucesso!')
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      alert('Erro ao finalizar venda!')
    }
  }

  const handleCancelSale = async (saleId: string) => {
    try {
      await cancelSale(saleId)
      setShowCancelModal(null)
      alert('Venda cancelada com sucesso!')
      refetchSales(selectedDate)
    } catch (error) {
      console.error('Erro ao cancelar venda:', error)
      alert('Erro ao cancelar venda!')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loadingProducts || loadingServices || loadingProfessionals || loadingCustomers) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Tabs principais */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('pdv')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pdv'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4 inline mr-2" />
          PDV - Ponto de Venda
        </button>
        <button
          onClick={() => setActiveTab('daily-sales')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'daily-sales'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Vendas do Dia
        </button>
      </div>

      {activeTab === 'pdv' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produtos e Serviços */}
          <div className="lg:col-span-2 space-y-4">
            {/* Seleção de Profissional */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional Responsável *
              </label>
              <select
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um profissional</option>
                {professionals.map(professional => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabs Produtos/Serviços */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="flex border-b">
                <button
                  onClick={() => setProductTab('products')}
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    productTab === 'products'
                      ? 'border-b-2 border-pink-500 text-pink-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Produtos
                </button>
                <button
                  onClick={() => setProductTab('services')}
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    productTab === 'services'
                      ? 'border-b-2 border-pink-500 text-pink-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Serviços
                </button>
              </div>

              <div className="p-4">
                {productTab === 'products' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map(product => (
                      <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                            <p className="text-xs text-gray-500">Estoque: {product.stock}</p>
                          </div>
                          <button
                            onClick={() => addToCart(product, 'product')}
                            disabled={product.stock === 0}
                            className="bg-pink-600 text-white px-3 py-1 rounded-md hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {productTab === 'services' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map(service => (
                      <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(service.price)}
                            </span>
                            <p className="text-xs text-gray-500">{service.duration} min</p>
                          </div>
                          <button
                            onClick={() => addToCart(service, 'service')}
                            disabled={!selectedProfessional}
                            className="bg-pink-600 text-white px-3 py-1 rounded-md hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carrinho */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Carrinho
              </h3>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.type}-${item.professionalId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">
                          {item.type === 'product' ? 'Produto' : 'Serviço'}
                          {item.professionalName && ` - ${item.professionalName}`}
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.type, item.professionalId, -1)}
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.type, item.professionalId, 1)}
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.type, item.professionalId)}
                          className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Resumo do carrinho */}
                  <div className="border-t pt-3 space-y-2">
                    {getProductsTotal() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Produtos:</span>
                        <span>{formatCurrency(getProductsTotal())}</span>
                      </div>
                    )}
                    {getServicesTotal() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Serviços:</span>
                        <span>{formatCurrency(getServicesTotal())}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(getTotalAmount())}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Finalização */}
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente (Opcional)
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Cliente não identificado</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="pix">PIX</option>
                </select>
              </div>

              <button
                onClick={handleFinalizeSale}
                disabled={cart.length === 0}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Finalizar Venda - {formatCurrency(getTotalAmount())}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'daily-sales' && (
        <div className="space-y-6">
          {/* Filtro por data */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data das Vendas
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Total: {formatCurrency(sales.filter(s => s.status === 'completed').reduce((sum, sale) => sum + sale.total_amount, 0))}
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                  Vendas: {sales.filter(s => s.status === 'completed').length}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de vendas */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Vendas do Dia</h3>
            </div>

            {loadingSales ? (
              <div className="p-8 text-center">Carregando vendas...</div>
            ) : sales.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma venda encontrada para esta data
              </div>
            ) : (
              <div className="divide-y">
                {sales.map(sale => (
                  <div key={sale.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">
                              Venda #{sale.id.slice(-8)}
                              {sale.status === 'cancelled' && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  CANCELADA
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(sale.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Cliente:</p>
                            <p className="font-medium">
                              {sale.customer?.name || 'Não identificado'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Profissional:</p>
                            <p className="font-medium">
                              {sale.professional?.name || 'Não informado'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Pagamento:</p>
                            <p className="font-medium capitalize">
                              {sale.payment_method.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            sale.status === 'cancelled' ? 'text-red-600 line-through' : 'text-green-600'
                          }`}>
                            {formatCurrency(sale.total_amount)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowSaleDetails(sale.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {sale.status === 'completed' && (
                            <button
                              onClick={() => setShowCancelModal(sale.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              title="Cancelar venda"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Itens da venda */}
                    {sale.sale_items && sale.sale_items.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Itens:</p>
                        <div className="space-y-1">
                          {sale.sale_items.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.quantity}x {item.product?.name || item.service?.name}
                                {item.item_type === 'service' && item.professional && (
                                  <span className="text-gray-500"> - {item.professional.name}</span>
                                )}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(item.total_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold">Cancelar Venda</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar esta venda? Esta ação não pode ser desfeita.
              O estoque dos produtos será restaurado.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Não, manter venda
              </button>
              <button
                onClick={() => handleCancelSale(showCancelModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sim, cancelar venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes da venda */}
      {showSaleDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {(() => {
              const sale = sales.find(s => s.id === showSaleDetails)
              if (!sale) return null

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Detalhes da Venda</h3>
                    <button
                      onClick={() => setShowSaleDetails(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">ID da Venda</p>
                        <p className="font-medium">#{sale.id.slice(-8)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data/Hora</p>
                        <p className="font-medium">{formatDateTime(sale.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cliente</p>
                        <p className="font-medium">{sale.customer?.name || 'Não identificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Profissional</p>
                        <p className="font-medium">{sale.professional?.name || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Forma de Pagamento</p>
                        <p className="font-medium capitalize">{sale.payment_method.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`font-medium ${
                          sale.status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {sale.status === 'cancelled' ? 'Cancelada' : 'Concluída'}
                        </p>
                      </div>
                    </div>

                    {sale.sale_items && sale.sale_items.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Itens da Venda</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qtd</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor Unit.</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {sale.sale_items.map((item: any) => (
                                <tr key={item.id}>
                                  <td className="px-4 py-2">
                                    <div>
                                      <p className="font-medium">{item.product?.name || item.service?.name}</p>
                                      {item.item_type === 'service' && item.professional && (
                                        <p className="text-sm text-gray-500">Prof: {item.professional.name}</p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      item.item_type === 'product' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-purple-100 text-purple-800'
                                    }`}>
                                      {item.item_type === 'product' ? 'Produto' : 'Serviço'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">{item.quantity}</td>
                                  <td className="px-4 py-2">{formatCurrency(item.unit_price)}</td>
                                  <td className="px-4 py-2 font-medium">{formatCurrency(item.total_price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total da Venda:</span>
                        <span className={`text-2xl font-bold ${
                          sale.status === 'cancelled' ? 'text-red-600 line-through' : 'text-green-600'
                        }`}>
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}