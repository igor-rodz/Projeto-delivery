'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Store, 
  Smartphone, 
  BarChart3, 
  Clock, 
  Shield, 
  Zap,
  ChevronRight,
  Menu,
  X,
  Star,
  Users,
  TrendingUp,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3cd58408-f2cd-4a5a-a11d-13da45360bc0/artifacts/t645xvxe_file_00000000209871f484e2bfad8a0b3268.png"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, business } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user && business) {
      router.push('/dashboard')
    } else if (user) {
      router.push('/onboarding')
    } else {
      router.push('/auth')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src={LOGO_URL} alt="Delivio" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">Deliv<span className="text-orange-500">io</span></span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Recursos</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Preços</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Depoimentos</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <Button onClick={handleGetStarted} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                  {business ? 'Meu Painel' : 'Continuar Cadastro'}
                </Button>
              ) : (
                <>
                  <Link href="/auth?mode=login">
                    <Button variant="ghost" className="text-gray-700">Entrar</Button>
                  </Link>
                  <Link href="/auth?mode=signup">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                      Começar Grátis
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Recursos</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Preços</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Depoimentos</a>
              <div className="pt-4 border-t space-y-3">
                {user ? (
                  <Button onClick={handleGetStarted} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                    {business ? 'Meu Painel' : 'Continuar Cadastro'}
                  </Button>
                ) : (
                  <>
                    <Link href="/auth?mode=login" className="block">
                      <Button variant="outline" className="w-full">Entrar</Button>
                    </Link>
                    <Link href="/auth?mode=signup" className="block">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                        Começar Grátis
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Novo: Integração com WhatsApp disponível!
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Crie seu cardápio digital
              <span className="text-orange-500"> em minutos</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A plataforma mais fácil para restaurantes receberem pedidos online. 
              Sem taxas por pedido, sem complicação.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-14 text-lg shadow-lg shadow-orange-500/25"
              >
                Criar meu cardápio grátis
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <a href="#demo">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg">
                  Ver demonstração
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900">5.000+</div>
                <div className="text-gray-600">Restaurantes ativos</div>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden sm:block" />
              <div>
                <div className="text-3xl font-bold text-gray-900">50.000+</div>
                <div className="text-gray-600">Pedidos por mês</div>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden sm:block" />
              <div>
                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-gray-900">
                  4.9 <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-gray-600">Avaliação média</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="p-4 md:p-8">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=600&fit=crop" 
                  alt="Dashboard Preview"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ferramentas profissionais para gerenciar seu negócio de delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Store,
                title: 'Cardápio Personalizado',
                description: 'Seu cardápio com sua marca, cores e logo. Totalmente customizável.'
              },
              {
                icon: Smartphone,
                title: 'Mobile First',
                description: 'Design otimizado para celular. Seus clientes pedem de qualquer lugar.'
              },
              {
                icon: BarChart3,
                title: 'Painel Completo',
                description: 'Gerencie pedidos, produtos, preços e métricas em um só lugar.'
              },
              {
                icon: Clock,
                title: 'Pronto em 5 Minutos',
                description: 'Cadastre-se e tenha seu cardápio funcionando rapidamente.'
              },
              {
                icon: Shield,
                title: 'Sem Taxa por Pedido',
                description: 'Pague apenas uma mensalidade fixa. Sem surpresas ou taxas escondidas.'
              },
              {
                icon: TrendingUp,
                title: 'Relatórios Detalhados',
                description: 'Acompanhe vendas, produtos mais vendidos e performance do negócio.'
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planos simples e transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e upgrade quando precisar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Grátis</h3>
                <div className="text-4xl font-bold text-gray-900">R$ 0</div>
                <div className="text-gray-600">para sempre</div>
              </div>
              <ul className="space-y-4 mb-8">
                {['Cardápio digital', 'Até 20 produtos', 'Gerenciamento básico', 'Suporte por email'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-full" onClick={handleGetStarted}>
                Começar Grátis
              </Button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl p-8 border-2 border-orange-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-orange-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Mais Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900">R$ 49</div>
                <div className="text-gray-600">/mês</div>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Tudo do Grátis',
                  'Produtos ilimitados',
                  'Relatórios avançados',
                  'Domínio personalizado',
                  'Suporte prioritário',
                  'Integração WhatsApp'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full" onClick={handleGetStarted}>
                Assinar Pro
              </Button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900">R$ 149</div>
                <div className="text-gray-600">/mês</div>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Tudo do Pro',
                  'Múltiplas lojas',
                  'API completa',
                  'Gerente de conta',
                  'SLA garantido',
                  'Integrações custom'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-full" onClick={handleGetStarted}>
                Falar com Vendas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Carlos Silva',
                business: 'Burger House',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                text: 'Triplicamos nossos pedidos em 2 meses. A plataforma é super fácil de usar!'
              },
              {
                name: 'Ana Santos',
                business: 'Doces da Ana',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
                text: 'Finalmente parei de perder pedidos no WhatsApp. Tudo organizado num só lugar.'
              },
              {
                name: 'Pedro Costa',
                business: 'Pizza Express',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                text: 'O suporte é excelente e a plataforma funciona perfeitamente. Recomendo!'
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.business}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para aumentar suas vendas?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de restaurantes que já estão vendendo mais com Delivio
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 h-14 text-lg font-semibold"
          >
            Criar meu cardápio grátis
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={LOGO_URL} alt="Delivio" className="h-10 w-auto" />
                <span className="text-xl font-bold text-white">Deliv<span className="text-orange-500">io</span></span>
              </div>
              <p className="text-sm">A plataforma mais fácil para restaurantes receberem pedidos online.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2025 Delivio. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
