'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Store, 
  Package, 
  ShoppingBag, 
  Settings, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  ExternalLink,
  Loader2,
  Truck,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/dashboard/products', label: 'Produtos', icon: Package },
  { href: '/dashboard/delivery', label: 'Entrega', icon: Truck },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, business, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth')
      } else if (!business) {
        router.push('/onboarding')
      }
    }
  }, [user, business, loading, router])

  const handleSignOut = async () => {
    await signOut()
    toast.success('Você saiu da sua conta')
    router.push('/')
  }

  if (loading || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <img src="https://customer-assets.emergentagent.com/job_3cd58408-f2cd-4a5a-a11d-13da45360bc0/artifacts/t645xvxe_file_00000000209871f484e2bfad8a0b3268.png" alt="Delivio" className="h-8 w-auto" />
              <span className="font-bold text-gray-900">Deliv<span className="text-orange-500">io</span></span>
            </Link>
          </div>

          {/* Business Info */}
          <div className="px-4 py-4 border-b">
            <div className="flex items-center space-x-3">
              {business.logo_url ? (
                <img src={business.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Store className="w-5 h-5 text-orange-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{business.business_name}</p>
                <p className={`text-xs ${business.is_open ? 'text-green-600' : 'text-red-600'}`}>
                  {business.is_open ? 'Aberto' : 'Fechado'}
                </p>
              </div>
            </div>
            <Link href={`/menu/${business.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                <ExternalLink className="w-3 h-3 mr-2" />
                Ver Cardápio
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-gray-900 truncate">{business.business_name}</span>
          <Link href={`/menu/${business.slug}`} target="_blank">
            <ExternalLink className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-white">
            <div className="flex items-center justify-between h-14 px-4 border-b">
              <span className="font-bold">Menu</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-red-50 text-red-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mt-4"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg
                  ${isActive ? 'text-red-500' : 'text-gray-500'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
