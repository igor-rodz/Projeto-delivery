'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Search, Edit, Trash2, MoreVertical, Upload, X, Loader2, GripVertical, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { supabase, uploadFile } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Category, Product } from '@/types/database'

export default function ProductsPage() {
  const { business } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Modal states
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    prep_time: '',
    image_url: '',
    enabled: true,
  })
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  })
  const [productImage, setProductImage] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (business) {
      fetchData()
    }
  }, [business])

  const fetchData = async () => {
    if (!business) return

    try {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('business_id', business.id)
          .order('sort_order'),
        supabase
          .from('products')
          .select('*')
          .eq('business_id', business.id)
          .order('name'),
      ])

      setCategories(cats || [])
      setProducts(prods || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }
      setProductImage(file)
      const reader = new FileReader()
      reader.onload = () => setProductImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category_id: product.category_id,
        prep_time: product.prep_time || '',
        image_url: product.image_url || '',
        enabled: product.enabled,
      })
      setProductImagePreview(product.image_url)
    } else {
      setEditingProduct(null)
      setProductForm({
        name: '',
        description: '',
        price: '',
        category_id: categories[0]?.id || '',
        prep_time: '15-20 min',
        image_url: '',
        enabled: true,
      })
      setProductImagePreview(null)
    }
    setProductImage(null)
    setProductDialogOpen(true)
  }

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        description: category.description || '',
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '' })
    }
    setCategoryDialogOpen(true)
  }

  const saveProduct = async () => {
    if (!business || !productForm.name || !productForm.price || !productForm.category_id) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      let imageUrl = productForm.image_url

      if (productImage) {
        const fileName = `${business.id}/products/${Date.now()}-${productImage.name}`
        imageUrl = await uploadFile('products', fileName, productImage)
      }

      const productData = {
        business_id: business.id,
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        category_id: productForm.category_id,
        prep_time: productForm.prep_time || null,
        image_url: imageUrl || null,
        enabled: productForm.enabled,
        updated_at: new Date().toISOString(),
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success('Produto atualizado!')
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData)

        if (error) throw error
        toast.success('Produto criado!')
      }

      setProductDialogOpen(false)
      fetchData()
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.message || 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      toast.success('Produto excluído!')
      fetchData()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Erro ao excluir produto')
    }
  }

  const toggleProductEnabled = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ enabled: !product.enabled })
        .eq('id', product.id)

      if (error) throw error
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, enabled: !p.enabled } : p
      ))
      toast.success(product.enabled ? 'Produto desativado' : 'Produto ativado')
    } catch (error) {
      console.error('Error toggling product:', error)
      toast.error('Erro ao atualizar produto')
    }
  }

  const saveCategory = async () => {
    if (!business || !categoryForm.name) {
      toast.error('Digite o nome da categoria')
      return
    }

    setSaving(true)
    try {
      const categoryData = {
        business_id: business.id,
        name: categoryForm.name,
        description: categoryForm.description || null,
        sort_order: editingCategory?.sort_order || categories.length + 1,
      }

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success('Categoria atualizada!')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData)

        if (error) throw error
        toast.success('Categoria criada!')
      }

      setCategoryDialogOpen(false)
      fetchData()
    } catch (error: any) {
      console.error('Error saving category:', error)
      toast.error(error.message || 'Erro ao salvar categoria')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    const productsInCategory = products.filter(p => p.category_id === categoryId)
    if (productsInCategory.length > 0) {
      toast.error('Não é possível excluir categoria com produtos')
      return
    }

    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error
      toast.success('Categoria excluída!')
      fetchData()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Erro ao excluir categoria')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu cardápio</p>
        </div>
        <Button onClick={() => openProductDialog()} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Produtos ({products.length})</TabsTrigger>
          <TabsTrigger value="categories">Categorias ({categories.length})</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-12 text-center text-gray-500">Carregando...</div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Nenhum produto encontrado</p>
                <Button onClick={() => openProductDialog()} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar primeiro produto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className={`overflow-hidden ${!product.enabled ? 'opacity-60' : ''}`}>
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sem imagem
                      </div>
                    )}
                    {!product.enabled && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">Desativado</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-500">{getCategoryName(product.category_id)}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openProductDialog(product)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleProductEnabled(product)}>
                            {product.enabled ? (
                              <><EyeOff className="w-4 h-4 mr-2" /> Desativar</>
                            ) : (
                              <><Eye className="w-4 h-4 mr-2" /> Ativar</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                    <p className="text-lg font-bold text-red-500">R$ {product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="flex justify-end mb-6">
            <Button onClick={() => openCategoryDialog()} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <div className="space-y-3">
            {categories.map((category) => {
              const productCount = products.filter(p => p.category_id === category.id).length
              return (
                <Card key={category.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-500">
                          {productCount} {productCount === 1 ? 'produto' : 'produtos'}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openCategoryDialog(category)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600"
                          disabled={productCount > 0}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label>Imagem</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 aspect-video rounded-lg border-2 border-dashed cursor-pointer flex items-center justify-center overflow-hidden hover:border-red-500 transition-colors"
              >
                {productImagePreview ? (
                  <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Clique para upload</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                placeholder="Ex: Hambúrguer Clássico"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Descreva o produto..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={productForm.category_id} 
                  onValueChange={(value) => setProductForm({...productForm, category_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="prep_time">Tempo de preparo</Label>
              <Input
                id="prep_time"
                value={productForm.prep_time}
                onChange={(e) => setProductForm({...productForm, prep_time: e.target.value})}
                placeholder="Ex: 15-20 min"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Produto ativo</Label>
              <Switch
                id="enabled"
                checked={productForm.enabled}
                onCheckedChange={(checked) => setProductForm({...productForm, enabled: checked})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setProductDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={saveProduct} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Nome *</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="Ex: Lanches"
              />
            </div>
            <div>
              <Label htmlFor="cat-description">Descrição</Label>
              <Input
                id="cat-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                placeholder="Opcional"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setCategoryDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={saveCategory} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
