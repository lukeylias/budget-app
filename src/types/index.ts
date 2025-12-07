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
