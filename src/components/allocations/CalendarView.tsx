import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { formatCurrency } from '../../lib/utils'
import { calculateFortnightlyAmount } from '../../lib/calculations'
import type { Allocation } from '../../types'

interface CalendarViewProps {
  allocations: Allocation[]
  onAllocationClick: (allocation: Allocation) => void
}

export function CalendarView({ allocations, onAllocationClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

  // Get allocations for this month (only those with a due date)
  const allocationsInMonth = allocations.filter((allocation) => {
    if (!allocation.dueDate) return false
    const dueDate = new Date(allocation.dueDate)
    return (
      dueDate.getMonth() === month &&
      dueDate.getFullYear() === year
    )
  })

  // Group allocations by day
  const allocationsByDay: Record<number, Allocation[]> = {}
  allocationsInMonth.forEach((allocation) => {
    if (!allocation.dueDate) return
    const day = new Date(allocation.dueDate).getDate()
    if (!allocationsByDay[day]) {
      allocationsByDay[day] = []
    }
    allocationsByDay[day].push(allocation)
  })

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Create calendar grid
  const calendarDays = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="min-h-[80px] md:min-h-[100px] p-1 md:p-2 border border-border bg-muted/30 rounded-lg" />
    )
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayAllocations = allocationsByDay[day] || []
    const currentDayDate = new Date(year, month, day)
    currentDayDate.setHours(0, 0, 0, 0)

    const isToday = currentDayDate.getTime() === today.getTime()
    const isPast = currentDayDate < today

    calendarDays.push(
      <div
        key={day}
        className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border border-border rounded-lg transition-colors ${
          isToday
            ? 'bg-primary/20 border-primary'
            : isPast
            ? 'bg-muted/30 text-muted-foreground'
            : 'bg-card'
        }`}
      >
        <div className={`font-semibold text-xs md:text-sm mb-1 md:mb-2 ${isToday ? 'text-primary' : ''}`}>
          {day}
        </div>
        <div className="space-y-0.5 md:space-y-1">
          {dayAllocations.map((allocation, index) => {
            // On mobile, show max 2 allocations, then show "+X more" indicator
            const isMobileHidden = index >= 2
            const remainingCount = dayAllocations.length - 2

            if (isMobileHidden) {
              // Only show the "+X more" indicator once, on the 3rd item
              if (index === 2) {
                return (
                  <div
                    key={`more-${allocation.id}`}
                    className="md:hidden text-[10px] font-semibold text-center py-0.5 text-muted-foreground"
                  >
                    +{remainingCount}
                  </div>
                )
              }
              // Hide the rest on mobile, but show on desktop
              return (
                <button
                  key={allocation.id}
                  onClick={() => onAllocationClick(allocation)}
                  className={`hidden md:block w-full text-left px-2 py-1 text-xs font-medium rounded-md transition-all hover:opacity-80 ${
                    isPast ? 'opacity-60' : ''
                  }`}
                  style={{
                    backgroundColor: allocation.color,
                    color: 'white',
                  }}
                >
                  <div className="truncate">{allocation.name}</div>
                  <div className="text-xs opacity-90">
                    {formatCurrency(calculateFortnightlyAmount(allocation))}
                  </div>
                </button>
              )
            }

            return (
              <button
                key={allocation.id}
                onClick={() => onAllocationClick(allocation)}
                className={`w-full text-left px-1 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-md transition-all hover:opacity-80 ${
                  isPast ? 'opacity-60' : ''
                }`}
                style={{
                  backgroundColor: allocation.color,
                  color: 'white',
                }}
              >
                <div className="truncate">{allocation.name}</div>
                <div className="hidden md:block text-xs opacity-90">
                  {formatCurrency(calculateFortnightlyAmount(allocation))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 md:space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={previousMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg md:text-2xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day Names - Full on desktop, Short on mobile */}
      <div className="grid grid-cols-7 gap-1">
        {/* Mobile: Single letter day names */}
        {dayNamesShort.map((name, index) => (
          <div
            key={`mobile-${name}-${index}`}
            className="md:hidden p-1.5 text-center font-semibold text-xs text-muted-foreground"
          >
            {name}
          </div>
        ))}
        {/* Desktop: Full day names */}
        {dayNames.map((name) => (
          <div
            key={name}
            className="hidden md:block p-3 text-center font-semibold text-sm text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-6">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-expense rounded-md flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">Expenses</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-saving rounded-md flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">Savings</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-investment rounded-md flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">Investments</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-primary/20 border border-primary rounded-md flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">Today</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 col-span-2 md:col-span-1">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-muted/50 rounded-md flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">Past</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
