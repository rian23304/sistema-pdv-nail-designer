'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Scissors, Plus, X, Ban, Settings, Eye, CheckCircle, XCircle } from 'lucide-react'
import { useAppointments, useServices, useProfessionals, useCustomers, useBlockedDates } from '@/lib/hooks'

export default function AppointmentsModule() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'blocked-dates'>('calendar')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showBlockDate, setShowBlockDate] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  // Estados do formulário de agendamento
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedProfessional, setSelectedProfessional] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')

  // Estados do bloqueio de datas
  const [blockDate, setBlockDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blockAllDay, setBlockAllDay] = useState(true)
  const [blockStartTime, setBlockStartTime] = useState('')
  const [blockEndTime, setBlockEndTime] = useState('')
  const [blockProfessional, setBlockProfessional] = useState('')

  const { appointments, loading: loadingAppointments, addAppointment, updateAppointmentStatus, refetch: refetchAppointments } = useAppointments()
  const { services, loading: loadingServices } = useServices()
  const { professionals, loading: loadingProfessionals } = useProfessionals()
  const { customers, addCustomer } = useCustomers()
  const { blockedDates, addBlockedDate, removeBlockedDate, refetch: refetchBlockedDates } = useBlockedDates()

  // Filtrar agendamentos por data
  const dayAppointments = appointments.filter(apt => 
    apt.appointment_date === selectedDate && apt.status !== 'cancelled'
  )

  // Gerar horários disponíveis
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  // Verificar se horário está disponível
  const isTimeSlotAvailable = (time: string, professionalId: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return false

    const serviceDuration = service.duration
    const [hours, minutes] = time.split(':').map(Number)
    const startTime = hours * 60 + minutes
    const endTime = startTime + serviceDuration

    // Verificar conflitos com outros agendamentos
    const conflicts = dayAppointments.filter(apt => 
      apt.professional_id === professionalId &&
      apt.status !== 'cancelled'
    ).some(apt => {
      const [aptHours, aptMinutes] = apt.appointment_time.split(':').map(Number)
      const aptStartTime = aptHours * 60 + aptMinutes
      const aptService = services.find(s => s.id === apt.service_id)
      const aptEndTime = aptStartTime + (aptService?.duration || 60)

      return (startTime < aptEndTime && endTime > aptStartTime)
    })

    // Verificar bloqueios
    const isBlocked = blockedDates.some(block => {
      if (block.date !== selectedDate) return false
      if (block.professional_id && block.professional_id !== professionalId) return false
      
      if (block.all_day) return true
      
      if (block.start_time && block.end_time) {
        const [blockStartHours, blockStartMinutes] = block.start_time.split(':').map(Number)
        const [blockEndHours, blockEndMinutes] = block.end_time.split(':').map(Number)
        const blockStart = blockStartHours * 60 + blockStartMinutes
        const blockEnd = blockEndHours * 60 + blockEndMinutes
        
        return (startTime < blockEnd && endTime > blockStart)
      }
      
      return false
    })

    return !conflicts && !isBlocked
  }

  const handleCreateAppointment = async () => {
    if (!customerName || !customerPhone || !selectedService || !selectedProfessional || !appointmentTime) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    try {
      // Verificar se cliente já existe
      let customer = customers.find(c => c.phone === customerPhone)
      
      if (!customer) {
        // Criar novo cliente
        customer = await addCustomer({
          name: customerName,
          phone: customerPhone
        })
      }

      // Criar agendamento
      await addAppointment({
        customer_id: customer.id,
        professional_id: selectedProfessional,
        service_id: selectedService,
        appointment_date: selectedDate,
        appointment_time: appointmentTime,
        status: 'scheduled'
      })

      // Limpar formulário
      setCustomerName('')
      setCustomerPhone('')
      setSelectedService('')
      setSelectedProfessional('')
      setAppointmentTime('')
      setShowNewAppointment(false)
      
      alert('Agendamento criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento!')
    }
  }

  const handleBlockDate = async () => {
    if (!blockDate) {
      alert('Selecione uma data para bloquear!')
      return
    }

    try {
      await addBlockedDate({
        date: blockDate,
        reason: blockReason,
        all_day: blockAllDay,
        start_time: blockAllDay ? undefined : blockStartTime,
        end_time: blockAllDay ? undefined : blockEndTime,
        professional_id: blockProfessional || null
      })

      // Limpar formulário
      setBlockDate('')
      setBlockReason('')
      setBlockAllDay(true)
      setBlockStartTime('')
      setBlockEndTime('')
      setBlockProfessional('')
      setShowBlockDate(false)
      
      alert('Data bloqueada com sucesso!')
      refetchBlockedDates()
    } catch (error) {
      console.error('Erro ao bloquear data:', error)
      alert('Erro ao bloquear data!')
    }
  }

  const handleUpdateStatus = async (appointmentId: string, newStatus: any) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus)
      alert('Status atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status!')
    }
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loadingAppointments || loadingServices || loadingProfessionals) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Calendário
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Lista de Agendamentos
        </button>
        <button
          onClick={() => setActiveTab('blocked-dates')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'blocked-dates'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Ban className="w-4 h-4 inline mr-2" />
          Datas Bloqueadas
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seletor de data e ações */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowNewAppointment(true)}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </button>
              <button
                onClick={() => setShowBlockDate(true)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                <Ban className="w-4 h-4 mr-2" />
                Bloquear Data/Horário
              </button>
            </div>

            {/* Resumo do dia */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3">Resumo do Dia</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total de agendamentos:</span>
                  <span className="font-medium">{dayAppointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confirmados:</span>
                  <span className="font-medium text-green-600">
                    {dayAppointments.filter(apt => apt.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pendentes:</span>
                  <span className="font-medium text-yellow-600">
                    {dayAppointments.filter(apt => apt.status === 'scheduled').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Concluídos:</span>
                  <span className="font-medium text-blue-600">
                    {dayAppointments.filter(apt => apt.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Agenda do dia */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Agenda - {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>

              <div className="p-4">
                {dayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum agendamento para esta data</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayAppointments
                      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                      .map(appointment => (
                        <div
                          key={appointment.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            appointment.status === 'completed' ? 'border-blue-500 bg-blue-50' :
                            appointment.status === 'confirmed' ? 'border-green-500 bg-green-50' :
                            appointment.status === 'in_progress' ? 'border-yellow-500 bg-yellow-50' :
                            'border-gray-500 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {formatTime(appointment.appointment_time)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="w-4 h-4 mr-1" />
                                  {appointment.customer?.name}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Scissors className="w-4 h-4 mr-1" />
                                  {appointment.service?.name}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="font-medium">{appointment.professional?.name}</p>
                                <p className="text-sm text-gray-600">
                                  {appointment.service?.duration} min - {formatCurrency(appointment.service?.price || 0)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {appointment.status === 'scheduled' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                                    title="Confirmar"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                    title="Cancelar"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {appointment.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                >
                                  Concluir
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedAppointment(appointment)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Todos os Agendamentos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Serviço</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Profissional</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">{formatTime(appointment.appointment_time)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{appointment.customer?.name}</p>
                        <p className="text-sm text-gray-600">{appointment.customer?.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{appointment.service?.name}</p>
                        <p className="text-sm text-gray-600">{appointment.service?.duration} min</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{appointment.professional?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'completed' ? 'Concluído' :
                         appointment.status === 'confirmed' ? 'Confirmado' :
                         appointment.status === 'in_progress' ? 'Em andamento' :
                         appointment.status === 'cancelled' ? 'Cancelado' :
                         'Agendado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(appointment.service?.price || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'blocked-dates' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Datas e Horários Bloqueados</h3>
              <button
                onClick={() => setShowBlockDate(true)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Bloqueio
              </button>
            </div>

            {blockedDates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Ban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma data bloqueada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedDates.map(block => (
                  <div key={block.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(block.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {block.all_day ? 'Dia inteiro' : `${block.start_time} - ${block.end_time}`}
                        </p>
                        {block.reason && (
                          <p className="text-sm text-gray-600 mt-1">Motivo: {block.reason}</p>
                        )}
                        {block.professional_id && (
                          <p className="text-sm text-gray-600">
                            Profissional: {professionals.find(p => p.id === block.professional_id)?.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeBlockedDate(block.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        title="Remover bloqueio"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de novo agendamento */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Novo Agendamento</h3>
              <button
                onClick={() => setShowNewAppointment(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serviço *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selecione um serviço</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)} ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissional *
                </label>
                <select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map(professional => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário *
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={!selectedService || !selectedProfessional}
                >
                  <option value="">Selecione um horário</option>
                  {selectedService && selectedProfessional && generateTimeSlots().map(time => (
                    <option
                      key={time}
                      value={time}
                      disabled={!isTimeSlotAvailable(time, selectedProfessional, selectedService)}
                    >
                      {time} {!isTimeSlotAvailable(time, selectedProfessional, selectedService) ? '(Ocupado)' : ''}
                    </option>
                  ))}
                </select>
                {(!selectedService || !selectedProfessional) && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selecione o serviço e profissional primeiro
                  </p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAppointment}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de bloqueio de data */}
      {showBlockDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bloquear Data/Horário</h3>
              <button
                onClick={() => setShowBlockDate(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Ex: Feriado, Folga, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissional (Opcional)
                </label>
                <select
                  value={blockProfessional}
                  onChange={(e) => setBlockProfessional(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Todos os profissionais</option>
                  {professionals.map(professional => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={blockAllDay}
                    onChange={(e) => setBlockAllDay(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Dia inteiro</span>
                </label>
              </div>

              {!blockAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora Início
                    </label>
                    <input
                      type="time"
                      value={blockStartTime}
                      onChange={(e) => setBlockStartTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora Fim
                    </label>
                    <input
                      type="time"
                      value={blockEndTime}
                      onChange={(e) => setBlockEndTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowBlockDate(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBlockDate}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Bloquear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes do agendamento */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalhes do Agendamento</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-medium">
                    {new Date(selectedAppointment.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Horário</p>
                  <p className="font-medium">{formatTime(selectedAppointment.appointment_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{selectedAppointment.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{selectedAppointment.customer?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Serviço</p>
                  <p className="font-medium">{selectedAppointment.service?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duração</p>
                  <p className="font-medium">{selectedAppointment.service?.duration} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profissional</p>
                  <p className="font-medium">{selectedAppointment.professional?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="font-medium">{formatCurrency(selectedAppointment.service?.price || 0)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  selectedAppointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedAppointment.status === 'completed' ? 'Concluído' :
                   selectedAppointment.status === 'confirmed' ? 'Confirmado' :
                   selectedAppointment.status === 'in_progress' ? 'Em andamento' :
                   selectedAppointment.status === 'cancelled' ? 'Cancelado' :
                   'Agendado'}
                </span>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment.id, 'confirmed')
                        setSelectedAppointment(null)
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment.id, 'cancelled')
                        setSelectedAppointment(null)
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, 'completed')
                      setSelectedAppointment(null)
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Marcar como Concluído
                  </button>
                )}
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}