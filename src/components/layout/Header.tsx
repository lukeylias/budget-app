import { DollarSign } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function Header() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b-4 border-black bg-card">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-12 h-12 bg-primary border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              <DollarSign className="h-6 w-6 text-black font-black" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight">Budget App</h1>
          </Link>

          <div className="flex gap-6">
            <Link
              to="/"
              className={cn(
                "text-sm font-bold uppercase tracking-wider transition-colors hover:text-primary",
                isActive('/') ? 'text-primary' : 'text-foreground'
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/allocations"
              className={cn(
                "text-sm font-bold uppercase tracking-wider transition-colors hover:text-primary",
                isActive('/allocations') ? 'text-primary' : 'text-foreground'
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
