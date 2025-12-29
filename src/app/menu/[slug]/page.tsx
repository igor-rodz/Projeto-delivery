'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPin, Phone, Clock, Search, ShoppingBag, 
  Plus, Minus, X, ChevronRight, ChevronLeft, Truck, Package,
  Loader2, CheckCircle, Star, Heart, Share2, Info,
  Timer, Bike, Store, CreditCard, Banknote, QrCode,
  MessageCircle, ChevronDown, Sparkles, UtensilsCrossed,
  Coffee, Pizza, Sandwich, IceCream, Salad, Flame,
  BadgePercent, Gift, Zap
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

// Category icons mapping
const categoryIcons: Record<string, any> = {
  'lanches': Sandwich,
  'hamburguer': Sandwich,
  'burger': Sandwich,
  'pizza': Pizza,
  'pizzas': Pizza,
  'bebidas': Coffee,
  'drinks': Coffee,
  'sobremesas': IceCream,
  'doces': IceCream,
  'saladas': Salad,
  'saudavel': Salad,
  'combos': Gift,
  'promocoes': BadgePercent,
  'destaque': Flame,
  'default': UtensilsCrossed
}

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (name.includes(key)) return icon
  }
  return categoryIcons.default
}

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
  const [favorites, setFavorites] = useState<string[]>([])
  
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
  
  const { items, addItem, updateQuantity, removeItem, clearCart, getSubtotal, getTotalItems } = useCart()

  useEffect(() => {
    if (slug) {
      fetchBusinessData()
    }
  }, [slug])

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

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p className="font-semibold">Adicionado ao carrinho!</p>
          <p className="text-sm text-gray-500">{selectedProduct.name}</p>
        </div>
      </div>,
      { duration: 2000 }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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
      toast.error(`Pedido mínimo: ${formatCurrency(business.min_order || 0)}`)
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

  // Theme colors - Foodora inspired
  const primaryColor = business?.theme_color || '#FF5A00'
  const primaryLight = '#FFF4EE'
  const primaryDark = '#3D2314'
  const accentGreen = '#00B37E'

  // Loading State with animation
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-200 animate-pulse">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Carregando cardápio...</p>
      </div>
    )
  }

  // Not Found State with illustration
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <div className="text-center bg-white rounded-[2rem] shadow-2xl p-10 max-w-sm">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-orange-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-orange-50 rounded-full flex items-center justify-center">
              <Store className="w-12 h-12 text-orange-300" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Restaurante não encontrado</h1>
          <p className="text-gray-500 mb-8">O link pode estar incorreto ou o restaurante não está mais disponível.</p>
          <Button 
            onClick={() => router.push('/')} 
            className="w-full h-14 rounded-2xl text-white font-semibold text-lg shadow-lg shadow-orange-200"
            style={{ backgroundColor: primaryColor }}
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  // Success View - Modern celebration
  if (currentView === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full animate-float"
              style={{
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                opacity: 0.6
              }}
            />
          ))}
        </div>

        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full text-center">
            {/* Success animation */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
            <p className="text-gray-500 mb-4">Seu pedido foi enviado com sucesso</p>
            
            {/* Order code */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl px-6 py-3 mb-6">
              <span className="text-sm text-gray-500">Código:</span>
              <span className="font-mono font-bold text-xl text-gray-900">#{orderId?.slice(-6).toUpperCase()}</span>
            </div>

            {/* Delivery info card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 text-left border border-amber-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Bike className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Acompanhe seu pedido</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {business?.delivery_time ? `Tempo estimado: ${business.delivery_time}` : 'Você será notificado sobre o status'}
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp button */}
            {business?.phone && (
              <a 
                href={`https://wa.me/55${business.phone.replace(/\D/g, '')}?text=Olá! Fiz o pedido ${orderId?.slice(-6).toUpperCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl p-4 mb-4 transition-all hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Conversar no WhatsApp</span>
              </a>
            )}

            {/* New order button */}
            <Button 
              className="w-full h-14 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 40px -10px ${primaryColor}50` }}
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

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
        `}</style>
      </div>
    )
  }

  // Checkout View - Premium design
  if (currentView === 'checkout') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white sticky top-0 z-50 shadow-sm">
          <div className="flex items-center h-16 px-4 max-w-lg mx-auto">
            <button 
              onClick={() => setCurrentView('cart')} 
              className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-4 text-gray-900">Finalizar Pedido</h1>
          </div>
        </header>

        <div className="max-w-lg mx-auto p-4 pb-36 space-y-4">
          {/* Delivery Type - Visual cards */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Como deseja receber?</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'delivery', label: 'Entrega', icon: Bike, desc: business?.delivery_time || '30-45 min', color: 'from-orange-500 to-red-500' },
                { value: 'takeaway', label: 'Retirar', icon: Package, desc: 'No balcão', color: 'from-blue-500 to-indigo-500' },
                { value: 'local', label: 'Comer aqui', icon: Store, desc: 'No local', color: 'from-green-500 to-emerald-500' },
              ].map((type) => {
                const isSelected = orderType === type.value
                return (
                  <button
                    key={type.value}
                    onClick={() => setOrderType(type.value as any)}
                    className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 scale-[1.02] shadow-lg'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      isSelected ? `bg-gradient-to-br ${type.color} shadow-lg` : 'bg-gray-100'
                    }`}>
                      <type.icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                    <span className="text-xs text-gray-500">{type.desc}</span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Delivery Address */}
          {orderType === 'delivery' && (
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                Endereço de Entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-600 text-sm font-medium">Região / Bairro *</Label>
                  <Select value={selectedArea?.id || ''} onValueChange={(value) => {
                    const area = deliveryAreas.find(a => a.id === value)
                    setSelectedArea(area || null)
                  }}>
                    <SelectTrigger className="h-14 rounded-2xl mt-2 border-gray-200 bg-gray-50 focus:bg-white transition-colors">
                      <SelectValue placeholder="Selecione seu bairro" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {deliveryAreas.map(area => (
                        <SelectItem key={area.id} value={area.id} className="rounded-xl">
                          <div className="flex items-center justify-between w-full py-1">
                            <span>{area.name}</span>
                            <span className="ml-4 font-bold text-green-600">
                              {area.fee === 0 ? 'Grátis' : formatCurrency(area.fee)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-gray-600 text-sm font-medium">Rua / Avenida *</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Rua das Flores"
                    className="h-14 rounded-2xl mt-2 border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-600 text-sm font-medium">Número *</Label>
                    <Input
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      placeholder="123"
                      className="h-14 rounded-2xl mt-2 border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-600 text-sm font-medium">Complemento</Label>
                    <Input
                      value={addressComplement}
                      onChange={(e) => setAddressComplement(e.target.value)}
                      placeholder="Apto, Bloco..."
                      className="h-14 rounded-2xl mt-2 border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </div>
              Seus Dados
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-600 text-sm font-medium">Nome completo *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="h-14 rounded-2xl mt-2 border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <Label className="text-gray-600 text-sm font-medium">WhatsApp *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="h-14 rounded-2xl mt-2 border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Payment Method - Visual cards */}
          {business?.payment_methods && business.payment_methods.length > 0 && (
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                Forma de Pagamento
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {business.payment_methods.map((method) => {
                  const isPix = method.toLowerCase().includes('pix')
                  const isDinheiro = method.toLowerCase().includes('dinheiro')
                  const Icon = isPix ? QrCode : isDinheiro ? Banknote : CreditCard
                  const isSelected = paymentMethod === method
                  
                  return (
                    <button
                      key={method}
                      onClick={() => {
                        setPaymentMethod(method)
                        if (!isDinheiro) {
                          setNeedChange(false)
                          setChangeFor('')
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-green-500' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                        {method}
                      </span>
                    </button>
                  )
                })}
              </div>

              {paymentMethod.toLowerCase().includes('dinheiro') && (
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={needChange}
                      onCheckedChange={(checked) => setNeedChange(checked as boolean)}
                      className="rounded-lg"
                    />
                    <span className="text-sm font-medium text-gray-700">Preciso de troco</span>
                  </label>
                  {needChange && (
                    <div className="mt-3">
                      <Input
                        type="number"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Troco para quanto?"
                        className="h-12 rounded-xl border-amber-200 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Observations */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Observações</h2>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ponto de referência, instruções de entrega..."
              className="rounded-2xl border-gray-200 bg-gray-50 focus:bg-white resize-none transition-colors"
              rows={3}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Resumo do Pedido</h2>
            
            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                  <span className="font-semibold">
                    {formatCurrency((item.product.price + item.selectedAdditionals.reduce((s, a) => s + a.price, 0)) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(getSubtotal())}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxa de entrega</span>
                  <span className={`font-medium ${selectedArea?.fee === 0 ? 'text-green-600' : ''}`}>
                    {selectedArea ? (selectedArea.fee === 0 ? 'Grátis' : formatCurrency(selectedArea.fee)) : '-'}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total</span>
                <span style={{ color: primaryColor }}>{formatCurrency(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t p-4 shadow-2xl">
          <div className="max-w-lg mx-auto">
            <Button
              className="w-full h-16 rounded-2xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 40px -10px ${primaryColor}80` }}
              onClick={submitOrder}
              disabled={submittingOrder}
            >
              {submittingOrder ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Enviando pedido...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Confirmar Pedido</span>
                  <span className="text-white/80">•</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Cart View - Modern design
  if (currentView === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white sticky top-0 z-50 shadow-sm">
          <div className="flex items-center h-16 px-4 max-w-lg mx-auto">
            <button 
              onClick={() => setCurrentView('menu')} 
              className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="ml-4">
              <h1 className="text-lg font-bold text-gray-900">Carrinho</h1>
              <p className="text-sm text-gray-500">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto p-4 pb-36">
          {items.length === 0 ? (
            <div className="text-center py-20">
              {/* Empty cart illustration */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div className="absolute inset-0 bg-orange-100 rounded-full opacity-50"></div>
                <div className="absolute inset-6 bg-orange-50 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-orange-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Carrinho vazio</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Explore nosso cardápio e adicione itens deliciosos!</p>
              <Button 
                onClick={() => setCurrentView('menu')} 
                className="h-14 rounded-2xl px-8 text-white font-semibold text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <UtensilsCrossed className="w-5 h-5 mr-2" />
                Ver Cardápio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Restaurant card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                {business?.logo_url ? (
                  <img src={business.logo_url} alt="" className="w-14 h-14 rounded-2xl object-cover shadow" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-100">
                    <Store className="w-7 h-7 text-orange-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{business?.business_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    {business?.delivery_time || '30-45 min'}
                  </p>
                </div>
              </div>

              {/* Cart items */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
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
                            className="w-24 h-24 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <UtensilsCrossed className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.product.name}</h3>
                            <button 
                              onClick={() => removeItem(item.product.id, addKey)}
                              className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {item.selectedAdditionals.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              + {item.selectedAdditionals.map(a => a.name).join(', ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold" style={{ color: accentGreen }}>
                              {formatCurrency(itemTotal)}
                            </span>
                            <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                              <button
                                onClick={() => updateQuantity(item.product.id, addKey, item.quantity - 1)}
                                className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-10 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, addKey, item.quantity + 1)}
                                className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95"
                                style={{ backgroundColor: primaryColor }}
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

              {/* Add more button */}
              <button
                onClick={() => setCurrentView('menu')}
                className="w-full p-4 bg-white rounded-2xl shadow-sm flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Adicionar mais itens</span>
              </button>

              {/* Subtotal card */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {formatCurrency(getSubtotal())}
                  </span>
                </div>
                {business && business.min_order > 0 && getSubtotal() < business.min_order && (
                  <div className="mt-4 p-3 bg-white rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Pedido mínimo: <span className="font-bold">{formatCurrency(business.min_order)}</span>
                      <br />
                      <span className="text-amber-600">Faltam {formatCurrency(business.min_order - getSubtotal())}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Continue button */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t p-4 shadow-2xl">
            <div className="max-w-lg mx-auto">
              <Button
                className="w-full h-16 rounded-2xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: primaryColor, boxShadow: `0 10px 40px -10px ${primaryColor}80` }}
                onClick={() => setCurrentView('checkout')}
                disabled={business && business.min_order > 0 && getSubtotal() < business.min_order}
              >
                Continuar
                <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Product Detail View - Foodora style
  if (currentView === 'product' && selectedProduct) {
    const productTotal = (selectedProduct.price + selectedAdditionals.reduce((s, a) => s + a.price, 0)) * productQuantity

    return (
      <div className="min-h-screen bg-white">
        {/* Header overlay */}
        <header className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('menu')} 
            className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => toggleFavorite(selectedProduct.id)}
            className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition-all active:scale-95"
          >
            <Heart className={`w-5 h-5 ${favorites.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </header>

        <div className="pb-36">
          {/* Product Image */}
          <div className="relative">
            {selectedProduct.image_url ? (
              <div className="aspect-square sm:aspect-[4/3]">
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square sm:aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <UtensilsCrossed className="w-32 h-32 text-orange-200" />
              </div>
            )}
            {/* Curve overlay */}
            <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-[2rem]" />
          </div>

          <div className="px-5 relative -mt-2 space-y-6">
            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h1>
                {selectedProduct.prep_time && (
                  <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                    <Timer className="w-4 h-4" />
                    {selectedProduct.prep_time}
                  </span>
                )}
              </div>
              {selectedProduct.description && (
                <p className="text-gray-500 mt-3 leading-relaxed">{selectedProduct.description}</p>
              )}
              
              {/* Price tag */}
              <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-green-200">
                <span className="text-2xl font-bold">{formatCurrency(selectedProduct.price)}</span>
              </div>
            </div>

            {/* Additionals */}
            {additionals.length > 0 && (
              <div className="bg-gray-50 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Adicionais</h2>
                    <p className="text-sm text-gray-500">Escolha quantos quiser</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-gray-500 shadow-sm">
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
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-transparent bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className={`font-medium ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                            {add.name}
                          </span>
                        </div>
                        <span className="font-bold text-green-600">
                          + {formatCurrency(add.price)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-3">Alguma observação?</h2>
              <Textarea
                value={productNotes}
                onChange={(e) => setProductNotes(e.target.value)}
                placeholder="Ex: Sem cebola, ponto da carne, retirar ingredientes..."
                className="rounded-2xl border-gray-200 bg-gray-50 focus:bg-white resize-none transition-colors"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t shadow-2xl p-4">
          <div className="max-w-lg mx-auto flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center bg-gray-100 rounded-2xl p-1.5">
              <button
                onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold w-12 text-center">{productQuantity}</span>
              <button
                onClick={() => setProductQuantity(productQuantity + 1)}
                className="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Add Button */}
            <Button
              className="flex-1 h-14 rounded-2xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 40px -10px ${primaryColor}80` }}
              onClick={addToCart}
            >
              Adicionar • {formatCurrency(productTotal)}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Menu View (Default) - Foodora inspired
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="relative h-52 sm:h-64">
          {business?.cover_url ? (
            <img 
              src={business.cover_url} 
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
            </button>
            <button className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Restaurant Info Card */}
        <div className="relative px-4 -mt-24">
          <div className="bg-white rounded-[2rem] shadow-xl p-6">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {business?.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt={business.business_name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl -mt-14"
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl -mt-14 bg-gradient-to-br from-orange-400 to-red-500"
                >
                  <Store className="w-10 h-10 text-white" />
                </div>
              )}
              
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between">
                  <h1 className="text-xl font-bold text-gray-900">{business?.business_name}</h1>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    business?.is_open 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {business?.is_open ? '● Aberto' : '● Fechado'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{business?.description || 'Delivery e Retirada'}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">4.8</span>
                  </div>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{business?.delivery_time}</span>
                </div>
              </div>
            </div>

            {/* Info Bar */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-2">
                  <Bike className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">{business?.delivery_time || '30-45 min'}</p>
                <p className="text-xs text-gray-500">Entrega</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <Banknote className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {business?.delivery_fee === 0 ? 'Grátis' : formatCurrency(business?.delivery_fee || 0)}
                </p>
                <p className="text-xs text-gray-500">Taxa</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(business?.min_order || 0)}</p>
                <p className="text-xs text-gray-500">Mínimo</p>
              </div>
            </div>

            {/* Expandable info */}
            <button 
              onClick={() => setShowBusinessInfo(!showBusinessInfo)}
              className="w-full mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-gray-500"
            >
              <span>{showBusinessInfo ? 'Menos informações' : 'Mais informações'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showBusinessInfo ? 'rotate-180' : ''}`} />
            </button>

            {showBusinessInfo && (
              <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                {business?.address && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{business.address}</p>
                  </div>
                )}
                {business?.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-600">{business.phone}</p>
                  </a>
                )}
                {business?.opening_hours && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-600">{business.opening_hours}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="px-4 mt-4 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar no cardápio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-12 pr-12 rounded-2xl border-gray-200 bg-white shadow-sm text-base"
              autoFocus
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories - Horizontal scroll with icons */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg shadow-sm mt-4">
        <div className="flex overflow-x-auto gap-3 p-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl min-w-[80px] transition-all ${
              !selectedCategory 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UtensilsCrossed className="w-6 h-6" />
            <span className="text-xs font-semibold whitespace-nowrap">Todos</span>
          </button>
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name)
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl min-w-[80px] transition-all ${
                  isSelected 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold whitespace-nowrap">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-32 space-y-8 mt-4">
        {searchTerm && filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum resultado</h3>
            <p className="text-gray-500">Não encontramos "{searchTerm}" no cardápio</p>
          </div>
        ) : (
          categories
            .filter(cat => !selectedCategory || cat.id === selectedCategory)
            .map((category) => {
              const categoryProducts = filteredProducts.filter(p => p.category_id === category.id)
              if (categoryProducts.length === 0) return null

              const Icon = getCategoryIcon(category.name)

              return (
                <div key={category.id} id={`category-${category.id}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                      <p className="text-sm text-gray-500">{categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'itens'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => openProduct(product)}
                        className="bg-white rounded-[1.5rem] p-4 shadow-sm flex gap-4 cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group"
                      >
                        <div className="flex-1 min-w-0 py-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">{product.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            {/* Price badge */}
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm shadow-green-200">
                              {formatCurrency(product.price)}
                            </span>
                            {product.prep_time && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
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
                              className="w-28 h-28 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                              <UtensilsCrossed className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                          {/* Add button */}
                          <button
                            className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                            style={{ backgroundColor: primaryColor, boxShadow: `0 4px 15px -3px ${primaryColor}80` }}
                            onClick={(e) => {
                              e.stopPropagation()
                              openProduct(product)
                            }}
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                          {/* Favorite button */}
                          <button
                            className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/90 backdrop-blur shadow flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(product.id)
                            }}
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
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

      {/* Floating Cart Button - Modern pill style */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pt-10">
          <button
            onClick={() => setCurrentView('cart')}
            className="w-full h-16 rounded-2xl text-white font-bold text-lg shadow-2xl flex items-center justify-between px-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 40px -10px ${primaryColor}80` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span>{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{formatCurrency(getSubtotal())}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
