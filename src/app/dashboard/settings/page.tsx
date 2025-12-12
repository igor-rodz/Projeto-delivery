'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Loader2, Store, ExternalLink, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/lib/auth-context'
import { supabase, uploadFile } from '@/lib/supabase'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { business, refreshBusiness } = useAuth()
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    business_name: '',
    description: '',
    address: '',
    phone: '',
    opening_hours: '',
    is_open: true,
    logo_url: '',
    cover_url: '',
    payment_methods: [] as string[],
    theme_color: '#f97316',
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [newLogo, setNewLogo] = useState<File | null>(null)
  const [newCover, setNewCover] = useState<File | null>(null)

  const paymentOptions = [
    'Dinheiro',
    'Cartão de Crédito',
    'Cartão de Débito',
    'PIX',
    'Vale Refeição',
  ]

  useEffect(() => {
    if (business) {
      setForm({
        business_name: business.business_name,
        description: business.description || '',
        address: business.address || '',
        phone: business.phone || '',
        opening_hours: business.opening_hours || '',
        is_open: business.is_open,
        logo_url: business.logo_url || '',
        cover_url: business.cover_url || '',
        payment_methods: business.payment_methods || [],
        theme_color: business.theme_color || '#f97316',
      })
      setLogoPreview(business.logo_url)
      setCoverPreview(business.cover_url)
    }
  }, [business])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }
      setNewLogo(file)
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }
      setNewCover(file)
      const reader = new FileReader()
      reader.onload = () => setCoverPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const togglePaymentMethod = (method: string) => {
    setForm(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }))
  }

  const handleSave = async () => {
    if (!business || !form.business_name) {
      toast.error('Nome do negócio é obrigatório')
      return
    }

    setSaving(true)
    try {
      let logoUrl = form.logo_url
      let coverUrl = form.cover_url

      if (newLogo) {
        const fileName = `${business.id}/${Date.now()}-logo.${newLogo.name.split('.').pop()}`
        logoUrl = await uploadFile('logos', fileName, newLogo)
      }

      if (newCover) {
        const fileName = `${business.id}/${Date.now()}-cover.${newCover.name.split('.').pop()}`
        coverUrl = await uploadFile('covers', fileName, newCover)
      }

      const { error } = await supabase
        .from('businesses')
        .update({
          business_name: form.business_name,
          description: form.description || null,
          address: form.address || null,
          phone: form.phone || null,
          opening_hours: form.opening_hours || null,
          is_open: form.is_open,
          logo_url: logoUrl || null,
          cover_url: coverUrl || null,
          payment_methods: form.payment_methods,
          theme_color: form.theme_color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id)

      if (error) throw error

      await refreshBusiness()
      setNewLogo(null)
      setNewCover(null)
      toast.success('Configurações salvas!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const copyMenuLink = () => {
    if (business) {
      const url = `${window.location.origin}/menu/${business.slug}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const menuUrl = business ? `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${business.slug}` : ''

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Personalize seu negócio</p>
      </div>

      <div className="space-y-6">
        {/* Menu Link */}
        <Card>
          <CardHeader>
            <CardTitle>Link do Cardápio</CardTitle>
            <CardDescription>Compartilhe este link com seus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={menuUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={copyMenuLink}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <a href={`/menu/${business?.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Negócio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo & Cover */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Logo</Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="mt-2 w-32 h-32 rounded-full border-2 border-dashed cursor-pointer flex items-center justify-center overflow-hidden hover:border-red-500 transition-colors"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500">Upload</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Capa</Label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className="mt-2 aspect-video max-w-xs rounded-lg border-2 border-dashed cursor-pointer flex items-center justify-center overflow-hidden hover:border-red-500 transition-colors"
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500">Upload</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Nome do Negócio *</Label>
                <Input
                  id="business_name"
                  value={form.business_name}
                  onChange={(e) => setForm({...form, business_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Conte um pouco sobre seu negócio..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="opening_hours">Horário de Funcionamento</Label>
                <Input
                  id="opening_hours"
                  value={form.opening_hours}
                  onChange={(e) => setForm({...form, opening_hours: e.target.value})}
                  placeholder="Ex: 18:00 - 23:00"
                />
              </div>
              <div className="flex items-center justify-between pt-8">
                <Label htmlFor="is_open">Loja aberta</Label>
                <Switch
                  id="is_open"
                  checked={form.is_open}
                  onCheckedChange={(checked) => setForm({...form, is_open: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
            <CardDescription>Selecione as formas de pagamento aceitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {paymentOptions.map((method) => (
                <Button
                  key={method}
                  variant={form.payment_methods.includes(method) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => togglePaymentMethod(method)}
                  className={form.payment_methods.includes(method) ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  {method}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Personalização</CardTitle>
            <CardDescription>Customize as cores do seu cardápio</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="theme_color">Cor Principal</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  id="theme_color"
                  value={form.theme_color}
                  onChange={(e) => setForm({...form, theme_color: e.target.value})}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input
                  value={form.theme_color}
                  onChange={(e) => setForm({...form, theme_color: e.target.value})}
                  className="w-32 font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          className="w-full md:w-auto bg-red-500 hover:bg-red-600"
          disabled={saving}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </div>
    </div>
  )
}
