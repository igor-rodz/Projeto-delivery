import { supabase } from './supabase'
import { templateCategories, templateProducts, templateAdditionals, templateDeliveryAreas } from './template-data'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
}

export async function createBusinessWithTemplate({
  userId,
  businessName,
  address,
  phone,
  logoUrl,
}: {
  userId: string
  businessName: string
  address?: string
  phone?: string
  logoUrl?: string
}) {
  // Generate unique slug
  let slug = generateSlug(businessName)
  let slugExists = true
  let counter = 0

  while (slugExists) {
    const checkSlug = counter === 0 ? slug : `${slug}-${counter}`
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', checkSlug)
      .single()
    
    if (!existing) {
      slug = checkSlug
      slugExists = false
    } else {
      counter++
    }
  }

  // Create business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      user_id: userId,
      business_name: businessName,
      slug,
      address,
      phone,
      logo_url: logoUrl,
      cover_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop',
      is_open: true,
      opening_hours: '18:00 - 23:00',
      min_order: 25.00,
      delivery_fee: 5.00,
      delivery_time: '30-45 min',
      payment_methods: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'],
      theme_color: '#f97316', // Orange
    })
    .select()
    .single()

  if (businessError) throw businessError

  // Create categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .insert(
      templateCategories.map(cat => ({
        business_id: business.id,
        ...cat,
      }))
    )
    .select()

  if (catError) throw catError

  // Create category lookup
  const categoryMap = new Map(categories?.map(c => [c.name, c.id]))

  // Create products
  const productsToInsert = templateProducts.map(prod => ({
    business_id: business.id,
    category_id: categoryMap.get(prod.category)!,
    name: prod.name,
    description: prod.description,
    price: prod.price,
    image_url: prod.image_url,
    prep_time: prod.prep_time,
    enabled: true,
  }))

  const { error: prodError } = await supabase
    .from('products')
    .insert(productsToInsert)

  if (prodError) throw prodError

  // Create additionals
  const { error: addError } = await supabase
    .from('additionals')
    .insert(
      templateAdditionals.map(add => ({
        business_id: business.id,
        ...add,
        enabled: true,
      }))
    )

  if (addError) throw addError

  // Create delivery areas
  const { error: areaError } = await supabase
    .from('delivery_areas')
    .insert(
      templateDeliveryAreas.map(area => ({
        business_id: business.id,
        ...area,
        enabled: true,
      }))
    )

  if (areaError) throw areaError

  return business
}
