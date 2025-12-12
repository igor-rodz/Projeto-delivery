export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          user_id: string
          business_name: string
          slug: string
          description: string | null
          address: string | null
          phone: string | null
          logo_url: string | null
          cover_url: string | null
          is_open: boolean
          opening_hours: string | null
          min_order: number
          delivery_fee: number
          delivery_time: string | null
          payment_methods: string[] | null
          theme_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          slug: string
          description?: string | null
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          cover_url?: string | null
          is_open?: boolean
          opening_hours?: string | null
          min_order?: number
          delivery_fee?: number
          delivery_time?: string | null
          payment_methods?: string[] | null
          theme_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          slug?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          cover_url?: string | null
          is_open?: boolean
          opening_hours?: string | null
          min_order?: number
          delivery_fee?: number
          delivery_time?: string | null
          payment_methods?: string[] | null
          theme_color?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          sort_order: number
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          sort_order?: number
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          sort_order?: number
          enabled?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          business_id: string
          category_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          prep_time: string | null
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          category_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          prep_time?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          prep_time?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      additionals: {
        Row: {
          id: string
          business_id: string
          name: string
          price: number
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          price: number
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          price?: number
          enabled?: boolean
          created_at?: string
        }
      }
      product_additionals: {
        Row: {
          id: string
          product_id: string
          additional_id: string
        }
        Insert: {
          id?: string
          product_id: string
          additional_id: string
        }
        Update: {
          id?: string
          product_id?: string
          additional_id?: string
        }
      }
      delivery_areas: {
        Row: {
          id: string
          business_id: string
          name: string
          fee: number
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          fee: number
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          fee?: number
          enabled?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          business_id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          order_type: 'local' | 'takeaway' | 'delivery'
          address: string | null
          delivery_area: string | null
          delivery_fee: number
          subtotal: number
          total: number
          observations: string | null
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          order_type: 'local' | 'takeaway' | 'delivery'
          address?: string | null
          delivery_area?: string | null
          delivery_fee?: number
          subtotal: number
          total: number
          observations?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          order_type?: 'local' | 'takeaway' | 'delivery'
          address?: string | null
          delivery_area?: string | null
          delivery_fee?: number
          subtotal?: number
          total?: number
          observations?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          additionals: Json | null
          additionals_total: number
          total: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          additionals?: Json | null
          additionals_total?: number
          total: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          additionals?: Json | null
          additionals_total?: number
          total?: number
        }
      }
    }
  }
}

// Helper types
export type Business = Database['public']['Tables']['businesses']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Additional = Database['public']['Tables']['additionals']['Row']
export type DeliveryArea = Database['public']['Tables']['delivery_areas']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

// Extended types
export type ProductWithCategory = Product & {
  category: Category
  additionals?: Additional[]
}

export type CategoryWithProducts = Category & {
  products: Product[]
}

export type OrderWithItems = Order & {
  items: OrderItem[]
}
