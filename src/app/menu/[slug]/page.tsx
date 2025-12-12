'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Store, MapPin, Phone, Clock, Star, Search, ShoppingCart, 
  Plus, Minus, X, ChevronRight, ArrowLeft, Truck, Package,
  Loader2, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { useCart, getAdditionalsKey } from '@/lib/cart-context'
import { toast } from 'sonner'
import type { Business, Category, Product, Additional, DeliveryArea } from '@/types/database'

type View = 'menu' | 'product' | 'cart' | 'checkout' | 'success'

export default function MenuPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [additionals, setAdditionals] = useState<Additional[]>([])
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  
  // UI State
  const [currentView, setCurrentView] = useState<View>('menu')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedAdditionals, setSelectedAdditionals] = useState<Additional[]>([])
  const [productQuantity, setProductQuantity] = useState(1)
  
  // Checkout State
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderType, setOrderType] = useState<'local' | 'takeaway' | 'delivery'>('delivery')
  const [address, setAddress] = useState('')
  const [selectedArea, setSelectedArea] = useState<DeliveryArea | null>(null)
  const [observations, setObservations] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  
  const { items, addItem, updateQuantity, removeItem, clearCart, getSubtotal, getTotalItems } = useCart()

  useEffect(() => {
    if (slug) {
      fetchBusinessData()
    }
  }, [slug])

  const fetchBusinessData = async () => {
    try {
      // Fetch business
      const { data: businessData, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .single()

      if (bizError || !businessData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setBusiness(businessData)

      // Fetch all related data
      const [catsRes, prodsRes, addsRes, areasRes] = await Promise.all([
        supabase.from('categories').select('*').eq('business_id', businessData.id).eq('enabled', true).order('sort_order'),
        supabase.from('products').select('*').eq('business_id', businessData.id).eq('enabled', true).order('name'),
        supabase.from('additionals').select('*').eq('business_id', businessData.id).eq('enabled', true).order('name'),
        supabase.from('delivery_areas').select('*').eq('business_id', businessData.id).eq('enabled', true).order('name'),
      ])

      setCategories(catsRes.data || [])
      setProducts(prodsRes.data || [])
      setAdditionals(addsRes.data || [])
      setDeliveryAreas(areasRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const openProduct = (product: Product) => {
    setSelectedProduct(product)
    setSelectedAdditionals([])
    setProductQuantity(1)
    setCurrentView('product')
  }

  const addToCart = () => {
    if (!selectedProduct || !business) return

    addItem({
      product: selectedProduct,
      quantity: productQuantity,
      selectedAdditionals: [...selectedAdditionals],
    }, business.id)

    toast.success(`${selectedProduct.name} adicionado!`)
    setCurrentView('menu')
  }

  const getTotal = () => {
    const subtotal = getSubtotal()
    const deliveryFee = orderType === 'delivery' && selectedArea ? selectedArea.fee : 0
    return subtotal + deliveryFee
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const submitOrder = async () => {
    if (!business) return

    if (!customerName || !customerPhone) {
      toast.error('Preencha nome e telefone')
      return
    }

    if (orderType === 'delivery' && (!address || !selectedArea)) {
      toast.error('Preencha o endereço e selecione a área')
      return
    }

    const subtotal = getSubtotal()
    if (subtotal < (business.min_order || 0)) {
      toast.error(`Pedido mínimo: R$ ${business.min_order?.toFixed(2)}`)
      return
    }

    setSubmittingOrder(true)
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: business.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          order_type: orderType,
          address: orderType === 'delivery' ? address : null,
          delivery_area: selectedArea?.name || null,
          delivery_fee: orderType === 'delivery' ? (selectedArea?.fee || 0) : 0,
          subtotal,
          total: getTotal(),
          observations: observations || null,
          payment_method: paymentMethod || null,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        additionals: item.selectedAdditionals,
        additionals_total: item.selectedAdditionals.reduce((sum, a) => sum + a.price, 0),
        total: (item.product.price + item.selectedAdditionals.reduce((sum, a) => sum + a.price, 0)) * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      setOrderId(order.id)
      clearCart()
      setCurrentView('success')
      toast.success('Pedido enviado com sucesso!')
    } catch (error: any) {
      console.error('Error submitting order:', error)
      toast.error(error.message || 'Erro ao enviar pedido')
    } finally {
      setSubmittingOrder(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const themeColor = business?.theme_color || '#f97316'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeColor }} />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurante não encontrado</h1>
          <p className="text-gray-600 mb-4">Verifique o link e tente novamente</p>
          <Button onClick={() => router.push('/')}>Voltar ao início</Button>
        </div>
      </div>
    )
  }

  // Success View
  if (currentView === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${themeColor}20` }}>
            <CheckCircle className="w-10 h-10" style={{ color: themeColor }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido Enviado!</h1>
          <p className="text-gray-600 mb-6">
            Seu pedido #{orderId?.slice(-6).toUpperCase()} foi recebido e está sendo processado.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left">
            <p className="text-gray-600">Você receberá atualizações sobre seu pedido.</p>
            <p className="text-gray-600 mt-2">Em caso de dúvidas, entre em contato:</p>
            {business?.phone && (
              <a href={`tel:${business.phone}`} className="font-medium" style={{ color: themeColor }}>
                {business.phone}
              </a>
            )}
          </div>
          <Button 
            className="w-full text-white"
            style={{ backgroundColor: themeColor }}
            onClick={() => {
              setCurrentView('menu')
              setOrderId(null)
              setCustomerName('')
              setCustomerPhone('')
              setAddress('')
              setObservations('')
            }}
          >
            Fazer Novo Pedido
          </Button>
        </div>
      </div>
    )
  }

  // Checkout View
  if (currentView === 'checkout') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="flex items-center h-14 px-4">
            <button onClick={() => setCurrentView('cart')} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold ml-2">Finalizar Pedido</h1>
          </div>
        </header>

        <div className="p-4 pb-32 max-w-lg mx-auto space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-4">Seus dados</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-4">Tipo de pedido</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'delivery', label: 'Delivery', icon: Truck },
                { value: 'takeaway', label: 'Retirada', icon: Package },
                { value: 'local', label: 'No local', icon: Store },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setOrderType(type.value as any)}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                    orderType === type.value
                      ? 'border-current'
                      : 'border-gray-200'
                  }`}
                  style={{ borderColor: orderType === type.value ? themeColor : undefined, color: orderType === type.value ? themeColor : undefined }}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {orderType === 'delivery' && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold mb-4">Endereço de entrega</h2>
              <div className="space-y-3">
                <div>
                  <Label>Bairro / Área *</Label>
                  <Select value={selectedArea?.id || ''} onValueChange={(value) => {
                    const area = deliveryAreas.find(a => a.id === value)
                    setSelectedArea(area || null)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua área" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryAreas.map(area => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name} - R$ {area.fee.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Endereço completo *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, complemento..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          {business?.payment_methods && business.payment_methods.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold mb-4">Forma de pagamento</h2>
              <div className="flex flex-wrap gap-2">
                {business.payment_methods.map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                      paymentMethod === method
                        ? 'text-white'
                        : 'border-gray-200'
                    }`}
                    style={{ 
                      backgroundColor: paymentMethod === method ? themeColor : undefined,
                      borderColor: paymentMethod === method ? themeColor : undefined 
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-4">Observações</h2>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Alguma observação sobre o pedido?"
              rows={2}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-4">Resumo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>R$ {getSubtotal().toFixed(2)}</span>
              </div>
              {orderType === 'delivery' && selectedArea && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de entrega</span>
                  <span>R$ {selectedArea.fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span style={{ color: themeColor }}>R$ {getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <Button
            className="w-full h-12 text-white text-lg"
            style={{ backgroundColor: themeColor }}
            onClick={submitOrder}
            disabled={submittingOrder}
          >
            {submittingOrder ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Enviar Pedido • R$ ${getTotal().toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Cart View
  if (currentView === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="flex items-center h-14 px-4">
            <button onClick={() => setCurrentView('menu')} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold ml-2">Seu Pedido</h1>
          </div>
        </header>

        <div className="p-4 pb-32">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Carrinho vazio</h2>
              <p className="text-gray-600 mb-4">Adicione itens para fazer seu pedido</p>
              <Button onClick={() => setCurrentView('menu')} style={{ backgroundColor: themeColor }} className="text-white">
                Ver Cardápio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const addKey = getAdditionalsKey(item.selectedAdditionals)
                const itemTotal = (item.product.price + item.selectedAdditionals.reduce((s, a) => s + a.price, 0)) * item.quantity
                
                return (
                  <div key={`${item.product.id}-${addKey}-${index}`} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex gap-3">
                      {item.product.image_url && (
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        {item.selectedAdditionals.length > 0 && (
                          <p className="text-xs text-gray-500">
                            + {item.selectedAdditionals.map(a => a.name).join(', ')}
                          </p>
                        )}
                        <p className="font-bold mt-1" style={{ color: themeColor }}>
                          R$ {itemTotal.toFixed(2)}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.product.id, addKey)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-end mt-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, addKey, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, addKey, item.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Subtotal */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between text-lg font-bold">
                  <span>Subtotal</span>
                  <span style={{ color: themeColor }}>R$ {getSubtotal().toFixed(2)}</span>
                </div>
                {business && business.min_order > 0 && getSubtotal() < business.min_order && (
                  <p className="text-sm text-red-500 mt-2">
                    Pedido mínimo: R$ {business.min_order.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Checkout Button */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <Button
              className="w-full h-12 text-white text-lg"
              style={{ backgroundColor: themeColor }}
              onClick={() => setCurrentView('checkout')}
            >
              Continuar <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Product Detail View
  if (currentView === 'product' && selectedProduct) {
    const productTotal = (selectedProduct.price + selectedAdditionals.reduce((s, a) => s + a.price, 0)) * productQuantity

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="flex items-center h-14 px-4">
            <button onClick={() => setCurrentView('menu')} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="pb-32">
          {/* Product Image */}
          {selectedProduct.image_url && (
            <div className="aspect-video">
              <img 
                src={selectedProduct.image_url} 
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4 space-y-6">
            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold">{selectedProduct.name}</h1>
              {selectedProduct.description && (
                <p className="text-gray-600 mt-2">{selectedProduct.description}</p>
              )}
              {selectedProduct.prep_time && (
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{selectedProduct.prep_time}</span>
                </div>
              )}
              <p className="text-2xl font-bold mt-4" style={{ color: themeColor }}>
                R$ {selectedProduct.price.toFixed(2)}
              </p>
            </div>

            {/* Additionals */}
            {additionals.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3">Adicionais</h2>
                <div className="space-y-2">
                  {additionals.map((add) => (
                    <div 
                      key={add.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedAdditionals.some(a => a.id === add.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAdditionals([...selectedAdditionals, add])
                            } else {
                              setSelectedAdditionals(selectedAdditionals.filter(a => a.id !== add.id))
                            }
                          }}
                        />
                        <span>{add.name}</span>
                      </div>
                      <span className="font-medium" style={{ color: themeColor }}>+R$ {add.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h2 className="font-semibold mb-3">Quantidade</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                  className="w-10 h-10 rounded-full border flex items-center justify-center"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-semibold w-8 text-center">{productQuantity}</span>
                <button
                  onClick={() => setProductQuantity(productQuantity + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <Button
            className="w-full h-12 text-white text-lg"
            style={{ backgroundColor: themeColor }}
            onClick={addToCart}
          >
            Adicionar • R$ {productTotal.toFixed(2)}
          </Button>
        </div>
      </div>
    )
  }

  // Menu View (Default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover & Header */}
      <div className="relative">
        <div 
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: business?.cover_url ? `url(${business.cover_url})` : undefined, backgroundColor: themeColor }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        {/* Business Info Card */}
        <div className="relative px-4 -mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-start gap-4">
              {business?.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt={business.business_name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
                />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}20` }}>
                  <Store className="w-8 h-8" style={{ color: themeColor }} />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg">{business?.business_name}</h1>
                  <Badge className={business?.is_open ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {business?.is_open ? 'Aberto' : 'Fechado'}
                  </Badge>
                </div>
                {business?.address && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {business.address}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  {business?.opening_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {business.opening_hours}
                    </span>
                  )}
                  {business?.delivery_time && (
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {business.delivery_time}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar no cardápio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-0 z-40 bg-white border-b mt-4">
        <div className="flex overflow-x-auto gap-2 p-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory ? 'text-white' : 'bg-gray-100'
            }`}
            style={{ backgroundColor: !selectedCategory ? themeColor : undefined }}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id ? 'text-white' : 'bg-gray-100'
              }`}
              style={{ backgroundColor: selectedCategory === cat.id ? themeColor : undefined }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="p-4 pb-24 space-y-6">
        {categories
          .filter(cat => !selectedCategory || cat.id === selectedCategory)
          .map((category) => {
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id)
            if (categoryProducts.length === 0) return null

            return (
              <div key={category.id}>
                <h2 className="font-bold text-lg mb-3">{category.name}</h2>
                <div className="space-y-3">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => openProduct(product)}
                      className="bg-white rounded-xl p-4 shadow-sm flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                        )}
                        <p className="font-bold mt-2" style={{ color: themeColor }}>
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white">
          <Button
            className="w-full h-14 text-white text-lg shadow-lg"
            style={{ backgroundColor: themeColor }}
            onClick={() => setCurrentView('cart')}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Ver Carrinho ({getTotalItems()}) • R$ {getSubtotal().toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  )
}
