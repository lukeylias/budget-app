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
import { db, getAllocationsByAccountId } from '../../lib/db'
import type { Account, BankType, AccountType } from '../../types'

interface AccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account | null
  onSuccess?: () => void
}

const BANK_OPTIONS: { value: BankType; label: string }[] = [
  { value: 'UP', label: 'UP Bank' },
  { value: 'ING', label: 'ING' },
]

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'spending', label: 'Spending' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'savings', label: 'Savings' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'offset', label: 'Offset' },
  { value: 'other', label: 'Other' },
]

const DEFAULT_COLORS = {
  spending: '#3B82F6',
  expenses: '#EF4444',
  savings: '#10B981',
  mortgage: '#F59E0B',
  offset: '#8B5CF6',
  other: '#6B7280',
}

export function AccountModal({ open, onOpenChange, account, onSuccess }: AccountModalProps) {
  const [name, setName] = useState('')
  const [bank, setBank] = useState<BankType>('UP')
  const [type, setType] = useState<AccountType>('spending')
  const [currentBalance, setCurrentBalance] = useState('')
  const [color, setColor] = useState(DEFAULT_COLORS.spending)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && account) {
      setName(account.name)
      setBank(account.bank)
      setType(account.type)
      setCurrentBalance(account.currentBalance.toString())
      setColor(account.color)
    } else if (open && !account) {
      // Reset form for new account
      setName('')
      setBank('UP')
      setType('spending')
      setCurrentBalance('0')
      setColor(DEFAULT_COLORS.spending)
    }
  }, [open, account])

  const handleTypeChange = (value: AccountType) => {
    setType(value)
    if (!account) {
      // Only auto-set color for new accounts
      setColor(DEFAULT_COLORS[value])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (account) {
        // Update existing account
        await db.accounts.update(account.id, {
          name,
          bank,
          type,
          currentBalance: parseFloat(currentBalance),
          color,
          updatedAt: new Date(),
        })
      } else {
        // Create new account
        const count = await db.accounts.count()
        await db.accounts.add({
          id: `account-${Date.now()}`,
          name,
          bank,
          type,
          currentBalance: parseFloat(currentBalance),
          color,
          icon: 'wallet',
          order: count,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving account:', error)
      alert('Failed to save account')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!account) return

    // Check if any allocations use this account
    const allocations = await getAllocationsByAccountId(account.id)

    if (allocations > 0) {
      alert(
        `Cannot delete account. ${allocations} allocation(s) are linked to this account. Please reassign them first.`
      )
      return
    }

    if (!confirm('Are you sure you want to delete this account?')) return

    try {
      await db.accounts.delete(account.id)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{account ? 'Edit Account' : 'Add Account'}</DialogTitle>
            <DialogDescription>
              {account ? 'Update account details' : 'Create a new bank account'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bank">Bank</Label>
              <Select value={bank} onValueChange={(value) => setBank(value as BankType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BANK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., Everyday Account"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Account Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                required
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
          </div>

          <DialogFooter>
            {account && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : account ? 'Update Account' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
