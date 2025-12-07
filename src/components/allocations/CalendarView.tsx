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

  // Get allocations for this month
  const allocationsInMonth = allocations.filter((allocation) => {
    const dueDate = new Date(allocation.dueDate)
    return (
      dueDate.getMonth() === month &&
      dueDate.getFullYear() === year
    )
  })

  // Group allocations by day
  const allocationsByDay: Record<number, Allocation[]> = {}
  allocationsInMonth.forEach((allocation) => {
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
      <div key={`empty-${i}`} className="min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-2 border-black bg-muted/50" />
    )
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayAllocations = allocationsByDay[day] || []
    const currentDayDate = new Date(year, month, day)
    currentDayDate.setHours(0, 0, 0, 0)

    const isToday = currentDayDate.getTime() === today.getTime()
    const isPast = currentDayDate < today
    const isFuture = currentDayDate > today

    calendarDays.push(
      <div
        key={day}
        className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-2 border-black transition-colors ${
          isToday
            ? 'bg-primary'
            : isPast
            ? 'bg-muted/50 text-muted-foreground'
            : 'bg-white'
        }`}
      >
        <div className={`font-black text-xs md:text-sm mb-1 md:mb-2 ${isToday ? 'text-black' : ''}`}>
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
                    className="md:hidden text-[10px] font-black text-center py-0.5"
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
                  className={`hidden md:block w-full text-left px-2 py-1 text-xs font-bold border-2 border-black transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] ${
                    isPast ? 'opacity-60' : ''
                  }`}
                  style={{
                    backgroundColor: allocation.color,
                    color: 'white',
                  }}
                >
                  <div className="truncate">{allocation.name}</div>
                  <div className="text-xs">
                    {formatCurrency(calculateFortnightlyAmount(allocation))}
                  </div>
                </button>
              )
            }

            return (
              <button
                key={allocation.id}
                onClick={() => onAllocationClick(allocation)}
                className={`w-full text-left px-1 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-bold border-2 border-black transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] ${
                  isPast ? 'opacity-60' : ''
                }`}
                style={{
                  backgroundColor: allocation.color,
                  color: 'white',
                }}
              >
                <div className="truncate">{allocation.name}</div>
                <div className="hidden md:block text-xs">
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
        <h2 className="text-lg md:text-2xl font-black uppercase">
          {monthNames[month]} {year}
        </h2>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day Names - Full on desktop, Short on mobile */}
      <div className="grid grid-cols-7 gap-0">
        {/* Mobile: Single letter day names */}
        {dayNamesShort.map((name, index) => (
          <div
            key={`mobile-${name}-${index}`}
            className="md:hidden p-1.5 text-center font-black text-xs uppercase border-2 border-black bg-white"
          >
            {name}
          </div>
        ))}
        {/* Desktop: Full day names */}
        {dayNames.map((name) => (
          <div
            key={name}
            className="hidden md:block p-3 text-center font-black text-sm uppercase border-2 border-black bg-white"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0">
        {calendarDays}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-6">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-expense border-2 border-black flex-shrink-0" />
              <span className="text-xs md:text-sm font-bold uppercase">Expenses</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-saving border-2 border-black flex-shrink-0" />
              <span className="text-xs md:text-sm font-bold uppercase">Savings</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-investment border-2 border-black flex-shrink-0" />
              <span className="text-xs md:text-sm font-bold uppercase">Investments</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-primary border-2 border-black flex-shrink-0" />
              <span className="text-xs md:text-sm font-bold uppercase">Today</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 col-span-2 md:col-span-1">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-muted/50 border-2 border-black flex-shrink-0" />
              <span className="text-xs md:text-sm font-bold uppercase">Past</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
