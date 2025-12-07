import { useEffect, useState } from 'react'
import { Plus, Settings, TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { formatCurrency, formatDate } from '../lib/utils'
import { calculateSafeToSpend, calculateCategoryBreakdown } from '../lib/calculations'
import { getIncome, getActiveAllocations, getAllAccounts } from '../lib/db'
import { IncomeModal } from '../components/modals/IncomeModal'
import { AccountModal } from '../components/modals/AccountModal'
import type { Income, Allocation, Account } from '../types'

export function Dashboard() {
  const [income, setIncome] = useState<Income | null>(null)
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [incomeData, allocationsData, accountsData] = await Promise.all([
        getIncome(),
        getActiveAllocations(),
        getAllAccounts(),
      ])

      setIncome(incomeData || null)
      setAllocations(allocationsData)
      setAccounts(accountsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setShowAccountModal(true)
  }

  const handleAddAccount = () => {
    setSelectedAccount(null)
    setShowAccountModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <DollarSign className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">Loading your budget...</p>
        </div>
      </div>
    )
  }

  if (!income || income.amount === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to Budget App</CardTitle>
              <CardDescription className="text-base">
                Let's get started by setting up your fortnightly income
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Button onClick={() => setShowIncomeModal(true)} size="lg" className="gap-2">
                <Settings className="w-4 h-4" />
                Set Up Income
              </Button>
            </CardContent>
          </Card>
        </div>

        <IncomeModal
          open={showIncomeModal}
          onOpenChange={setShowIncomeModal}
          onSuccess={loadData}
        />
      </div>
    )
  }

  const safeToSpend = calculateSafeToSpend(income, allocations)
  const breakdown = calculateCategoryBreakdown(income, allocations)
  const totalAllocated = breakdown.expense.amount + breakdown.saving.amount + breakdown.investment.amount

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 max-w-7xl">
      {/* Safe to Spend Hero Section */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Available to Spend</p>
              <h2 className="text-4xl md:text-5xl font-bold">
                {formatCurrency(safeToSpend)}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowIncomeModal(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium text-sm">Income:</span>
              </div>
              <span className="font-semibold">{formatCurrency(income.amount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingDown className="w-4 h-4" />
                <span className="font-medium text-sm">Allocated:</span>
              </div>
              <span className="font-semibold">{formatCurrency(totalAllocated)}</span>
            </div>
          </div>

          <p className="text-xs font-medium text-muted-foreground mt-4">
            Next pay: {formatDate(income.nextPayDate)}
          </p>
        </CardContent>
      </Card>

      {/* Allocation Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-expense rounded-t-2xl" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Expenses
              </CardTitle>
              <div className="w-10 h-10 bg-expense/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-expense" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">{formatCurrency(breakdown.expense.amount)}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">per fortnight</span>
              <span className="px-2 py-0.5 bg-expense/10 text-expense font-semibold text-xs rounded-lg">
                {breakdown.expense.percentage}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-saving rounded-t-2xl" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Savings
              </CardTitle>
              <div className="w-10 h-10 bg-saving/10 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-saving" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">{formatCurrency(breakdown.saving.amount)}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">per fortnight</span>
              <span className="px-2 py-0.5 bg-saving/10 text-saving font-semibold text-xs rounded-lg">
                {breakdown.saving.percentage}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-investment rounded-t-2xl" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Investments
              </CardTitle>
              <div className="w-10 h-10 bg-investment/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-investment" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">{formatCurrency(breakdown.investment.amount)}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">per fortnight</span>
              <span className="px-2 py-0.5 bg-investment/10 text-investment font-semibold text-xs rounded-lg">
                {breakdown.investment.percentage}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Balances */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Accounts</CardTitle>
              <CardDescription>Your bank account balances</CardDescription>
            </div>
            <Button onClick={handleAddAccount} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Account</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4 font-medium">No accounts yet</p>
              <Button onClick={handleAddAccount} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="group flex items-center justify-between p-4 rounded-xl bg-background hover:bg-muted/50 transition-all cursor-pointer"
                  onClick={() => handleEditAccount(account)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: account.color }}
                    >
                      {account.bank.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-base">
                        {account.bank} - {account.name}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold tabular-nums">
                    {formatCurrency(account.currentBalance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <IncomeModal
        open={showIncomeModal}
        onOpenChange={setShowIncomeModal}
        onSuccess={loadData}
      />
      <AccountModal
        open={showAccountModal}
        onOpenChange={setShowAccountModal}
        account={selectedAccount}
        onSuccess={loadData}
      />
    </div>
  )
}
