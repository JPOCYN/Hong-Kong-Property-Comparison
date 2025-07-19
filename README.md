# Hong Kong Property Comparison Tool

A modern, responsive web application for Hong Kong residents comparing residential properties for self-use (自住買樓). Built with React (Next.js), TailwindCSS, and Zustand for state management.

## 🌟 Features

### User Financial Input
- Monthly salary input
- Downpayment budget setting
- First-time buyer toggle (首置)
- Mortgage type selection:
  - HIBOR Mortgage (H + X%) - Default HIBOR: 1.07%, Spread: 1.3%
  - Prime Rate Mortgage (Prime – Y%) - Default Prime: 5.25%, Discount: 2.0%
  - Manual rate input

### Property Comparison
- Add up to 3 properties for comparison
- Input property details:
  - Name and size (ft²)
  - Total price
  - Room and toilet count
  - Car park inclusion/price
  - Monthly management fee

### Comprehensive Calculations
- **Stamp Duty**: Based on 2024 HK first-time buyer policies
- **Upfront Costs**: Downpayment, stamp duty, legal fees, agent fees, parking
- **Monthly Mortgage**: Calculated using standard mortgage formula
- **Recurring Costs**: Mortgage + management fee + rates (差餉)
- **Affordability Analysis**: Monthly burden vs income percentage

### Results Display
- Side-by-side comparison table
- Cost per square foot analysis
- Affordability indicators with color coding
- Best value property highlighting
- Summary statistics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JPOCYN/Hong-Kong-Property-Comparison.git
cd Hong-Kong-Property-Comparison
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧱 Technical Stack

- **Frontend**: React 18 with Next.js 14
- **Styling**: TailwindCSS
- **State Management**: Zustand with persistence
- **Language**: TypeScript
- **Build Tool**: Next.js built-in bundler

## 📐 Calculation Formulas

### Monthly Mortgage Payment
```
Monthly Payment = (Loan × r × (1 + r)^n) / ((1 + r)^n – 1)
```
Where:
- r = monthly interest rate
- n = total number of months

### Stamp Duty (2024 HK Rules)
- **Ad Valorem Stamp Duty**: 1.5% of property price
- **Special Stamp Duty**: 10% for non-first-time buyers
- **Buyer's Stamp Duty**: Progressive rates based on price tiers

### Rates (差餉)
- Estimated at 3% annually ÷ 12 = 0.25% monthly of property price

## 🌐 Internationalization

The app supports both English and Traditional Chinese (繁體中文) with a language toggle in the header.

## 💾 Data Persistence

User data is automatically saved to localStorage using Zustand's persist middleware, so your financial settings and property comparisons will be preserved between sessions.

## 📱 Responsive Design

The application is built with a mobile-first approach using TailwindCSS, ensuring optimal experience across all device sizes.

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/          # React components
│   ├── FinancialInput.tsx
│   ├── PropertyInput.tsx
│   ├── ComparisonResults.tsx
│   └── LanguageToggle.tsx
├── store/              # Zustand store
│   └── propertyStore.ts
└── utils/              # Utility functions
    ├── calculations.ts
    ├── mortgage.ts
    ├── stampDuty.ts
    └── translations.ts
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for Hong Kong property buyers 