'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, MapPin, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { DeliveryArea } from '@/types/database'

export default function DeliveryPage() {
  const { business, refreshBusiness } = useAuth()
  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null)
  const [saving, setSaving] = useState(false)
  const [areaForm, setAreaForm] = useState({ name: '', fee: '' })

  // Business delivery settings
  const [deliveryFee, setDeliveryFee] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (business) {
      fetchAreas()
      setDeliveryFee(business.delivery_fee?.toString() || '')
      setDeliveryTime(business.delivery_time || '')
      setMinOrder(business.min_order?.toString() || '')
    }
  }, [business])

  const fetchAreas = async () => {
    if (!business) return

    try {
      const { data, error } = await supabase
        .from('delivery_areas')
        .select('*')
        .eq('business_id', business.id)
        .order('name')

      if (error) throw error
      setAreas(data || [])
    } catch (error) {
      console.error('Error fetching areas:', error)
      toast.error('Erro ao carregar áreas')
    } finally {
      setLoading(false)
    }
  }

  const openDialog = (area?: DeliveryArea) => {
    if (area) {
      setEditingArea(area)
      setAreaForm({ name: area.name, fee: area.fee.toString() })
    } else {
      setEditingArea(null)
      setAreaForm({ name: '', fee: '' })
    }
    setDialogOpen(true)
  }

  const saveArea = async () => {
    if (!business || !areaForm.name || !areaForm.fee) {
      toast.error('Preencha todos os campos')
      return
    }

    setSaving(true)
    try {
      const areaData = {
        business_id: business.id,
        name: areaForm.name,
        fee: parseFloat(areaForm.fee),
        enabled: true,
      }

      if (editingArea) {
        const { error } = await supabase
          .from('delivery_areas')
          .update(areaData)
          .eq('id', editingArea.id)

        if (error) throw error
        toast.success('Área atualizada!')
      } else {
        const { error } = await supabase
          .from('delivery_areas')
          .insert(areaData)

        if (error) throw error
        toast.success('Área criada!')
      }

      setDialogOpen(false)
      fetchAreas()
    } catch (error: any) {
      console.error('Error saving area:', error)
      toast.error(error.message || 'Erro ao salvar área')
    } finally {
      setSaving(false)
    }
  }

  const toggleAreaEnabled = async (area: DeliveryArea) => {
    try {
      const { error } = await supabase
        .from('delivery_areas')
        .update({ enabled: !area.enabled })
        .eq('id', area.id)

      if (error) throw error
      setAreas(areas.map(a => 
        a.id === area.id ? { ...a, enabled: !a.enabled } : a
      ))
      toast.success(area.enabled ? 'Área desativada' : 'Área ativada')
    } catch (error) {
      console.error('Error toggling area:', error)
      toast.error('Erro ao atualizar área')
    }
  }

  const deleteArea = async (areaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta área?')) return

    try {
      const { error } = await supabase
        .from('delivery_areas')
        .delete()
        .eq('id', areaId)

      if (error) throw error
      toast.success('Área excluída!')
      fetchAreas()
    } catch (error) {
      console.error('Error deleting area:', error)
      toast.error('Erro ao excluir área')
    }
  }

  const saveDeliverySettings = async () => {
    if (!business) return

    setSavingSettings(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          delivery_fee: parseFloat(deliveryFee) || 0,
          delivery_time: deliveryTime || null,
          min_order: parseFloat(minOrder) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id)

      if (error) throw error
      await refreshBusiness()
      toast.success('Configurações salvas!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Entrega</h1>
        <p className="text-gray-600">Configure as opções de delivery</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Entrega</CardTitle>
            <CardDescription>Defina as configurações gerais de delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="deliveryFee">Taxa de entrega padrão (R$)</Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Usado quando não houver áreas específicas</p>
            </div>

            <div>
              <Label htmlFor="deliveryTime">Tempo estimado de entrega</Label>
              <Input
                id="deliveryTime"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="Ex: 30-45 min"
              />
            </div>

            <div>
              <Label htmlFor="minOrder">Pedido mínimo (R$)</Label>
              <Input
                id="minOrder"
                type="number"
                step="0.01"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <Button 
              onClick={saveDeliverySettings} 
              className="w-full bg-red-500 hover:bg-red-600"
              disabled={savingSettings}
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Configurações'}
            </Button>
          </CardContent>
        </Card>

        {/* Delivery Areas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Áreas de Entrega</CardTitle>
                <CardDescription>Defina taxas por região</CardDescription>
              </div>
              <Button onClick={() => openDialog()} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Carregando...</div>
            ) : areas.length === 0 ? (
              <div className="py-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nenhuma área cadastrada</p>
                <Button onClick={() => openDialog()} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar área
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {areas.map((area) => (
                  <div 
                    key={area.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${!area.enabled ? 'bg-gray-50 opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{area.name}</p>
                        <p className="text-sm text-green-600">R$ {area.fee.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={area.enabled}
                        onCheckedChange={() => toggleAreaEnabled(area)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => openDialog(area)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteArea(area.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Area Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea ? 'Editar Área' : 'Nova Área de Entrega'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="area-name">Nome da área *</Label>
              <Input
                id="area-name"
                value={areaForm.name}
                onChange={(e) => setAreaForm({...areaForm, name: e.target.value})}
                placeholder="Ex: Centro, Zona Norte"
              />
            </div>
            <div>
              <Label htmlFor="area-fee">Taxa de entrega (R$) *</Label>
              <Input
                id="area-fee"
                type="number"
                step="0.01"
                value={areaForm.fee}
                onChange={(e) => setAreaForm({...areaForm, fee: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={saveArea} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
