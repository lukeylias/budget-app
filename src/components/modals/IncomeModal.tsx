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
import { getIncome, updateIncome } from '../../lib/db'
import { formatDate } from '../../lib/utils'

interface IncomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function IncomeModal({ open, onOpenChange, onSuccess }: IncomeModalProps) {
  const [amount, setAmount] = useState('')
  const [nextPayDate, setNextPayDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadIncome()
    }
  }, [open])

  const loadIncome = async () => {
    try {
      const income = await getIncome()
      if (income) {
        setAmount(income.amount.toString())
        setNextPayDate(income.nextPayDate.toISOString().split('T')[0])
      }
    } catch (error) {
      console.error('Error loading income:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateIncome(parseFloat(amount), new Date(nextPayDate))
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating income:', error)
      alert('Failed to update income')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Income</DialogTitle>
            <DialogDescription>
              Set your fortnightly income amount and next pay date.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Fortnightly Income Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nextPayDate">Next Pay Date</Label>
              <Input
                id="nextPayDate"
                type="date"
                value={nextPayDate}
                onChange={(e) => setNextPayDate(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
