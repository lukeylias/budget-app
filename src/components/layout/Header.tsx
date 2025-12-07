import { DollarSign } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function Header() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-card">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center transition-all">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Budget App</h1>
          </Link>

          <div className="flex gap-6">
            <Link
              to="/"
              className={cn(
                "text-sm font-semibold transition-colors hover:text-primary",
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/allocations"
              className={cn(
                "text-sm font-semibold transition-colors hover:text-primary",
                isActive('/allocations') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Allocations
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
