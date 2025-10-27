import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { Customer, Professional, Service, Product, Appointment, Sale, SaleItem, BlockedDate, BusinessHour } from './supabase'

// Hook para clientes
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single()
      
      if (error) throw error
      setCustomers(prev => [...prev, data])
      return data
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      throw error
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      setCustomers(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }
  }

  return { customers, loading, addCustomer, updateCustomer, refetch: fetchCustomers }
}

// Hook para profissionais
export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfessionals()
  }, [])

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (error) throw error
      setProfessionals(data || [])
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
    } finally {
      setLoading(false)
    }
  }

  const addProfessional = async (professional: Omit<Professional, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .insert([professional])
        .select()
        .single()
      
      if (error) throw error
      setProfessionals(prev => [...prev, data])
      return data
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error)
      throw error
    }
  }

  return { professionals, loading, addProfessional, refetch: fetchProfessionals }
}

// Hook para serviços
export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  const addService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single()
      
      if (error) throw error
      setServices(prev => [...prev, data])
      return data
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error)
      throw error
    }
  }

  return { services, loading, addService, refetch: fetchServices }
}

// Hook para produtos
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()
      
      if (error) throw error
      setProducts(prev => [...prev, data])
      return data
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      throw error
    }
  }

  const updateProductStock = async (id: string, newStock: number) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      setProducts(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error)
      throw error
    }
  }

  return { products, loading, addProduct, updateProductStock, refetch: fetchProducts }
}

// Hook para agendamentos
export function useAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(name, phone),
          professional:professionals(name),
          service:services(name, duration, price)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
      
      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...appointment, status: 'scheduled' }])
        .select(`
          *,
          customer:customers(name, phone),
          professional:professionals(name),
          service:services(name, duration, price)
        `)
        .single()
      
      if (error) throw error
      setAppointments(prev => [...prev, data])
      return data
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      throw error
    }
  }

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          customer:customers(name, phone),
          professional:professionals(name),
          service:services(name, duration, price)
        `)
        .single()
      
      if (error) throw error
      setAppointments(prev => prev.map(a => a.id === id ? data : a))
      return data
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }

  return { appointments, loading, addAppointment, updateAppointmentStatus, refetch: fetchAppointments }
}

// Hook para vendas
export function useSales() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async (date?: string) => {
    try {
      let query = supabase
        .from('sales')
        .select(`
          *,
          customer:customers(name, phone),
          professional:professionals(name),
          sale_items(
            *,
            product:products(name),
            service:services(name),
            professional:professionals(name)
          )
        `)
        .order('created_at', { ascending: false })

      if (date) {
        query = query.gte('sale_date', `${date}T00:00:00`)
                   .lt('sale_date', `${date}T23:59:59`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Erro ao buscar vendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSale = async (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>, items: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>[]) => {
    try {
      // Criar venda
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([sale])
        .select()
        .single()
      
      if (saleError) throw saleError

      // Criar itens da venda
      const saleItems = items.map(item => ({
        ...item,
        sale_id: saleData.id
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)
      
      if (itemsError) throw itemsError

      // Atualizar estoque dos produtos
      for (const item of items) {
        if (item.item_type === 'product') {
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.item_id)
            .single()
          
          if (product) {
            await supabase
              .from('products')
              .update({ stock: product.stock - item.quantity })
              .eq('id', item.item_id)
          }
        }
      }

      await fetchSales()
      return saleData
    } catch (error) {
      console.error('Erro ao criar venda:', error)
      throw error
    }
  }

  const cancelSale = async (id: string) => {
    try {
      // Buscar itens da venda para restaurar estoque
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', id)

      // Restaurar estoque dos produtos
      if (saleItems) {
        for (const item of saleItems) {
          if (item.item_type === 'product') {
            const { data: product } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.item_id)
              .single()
            
            if (product) {
              await supabase
                .from('products')
                .update({ stock: product.stock + item.quantity })
                .eq('id', item.item_id)
            }
          }
        }
      }

      // Cancelar venda
      const { data, error } = await supabase
        .from('sales')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      setSales(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s))
      return data
    } catch (error) {
      console.error('Erro ao cancelar venda:', error)
      throw error
    }
  }

  return { sales, loading, addSale, cancelSale, refetch: fetchSales }
}

// Hook para datas bloqueadas
export function useBlockedDates() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlockedDates()
  }, [])

  const fetchBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date')
      
      if (error) throw error
      setBlockedDates(data || [])
    } catch (error) {
      console.error('Erro ao buscar datas bloqueadas:', error)
    } finally {
      setLoading(false)
    }
  }

  const addBlockedDate = async (blockedDate: Omit<BlockedDate, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .insert([blockedDate])
        .select()
        .single()
      
      if (error) throw error
      setBlockedDates(prev => [...prev, data])
      return data
    } catch (error) {
      console.error('Erro ao bloquear data:', error)
      throw error
    }
  }

  const removeBlockedDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setBlockedDates(prev => prev.filter(d => d.id !== id))
    } catch (error) {
      console.error('Erro ao remover bloqueio:', error)
      throw error
    }
  }

  return { blockedDates, loading, addBlockedDate, removeBlockedDate, refetch: fetchBlockedDates }
}