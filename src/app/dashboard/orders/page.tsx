'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronDown, Phone, MapPin, Package, Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Order, OrderItem } from '@/types/database'

type OrderWithItems = Order & { items: OrderItem[] }

const statusFlow = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  { value: 'preparing', label: 'Preparando', color: 'bg-orange-100 text-orange-700', icon: Package },
  { value: 'ready', label: 'Pronto', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  { value: 'out_for_delivery', label: 'Saiu p/ entrega', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  { value: 'delivered', label: 'Entregue', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-orange-100 text-red-700', icon: XCircle },
]

export default function OrdersPage() {
  const { business } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('active')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (business) {
      fetchOrders()
      // Subscribe to realtime updates
      const channel = supabase
        .channel('orders')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders', filter: `business_id=eq.${business.id}` },
          () => fetchOrders()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [business])

  const fetchOrders = async () => {
    if (!business) return

    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch items for each order
      const ordersWithItems: OrderWithItems[] = []
      for (const order of ordersData || []) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)

        ordersWithItems.push({ ...order, items: items || [] })
      }

      setOrders(ordersWithItems)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
      ))
      toast.success('Status atualizado!')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return !['delivered', 'cancelled'].includes(order.status)
    }
    if (filter === 'completed') {
      return order.status === 'delivered'
    }
    if (filter === 'cancelled') {
      return order.status === 'cancelled'
    }
    return true
  })

  const getStatusInfo = (status: string) => {
    return statusFlow.find(s => s.value === status) || statusFlow[0]
  }

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery': return <Truck className="w-4 h-4" />
      case 'takeaway': return <Package className="w-4 h-4" />
      default: return <Store className="w-4 h-4" />
    }
  }

  const getOrderTypeText = (type: string) => {
    switch (type) {
      case 'delivery': return 'Delivery'
      case 'takeaway': return 'Retirada'
      default: return 'Local'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">Gerencie os pedidos do seu negócio</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'active', label: 'Ativos' },
          { value: 'all', label: 'Todos' },
          { value: 'completed', label: 'Concluídos' },
          { value: 'cancelled', label: 'Cancelados' },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Carregando pedidos...</div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const isExpanded = expandedOrder === order.id

            return (
              <Card key={order.id} className="overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">#{order.id.slice(-6).toUpperCase()}</span>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getOrderTypeIcon(order.order_type)}
                          {getOrderTypeText(order.order_type)}
                        </Badge>
                      </div>
                      <p className="text-gray-900 font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">R$ {order.total.toFixed(2)}</p>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    {/* Customer Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-700">Cliente</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${order.customer_phone}`} className="text-blue-600">
                            {order.customer_phone}
                          </a>
                        </div>
                        {order.address && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span>{order.address}</span>
                          </div>
                        )}
                        {order.observations && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Obs:</span> {order.observations}
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Itens</h4>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.product_name}</span>
                              <span>R$ {item.total.toFixed(2)}</span>
                            </div>
                          ))}
                          {order.delivery_fee > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Taxa de entrega</span>
                              <span>R$ {order.delivery_fee.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-bold border-t pt-1">
                            <span>Total</span>
                            <span>R$ {order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Actions */}
                    {!['delivered', 'cancelled'].includes(order.status) && (
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <span className="text-sm text-gray-600">Atualizar status:</span>
                        <div className="flex flex-wrap gap-2">
                          {order.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                                Confirmar
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                                Cancelar
                              </Button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                              Iniciar Preparo
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>
                              Marcar Pronto
                            </Button>
                          )}
                          {order.status === 'ready' && order.order_type === 'delivery' && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}>
                              Saiu para Entrega
                            </Button>
                          )}
                          {(order.status === 'ready' && order.order_type !== 'delivery') && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                              Finalizar
                            </Button>
                          )}
                          {order.status === 'out_for_delivery' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                              Entregue
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
