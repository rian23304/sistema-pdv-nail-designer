'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, Calendar, User, Download, Filter, Eye } from 'lucide-react'
import { useProfessionals, useSales, useAppointments } from '@/lib/hooks'

export default function ReportsModule() {
  const [activeTab, setActiveTab] = useState<'overview' | 'professional' | 'services' | 'financial'>('overview')
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null)

  const { professionals, loading: loadingProfessionals } = useProfessionals()
  const { sales, loading: loadingSales } = useSales()
  const { appointments, loading: loadingAppointments } = useAppointments()

  // Calcular datas baseado no range selecionado
  const getDateRange = () => {
    const today = new Date()
    let start = new Date()
    let end = new Date()

    switch (dateRange) {
      case 'today':
        start = new Date(today.setHours(0, 0, 0, 0))
        end = new Date(today.setHours(23, 59, 59, 999))
        break
      case 'week':
        start = new Date(today.setDate(today.getDate() - 7))
        end = new Date()
        break
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'custom':
        start = startDate ? new Date(startDate) : new Date()
        end = endDate ? new Date(endDate) : new Date()
        break
    }

    return { start, end }
  }

  // Filtrar dados por período
  const filterDataByPeriod = (data: any[], dateField: string) => {
    const { start, end } = getDateRange()
    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= start && itemDate <= end
    })
  }

  // Relatório por profissional
  const getProfessionalReport = (professionalId: string) => {
    const filteredSales = filterDataByPeriod(sales, 'sale_date')
    const filteredAppointments = filterDataByPeriod(appointments, 'appointment_date')

    // Vendas do profissional
    const professionalSales = filteredSales.filter(sale => 
      sale.professional_id === professionalId && sale.status === 'completed'
    )

    // Agendamentos do profissional
    const professionalAppointments = filteredAppointments.filter(apt => 
      apt.professional_id === professionalId
    )

    // Serviços prestados (através de sale_items)
    const servicesProvided = []
    professionalSales.forEach(sale => {
      if (sale.sale_items) {
        sale.sale_items.forEach((item: any) => {
          if (item.item_type === 'service' && item.professional_id === professionalId) {
            servicesProvided.push({
              ...item,
              sale_date: sale.sale_date,
              customer_name: sale.customer?.name || 'Cliente não identificado',
              service_name: item.service?.name || 'Serviço não identificado'
            })
          }
        })
      }
    })

    // Calcular estatísticas
    const totalRevenue = servicesProvided.reduce((sum, service) => sum + service.total_price, 0)
    const totalServices = servicesProvided.length
    const completedAppointments = professionalAppointments.filter(apt => apt.status === 'completed').length
    const cancelledAppointments = professionalAppointments.filter(apt => apt.status === 'cancelled').length
    const averageServiceValue = totalServices > 0 ? totalRevenue / totalServices : 0

    // Serviços por tipo
    const servicesByType = servicesProvided.reduce((acc: any, service) => {
      const serviceName = service.service_name
      if (!acc[serviceName]) {
        acc[serviceName] = {
          count: 0,
          revenue: 0,
          name: serviceName
        }
      }
      acc[serviceName].count += service.quantity
      acc[serviceName].revenue += service.total_price
      return acc
    }, {})

    // Vendas por dia
    const salesByDay = servicesProvided.reduce((acc: any, service) => {
      const date = new Date(service.sale_date).toLocaleDateString('pt-BR')
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          revenue: 0
        }
      }
      acc[date].count += service.quantity
      acc[date].revenue += service.total_price
      return acc
    }, {})

    return {
      totalRevenue,
      totalServices,
      completedAppointments,
      cancelledAppointments,
      averageServiceValue,
      servicesProvided,
      servicesByType: Object.values(servicesByType),
      salesByDay: Object.values(salesByDay).sort((a: any, b: any) => 
        new Date(a.date.split('/').reverse().join('-')).getTime() - 
        new Date(b.date.split('/').reverse().join('-')).getTime()
      )
    }
  }

  // Relatório geral
  const getOverallReport = () => {
    const filteredSales = filterDataByPeriod(sales, 'sale_date')
    const filteredAppointments = filterDataByPeriod(appointments, 'appointment_date')

    const completedSales = filteredSales.filter(sale => sale.status === 'completed')
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total_amount, 0)
    const totalSales = completedSales.length
    const totalAppointments = filteredAppointments.length
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length

    return {
      totalRevenue,
      totalSales,
      totalAppointments,
      completedAppointments,
      averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
      completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loadingProfessionals || loadingSales || loadingAppointments) {
    return <div className="flex items-center justify-center h-64">Carregando relatórios...</div>
  }

  const overallReport = getOverallReport()

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="today">Hoje</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Este mês</option>
              <option value="custom">Período personalizado</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="ml-auto">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('professional')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'professional'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Por Profissional
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'services'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Serviços
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'financial'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Financeiro
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overallReport.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900">{overallReport.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{overallReport.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overallReport.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'professional' && (
        <div className="space-y-6">
          {/* Seletor de profissional */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Profissional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="w-full max-w-md p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Selecione um profissional</option>
              {professionals.map(professional => (
                <option key={professional.id} value={professional.id}>
                  {professional.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProfessional && (() => {
            const report = getProfessionalReport(selectedProfessional)
            const professional = professionals.find(p => p.id === selectedProfessional)

            return (
              <div className="space-y-6">
                {/* Estatísticas do profissional */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Receita</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(report.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Serviços</p>
                        <p className="text-2xl font-bold text-gray-900">{report.totalServices}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Concluídos</p>
                        <p className="text-2xl font-bold text-gray-900">{report.completedAppointments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Valor Médio</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(report.averageServiceValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Serviços por tipo */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Serviços por Tipo</h3>
                  </div>
                  <div className="p-4">
                    {report.servicesByType.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Nenhum serviço prestado no período</p>
                    ) : (
                      <div className="space-y-4">
                        {report.servicesByType.map((service: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-gray-600">{service.count} serviços</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatCurrency(service.revenue)}</p>
                              <p className="text-sm text-gray-600">
                                Média: {formatCurrency(service.revenue / service.count)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Detalhamento de serviços prestados */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Detalhamento de Serviços</h3>
                    <button
                      onClick={() => setShowDetailModal(selectedProfessional)}
                      className="text-pink-600 hover:text-pink-700 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver todos
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Serviço</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qtd</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {report.servicesProvided.slice(0, 10).map((service: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{formatDate(service.sale_date)}</td>
                            <td className="px-4 py-3">{service.customer_name}</td>
                            <td className="px-4 py-3">{service.service_name}</td>
                            <td className="px-4 py-3">{service.quantity}</td>
                            <td className="px-4 py-3 font-medium">{formatCurrency(service.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {report.servicesProvided.length > 10 && (
                      <div className="p-4 text-center border-t">
                        <button
                          onClick={() => setShowDetailModal(selectedProfessional)}
                          className="text-pink-600 hover:text-pink-700"
                        >
                          Ver mais {report.servicesProvided.length - 10} serviços
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Relatório de Serviços</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-500 text-center py-8">
              Relatório de serviços em desenvolvimento...
            </p>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Relatório Financeiro</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-500 text-center py-8">
              Relatório financeiro em desenvolvimento...
            </p>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {showDetailModal && (() => {
        const report = getProfessionalReport(showDetailModal)
        const professional = professionals.find(p => p.id === showDetailModal)

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Detalhamento Completo - {professional?.name}
                </h3>
                <button
                  onClick={() => setShowDetailModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data/Hora</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Serviço</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qtd</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor Unit.</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {report.servicesProvided.map((service: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{formatDateTime(service.sale_date)}</td>
                          <td className="px-4 py-3">{service.customer_name}</td>
                          <td className="px-4 py-3">{service.service_name}</td>
                          <td className="px-4 py-3">{service.quantity}</td>
                          <td className="px-4 py-3">{formatCurrency(service.unit_price)}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(service.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right font-medium">Total:</td>
                        <td className="px-4 py-3 font-bold text-green-600">
                          {formatCurrency(report.totalRevenue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}