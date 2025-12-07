import { useEffect, useState } from 'react'
import { Plus, List, Calendar as CalendarIcon, CreditCard, PiggyBank, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { getActiveAllocations, getAllocationsByCategory } from '../lib/db'
import { calculateFortnightlyAmount, calculateCategoryTotal } from '../lib/calculations'
import { formatCurrency, formatDate } from '../lib/utils'
import { AllocationModal } from '../components/modals/AllocationModal'
import { CalendarView } from '../components/allocations/CalendarView'
import type { Allocation } from '../types'

type ViewMode = 'list' | 'calendar'

export function Allocations() {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [loading, setLoading] = useState(true)
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null)

  useEffect(() => {
    loadAllocations()
  }, [])

  const loadAllocations = async () => {
    try {
      const data = await getActiveAllocations()
      setAllocations(data)
    } catch (error) {
      console.error('Error loading allocations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAllocation = (allocation: Allocation) => {
    setSelectedAllocation(allocation)
    setShowAllocationModal(true)
  }

  const handleAddAllocation = () => {
    setSelectedAllocation(null)
    setShowAllocationModal(true)
  }

  const groupedAllocations = {
    expense: allocations.filter((a) => a.category === 'expense'),
    saving: allocations.filter((a) => a.category === 'saving'),
    investment: allocations.filter((a) => a.category === 'investment'),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 max-w-7xl">
      {/* Header with view toggle and filters */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Allocations</h1>
          <p className="text-muted-foreground mt-1">
            {allocations.length} {allocations.length === 1 ? 'allocation' : 'allocations'}
          </p>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          {/* View Toggle */}
          <div className="inline-flex gap-1 p-1 bg-muted">
            <button
              onClick={() => setViewMode('list')}
              className={`gap-2 inline-flex items-center justify-center px-3 h-9 text-sm font-bold border-4 border-black transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`gap-2 inline-flex items-center justify-center px-3 h-9 text-sm font-bold border-4 border-black transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
          </div>

          <Button onClick={handleAddAllocation} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Allocation</span>
          </Button>
        </div>
      </div>

      {/* Category Filters - only show in list view */}
      {viewMode === 'list' && allocations.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap border-4 border-black ${
              filter === 'all'
                ? 'bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border-4 border-black ${
              filter === 'expense'
                ? 'bg-expense text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Expenses
          </button>
          <button
            onClick={() => setFilter('saving')}
            className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border-4 border-black ${
              filter === 'saving'
                ? 'bg-saving text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            Savings
          </button>
          <button
            onClick={() => setFilter('investment')}
            className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border-4 border-black ${
              filter === 'investment'
                ? 'bg-investment text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Investments
          </button>
        </div>
      )}

      {/* Content - List or Calendar View */}
      {allocations.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4 font-medium">
              No allocations yet. Add your first allocation to get started.
            </p>
            <Button onClick={handleAddAllocation} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Allocation
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'calendar' ? (
        <CalendarView
          allocations={allocations}
          onAllocationClick={handleEditAllocation}
        />
      ) : (
        <div className="space-y-8">
          {(filter === 'all' || filter === 'expense') && groupedAllocations.expense.length > 0 ? (
            <CategorySection
              title="Expenses"
              icon={CreditCard}
              allocations={groupedAllocations.expense}
              category="expense"
              onAllocationClick={handleEditAllocation}
            />
          ) : filter === 'expense' && groupedAllocations.expense.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No expense allocations yet.</p>
              </CardContent>
            </Card>
          ) : null}

          {(filter === 'all' || filter === 'saving') && groupedAllocations.saving.length > 0 ? (
            <CategorySection
              title="Savings"
              icon={PiggyBank}
              allocations={groupedAllocations.saving}
              category="saving"
              onAllocationClick={handleEditAllocation}
            />
          ) : filter === 'saving' && groupedAllocations.saving.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No saving allocations yet.</p>
              </CardContent>
            </Card>
          ) : null}

          {(filter === 'all' || filter === 'investment') && groupedAllocations.investment.length > 0 ? (
            <CategorySection
              title="Investments"
              icon={TrendingUp}
              allocations={groupedAllocations.investment}
              category="investment"
              onAllocationClick={handleEditAllocation}
            />
          ) : filter === 'investment' && groupedAllocations.investment.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No investment allocations yet.</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* Modals */}
      <AllocationModal
        open={showAllocationModal}
        onOpenChange={setShowAllocationModal}
        allocation={selectedAllocation}
        onSuccess={loadAllocations}
      />
    </div>
  )
}

function CategorySection({
  title,
  icon: Icon,
  allocations,
  category,
  onAllocationClick,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  allocations: Allocation[]
  category: string
  onAllocationClick: (allocation: Allocation) => void
}) {
  const total = calculateCategoryTotal(allocations, category)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase">{title}</h2>
            <p className="text-sm font-bold">
              {allocations.length} {allocations.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tabular-nums">{formatCurrency(total)}</p>
          <p className="text-xs font-bold uppercase">per fortnight</p>
        </div>
      </div>
      <div className="grid gap-3">
        {allocations.map((allocation) => (
          <AllocationCard
            key={allocation.id}
            allocation={allocation}
            onClick={() => onAllocationClick(allocation)}
          />
        ))}
      </div>
    </div>
  )
}

function AllocationCard({
  allocation,
  onClick,
}: {
  allocation: Allocation
  onClick: () => void
}) {
  const fortnightlyAmount = calculateFortnightlyAmount(allocation)
  const progressPercentage =
    allocation.totalAmount > 0
      ? (allocation.amountAlreadySaved / allocation.totalAmount) * 100
      : 0

  const getCategoryIcon = () => {
    switch (allocation.category) {
      case 'expense':
        return CreditCard
      case 'saving':
        return PiggyBank
      case 'investment':
        return TrendingUp
      default:
        return CreditCard
    }
  }

  const Icon = getCategoryIcon()

  return (
    <Card
      className="cursor-pointer overflow-hidden group hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
      onClick={onClick}
    >
      <div className="flex items-center p-4 gap-4">
        {/* Color indicator */}
        <div
          className="w-2 h-20 -ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: allocation.color }}
        />

        {/* Icon/Avatar */}
        <div
          className="w-14 h-14 flex items-center justify-center border-4 border-black bg-white transition-colors"
        >
          <Icon className="w-6 h-6 text-black" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-base truncate uppercase">{allocation.name}</h3>
              <p className="text-sm font-bold">
                Due {formatDate(allocation.dueDate)} • {allocation.frequency}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-black text-lg tabular-nums">{formatCurrency(fortnightlyAmount)}</p>
              <p className="text-xs font-bold">/fortnight</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-white h-4 border-4 border-black transition-colors">
              <div
                className="h-full"
                style={{
                  width: `${Math.min(100, progressPercentage)}%`,
                  backgroundColor: allocation.color,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">
                {formatCurrency(allocation.amountAlreadySaved)} saved
              </span>
              <span className="font-black transition-colors" style={{ color: allocation.color }}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
