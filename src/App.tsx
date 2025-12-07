import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Dashboard } from './pages/Dashboard'
import { Allocations } from './pages/Allocations'
import { initializeDatabase } from './lib/db'

function App() {
  useEffect(() => {
    // Initialize the database on app load
    initializeDatabase().catch(console.error)
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/allocations" element={<Allocations />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
