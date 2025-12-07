import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { db, getAllAccounts } from '../../lib/db'
import { calculateFortnightlyAmount } from '../../lib/calculations'
import { formatCurrency } from '../../lib/utils'
import type { Allocation, AllocationCategory, FrequencyType, Account } from '../../types'

interface AllocationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allocation?: Allocation | null
  onSuccess?: () => void
}

const CATEGORY_OPTIONS: { value: AllocationCategory; label: string; color: string }[] = [
  { value: 'expense', label: 'Expense', color: '#EF4444' },
  { value: 'saving', label: 'Saving', color: '#10B981' },
  { value: 'investment', label: 'Investment', color: '#8B5CF6' },
]

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

export function AllocationModal({
  open,
  onOpenChange,
  allocation,
  onSuccess,
}: AllocationModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<AllocationCategory>('expense')
  const [totalAmount, setTotalAmount] = useState('')
  const [frequency, setFrequency] = useState<FrequencyType>('monthly')
  const [dueDate, setDueDate] = useState('')
  const [accountId, setAccountId] = useState('')
  const [amountAlreadySaved, setAmountAlreadySaved] = useState('0')
  const [color, setColor] = useState('#EF4444')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    if (open) {
      loadAccounts()
    }
  }, [open])

  useEffect(() => {
    if (open && allocation) {
      setName(allocation.name)
      setCategory(allocation.category)
      setTotalAmount(allocation.totalAmount.toString())
      setFrequency(allocation.frequency)
      setDueDate(allocation.dueDate.toISOString().split('T')[0])
      setAccountId(allocation.accountId)
      setAmountAlreadySaved(allocation.amountAlreadySaved.toString())
      setColor(allocation.color)
      setNotes(allocation.notes || '')
    } else if (open && !allocation) {
      // Reset form for new allocation
      setName('')
      setCategory('expense')
      setTotalAmount('')
      setFrequency('monthly')
      setDueDate('')
      setAccountId('')
      setAmountAlreadySaved('0')
      setColor('#EF4444')
      setNotes('')
    }
  }, [open, allocation])

  const loadAccounts = async () => {
    const accountList = await getAllAccounts()
    setAccounts(accountList)
    if (accountList.length > 0 && !accountId) {
      setAccountId(accountList[0].id)
    }
  }

  const handleCategoryChange = (value: AllocationCategory) => {
    setCategory(value)
    if (!allocation) {
      const categoryOption = CATEGORY_OPTIONS.find((opt) => opt.value === value)
      if (categoryOption) {
        setColor(categoryOption.color)
      }
    }
  }

  const calculateFortnightlyPreview = () => {
    if (!totalAmount || !frequency) return null

    const mockAllocation: Allocation = {
      id: '',
      name: '',
      category,
      totalAmount: parseFloat(totalAmount),
      frequency,
      dueDate: new Date(),
      accountId: '',
      amountAlreadySaved: 0,
      color: '',
      icon: '',
      notes: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return calculateFortnightlyAmount(mockAllocation)
  }

  const fortnightlyPreview = calculateFortnightlyPreview()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (allocation) {
        // Update existing allocation
        await db.allocations.update(allocation.id, {
          name,
          category,
          totalAmount: parseFloat(totalAmount),
          frequency,
          dueDate: new Date(dueDate),
          accountId,
          amountAlreadySaved: parseFloat(amountAlreadySaved),
          color,
          notes,
          updatedAt: new Date(),
        })
      } else {
        // Create new allocation
        await db.allocations.add({
          id: `allocation-${Date.now()}`,
          name,
          category,
          totalAmount: parseFloat(totalAmount),
          frequency,
          dueDate: new Date(dueDate),
          accountId,
          amountAlreadySaved: parseFloat(amountAlreadySaved),
          color,
          icon: 'circle',
          notes,
          isActive: true,
        })
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving allocation:', error)
      alert('Failed to save allocation')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!allocation) return

    if (!confirm('Are you sure you want to delete this allocation?')) return

    try {
      await db.allocations.delete(allocation.id)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting allocation:', error)
      alert('Failed to delete allocation')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{allocation ? 'Edit Allocation' : 'Add Allocation'}</DialogTitle>
            <DialogDescription>
              {allocation ? 'Update allocation details' : 'Create a new budget allocation'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Netflix, Car Insurance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(value) => setFrequency(value as FrequencyType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {fortnightlyPreview !== null && (
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-sm font-medium">
                  Per fortnight: {formatCurrency(fortnightlyPreview)}
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountId">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bank} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {accounts.length === 0 && (
                <p className="text-sm text-destructive">
                  No accounts available. Please create an account first.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amountAlreadySaved">Amount Already Saved</Label>
              <Input
                id="amountAlreadySaved"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountAlreadySaved}
                onChange={(e) => setAmountAlreadySaved(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            {allocation && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || accounts.length === 0}>
              {loading ? 'Saving...' : allocation ? 'Update Allocation' : 'Add Allocation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
