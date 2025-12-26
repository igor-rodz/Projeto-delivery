'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPin, Phone, Clock, Search, ShoppingBag, 
  Plus, Minus, X, ChevronRight, ChevronLeft, Truck, Package,
  Loader2, CheckCircle, Star, Heart, Share2, Info,
  Timer, Bike, Store, CreditCard, Banknote, QrCode,
  MessageCircle, ChevronDown, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedAdditionals, setSelectedAdditionals] = useState<Additional[]>([])
  const [productQuantity, setProductQuantity] = useState(1)
  const [productNotes, setProductNotes] = useState('')
  const [showBusinessInfo, setShowBusinessInfo] = useState(false)
  
  // Checkout State
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderType, setOrderType] = useState<'local' | 'takeaway' | 'delivery'>('delivery')
  const [address, setAddress] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [addressComplement, setAddressComplement] = useState('')
  const [selectedArea, setSelectedArea] = useState<DeliveryArea | null>(null)
  const [observations, setObservations] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [needChange, setNeedChange] = useState(false)
  const [changeFor, setChangeFor] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  
  const categoriesRef = useRef<HTMLDivElement>(null)
  const { items, addItem, updateQuantity, removeItem, clearCart, getSubtotal, getTotalItems } = useCart()

  useEffect(() => {
    if (slug) {
      fetchBusinessData()
    }
  }, [slug])

  // Scroll to category when selected
  useEffect(() => {
    if (selectedCategory && categoriesRef.current) {
      const element = document.getElementById(`category-${selectedCategory}`)
      if (element) {
        const yOffset = -120
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }, [selectedCategory])

  const fetchBusinessData = async () => {
    try {
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
    setProductNotes('')
    setCurrentView('product')
  }

  const addToCart = () => {
    if (!selectedProduct || !business) return

    addItem({
      product: selectedProduct,
      quantity: productQuantity,
      selectedAdditionals: [...selectedAdditionals],
      notes: productNotes,
    }, business.id)

    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span>{selectedProduct.name} adicionado ao carrinho!</span>
      </div>
    )
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

    if (!customerName.trim()) {
      toast.error('Digite seu nome')
      return
    }
    if (!customerPhone || customerPhone.length < 14) {
      toast.error('Digite um telefone válido')
      return
    }

    if (orderType === 'delivery') {
      if (!address.trim()) {
        toast.error('Digite seu endereço')
        return
      }
      if (!selectedArea) {
        toast.error('Selecione sua região')
        return
      }
    }

    if (!paymentMethod) {
      toast.error('Selecione a forma de pagamento')
      return
    }

    const subtotal = getSubtotal()
    if (subtotal < (business.min_order || 0)) {
      toast.error(`Pedido mínimo: R$ ${business.min_order?.toFixed(2)}`)
      return
    }

    setSubmittingOrder(true)
    try {
      const fullAddress = orderType === 'delivery' 
        ? `${address}${addressNumber ? ', ' + addressNumber : ''}${addressComplement ? ' - ' + addressComplement : ''}`
        : null

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: business.id,
          customer_name: customerName.trim(),
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          order_type: orderType,
          address: fullAddress,
          delivery_area: selectedArea?.name || null,
          delivery_fee: orderType === 'delivery' ? (selectedArea?.fee || 0) : 0,
          subtotal,
          total: getTotal(),
          observations: observations || null,
          payment_method: paymentMethod + (needChange && changeFor ? ` (Troco para R$ ${changeFor})` : ''),
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

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

  const themeColor = business?.theme_color || '#ea1d2c'
  const themeColorLight = `${themeColor}15`
  const themeColorMedium = `${themeColor}30`

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-current rounded-full animate-spin absolute top-0 left-0" style={{ color: themeColor }}></div>
        </div>
        <p className="mt-4 text-gray-500 animate-pulse">Carregando cardápio...</p>
      </div>
    )
  }

  // Not Found State
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Não encontrado</h1>
          <p className="text-gray-500 mb-6">Este restaurante não existe ou o link está incorreto.</p>
          <Button 
            onClick={() => router.push('/')} 
            className="rounded-full px-8"
            style={{ backgroundColor: themeColor }}
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  // Success View - Pedido Confirmado
  if (currentView === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-8 right-8 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute top-16 left-12 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              <div className="absolute top-6 right-16 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
            </div>
            
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
              <p className="text-gray-500 mb-2">Seu pedido foi recebido com sucesso</p>
              
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
                <span className="text-sm text-gray-500">Código:</span>
                <span className="font-bold text-gray-900">#{orderId?.slice(-6).toUpperCase()}</span>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 text-left border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Timer className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Acompanhe seu pedido</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {business?.delivery_time ? `Tempo estimado: ${business.delivery_time}` : 'Em breve você receberá atualizações'}
                    </p>
                  </div>
                </div>
              </div>

              {business?.phone && (
                <a 
                  href={`https://wa.me/55${business.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl p-4 mb-4 transition-all hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Conversar no WhatsApp</span>
                </a>
              )}

              <Button 
                className="w-full h-14 rounded-2xl text-white font-semibold text-lg"
                style={{ backgroundColor: themeColor }}
                onClick={() => {
                  setCurrentView('menu')
                  setOrderId(null)
                  setCustomerName('')
                  setCustomerPhone('')
                  setAddress('')
                  setObservations('')
                  setPaymentMethod('')
                }}
              >
                Fazer Novo Pedido
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Checkout View
  if (currentView === 'checkout') {
    const getPaymentIcon = (method: string) => {
      if (method.toLowerCase().includes('pix')) return QrCode
      if (method.toLowerCase().includes('dinheiro')) return Banknote
      return CreditCard
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="flex items-center h-16 px-4 max-w-lg mx-auto">
            <button 
              onClick={() => setCurrentView('cart')} 
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-4">Finalizar Pedido</h1>
          </div>
        </header>

        <div className="max-w-lg mx-auto p-4 pb-36 space-y-4">
          {/* Delivery Type Selection */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Como deseja receber?</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'delivery', label: 'Entrega', icon: Bike, desc: business?.delivery_time || '30-45 min' },
                { value: 'takeaway', label: 'Retirar', icon: Package, desc: 'No balcão' },
                { value: 'local', label: 'Comer aqui', icon: Store, desc: 'No local' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setOrderType(type.value as any)}
                  className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    orderType === type.value
                      ? 'border-current shadow-lg scale-[1.02]'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                  style={{ 
                    borderColor: orderType === type.value ? themeColor : undefined,
                    backgroundColor: orderType === type.value ? themeColorLight : undefined 
                  }}
                >
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      orderType === type.value ? 'bg-white shadow' : 'bg-white'
                    }`}
                  >
                    <type.icon 
                      className="w-6 h-6" 
                      style={{ color: orderType === type.value ? themeColor : '#6b7280' }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${orderType === type.value ? '' : 'text-gray-700'}`}
                    style={{ color: orderType === type.value ? themeColor : undefined }}
                  >
                    {type.label}
                  </span>
                  <span className="text-xs text-gray-500">{type.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {orderType === 'delivery' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: themeColor }} />
                Endereço de Entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-600 text-sm">Região *</Label>
                  <Select value={selectedArea?.id || ''} onValueChange={(value) => {
                    const area = deliveryAreas.find(a => a.id === value)
                    setSelectedArea(area || null)
                  }}>
                    <SelectTrigger className="h-12 rounded-xl mt-1 border-gray-200">
                      <SelectValue placeholder="Selecione seu bairro" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryAreas.map(area => (
                        <SelectItem key={area.id} value={area.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{area.name}</span>
                            <span className="text-green-600 font-medium ml-4">
                              {area.fee === 0 ? 'Grátis' : `R$ ${area.fee.toFixed(2)}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-gray-600 text-sm">Rua / Avenida *</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Rua das Flores"
                    className="h-12 rounded-xl mt-1 border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-600 text-sm">Número *</Label>
                    <Input
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      placeholder="123"
                      className="h-12 rounded-xl mt-1 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-600 text-sm">Complemento</Label>
                    <Input
                      value={addressComplement}
                      onChange={(e) => setAddressComplement(e.target.value)}
                      placeholder="Apto, Bloco..."
                      className="h-12 rounded-xl mt-1 border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" style={{ color: themeColor }} />
              Seus Dados
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-600 text-sm">Nome *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="h-12 rounded-xl mt-1 border-gray-200"
                />
              </div>
              <div>
                <Label className="text-gray-600 text-sm">WhatsApp *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="h-12 rounded-xl mt-1 border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {business?.payment_methods && business.payment_methods.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" style={{ color: themeColor }} />
                Forma de Pagamento
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {business.payment_methods.map((method) => {
                  const Icon = getPaymentIcon(method)
                  const isSelected = paymentMethod === method
                  return (
                    <button
                      key={method}
                      onClick={() => {
                        setPaymentMethod(method)
                        if (!method.toLowerCase().includes('dinheiro')) {
                          setNeedChange(false)
                          setChangeFor('')
                        }
                      }}
                      className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        isSelected 
                          ? 'border-current shadow-md' 
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                      style={{ 
                        borderColor: isSelected ? themeColor : undefined,
                        backgroundColor: isSelected ? themeColorLight : undefined
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: isSelected ? themeColor : '#6b7280' }} />
                      <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-700'}`}
                        style={{ color: isSelected ? themeColor : undefined }}
                      >
                        {method}
                      </span>
                    </button>
                  )
                })}
              </div>

              {paymentMethod.toLowerCase().includes('dinheiro') && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={needChange}
                      onCheckedChange={(checked) => setNeedChange(checked as boolean)}
                    />
                    <span className="text-sm text-gray-700">Preciso de troco</span>
                  </label>
                  {needChange && (
                    <div className="mt-3">
                      <Input
                        type="number"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Troco para quanto?"
                        className="h-12 rounded-xl border-amber-200"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Observations */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Observações</h2>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Algum ponto de referência ou instrução especial?"
              className="rounded-xl border-gray-200 resize-none"
              rows={3}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                  <span className="font-medium">
                    R$ {((item.product.price + item.selectedAdditionals.reduce((s, a) => s + a.price, 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>R$ {getSubtotal().toFixed(2)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxa de entrega</span>
                  <span className={selectedArea?.fee === 0 ? 'text-green-600 font-medium' : ''}>
                    {selectedArea ? (selectedArea.fee === 0 ? 'Grátis' : `R$ ${selectedArea.fee.toFixed(2)}`) : '-'}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total</span>
                <span style={{ color: themeColor }}>R$ {getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4">
          <div className="max-w-lg mx-auto">
            <Button
              className="w-full h-14 rounded-2xl text-white font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: themeColor }}
              onClick={submitOrder}
              disabled={submittingOrder}
            >
              {submittingOrder ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando pedido...</span>
                </div>
              ) : (
                <span>Confirmar Pedido • R$ {getTotal().toFixed(2)}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Cart View
  if (currentView === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="flex items-center h-16 px-4 max-w-lg mx-auto">
            <button 
              onClick={() => setCurrentView('menu')} 
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="ml-4">
              <h1 className="text-lg font-bold">Seu Carrinho</h1>
              <p className="text-sm text-gray-500">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto p-4 pb-36">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Carrinho vazio</h2>
              <p className="text-gray-500 mb-6">Adicione itens deliciosos ao seu pedido!</p>
              <Button 
                onClick={() => setCurrentView('menu')} 
                className="rounded-full px-8 text-white"
                style={{ backgroundColor: themeColor }}
              >
                Ver Cardápio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Restaurant Info */}
              <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                {business?.logo_url ? (
                  <img src={business.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: themeColorLight }}>
                    <Store className="w-6 h-6" style={{ color: themeColor }} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{business?.business_name}</h3>
                  <p className="text-sm text-gray-500">{business?.delivery_time}</p>
                </div>
              </div>

              {/* Cart Items */}
              <div className="bg-white rounded-2xl shadow-sm divide-y">
                {items.map((item, index) => {
                  const addKey = getAdditionalsKey(item.selectedAdditionals)
                  const itemTotal = (item.product.price + item.selectedAdditionals.reduce((s, a) => s + a.price, 0)) * item.quantity
                  
                  return (
                    <div key={`${item.product.id}-${addKey}-${index}`} className="p-4">
                      <div className="flex gap-4">
                        {item.product.image_url ? (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                            <button 
                              onClick={() => removeItem(item.product.id, addKey)}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {item.selectedAdditionals.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              + {item.selectedAdditionals.map(a => a.name).join(', ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold" style={{ color: themeColor }}>
                              R$ {itemTotal.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                              <button
                                onClick={() => updateQuantity(item.product.id, addKey, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, addKey, item.quantity + 1)}
                                className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: themeColor }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add More Items */}
              <button
                onClick={() => setCurrentView('menu')}
                className="w-full p-4 bg-white rounded-2xl shadow-sm flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Adicionar mais itens</span>
              </button>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-xl font-bold" style={{ color: themeColor }}>
                    R$ {getSubtotal().toFixed(2)}
                  </span>
                </div>
                {business && business.min_order > 0 && getSubtotal() < business.min_order && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                      Pedido mínimo: R$ {business.min_order.toFixed(2)}. Faltam R$ {(business.min_order - getSubtotal()).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4">
            <div className="max-w-lg mx-auto">
              <Button
                className="w-full h-14 rounded-2xl text-white font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: themeColor }}
                onClick={() => setCurrentView('checkout')}
                disabled={business && business.min_order > 0 && getSubtotal() < business.min_order}
              >
                Continuar
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Product Detail View
  if (currentView === 'product' && selectedProduct) {
    const productTotal = (selectedProduct.price + selectedAdditionals.reduce((s, a) => s + a.price, 0)) * productQuantity

    return (
      <div className="min-h-screen bg-white">
        {/* Header with Back Button */}
        <header className="fixed top-0 left-0 right-0 z-50 p-4">
          <button 
            onClick={() => setCurrentView('menu')} 
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </header>

        <div className="pb-32">
          {/* Product Image */}
          <div className="relative">
            {selectedProduct.image_url ? (
              <div className="aspect-square sm:aspect-video max-h-80">
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square sm:aspect-video max-h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="px-5 -mt-8 relative space-y-6">
            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h1>
              {selectedProduct.description && (
                <p className="text-gray-500 mt-2 leading-relaxed">{selectedProduct.description}</p>
              )}
              
              <div className="flex items-center gap-4 mt-4">
                <span className="text-3xl font-bold" style={{ color: themeColor }}>
                  R$ {selectedProduct.price.toFixed(2)}
                </span>
                {selectedProduct.prep_time && (
                  <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    {selectedProduct.prep_time}
                  </span>
                )}
              </div>
            </div>

            {/* Additionals */}
            {additionals.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-gray-900">Adicionais</h2>
                    <p className="text-sm text-gray-500">Escolha até {additionals.length} opções</p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                    Opcional
                  </span>
                </div>
                <div className="space-y-2">
                  {additionals.map((add) => {
                    const isSelected = selectedAdditionals.some(a => a.id === add.id)
                    return (
                      <button
                        key={add.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAdditionals(selectedAdditionals.filter(a => a.id !== add.id))
                          } else {
                            setSelectedAdditionals([...selectedAdditionals, add])
                          }
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          isSelected 
                            ? 'border-current shadow-md' 
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                        style={{ 
                          borderColor: isSelected ? themeColor : undefined,
                          backgroundColor: isSelected ? themeColorLight : undefined
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-current bg-current' : 'border-gray-300'
                          }`}
                            style={{ borderColor: isSelected ? themeColor : undefined, backgroundColor: isSelected ? themeColor : undefined }}
                          >
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className={`font-medium ${isSelected ? '' : 'text-gray-700'}`}
                            style={{ color: isSelected ? themeColor : undefined }}
                          >
                            {add.name}
                          </span>
                        </div>
                        <span className="font-semibold" style={{ color: themeColor }}>
                          + R$ {add.price.toFixed(2)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <h2 className="font-bold text-gray-900 mb-3">Alguma observação?</h2>
              <Textarea
                value={productNotes}
                onChange={(e) => setProductNotes(e.target.value)}
                placeholder="Ex: Sem cebola, mal passado, etc."
                className="rounded-2xl border-gray-200 resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4">
          <div className="max-w-lg mx-auto flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-2">
              <button
                onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold w-10 text-center">{productQuantity}</span>
              <button
                onClick={() => setProductQuantity(productQuantity + 1)}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Add Button */}
            <Button
              className="flex-1 h-14 rounded-2xl text-white font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: themeColor }}
              onClick={addToCart}
            >
              Adicionar • R$ {productTotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Menu View (Default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image & Header */}
      <div className="relative">
        {/* Cover */}
        <div className="relative h-48 sm:h-56">
          {business?.cover_url ? (
            <img 
              src={business.cover_url} 
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: themeColor }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Business Info Card */}
        <div className="relative px-4 -mt-20">
          <div className="bg-white rounded-3xl shadow-xl p-5">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {business?.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt={business.business_name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg -mt-12"
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg -mt-12"
                  style={{ backgroundColor: themeColorLight }}
                >
                  <Store className="w-10 h-10" style={{ color: themeColor }} />
                </div>
              )}
              
              <div className="flex-1 pt-1">
                <h1 className="text-xl font-bold text-gray-900">{business?.business_name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{business?.description || 'Delivery e Retirada'}</p>
                
                {/* Rating & Info */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-semibold">4.8</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    business?.is_open 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {business?.is_open ? '● Aberto' : '● Fechado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info Bar */}
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5" style={{ color: themeColor }} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{business?.delivery_time || '30-45 min'}</p>
                  <p className="text-xs text-gray-500">Entrega</p>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5" style={{ color: themeColor }} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {business?.delivery_fee === 0 ? 'Grátis' : `R$ ${business?.delivery_fee?.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-gray-500">Taxa</p>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" style={{ color: themeColor }} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">R$ {business?.min_order?.toFixed(0) || '0'}</p>
                  <p className="text-xs text-gray-500">Mínimo</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBusinessInfo(!showBusinessInfo)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${showBusinessInfo ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Extended Info */}
            {showBusinessInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                {business?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{business.address}</p>
                  </div>
                )}
                {business?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${business.phone}`} className="text-sm text-gray-600 hover:underline">
                      {business.phone}
                    </a>
                  </div>
                )}
                {business?.opening_hours && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-600">{business.opening_hours}</p>
                  </div>
                )}
                {business?.payment_methods && business.payment_methods.length > 0 && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{business.payment_methods.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar (Collapsible) */}
      {searchOpen && (
        <div className="px-4 mt-4 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar no cardápio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 pr-12 rounded-2xl border-gray-200 bg-white shadow-sm"
              autoFocus
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories Navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-sm mt-4" ref={categoriesRef}>
        <div className="flex overflow-x-auto gap-2 p-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              !selectedCategory 
                ? 'text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{ backgroundColor: !selectedCategory ? themeColor : undefined }}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id 
                  ? 'text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ backgroundColor: selectedCategory === cat.id ? themeColor : undefined }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 pb-28 space-y-8 mt-4">
        {searchTerm && filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum resultado</h3>
            <p className="text-gray-500">Não encontramos "{searchTerm}" no cardápio</p>
          </div>
        ) : (
          categories
            .filter(cat => !selectedCategory || cat.id === selectedCategory)
            .map((category) => {
              const categoryProducts = filteredProducts.filter(p => p.category_id === category.id)
              if (categoryProducts.length === 0) return null

              return (
                <div key={category.id} id={`category-${category.id}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium px-3 py-1 rounded-full" 
                      style={{ backgroundColor: themeColorLight, color: themeColor }}
                    >
                      {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => openProduct(product)}
                        className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-lg font-bold" style={{ color: themeColor }}>
                              R$ {product.price.toFixed(2)}
                            </span>
                            {product.prep_time && (
                              <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                <Timer className="w-3 h-3" />
                                {product.prep_time}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="relative flex-shrink-0">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-28 h-28 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-28 h-28 rounded-xl bg-gray-100 flex items-center justify-center">
                              <Package className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                          <button
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                            style={{ backgroundColor: themeColor }}
                            onClick={(e) => {
                              e.stopPropagation()
                              openProduct(product)
                            }}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
        )}
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pt-8">
          <button
            onClick={() => setCurrentView('cart')}
            className="w-full h-16 rounded-2xl text-white font-bold text-lg shadow-xl flex items-center justify-between px-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: themeColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span>{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>R$ {getSubtotal().toFixed(2)}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
