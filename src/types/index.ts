export type BankType = 'UP' | 'ING'
export type AccountType = 'spending' | 'expenses' | 'savings' | 'mortgage' | 'offset' | 'other'
export type AllocationCategory = 'expense' | 'saving' | 'investment'
export type FrequencyType = 'fortnightly' | 'monthly' | 'quarterly' | 'yearly' | 'weekly'
export type ThemeType = 'light' | 'dark' | 'system'

export interface Account {
  id: string
  name: string
  bank: BankType
  type: AccountType
  currentBalance: number
  color: string // hex color for visual identification
  icon: string // lucide icon name
  order: number // for display ordering
  createdAt: Date
  updatedAt: Date
}

export interface Allocation {
  id: string
  name: string // e.g., "Netflix", "Car Insurance", "Emergency Fund"
  category: AllocationCategory
  totalAmount: number // total cost of the bill/goal
  frequency: FrequencyType
  dueDate: Date // when the bill is actually due or goal target date
  accountId: string // which account this is linked to
  amountAlreadySaved: number // manually updated by user
  color: string // for visual identification
  icon: string // lucide icon name
  notes?: string
  isActive: boolean // to "archive" without deleting
  createdAt: Date
  updatedAt: Date
}

export interface Income {
  id: string
  amount: number // fortnightly income amount
  frequency: 'fortnightly' // locked for v1
  nextPayDate: Date // when is the next pay
  createdAt: Date
  updatedAt: Date
}

export interface Settings {
  id: string
  currency: 'AUD'
  dateFormat: string // e.g., 'dd/MM/yyyy'
  theme: ThemeType
  payScheduleStart: Date // first pay date for calculating fortnights
}

// Database row types (snake_case from Supabase)
export interface AccountRow {
  id: string
  name: string
  bank: BankType
  type: AccountType
  current_balance: number
  color: string
  icon: string
  order: number
  created_at: string
  updated_at: string
}

export interface AllocationRow {
  id: string
  name: string
  category: AllocationCategory
  total_amount: number
  frequency: FrequencyType
  due_date: string
  account_id: string
  amount_already_saved: number
  color: string
  icon: string
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IncomeRow {
  id: string
  amount: number
  frequency: 'fortnightly'
  next_pay_date: string
  created_at: string
  updated_at: string
}

export interface SettingsRow {
  id: string
  currency: 'AUD'
  date_format: string
  theme: ThemeType
  pay_schedule_start: string
  created_at: string
  updated_at: string
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: AccountRow
        Insert: Omit<AccountRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<AccountRow, 'id' | 'created_at' | 'updated_at'>>
      }
      allocations: {
        Row: AllocationRow
        Insert: Omit<AllocationRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<AllocationRow, 'id' | 'created_at' | 'updated_at'>>
      }
      income: {
        Row: IncomeRow
        Insert: Omit<IncomeRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<IncomeRow, 'id' | 'created_at' | 'updated_at'>>
      }
      settings: {
        Row: SettingsRow
        Insert: Omit<SettingsRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<SettingsRow, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
