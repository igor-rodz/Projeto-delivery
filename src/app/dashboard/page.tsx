'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingBag, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Order, Product } from '@/types/database'

export default function DashboardPage() {
  const { business } = useAuth()
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (business) {
      fetchData()
    }
  }, [business])

  const fetchData = async () => {
    if (!business) return

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)

      if (orders) {
        const todayOrders = orders.filter(o => new Date(o.created_at) >= today)
        const pendingOrders = orders.filter(o => 
          ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
        )

        setStats({
          todayOrders: todayOrders.length,
          todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
          pendingOrders: pendingOrders.length,
          totalProducts: productsCount || 0,
        })

        setRecentOrders(orders.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'preparing': return 'bg-orange-100 text-orange-700'
      case 'ready': return 'bg-purple-100 text-purple-700'
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'confirmed': return 'Confirmado'
      case 'preparing': return 'Preparando'
      case 'ready': return 'Pronto'
      case 'out_for_delivery': return 'Saiu para entrega'
      case 'delivered': return 'Entregue'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Hoje</p>
                <p className="text-2xl font-bold">{stats.todayOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Faturamento Hoje</p>
                <p className="text-2xl font-bold">R$ {stats.todayRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Pendentes</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produtos</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Carregando...</div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum pedido ainda</p>
              <p className="text-sm">Compartilhe seu cardápio para receber pedidos!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
