'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Loader2, Store, MapPin, Phone, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { createBusinessWithTemplate } from '@/lib/business-service'
import { uploadFile } from '@/lib/supabase'
import { toast } from 'sonner'

const steps = [
  { id: 1, title: 'Nome do negócio', icon: Store },
  { id: 2, title: 'Endereço', icon: MapPin },
  { id: 3, title: 'Contato', icon: Phone },
  { id: 4, title: 'Logo', icon: Upload },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user, business, refreshBusiness, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth')
      } else if (business) {
        router.push('/dashboard')
      }
    }
  }, [user, business, authLoading, router])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }
      setLogo(file)
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handleNext = () => {
    if (currentStep === 1 && !businessName.trim()) {
      toast.error('Digite o nome do seu negócio')
      return
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      let logoUrl: string | undefined

      if (logo) {
        const fileName = `${user.id}/${Date.now()}-${logo.name}`
        logoUrl = await uploadFile('logos', fileName, logo)
      }

      await createBusinessWithTemplate({
        userId: user.id,
        businessName: businessName.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        logoUrl,
      })

      await refreshBusiness()
      toast.success('Negócio criado com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating business:', error)
      toast.error(error.message || 'Erro ao criar negócio')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="https://customer-assets.emergentagent.com/job_3cd58408-f2cd-4a5a-a11d-13da45360bc0/artifacts/t645xvxe_file_00000000209871f484e2bfad8a0b3268.png" alt="Delivio" className="h-10 w-auto" />
            <span className="text-xl font-bold text-gray-900">Deliv<span className="text-orange-500">io</span></span>
          </Link>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-colors
                  ${currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Step 1: Business Name */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Qual o nome do seu negócio?</h1>
                  <p className="text-gray-600">Esse será o nome exibido no seu cardápio digital</p>
                </div>
                <div>
                  <Label htmlFor="businessName">Nome do Negócio *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ex: Pizzaria do João"
                    className="h-12 mt-1 text-lg"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Onde fica seu negócio?</h1>
                  <p className="text-gray-600">Opcional, mas ajuda seus clientes a te encontrarem</p>
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Rua das Flores, 123 - Centro"
                    className="h-12 mt-1"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 3: Phone */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Qual seu telefone?</h1>
                  <p className="text-gray-600">Para seus clientes entrarem em contato</p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="h-12 mt-1"
                    maxLength={15}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 4: Logo */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Adicione sua logo</h1>
                  <p className="text-gray-600">Opcional, mas deixa seu cardápio mais profissional</p>
                </div>
                <div className="flex flex-col items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      w-32 h-32 rounded-full border-2 border-dashed cursor-pointer
                      flex items-center justify-center overflow-hidden transition-all
                      ${logoPreview ? 'border-green-500' : 'border-gray-300 hover:border-orange-500'}
                    `}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Upload</span>
                      </div>
                    )}
                  </div>
                  {logoPreview && (
                    <button
                      onClick={() => {
                        setLogo(null)
                        setLogoPreview(null)
                      }}
                      className="mt-3 text-sm text-orange-500 hover:text-orange-600"
                    >
                      Remover imagem
                    </button>
                  )}
                  <p className="text-sm text-gray-500 mt-4">PNG, JPG até 5MB</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
                className="text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : currentStep === 4 ? (
                  'Criar meu Cardápio'
                ) : (
                  'Continuar'
                )}
              </Button>
            </div>

            {/* Skip button for optional steps */}
            {currentStep > 1 && currentStep < 4 && (
              <div className="text-center mt-4">
                <button
                  onClick={handleNext}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Pular esta etapa
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          {currentStep === 4 && businessName && (
            <div className="mt-6 bg-white rounded-xl p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Nome:</span> {businessName}</p>
                {address && <p><span className="text-gray-500">Endereço:</span> {address}</p>}
                {phone && <p><span className="text-gray-500">Telefone:</span> {phone}</p>}
                <p><span className="text-gray-500">Logo:</span> {logo ? 'Adicionada' : 'Não adicionada'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
