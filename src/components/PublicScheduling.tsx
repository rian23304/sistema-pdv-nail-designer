'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Scissors, CheckCircle, ArrowLeft } from 'lucide-react'
import { useServices, useProfessionals, useAppointments, useCustomers, useBlockedDates } from '@/lib/hooks'

interface PublicSchedulingProps {
  onBack: () => void
}

export default function PublicScheduling({ onBack }: PublicSchedulingProps) {
  const [step, setStep] = useState<'service' | 'professional' | 'datetime' | 'contact' | 'confirmation'>('service')
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { services, loading: loadingServices } = useServices()
  const { professionals, loading: loadingProfessionals } = useProfessionals()
  const { appointments, addAppointment } = useAppointments()
  const { customers, addCustomer } = useCustomers()
  const { blockedDates } = useBlockedDates()

  // Filtrar profissionais que podem fazer o serviço selecionado
  const availableProfessionals = professionals.filter(prof => 
    selectedService && prof.specialties.some(specialty => 
      selectedService.category.toLowerCase().includes(specialty.toLowerCase()) ||
      specialty.toLowerCase().includes(selectedService.category.toLowerCase())
    )
  )

  // Gerar próximos 30 dias úteis
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Pular domingos (0 = domingo)
      if (date.getDay() === 0) continue
      
      const dateString = date.toISOString().split('T')[0]
      
      // Verificar se a data não está bloqueada
      const isBlocked = blockedDates.some(block => 
        block.date === dateString && 
        block.all_day && 
        (!block.professional_id || block.professional_id === selectedProfessional?.id)
      )
      
      if (!isBlocked) {
        dates.push({
          date: dateString,
          formatted: date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })
        })
      }
    }
    
    return dates
  }

  // Gerar horários disponíveis para a data selecionada
  const generateAvailableTimeSlots = () => {
    if (!selectedDate || !selectedProfessional || !selectedService) return []

    const slots = []
    const dayOfWeek = new Date(selectedDate + 'T00:00:00').getDay()
    
    // Horários de funcionamento (Segunda a Sexta: 9h-18h, Sábado: 9h-16h)
    let startHour = 9
    let endHour = dayOfWeek === 6 ? 16 : 18 // Sábado até 16h, outros dias até 18h
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        if (isTimeSlotAvailable(time)) {
          slots.push(time)
        }
      }
    }
    
    return slots
  }

  // Verificar se horário está disponível
  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate || !selectedProfessional || !selectedService) return false

    const serviceDuration = selectedService.duration
    const [hours, minutes] = time.split(':').map(Number)
    const startTime = hours * 60 + minutes
    const endTime = startTime + serviceDuration

    // Verificar conflitos com outros agendamentos
    const dayAppointments = appointments.filter(apt => 
      apt.appointment_date === selectedDate &&
      apt.professional_id === selectedProfessional.id &&
      apt.status !== 'cancelled'
    )

    const hasConflict = dayAppointments.some(apt => {
      const [aptHours, aptMinutes] = apt.appointment_time.split(':').map(Number)
      const aptStartTime = aptHours * 60 + aptMinutes
      const aptService = services.find(s => s.id === apt.service_id)
      const aptEndTime = aptStartTime + (aptService?.duration || 60)

      return (startTime < aptEndTime && endTime > aptStartTime)
    })

    // Verificar bloqueios de horário específico
    const isBlocked = blockedDates.some(block => {
      if (block.date !== selectedDate) return false
      if (block.professional_id && block.professional_id !== selectedProfessional.id) return false
      
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

    return !hasConflict && !isBlocked
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      alert('Preencha todos os campos!')
      return
    }

    setIsSubmitting(true)

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
        professional_id: selectedProfessional.id,
        service_id: selectedService.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        status: 'scheduled'
      })

      setStep('confirmation')
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert('Erro ao agendar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  if (loadingServices || loadingProfessionals) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agendar Serviço
          </h1>
          <p className="text-gray-600">
            Bruna Godoy Nayls Designer
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { key: 'service', label: 'Serviço', icon: Scissors },
              { key: 'professional', label: 'Profissional', icon: User },
              { key: 'datetime', label: 'Data/Hora', icon: Calendar },
              { key: 'contact', label: 'Contato', icon: Phone },
              { key: 'confirmation', label: 'Confirmação', icon: CheckCircle }
            ].map((stepItem, index) => {
              const Icon = stepItem.icon
              const isActive = step === stepItem.key
              const isCompleted = ['service', 'professional', 'datetime', 'contact', 'confirmation'].indexOf(step) > 
                                 ['service', 'professional', 'datetime', 'contact', 'confirmation'].indexOf(stepItem.key)
              
              return (
                <div key={stepItem.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-pink-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-pink-600' : 'text-gray-500'
                  }`}>
                    {stepItem.label}
                  </span>
                  {index < 4 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {step === 'service' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Escolha o Serviço</h2>
              <div className="grid gap-4">
                {services.map(service => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      setStep('professional')
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedService?.id === service.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration} minutos
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-pink-600">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'professional' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Escolha o Profissional</h2>
              <div className="grid gap-4">
                {availableProfessionals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum profissional disponível para este serviço.</p>
                    <button
                      onClick={() => setStep('service')}
                      className="mt-4 text-pink-600 hover:text-pink-700"
                    >
                      Escolher outro serviço
                    </button>
                  </div>
                ) : (
                  availableProfessionals.map(professional => (
                    <div
                      key={professional.id}
                      onClick={() => {
                        setSelectedProfessional(professional)
                        setStep('datetime')
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedProfessional?.id === professional.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                          <p className="text-gray-600 text-sm">
                            Especialidades: {professional.specialties.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setStep('service')}
                  className="text-pink-600 hover:text-pink-700"
                >
                  ← Voltar para serviços
                </button>
              </div>
            </div>
          )}

          {step === 'datetime' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Escolha Data e Horário</h2>
              
              {!selectedDate ? (
                <div>
                  <h3 className="font-medium mb-4">Datas Disponíveis</h3>
                  <div className="grid gap-3">
                    {generateAvailableDates().slice(0, 10).map(dateOption => (
                      <button
                        key={dateOption.date}
                        onClick={() => setSelectedDate(dateOption.date)}
                        className="p-3 text-left border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
                      >
                        <span className="font-medium capitalize">{dateOption.formatted}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedDate('')}
                      className="text-pink-600 hover:text-pink-700 text-sm"
                    >
                      ← Escolher outra data
                    </button>
                    <h3 className="font-medium mt-2">
                      Horários para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {generateAvailableTimeSlots().map(time => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time)
                          setStep('contact')
                        }}
                        className="p-3 text-center border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                  
                  {generateAvailableTimeSlots().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum horário disponível para esta data.</p>
                      <button
                        onClick={() => setSelectedDate('')}
                        className="mt-4 text-pink-600 hover:text-pink-700"
                      >
                        Escolher outra data
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => setStep('professional')}
                  className="text-pink-600 hover:text-pink-700"
                >
                  ← Voltar para profissionais
                </button>
              </div>
            </div>
          )}

          {step === 'contact' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Seus Dados</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => setStep('datetime')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!customerName || !customerPhone || isSubmitting}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Agendamento Confirmado!
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serviço:</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profissional:</span>
                    <span className="font-medium">{selectedProfessional?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horário:</span>
                    <span className="font-medium">{formatTime(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium">{formatCurrency(selectedService?.price || 0)}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Seu agendamento foi confirmado! Você receberá uma confirmação em breve.
                Em caso de dúvidas, entre em contato conosco.
              </p>
              
              <button
                onClick={onBack}
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
              >
                Voltar ao Início
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}