export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
          role?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }

      supply_items: {
        Row: {
          id: string
          name: string
          category: string
          quantity: number
          unit: string
          unit_price: number
          supplier: string | null
          status: 'available' | 'low_stock' | 'out_of_stock'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          quantity?: number
          unit?: string
          unit_price?: number
          supplier?: string | null
          status?: 'available' | 'low_stock' | 'out_of_stock'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          category?: string
          quantity?: number
          unit?: string
          unit_price?: number
          supplier?: string | null
          status?: 'available' | 'low_stock' | 'out_of_stock'
          updated_at?: string
        }
      }

      str_markets: {
        Row: {
          id: number
          market: string
          agents: number
          added_by_name: string | null
          created_at: string
        }
        Insert: {
          id?: number
          market: string
          agents?: number
          added_by_name?: string | null
          created_at?: string
        }
        Update: {
          market?: string
          agents?: number
          added_by_name?: string | null
        }
      }
    }
  }
}

/* =========================
   ✅ ADDED CLEAN TYPE ALIASES
   ========================= */

export type UserRow =
  Database['public']['Tables']['profiles']['Row']

export type ProfileRow =
  Database['public']['Tables']['profiles']['Row']

export type SupplyItemRow =
  Database['public']['Tables']['supply_items']['Row']

export type STRMarketRow =
  Database['public']['Tables']['str_markets']['Row']