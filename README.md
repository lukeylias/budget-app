# Personal Budgeting App

A local-first, zero-dollar budgeting web application for managing fortnightly income allocation across expenses, savings, and investments.

## Features

### Phase 1 ✅ Complete - Foundation
- ✅ Dashboard with safe-to-spend calculation
- ✅ Account management (CRUD) with modal interface
- ✅ Allocation management (CRUD) with modal interface
- ✅ Allocations list view with category grouping
- ✅ Per-fortnight calculations
- ✅ Income setup and editing
- ✅ Manual balance updates
- ✅ Data persistence with IndexedDB
- ✅ Responsive design (mobile + desktop)
- ✅ Light/dark theme support
- ✅ Click-to-edit functionality for accounts and allocations
- ✅ Progress tracking for allocations
- ✅ Category filtering (All, Expenses, Savings, Investments)

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Date handling**: date-fns
- **Database**: IndexedDB (via Dexie.js)
- **Build tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Card, etc.)
│   ├── dashboard/       # Dashboard-specific components
│   ├── allocations/     # Allocation components
│   ├── modals/          # Modal components
│   └── layout/          # Layout components (Header, etc.)
├── lib/
│   ├── db.ts            # IndexedDB setup with Dexie
│   ├── calculations.ts  # Budget calculation utilities
│   └── utils.ts         # Helper functions
├── types/               # TypeScript interfaces
├── pages/               # Page components (Dashboard, Allocations)
└── App.tsx              # Main app component with routing
```

## Data Models

### Account
Represents a bank account (UP, ING) with type (spending, expenses, savings, etc.)

### Allocation
Represents a budgeted item (expense, saving, or investment) with:
- Total amount
- Frequency (weekly, fortnightly, monthly, quarterly, yearly)
- Due date
- Progress tracking (amount already saved)

### Income
Represents fortnightly income with next pay date

### Settings
App-wide settings including currency, date format, and theme

## Calculation Logic

### Fortnightly Allocation Amount
```
fortnightlyAmount = totalAmount / frequency_in_fortnights

Where frequency_in_fortnights:
- fortnightly: 1
- weekly: 0.5
- monthly: 2.17 (52 weeks / 12 months / 2)
- quarterly: 6.5 (26 fortnights / 4)
- yearly: 26
```

### Safe to Spend
```
safeToSpend = income.amount - sum(all_active_allocations.fortnightlyAmount)
```

## Roadmap

### Phase 2 ✅ Complete - Enhanced UX
- ✅ Calendar view for allocations with month navigation
- ✅ List/Calendar view toggle
- ✅ Progress tracking visualization with color-coded progress bars
- ✅ Color picker for accounts and allocations
- ✅ Visual improvements and better UI feedback

### Phase 3 - Future Enhancements
- [ ] Icon picker for allocations with 30+ options
- [ ] Drag-to-reorder allocations within categories
- [ ] Category breakdown donut charts
- [ ] PWA with offline support
- [ ] Data export/import (JSON)
- [ ] Settings page
- [ ] Keyboard shortcuts
- [ ] Search/filter allocations
- [ ] Allocation history/audit log

## License

Personal project - MIT License

## Contributing

This is a personal project built for self-use. Feel free to fork and adapt for your own needs!
