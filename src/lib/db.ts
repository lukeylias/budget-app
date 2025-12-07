import { supabase } from './supabase'
import type { Account, Allocation, Income, Settings } from '../types'

// Helper functions to convert database rows (snake_case) to app types (camelCase)
function rowToAccount(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    bank: row.bank,
    type: row.type,
    currentBalance: row.current_balance,
    color: row.color,
    icon: row.icon,
    order: row.order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function rowToAllocation(row: any): Allocation {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    totalAmount: row.total_amount,
    frequency: row.frequency,
    dueDate: new Date(row.due_date),
    accountId: row.account_id,
    amountAlreadySaved: row.amount_already_saved,
    color: row.color,
    icon: row.icon,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function rowToIncome(row: any): Income {
  return {
    id: row.id,
    amount: row.amount,
    frequency: row.frequency,
    nextPayDate: new Date(row.next_pay_date),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function rowToSettings(row: any): Settings {
  return {
    id: row.id,
    currency: row.currency,
    dateFormat: row.date_format,
    theme: row.theme,
    payScheduleStart: new Date(row.pay_schedule_start),
  }
}

// Initialize database - ensures default records exist
export async function initializeDatabase() {
  // Check and create default income if needed
  const { error: incomeError } = await supabase
    .from('income')
    .select('*')
    .eq('id', 'default')
    .single()

  if (incomeError && incomeError.code === 'PGRST116') {
    // No rows found, create default
    await supabase.from('income').insert({
      id: 'default',
      amount: 0,
      frequency: 'fortnightly' as const,
      next_pay_date: new Date().toISOString(),
    } as any)
  }

  // Check and create default settings if needed
  const { error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'default')
    .single()

  if (settingsError && settingsError.code === 'PGRST116') {
    // No rows found, create default
    await supabase.from('settings').insert({
      id: 'default',
      currency: 'AUD' as const,
      date_format: 'dd/MM/yyyy',
      theme: 'system' as const,
      pay_schedule_start: new Date().toISOString(),
    } as any)
  }
}

// Income operations
export async function getIncome(): Promise<Income | undefined> {
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error) {
    console.error('Error fetching income:', error)
    return undefined
  }

  return data ? rowToIncome(data) : undefined
}

export async function updateIncome(amount: number, nextPayDate: Date): Promise<void> {
  // @ts-ignore - Supabase type inference issue
  const { error } = await supabase
    .from('income')
    .update({
      amount,
      next_pay_date: nextPayDate.toISOString(),
    })
    .eq('id', 'default')

  if (error) {
    console.error('Error updating income:', error)
    throw error
  }
}

// Settings operations
export async function getSettings(): Promise<Settings | undefined> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error) {
    console.error('Error fetching settings:', error)
    return undefined
  }

  return data ? rowToSettings(data) : undefined
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const updateData: any = {}

  if (settings.currency !== undefined) updateData.currency = settings.currency
  if (settings.dateFormat !== undefined) updateData.date_format = settings.dateFormat
  if (settings.theme !== undefined) updateData.theme = settings.theme
  if (settings.payScheduleStart !== undefined) {
    updateData.pay_schedule_start = settings.payScheduleStart.toISOString()
  }

  // @ts-ignore - Supabase type inference issue
  const { error } = await supabase
    .from('settings')
    .update(updateData)
    .eq('id', 'default')

  if (error) {
    console.error('Error updating settings:', error)
    throw error
  }
}

// Account operations
export async function getAllAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching accounts:', error)
    throw error
  }

  return data.map(rowToAccount)
}

export async function getAccountById(id: string): Promise<Account | undefined> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching account:', error)
    return undefined
  }

  return data ? rowToAccount(data) : undefined
}

export async function createAccount(account: Omit<Account, 'createdAt' | 'updatedAt'>): Promise<void> {
  const { error } = await supabase.from('accounts').insert({
    id: account.id,
    name: account.name,
    bank: account.bank,
    type: account.type,
    current_balance: account.currentBalance,
    color: account.color,
    icon: account.icon,
    order: account.order,
  } as any)

  if (error) {
    console.error('Error creating account:', error)
    throw error
  }
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<void> {
  const updateData: any = {}

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.bank !== undefined) updateData.bank = updates.bank
  if (updates.type !== undefined) updateData.type = updates.type
  if (updates.currentBalance !== undefined) updateData.current_balance = updates.currentBalance
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.order !== undefined) updateData.order = updates.order

  // @ts-ignore - Supabase type inference issue
  const { error } = await supabase
    .from('accounts')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating account:', error)
    throw error
  }
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting account:', error)
    throw error
  }
}

export async function countAccounts(): Promise<number> {
  const { count, error } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting accounts:', error)
    return 0
  }

  return count || 0
}

// Allocation operations
export async function getActiveAllocations(): Promise<Allocation[]> {
  const { data, error } = await supabase
    .from('allocations')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching allocations:', error)
    throw error
  }

  return data.map(rowToAllocation)
}

export async function getAllocationsByCategory(category: string): Promise<Allocation[]> {
  const { data, error } = await supabase
    .from('allocations')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching allocations by category:', error)
    throw error
  }

  return data.map(rowToAllocation)
}

export async function getAllocationsByAccountId(accountId: string): Promise<number> {
  const { count, error } = await supabase
    .from('allocations')
    .select('*', { count: 'exact', head: true })
    .eq('account_id', accountId)

  if (error) {
    console.error('Error counting allocations for account:', error)
    return 0
  }

  return count || 0
}

export async function createAllocation(allocation: Omit<Allocation, 'createdAt' | 'updatedAt'>): Promise<void> {
  const { error } = await supabase.from('allocations').insert({
    id: allocation.id,
    name: allocation.name,
    category: allocation.category,
    total_amount: allocation.totalAmount,
    frequency: allocation.frequency,
    due_date: allocation.dueDate.toISOString(),
    account_id: allocation.accountId,
    amount_already_saved: allocation.amountAlreadySaved,
    color: allocation.color,
    icon: allocation.icon,
    notes: allocation.notes,
    is_active: allocation.isActive,
  } as any)

  if (error) {
    console.error('Error creating allocation:', error)
    throw error
  }
}

export async function updateAllocation(id: string, updates: Partial<Allocation>): Promise<void> {
  const updateData: any = {}

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount
  if (updates.frequency !== undefined) updateData.frequency = updates.frequency
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString()
  if (updates.accountId !== undefined) updateData.account_id = updates.accountId
  if (updates.amountAlreadySaved !== undefined) updateData.amount_already_saved = updates.amountAlreadySaved
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive

  // @ts-ignore - Supabase type inference issue
  const { error } = await supabase
    .from('allocations')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating allocation:', error)
    throw error
  }
}

export async function deleteAllocation(id: string): Promise<void> {
  const { error } = await supabase
    .from('allocations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting allocation:', error)
    throw error
  }
}

// Legacy compatibility - keep the db object structure for minimal changes
export const db = {
  accounts: {
    count: countAccounts,
    add: createAccount,
    update: updateAccount,
    delete: deleteAccount,
    orderBy: (_field: string) => ({
      toArray: getAllAccounts,
    }),
    where: (_field: string) => ({
      equals: (value: string) => ({
        count: async () => {
          return await getAllocationsByAccountId(value)
        },
      }),
    }),
  },
  allocations: {
    filter: (fn: (allocation: Allocation) => boolean) => ({
      toArray: async () => {
        const all = await getActiveAllocations()
        return all.filter(fn)
      },
    }),
    where: (_field: string) => ({
      equals: (value: string) => ({
        and: (fn: (allocation: Allocation) => boolean) => ({
          toArray: async () => {
            const byCategory = await getAllocationsByCategory(value)
            return byCategory.filter(fn)
          },
        }),
        count: async () => {
          return await getAllocationsByAccountId(value)
        },
      }),
    }),
    add: createAllocation,
    update: updateAllocation,
    delete: deleteAllocation,
  },
  income: {
    get: async (id: string) => {
      if (id === 'default') {
        return await getIncome()
      }
      return undefined
    },
    update: async (id: string, updates: Partial<Income>) => {
      if (id === 'default' && updates.amount !== undefined && updates.nextPayDate !== undefined) {
        await updateIncome(updates.amount, updates.nextPayDate)
      }
    },
    count: async () => {
      const income = await getIncome()
      return income ? 1 : 0
    },
    add: async (income: Income) => {
      const { error } = await supabase.from('income').insert({
        id: income.id,
        amount: income.amount,
        frequency: income.frequency,
        next_pay_date: income.nextPayDate.toISOString(),
      } as any)
      if (error) throw error
    },
  },
  settings: {
    get: async (id: string) => {
      if (id === 'default') {
        return await getSettings()
      }
      return undefined
    },
    update: updateSettings,
    count: async () => {
      const settings = await getSettings()
      return settings ? 1 : 0
    },
    add: async (settings: Settings) => {
      const { error } = await supabase.from('settings').insert({
        id: settings.id,
        currency: settings.currency,
        date_format: settings.dateFormat,
        theme: settings.theme,
        pay_schedule_start: settings.payScheduleStart.toISOString(),
      } as any)
      if (error) throw error
    },
  },
}
