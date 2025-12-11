"use client"

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Clock, CheckCircle, Truck, Store, Package, Settings, BarChart3, Users, DollarSign, Edit, Trash2, X, Menu as MenuIcon, Star, ArrowLeft, Search, MapPin, Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

// Types
interface Additional {
  id: string
  name: string
  price: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  rating?: number
  prepTime?: string
  additionals?: Additional[]
}

interface CartItem extends Product {
  quantity: number
  selectedAdditionals: Additional[]
}

interface Order {
  id: string
  customerName: string
  customerPhone: string
  items: CartItem[]
  total: number
  type: 'local' | 'takeaway' | 'delivery'
  address?: string
  observations?: string
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
  createdAt: Date
  deliveryArea?: string
  deliveryFee?: number
}

interface DeliveryArea {
  id: string
  name: string
  fee: number
}

interface RestaurantSettings {
  name: string
  logo: string
  coverImage: string
  address: string
  phone: string
  minOrder: number
  isOpen: boolean
  openingHours: string
  deliveryAreas: DeliveryArea[]
}

// Mock data
const initialAdditionals: Additional[] = [
  { id: '1', name: 'Bacon Extra', price: 4.00 },
  { id: '2', name: 'Queijo Cheddar', price: 3.50 },
  { id: '3', name: 'Ovo Frito', price: 2.50 },
  { id: '4', name: 'Cebola Caramelizada', price: 2.00 },
  { id: '5', name: 'Molho Especial', price: 1.50 },
  { id: '6', name: 'Alface Extra', price: 1.00 },
  { id: '7', name: 'Tomate Extra', price: 1.00 },
  { id: '8', name: 'Picles', price: 1.50 },
]

const initialDeliveryAreas: DeliveryArea[] = [
  { id: '1', name: 'Centro', fee: 3.00 },
  { id: '2', name: 'Vila Nova', fee: 4.50 },
  { id: '3', name: 'Jardim América', fee: 5.00 },
  { id: '4', name: 'Bela Vista', fee: 6.00 },
  { id: '5', name: 'Santa Rosa', fee: 7.50 },
]

const initialRestaurantSettings: RestaurantSettings = {
  name: 'Pit Stop Burguer',
  logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop&crop=center',
  coverImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop',
  address: 'Rua das Delícias, 123 - Centro',
  phone: '(11) 99999-9999',
  minOrder: 25.00,
  isOpen: true,
  openingHours: '18:00 - 23:00',
  deliveryAreas: initialDeliveryAreas
}

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Pit Stop Classic',
    description: 'Hambúrguer artesanal 180g, queijo cheddar, alface, tomate, cebola roxa e molho especial',
    price: 28.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    category: 'Lanches',
    rating: 4.8,
    prepTime: '15-20 min',
    additionals: initialAdditionals.slice(0, 6)
  },
  {
    id: '2',
    name: 'Bacon Explosion',
    description: 'Duplo hambúrguer 160g cada, bacon crocante, queijo cheddar duplo, cebola caramelizada',
    price: 35.90,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=300&fit=crop',
    category: 'Lanches',
    rating: 4.9,
    prepTime: '20-25 min',
    additionals: initialAdditionals.slice(0, 8)
  },
  {
    id: '3',
    name: 'Chicken Crispy',
    description: 'Frango empanado crocante, queijo suíço, alface americana, tomate e maionese temperada',
    price: 26.90,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e9a13086?w=400&h=300&fit=crop',
    category: 'Lanches',
    rating: 4.7,
    prepTime: '15-18 min',
    additionals: initialAdditionals.slice(0, 5)
  },
  {
    id: '4',
    name: 'Veggie Deluxe',
    description: 'Hambúrguer de grão-de-bico, queijo vegano, rúcula, tomate seco e molho pesto',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400&h=300&fit=crop',
    category: 'Lanches',
    rating: 4.6,
    prepTime: '12-15 min',
    additionals: initialAdditionals.slice(2, 7)
  },
  {
    id: '5',
    name: 'Coca-Cola 350ml',
    description: 'Refrigerante gelado',
    price: 5.90,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
    category: 'Bebidas',
    rating: 4.5,
    prepTime: '2 min',
    additionals: []
  },
  {
    id: '6',
    name: 'Suco Natural Laranja',
    description: 'Suco de laranja natural 400ml',
    price: 8.90,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
    category: 'Bebidas',
    rating: 4.4,
    prepTime: '3-5 min',
    additionals: []
  },
  {
    id: '7',
    name: 'Batata Frita Grande',
    description: 'Porção generosa de batatas fritas crocantes',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    category: 'Acompanhamentos',
    rating: 4.7,
    prepTime: '8-10 min',
    additionals: initialAdditionals.slice(4, 6)
  },
  {
    id: '8',
    name: 'Onion Rings',
    description: '8 unidades de anéis de cebola empanados',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop',
    category: 'Acompanhamentos',
    rating: 4.6,
    prepTime: '10-12 min',
    additionals: initialAdditionals.slice(4, 6)
  },
  {
    id: '9',
    name: 'Brownie com Sorvete',
    description: 'Brownie de chocolate quente com bola de sorvete de baunilha',
    price: 16.90,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    category: 'Sobremesas',
    rating: 4.8,
    prepTime: '5-8 min',
    additionals: []
  },
  {
    id: '10',
    name: 'Combo Pit Stop',
    description: 'Pit Stop Classic + Batata Frita + Refrigerante',
    price: 42.90,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    category: 'Combos',
    rating: 4.9,
    prepTime: '18-22 min',
    additionals: initialAdditionals.slice(0, 4)
  }
]

const categories = ['Todos', 'Lanches', 'Bebidas', 'Acompanhamentos', 'Sobremesas', 'Combos']

export default function PitStopBurguer() {
  const [currentView, setCurrentView] = useState<'menu' | 'cart' | 'checkout' | 'tracking' | 'admin' | 'product-detail'>('menu')
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [additionals, setAdditionals] = useState<Additional[]>(initialAdditionals)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedAdditionals, setSelectedAdditionals] = useState<Additional[]>([])
  const [productQuantity, setProductQuantity] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<DeliveryArea | null>(null)
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(initialRestaurantSettings)

  // Customer form data
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [orderType, setOrderType] = useState<'local' | 'takeaway' | 'delivery'>('local')
  const [address, setAddress] = useState('')
  const [observations, setObservations] = useState('')

  // Admin form data
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'Lanches',
    rating: 4.5,
    prepTime: '15 min'
  })
  const [newAdditional, setNewAdditional] = useState({
    name: '',
    price: 0
  })
  const [newDeliveryArea, setNewDeliveryArea] = useState({
    name: '',
    fee: 0
  })

  // Editing states for inline editing
  const [editingAdditional, setEditingAdditional] = useState<string | null>(null)
  const [editingDeliveryArea, setEditingDeliveryArea] = useState<string | null>(null)
  const [editingAdditionalData, setEditingAdditionalData] = useState<Additional | null>(null)
  const [editingDeliveryAreaData, setEditingDeliveryAreaData] = useState<DeliveryArea | null>(null)

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product)
    setSelectedAdditionals([])
    setProductQuantity(1)
    setCurrentView('product-detail')
  }

  const addToCartWithAdditionals = () => {
    if (!selectedProduct) return

    const cartItem: CartItem = {
      ...selectedProduct,
      quantity: productQuantity,
      selectedAdditionals: [...selectedAdditionals]
    }

    const existingItemIndex = cart.findIndex(item => 
      item.id === selectedProduct.id && 
      JSON.stringify(item.selectedAdditionals) === JSON.stringify(selectedAdditionals)
    )

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += productQuantity
      setCart(updatedCart)
    } else {
      setCart([...cart, cartItem])
    }

    toast.success(`${selectedProduct.name} adicionado ao pedido!`)
    setCurrentView('menu')
  }

  const addToCart = (product: Product) => {
    if (product.additionals && product.additionals.length > 0) {
      openProductDetail(product)
    } else {
      const existingItem = cart.find(item => item.id === product.id)
      if (existingItem) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        setCart([...cart, { ...product, quantity: 1, selectedAdditionals: [] }])
      }
      toast.success(`${product.name} adicionado ao pedido!`)
    }
  }

  const updateQuantity = (id: string, quantity: number, additionals: Additional[]) => {
    if (quantity === 0) {
      setCart(cart.filter(item => !(item.id === id && JSON.stringify(item.selectedAdditionals) === JSON.stringify(additionals))))
    } else {
      setCart(cart.map(item => 
        item.id === id && JSON.stringify(item.selectedAdditionals) === JSON.stringify(additionals)
          ? { ...item, quantity } 
          : item
      ))
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.price + item.selectedAdditionals.reduce((sum, add) => sum + add.price, 0)
      return total + (itemPrice * item.quantity)
    }, 0)
  }

  const getFinalTotal = () => {
    const subtotal = getCartTotal()
    const deliveryFee = orderType === 'delivery' && selectedDeliveryArea ? selectedDeliveryArea.fee : 0
    return subtotal + deliveryFee
  }

  const submitOrder = () => {
    if (!customerName || !customerPhone || cart.length === 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (orderType === 'delivery' && (!address || !selectedDeliveryArea)) {
      toast.error('Endereço e área de entrega são obrigatórios para delivery')
      return
    }

    const cartTotal = getCartTotal()
    if (cartTotal < restaurantSettings.minOrder) {
      toast.error(`Pedido mínimo: R$ ${restaurantSettings.minOrder.toFixed(2)}`)
      return
    }

    const order: Order = {
      id: Date.now().toString(),
      customerName,
      customerPhone,
      items: [...cart],
      total: getFinalTotal(),
      type: orderType,
      address: orderType === 'delivery' ? address : undefined,
      observations,
      status: 'pending',
      createdAt: new Date(),
      deliveryArea: selectedDeliveryArea?.name,
      deliveryFee: selectedDeliveryArea?.fee
    }

    setOrders([...orders, order])
    setCurrentOrder(order)
    setCart([])
    setCurrentView('tracking')
    toast.success('Pedido enviado com sucesso!')
    
    // Reset form
    setCustomerName('')
    setCustomerPhone('')
    setAddress('')
    setObservations('')
    setSelectedDeliveryArea(null)
  }

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ))
    if (currentOrder?.id === orderId) {
      setCurrentOrder({ ...currentOrder, status })
    }
    toast.success('Status do pedido atualizado!')
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
    toast.success('Produto removido!')
  }

  const saveProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p))
      setEditingProduct(null)
      toast.success('Produto atualizado!')
    } else {
      const product: Product = {
        ...newProduct,
        id: Date.now().toString(),
        additionals: []
      }
      setProducts([...products, product])
      setNewProduct({ name: '', description: '', price: 0, image: '', category: 'Lanches', rating: 4.5, prepTime: '15 min' })
      toast.success('Produto adicionado!')
    }
  }

  const saveAdditional = () => {
    const additional: Additional = {
      ...newAdditional,
      id: Date.now().toString()
    }
    setAdditionals([...additionals, additional])
    setNewAdditional({ name: '', price: 0 })
    toast.success('Adicional criado!')
  }

  const deleteAdditional = (id: string) => {
    setAdditionals(additionals.filter(a => a.id !== id))
    toast.success('Adicional removido!')
  }

  const saveDeliveryArea = () => {
    const area: DeliveryArea = {
      ...newDeliveryArea,
      id: Date.now().toString()
    }
    const updatedAreas = [...restaurantSettings.deliveryAreas, area]
    setRestaurantSettings({
      ...restaurantSettings,
      deliveryAreas: updatedAreas
    })
    setNewDeliveryArea({ name: '', fee: 0 })
    toast.success('Área de entrega adicionada!')
  }

  const deleteDeliveryArea = (id: string) => {
    const updatedAreas = restaurantSettings.deliveryAreas.filter(a => a.id !== id)
    setRestaurantSettings({
      ...restaurantSettings,
      deliveryAreas: updatedAreas
    })
    toast.success('Área de entrega removida!')
  }

  const updateRestaurantSettings = (updates: Partial<RestaurantSettings>) => {
    setRestaurantSettings({
      ...restaurantSettings,
      ...updates
    })
    toast.success('Configurações atualizadas!')
  }

  // Inline editing functions for additionals
  const startEditingAdditional = (additional: Additional) => {
    setEditingAdditional(additional.id)
    setEditingAdditionalData({ ...additional })
  }

  const saveEditingAdditional = () => {
    if (editingAdditionalData) {
      setAdditionals(additionals.map(a => 
        a.id === editingAdditionalData.id ? editingAdditionalData : a
      ))
      setEditingAdditional(null)
      setEditingAdditionalData(null)
      toast.success('Adicional atualizado!')
    }
  }

  const cancelEditingAdditional = () => {
    setEditingAdditional(null)
    setEditingAdditionalData(null)
  }

  // Inline editing functions for delivery areas
  const startEditingDeliveryArea = (area: DeliveryArea) => {
    setEditingDeliveryArea(area.id)
    setEditingDeliveryAreaData({ ...area })
  }

  const saveEditingDeliveryArea = () => {
    if (editingDeliveryAreaData) {
      const updatedAreas = restaurantSettings.deliveryAreas.map(a => 
        a.id === editingDeliveryAreaData.id ? editingDeliveryAreaData : a
      )
      setRestaurantSettings({
        ...restaurantSettings,
        deliveryAreas: updatedAreas
      })
      setEditingDeliveryArea(null)
      setEditingDeliveryAreaData(null)
      toast.success('Área de entrega atualizada!')
    }
  }

  const cancelEditingDeliveryArea = () => {
    setEditingDeliveryArea(null)
    setEditingDeliveryAreaData(null)
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-500 text-white'
      case 'preparing': return 'bg-orange-600 text-white'
      case 'ready': return 'bg-orange-700 text-white'
      case 'delivered': return 'bg-green-600 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Aguardando'
      case 'preparing': return 'Em Preparo'
      case 'ready': return 'Pronto'
      case 'delivered': return 'Entregue'
      default: return 'Desconhecido'
    }
  }

  const getOrderTypeIcon = (type: Order['type']) => {
    switch (type) {
      case 'local': return <Store className="w-4 h-4" />
      case 'takeaway': return <Package className="w-4 h-4" />
      case 'delivery': return <Truck className="w-4 h-4" />
    }
  }

  const getOrderTypeText = (type: Order['type']) => {
    switch (type) {
      case 'local': return 'Comer no Local'
      case 'takeaway': return 'Retirar no Balcão'
      case 'delivery': return 'Delivery'
    }
  }

  // Header Component
  const Header = () => (
    <header className="bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">🏁 {restaurantSettings.name}</div>
            <div className="hidden md:block text-sm opacity-90">Os melhores pratos da cidade</div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {!isAdmin && (
              <>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setCurrentView('menu')}
                >
                  Cardápio
                </Button>
                {cart.length > 0 && (
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/20 relative"
                    onClick={() => setCurrentView('cart')}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Carrinho
                    <Badge className="absolute -top-2 -right-2 bg-white text-orange-600">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  </Button>
                )}
              </>
            )}
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => {
                setIsAdmin(!isAdmin)
                setCurrentView(isAdmin ? 'menu' : 'admin')
              }}
            >
              {isAdmin ? 'Sair Admin' : 'Admin'}
            </Button>
          </div>

          <Button
            variant="ghost"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="w-6 h-6" />
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20">
            <div className="flex flex-col space-y-2 mt-4">
              {!isAdmin && (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/20 justify-start"
                    onClick={() => {
                      setCurrentView('menu')
                      setMobileMenuOpen(false)
                    }}
                  >
                    Cardápio
                  </Button>
                  {cart.length > 0 && (
                    <Button 
                      variant="ghost" 
                      className="text-white hover:bg-white/20 justify-start relative"
                      onClick={() => {
                        setCurrentView('cart')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </Button>
                  )}
                </>
              )}
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 justify-start"
                onClick={() => {
                  setIsAdmin(!isAdmin)
                  setCurrentView(isAdmin ? 'menu' : 'admin')
                  setMobileMenuOpen(false)
                }}
              >
                {isAdmin ? 'Sair Admin' : 'Admin'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )

  // Restaurant Hero Component
  const RestaurantHero = () => (
    <div className="relative h-64 md:h-80 overflow-hidden">
      {/* Cover Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${restaurantSettings.coverImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Restaurant Info Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="bg-white/95 backdrop-blur-sm max-w-2xl w-full">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src={restaurantSettings.logo} 
                  alt={restaurantSettings.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
              
              {/* Restaurant Details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">{restaurantSettings.name}</h1>
                  <div className="flex items-center gap-2">
                    <Badge className={restaurantSettings.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                      {restaurantSettings.isOpen ? 'Aberto' : 'Fechado'}
                    </Badge>
                    <Select>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="Horários" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">{restaurantSettings.openingHours}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurantSettings.address}</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  Pedido mínimo: R$ {restaurantSettings.minOrder.toFixed(2)}
                </div>
                
                {/* Delivery Areas */}
                <div className="flex items-center gap-2">
                  <Select value={selectedDeliveryArea?.id || ''} onValueChange={(value) => {
                    const area = restaurantSettings.deliveryAreas.find(a => a.id === value)
                    setSelectedDeliveryArea(area || null)
                  }}>
                    <SelectTrigger className="w-48 h-8 text-xs">
                      <SelectValue placeholder="Selecionar área de entrega" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurantSettings.deliveryAreas.map(area => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name} - R$ {area.fee.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar pratos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Product Detail View
  const ProductDetailView = () => {
    if (!selectedProduct) return null

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFF4E6' }}>
        {/* Header with back button */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white py-4">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
              onClick={() => setCurrentView('menu')}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="overflow-hidden bg-white">
              {/* Product Image */}
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{selectedProduct.rating}</span>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Product Info */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2">{selectedProduct.name}</h1>
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{selectedProduct.prepTime}</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">
                      R$ {selectedProduct.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Additionals Section */}
                {selectedProduct.additionals && selectedProduct.additionals.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Adicionais</h3>
                    <div className="space-y-3">
                      {selectedProduct.additionals.map(additional => (
                        <div key={additional.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedAdditionals.some(a => a.id === additional.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAdditionals([...selectedAdditionals, additional])
                                } else {
                                  setSelectedAdditionals(selectedAdditionals.filter(a => a.id !== additional.id))
                                }
                              }}
                            />
                            <span className="font-medium">{additional.name}</span>
                          </div>
                          <span className="text-orange-500 font-semibold">
                            +R$ {additional.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Quantidade</h3>
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{productQuantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      onClick={() => setProductQuantity(productQuantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-orange-500">
                      R$ {((selectedProduct.price + selectedAdditionals.reduce((sum, add) => sum + add.price, 0)) * productQuantity).toFixed(2)}
                    </span>
                  </div>
                  {selectedAdditionals.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Produto: R$ {(selectedProduct.price * productQuantity).toFixed(2)}</div>
                      <div>Adicionais: R$ {(selectedAdditionals.reduce((sum, add) => sum + add.price, 0) * productQuantity).toFixed(2)}</div>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 rounded-full"
                  onClick={addToCartWithAdditionals}
                >
                  Adicionar ao Carrinho
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Menu View
  const MenuView = () => (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF4E6' }}>
      {/* Restaurant Hero */}
      <RestaurantHero />

      {/* Categories */}
      <section className="py-6 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={selectedCategory === category 
                  ? "bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6" 
                  : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-full px-6"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white cursor-pointer">
                <div className="relative aspect-video overflow-hidden" onClick={() => openProductDetail(product)}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{product.rating}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  {/* Prep Time */}
                  <div className="flex items-center gap-1 mb-3 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{product.prepTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-500">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <Button 
                      onClick={() => addToCart(product)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full"
                    >
                      Pedir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  // Cart View
  const CartView = () => (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#FFF4E6' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Seu Pedido</h1>
            <Button 
              variant="outline" 
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              onClick={() => setCurrentView('menu')}
            >
              Voltar ao Cardápio
            </Button>
          </div>

          {cart.length === 0 ? (
            <Card className="text-center py-12 bg-white">
              <CardContent>
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
                <p className="text-gray-600 mb-4">Adicione alguns itens deliciosos!</p>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setCurrentView('menu')}
                >
                  Ver Cardápio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Itens do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)}</p>
                          {item.selectedAdditionals.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs text-gray-500">Adicionais:</p>
                              {item.selectedAdditionals.map(add => (
                                <p key={add.id} className="text-xs text-gray-600">
                                  + {add.name} (R$ {add.price.toFixed(2)})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedAdditionals)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedAdditionals)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            R$ {((item.price + item.selectedAdditionals.reduce((sum, add) => sum + add.price, 0)) * item.quantity).toFixed(2)}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => updateQuantity(item.id, 0, item.selectedAdditionals)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="sticky top-24 bg-white">
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {getCartTotal().toFixed(2)}</span>
                    </div>
                    {orderType === 'delivery' && selectedDeliveryArea && (
                      <div className="flex justify-between">
                        <span>Taxa de entrega ({selectedDeliveryArea.name}):</span>
                        <span>R$ {selectedDeliveryArea.fee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-orange-500">R$ {getFinalTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => setCurrentView('checkout')}
                    >
                      Finalizar Pedido
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Checkout View
  const CheckoutView = () => (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#FFF4E6' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Finalizar Pedido</h1>
            <Button 
              variant="outline" 
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              onClick={() => setCurrentView('cart')}
            >
              Voltar ao Carrinho
            </Button>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Dados do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label>Tipo de Pedido *</Label>
                <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">
                      <div className="flex items-center space-x-2">
                        <Store className="w-4 h-4" />
                        <span>Comer no Local</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="takeaway">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>Retirar no Balcão</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="delivery">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4" />
                        <span>Delivery</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType === 'delivery' && (
                <>
                  <div>
                    <Label>Área de Entrega *</Label>
                    <Select value={selectedDeliveryArea?.id || ''} onValueChange={(value) => {
                      const area = restaurantSettings.deliveryAreas.find(a => a.id === value)
                      setSelectedDeliveryArea(area || null)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua área" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurantSettings.deliveryAreas.map(area => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name} - R$ {area.fee.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço de Entrega *</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, bairro, cidade..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Alguma observação especial?"
                  rows={3}
                />
              </div>

              <div className="border-t pt-6">
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Resumo do Pedido</h3>
                  <div className="space-y-1 text-sm">
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${index}`}>
                        <div className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>R$ {((item.price + item.selectedAdditionals.reduce((sum, add) => sum + add.price, 0)) * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.selectedAdditionals.length > 0 && (
                          <div className="ml-4 text-xs text-gray-600">
                            {item.selectedAdditionals.map(add => (
                              <div key={add.id}>+ {add.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>R$ {getCartTotal().toFixed(2)}</span>
                      </div>
                      {orderType === 'delivery' && selectedDeliveryArea && (
                        <div className="flex justify-between">
                          <span>Taxa de entrega ({selectedDeliveryArea.name}):</span>
                          <span>R$ {selectedDeliveryArea.fee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-orange-500">R$ {getFinalTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6"
                  onClick={submitOrder}
                >
                  Confirmar Pedido
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Tracking View
  const TrackingView = () => (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#FFF4E6' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-3xl font-bold mb-2">Pedido Confirmado!</h1>
            <p className="text-gray-600">Acompanhe o status do seu pedido abaixo</p>
          </div>

          {currentOrder && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pedido #{currentOrder.id}</span>
                  <Badge className={getStatusColor(currentOrder.status)}>
                    {getStatusText(currentOrder.status)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {getOrderTypeText(currentOrder.type)} • {currentOrder.createdAt.toLocaleString()}
                  {currentOrder.deliveryArea && (
                    <span> • {currentOrder.deliveryArea}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                  <div className="space-y-2">
                    {currentOrder.items.map((item, index) => (
                      <div key={`${item.id}-${index}`}>
                        <div className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>R$ {((item.price + item.selectedAdditionals.reduce((sum, add) => sum + add.price, 0)) * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.selectedAdditionals.length > 0 && (
                          <div className="ml-4 text-xs text-gray-600">
                            {item.selectedAdditionals.map(add => (
                              <div key={add.id}>+ {add.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>R$ {currentOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Status do Pedido</h3>
                  <div className="space-y-3">
                    <div className={`flex items-center space-x-3 ${currentOrder.status === 'pending' ? 'text-orange-500' : currentOrder.status !== 'pending' ? 'text-green-600' : 'text-gray-400'}`}>
                      <Clock className="w-5 h-5" />
                      <span>Pedido recebido</span>
                    </div>
                    <div className={`flex items-center space-x-3 ${currentOrder.status === 'preparing' ? 'text-orange-600' : currentOrder.status === 'ready' || currentOrder.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                      <Clock className="w-5 h-5" />
                      <span>Em preparo</span>
                    </div>
                    <div className={`flex items-center space-x-3 ${currentOrder.status === 'ready' ? 'text-orange-700' : currentOrder.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="w-5 h-5" />
                      <span>Pronto para {currentOrder.type === 'delivery' ? 'entrega' : currentOrder.type === 'takeaway' ? 'retirada' : 'servir'}</span>
                    </div>
                    {currentOrder.type === 'delivery' && (
                      <div className={`flex items-center space-x-3 ${currentOrder.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                        <Truck className="w-5 h-5" />
                        <span>Entregue</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                    onClick={() => setCurrentView('menu')}
                  >
                    Fazer Novo Pedido
                  </Button>
                  <Button 
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => {
                      toast.success('Status atualizado!')
                    }}
                  >
                    Atualizar Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )

  // Admin View
  const AdminView = () => (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF4E6' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie pedidos, produtos e configurações</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Pedidos</TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Produtos</TabsTrigger>
            <TabsTrigger value="additionals" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Adicionais</TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Entrega</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                      <p className="text-2xl font-bold">
                        {orders.filter(o => o.status !== 'delivered').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Faturamento</p>
                      <p className="text-2xl font-bold">
                        R$ {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Produtos</p>
                      <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Gerenciar Pedidos</CardTitle>
                <CardDescription>
                  Acompanhe e atualize o status dos pedidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum pedido encontrado</p>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold">#{order.id}</span>
                              {getOrderTypeIcon(order.type)}
                              <span className="text-sm text-gray-600">
                                {getOrderTypeText(order.type)}
                              </span>
                              {order.deliveryArea && (
                                <span className="text-sm text-gray-600">
                                  • {order.deliveryArea}
                                </span>
                              )}
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {order.customerName} • {order.customerPhone}
                            </p>
                            <div className="text-sm text-gray-600 mb-2">
                              {order.items.map((item, index) => (
                                <div key={`${item.id}-${index}`}>
                                  {item.quantity}x {item.name}
                                  {item.selectedAdditionals.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      {' '}(+ {item.selectedAdditionals.map(add => add.name).join(', ')})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="font-semibold text-orange-500">
                              Total: R$ {order.total.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                              >
                                Iniciar Preparo
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                className="bg-orange-700 hover:bg-orange-800 text-white"
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                              >
                                Marcar Pronto
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                              >
                                {order.type === 'delivery' ? 'Entregar' : 'Finalizar'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <div className="space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Adicionar Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-name">Nome</Label>
                      <Input
                        id="product-name"
                        value={editingProduct?.name || newProduct.name}
                        onChange={(e) => editingProduct 
                          ? setEditingProduct({...editingProduct, name: e.target.value})
                          : setNewProduct({...newProduct, name: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-price">Preço</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={editingProduct?.price || newProduct.price}
                        onChange={(e) => editingProduct 
                          ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})
                          : setNewProduct({...newProduct, price: parseFloat(e.target.value)})
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-category">Categoria</Label>
                      <Select 
                        value={editingProduct?.category || newProduct.category}
                        onValueChange={(value) => editingProduct 
                          ? setEditingProduct({...editingProduct, category: value})
                          : setNewProduct({...newProduct, category: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c !== 'Todos').map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="product-image">URL da Imagem</Label>
                      <Input
                        id="product-image"
                        value={editingProduct?.image || newProduct.image}
                        onChange={(e) => editingProduct 
                          ? setEditingProduct({...editingProduct, image: e.target.value})
                          : setNewProduct({...newProduct, image: e.target.value})
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="product-description">Descrição</Label>
                      <Textarea
                        id="product-description"
                        value={editingProduct?.description || newProduct.description}
                        onChange={(e) => editingProduct 
                          ? setEditingProduct({...editingProduct, description: e.target.value})
                          : setNewProduct({...newProduct, description: e.target.value})
                        }
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={saveProduct}
                    >
                      {editingProduct ? 'Atualizar' : 'Adicionar'} Produto
                    </Button>
                    {editingProduct && (
                      <Button variant="outline" onClick={() => setEditingProduct(null)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Produtos Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                        <p className="font-bold text-orange-500 mb-2">R$ {product.price.toFixed(2)}</p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="additionals">
            <div className="space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Adicionar Novo Adicional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="additional-name">Nome do Adicional</Label>
                      <Input
                        id="additional-name"
                        value={newAdditional.name}
                        onChange={(e) => setNewAdditional({...newAdditional, name: e.target.value})}
                        placeholder="Ex: Bacon Extra"
                      />
                    </div>
                    <div>
                      <Label htmlFor="additional-price">Preço</Label>
                      <Input
                        id="additional-price"
                        type="number"
                        step="0.01"
                        value={newAdditional.price}
                        onChange={(e) => setNewAdditional({...newAdditional, price: parseFloat(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button 
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={saveAdditional}
                  >
                    Adicionar
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Adicionais Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {additionals.map(additional => (
                      <div key={additional.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          {editingAdditional === additional.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editingAdditionalData?.name || ''}
                                onChange={(e) => setEditingAdditionalData(prev => prev ? {...prev, name: e.target.value} : null)}
                                placeholder="Nome do adicional"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                value={editingAdditionalData?.price || 0}
                                onChange={(e) => setEditingAdditionalData(prev => prev ? {...prev, price: parseFloat(e.target.value)} : null)}
                                placeholder="Preço"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={saveEditingAdditional}
                                >
                                  Salvar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditingAdditional}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold">{additional.name}</h3>
                              <p className="text-orange-500 font-bold">R$ {additional.price.toFixed(2)}</p>
                            </>
                          )}
                        </div>
                        {editingAdditional !== additional.id && (
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                              onClick={() => startEditingAdditional(additional)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteAdditional(additional.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="delivery">
            <div className="space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Adicionar Área de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="area-name">Nome do Bairro</Label>
                      <Input
                        id="area-name"
                        value={newDeliveryArea.name}
                        onChange={(e) => setNewDeliveryArea({...newDeliveryArea, name: e.target.value})}
                        placeholder="Ex: Centro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="area-fee">Taxa de Entrega (R$)</Label>
                      <Input
                        id="area-fee"
                        type="number"
                        step="0.01"
                        value={newDeliveryArea.fee}
                        onChange={(e) => setNewDeliveryArea({...newDeliveryArea, fee: parseFloat(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button 
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={saveDeliveryArea}
                  >
                    Adicionar Área
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Áreas de Entrega Cadastradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurantSettings.deliveryAreas.map(area => (
                      <div key={area.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          {editingDeliveryArea === area.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editingDeliveryAreaData?.name || ''}
                                onChange={(e) => setEditingDeliveryAreaData(prev => prev ? {...prev, name: e.target.value} : null)}
                                placeholder="Nome do bairro"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                value={editingDeliveryAreaData?.fee || 0}
                                onChange={(e) => setEditingDeliveryAreaData(prev => prev ? {...prev, fee: parseFloat(e.target.value)} : null)}
                                placeholder="Taxa de entrega"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={saveEditingDeliveryArea}
                                >
                                  Salvar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditingDeliveryArea}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold">{area.name}</h3>
                              <p className="text-orange-500 font-bold">R$ {area.fee.toFixed(2)}</p>
                            </>
                          )}
                        </div>
                        {editingDeliveryArea !== area.id && (
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                              onClick={() => startEditingDeliveryArea(area)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteDeliveryArea(area.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Configurações do Restaurante</CardTitle>
                  <CardDescription>
                    Configure as informações básicas do restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Restaurante</Label>
                      <Input 
                        value={restaurantSettings.name}
                        onChange={(e) => updateRestaurantSettings({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input 
                        value={restaurantSettings.phone}
                        onChange={(e) => updateRestaurantSettings({ phone: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Endereço</Label>
                    <Input 
                      value={restaurantSettings.address}
                      onChange={(e) => updateRestaurantSettings({ address: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Pedido Mínimo (R$)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={restaurantSettings.minOrder}
                        onChange={(e) => updateRestaurantSettings({ minOrder: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Horário de Funcionamento</Label>
                      <Input 
                        value={restaurantSettings.openingHours}
                        onChange={(e) => updateRestaurantSettings({ openingHours: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>URL da Logo</Label>
                    <Input 
                      value={restaurantSettings.logo}
                      onChange={(e) => updateRestaurantSettings({ logo: e.target.value })}
                      placeholder="https://exemplo.com/logo.jpg"
                    />
                  </div>
                  
                  <div>
                    <Label>URL da Capa</Label>
                    <Input 
                      value={restaurantSettings.coverImage}
                      onChange={(e) => updateRestaurantSettings({ coverImage: e.target.value })}
                      placeholder="https://exemplo.com/capa.jpg"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={restaurantSettings.isOpen}
                      onCheckedChange={(checked) => updateRestaurantSettings({ isOpen: !!checked })}
                    />
                    <Label>Restaurante aberto</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {currentView === 'menu' && <MenuView />}
      {currentView === 'product-detail' && <ProductDetailView />}
      {currentView === 'cart' && <CartView />}
      {currentView === 'checkout' && <CheckoutView />}
      {currentView === 'tracking' && <TrackingView />}
      {currentView === 'admin' && <AdminView />}
    </div>
  )
}