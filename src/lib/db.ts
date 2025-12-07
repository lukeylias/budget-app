import Dexie, { type Table } from 'dexie'
import type { Account, Allocation, Income, Settings } from '../types'

export class BudgetDatabase extends Dexie {
  accounts!: Table<Account>
  allocations!: Table<Allocation>
  income!: Table<Income>
  settings!: Table<Settings>

  constructor() {
    super('BudgetDatabase')
    this.version(1).stores({
      accounts: 'id, bank, type, order',
      allocations: 'id, category, accountId, dueDate, isActive',
      income: 'id',
      settings: 'id'
    })
  }
}

export const db = new BudgetDatabase()

// Initialize default data if needed
export async function initializeDatabase() {
  const settingsCount = await db.settings.count()

  if (settingsCount === 0) {
    // Create default settings
    await db.settings.add({
      id: 'default',
      currency: 'AUD',
      dateFormat: 'dd/MM/yyyy',
      theme: 'system',
      payScheduleStart: new Date(),
    })
  }

  const incomeCount = await db.income.count()

  if (incomeCount === 0) {
    // Create default income entry
    await db.income.add({
      id: 'default',
      amount: 0,
      frequency: 'fortnightly',
      nextPayDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}

// Helper functions for common operations
export async function getIncome(): Promise<Income | undefined> {
  return await db.income.get('default')
}

export async function updateIncome(amount: number, nextPayDate: Date): Promise<void> {
  await db.income.update('default', {
    amount,
    nextPayDate,
    updatedAt: new Date(),
  })
}

export async function getSettings(): Promise<Settings | undefined> {
  return await db.settings.get('default')
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  await db.settings.update('default', {
    ...settings,
  })
}

export async function getAllAccounts(): Promise<Account[]> {
  return await db.accounts.orderBy('order').toArray()
}

export async function getActiveAllocations(): Promise<Allocation[]> {
  return await db.allocations.filter(a => a.isActive === true).toArray()
}

export async function getAllocationsByCategory(category: string): Promise<Allocation[]> {
  return await db.allocations.where('category').equals(category).and(a => a.isActive).toArray()
}
