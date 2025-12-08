import type { Allocation, FrequencyType, Income } from '../types'
import { differenceInCalendarDays } from 'date-fns'

/**
 * Convert frequency to number of fortnights
 */
export function getFrequencyInFortnights(frequency: FrequencyType): number {
  // 26 fortnights per year (52 weeks / 2)
  const FORTNIGHTS_PER_YEAR = 26

  const frequencies: Record<FrequencyType, number> = {
    weekly: 0.5,                              // 1 week = 0.5 fortnights
    fortnightly: 1,                           // 1 fortnight
    monthly: FORTNIGHTS_PER_YEAR / 12,        // 26/12 = 2.1667 fortnights
    quarterly: FORTNIGHTS_PER_YEAR / 4,       // 26/4 = 6.5 fortnights
    yearly: FORTNIGHTS_PER_YEAR,              // 26 fortnights
  }
  return frequencies[frequency]
}

/**
 * Calculate the amount that needs to be set aside per fortnight for an allocation
 */
export function calculateFortnightlyAmount(allocation: Allocation): number {
  const frequencyInFortnights = getFrequencyInFortnights(allocation.frequency)
  return allocation.totalAmount / frequencyInFortnights
}

/**
 * Calculate safe to spend amount
 */
export function calculateSafeToSpend(income: Income, allocations: Allocation[]): number {
  const totalAllocated = allocations.reduce((sum, allocation) => {
    if (!allocation.isActive) return sum
    return sum + calculateFortnightlyAmount(allocation)
  }, 0)

  return income.amount - totalAllocated
}

/**
 * Calculate total allocated per fortnight for a specific category
 */
export function calculateCategoryTotal(allocations: Allocation[], category: string): number {
  return allocations
    .filter(a => a.isActive && a.category === category)
    .reduce((sum, allocation) => sum + calculateFortnightlyAmount(allocation), 0)
}

/**
 * Calculate category breakdown (percentage of income)
 */
export function calculateCategoryBreakdown(
  income: Income,
  allocations: Allocation[]
): Record<string, { amount: number; percentage: number }> {
  const categories = ['expense', 'saving', 'investment']
  const result: Record<string, { amount: number; percentage: number }> = {}

  categories.forEach(category => {
    const amount = calculateCategoryTotal(allocations, category)
    const percentage = income.amount > 0 ? (amount / income.amount) * 100 : 0

    result[category] = {
      amount,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
    }
  })

  return result
}

/**
 * Calculate allocation progress
 */
export function calculateAllocationProgress(allocation: Allocation): {
  progressPercentage: number
  remainingToSave: number
  fortnightsUntilDue: number | null
  onTrack: boolean
} {
  const progressPercentage =
    allocation.totalAmount > 0
      ? (allocation.amountAlreadySaved / allocation.totalAmount) * 100
      : 0

  const remainingToSave = allocation.totalAmount - allocation.amountAlreadySaved

  const today = new Date()

  // Calculate fortnights until due (null if no due date)
  let fortnightsUntilDue: number | null = null
  if (allocation.dueDate) {
    const daysUntilDue = differenceInCalendarDays(allocation.dueDate, today)
    fortnightsUntilDue = Math.max(0, Math.ceil(daysUntilDue / 14))
  }

  // Calculate how many fortnights have elapsed since creation
  const daysSinceCreation = differenceInCalendarDays(today, allocation.createdAt)
  const fortnightsElapsed = Math.max(0, Math.floor(daysSinceCreation / 14))

  const fortnightlyAmount = calculateFortnightlyAmount(allocation)
  const expectedSaved = fortnightlyAmount * fortnightsElapsed

  const onTrack = allocation.amountAlreadySaved >= expectedSaved

  return {
    progressPercentage: Math.min(100, Math.round(progressPercentage * 10) / 10),
    remainingToSave,
    fortnightsUntilDue,
    onTrack,
  }
}

/**
 * Calculate the next occurrence of a due date based on frequency
 */
export function calculateNextDueDate(currentDueDate: Date, frequency: FrequencyType): Date {
  const nextDate = new Date(currentDueDate)

  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'fortnightly':
      nextDate.setDate(nextDate.getDate() + 14)
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3)
      break
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }

  return nextDate
}

/**
 * Calculate the next pay date based on fortnightly schedule
 */
export function calculateNextPayDate(currentPayDate: Date): Date {
  const nextDate = new Date(currentPayDate)
  nextDate.setDate(nextDate.getDate() + 14)
  return nextDate
}
