# 🏠 Hong Kong Property Comparison Tool

A comprehensive web application for comparing Hong Kong properties with intelligent autocomplete and detailed financial calculations. Features a modern SaaS-style landing page and powerful comparison tools.

## 🌟 New Landing Page

The app now includes a professional landing page with:
- **Modern SaaS Design**: Clean, professional layout with gradient backgrounds
- **Feature Showcase**: 6 key features with icons and descriptions
- **How It Works**: 3-step process explanation
- **Clear CTAs**: Multiple call-to-action buttons
- **Responsive Design**: Mobile-optimized layout
- **Hong Kong Localization**: Bilingual content (English/Chinese)

### Landing Page Features
- **Hero Section**: Compelling headline with dual CTAs
- **Feature Grid**: Mortgage calculator, stamp duty analysis, autocomplete, PDF export, mobile optimization, privacy-first
- **Process Steps**: Add properties → Set budget → Compare & decide
- **Footer**: Comprehensive links and information

## ✨ Features

### 🎯 Core Functionality
- **3-Step Property Comparison**: Buyer info → Property input → Results
- **Intelligent Autocomplete**: Smart estate name suggestions with auto-fill
- **Financial Calculations**: Mortgage, stamp duty, affordability analysis
- **Multi-language Support**: English and Traditional Chinese
- **Responsive Design**: Optimized for desktop and mobile
- **PDF Export**: Download comparison results with Chinese text support

### 🏢 Property Data
- **40+ Hong Kong Estates**: Real property data with addresses, districts, building ages
- **Price per ft²**: Current market prices
- **School Nets**: Primary school district information (optional manual input)
- **Building Ages**: Property age data for mortgage considerations
- **Management Fees**: Monthly property management costs
- **Parking Options**: Included, additional, or no parking

### 💰 Financial Calculations
- **Mortgage Calculator**: Monthly payments, interest, loan amounts
- **Stamp Duty**: Hong Kong property tax calculations (Basic, Ad Valorem, Special)
- **Affordability Analysis**: Based on maximum monthly payment input
- **Upfront Costs**: Stamp duty, legal fees, agent commission, parking
- **Management Fees**: Monthly property management costs
- **Cost per ft²**: Property value analysis

### 🎨 Enhanced UI/UX
- **Card-based Comparison**: Clean, modern comparison layout
- **Quick Edit**: Inline budget adjustments on results page
- **Simplified Forms**: Streamlined property input with better flow
- **Color-coded Warnings**: Visual indicators for affordability status
- **Progressive Disclosure**: Information shown when needed
- **Mobile-optimized**: Responsive design for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Hong-Kong-Property-Comparison

# Install dependencies
npm install

# Install scraper dependencies
npm install puppeteer --save-dev
```

### Development
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Data Scraping
```bash
# Run the property data scraper
npm run scrape

# This will:
# 1. Scrape Hong Kong property data from Centadata
# 2. Save to /public/estateData.json
# 3. Enable autocomplete functionality
```

## 📁 Project Structure

```
Hong-Kong-Property-Comparison/
├── public/
│   └── estateData.json          # Property database
├── scripts/
│   └── scraper.js              # Data scraper
├── src/
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   │   ├── Input/             # Step 1: Buyer info
│   │   ├── Property/          # Step 2: Property input
│   │   ├── Comparison/        # Step 3: Results
│   │   └── UI/               # Shared UI components
│   ├── store/                 # Zustand state management
│   ├── utils/                 # Utilities and calculations
│   └── types/                 # TypeScript types
└── README.md
```

## 🔧 Scraper Configuration

### Features
- **Rate Limiting**: 1000ms delay between requests
- **User Agent Rotation**: Prevents blocking
- **Error Handling**: Graceful fallback to sample data
- **Data Validation**: Removes duplicates and validates format

### Districts Covered
- **Hong Kong Island**: 中西區, 灣仔, 東區, 南區
- **Kowloon**: 油尖旺, 深水埗, 九龍城, 黃大仙, 觀塘
- **New Territories**: 荃灣, 屯門, 元朗, 北區, 大埔, 西貢, 沙田, 葵青, 離島

### Data Format
```json
{
  "name": "泓都",
  "address": "西營盤第三街",
  "district": "中西區",
  "region": "港島",
  "buildingAge": "15",
  "schoolNet": "11",
  "pricePerFt": "$22,651"
}
```

## 💡 Usage Guide

### Step 1: Buyer Information
- Enter maximum monthly payment (最大月供款)
- Set downpayment budget in 萬 HKD (首期預算)
- Choose first-time buyer status
- View current mortgage rates

### Step 2: Property Input
- **Autocomplete**: Start typing estate name for suggestions
- **Auto-fill**: Select estate to populate district, age, school net
- **Smart Validation**: Real-time cost per ft² feedback
- **Multiple Properties**: Compare up to 3 properties
- **Simplified Parking**: Dropdown selection with conditional price input
- **Management Fees**: Monthly property management costs
- **School Net**: Optional manual input (no auto-fill)

### Step 3: Comparison Results
- **Card-based Layout**: Clean, modern comparison design
- **Quick Edit Section**: Adjust budget settings directly on results page
- **Financial Breakdown**: Mortgage, stamp duty, monthly costs
- **Upfront Costs**: Detailed breakdown of stamp duty, legal fees, agent fees
- **Management Fees**: Monthly property management costs
- **Affordability Analysis**: Based on maximum monthly payment
- **PDF Export**: Download detailed comparison with proper Chinese text

## 🛠️ Technical Stack

### Frontend
- **Next.js 14**: React framework with app directory
- **TypeScript**: Type safety and better DX
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management with persistence

### Data & Calculations
- **Puppeteer**: Web scraping for property data
- **Custom Calculations**: Hong Kong-specific financial formulas
- **Local Storage**: Persistent user data
- **jsPDF**: PDF generation with Chinese text support

### Deployment
- **Vercel**: Recommended hosting platform
- **Static Export**: Can be deployed anywhere

## 📊 Financial Calculations

### Mortgage Rates (2024)
- **Prime Rate**: 5.875% (HIBOR + 1.5%)
- **Stress Test**: 7.875% (Prime + 2%)
- **Max LTV**: 90% for first-time buyers
- **Max DSR**: 50% debt-to-income ratio

### Stamp Duty Rates
- **Basic Rate**: 1.5% (first $2M)
- **Ad Valorem**: 7.5% (over $2M)
- **Special Rate**: 15% (over $3M)

### Upfront Costs Formula
```
Upfront Costs = Stamp Duty + Legal Fees ($5,000) + Agent Commission (1%) + Parking Cost
```

### Management Fees
- **Average Rate**: HK$2.7 per square foot
- **Industry Standard**: Common rate for Hong Kong properties

## 🎨 UI/UX Improvements

### Recent Enhancements
- **Simplified Property Input**: Streamlined forms with better flow
- **Card-based Results**: Modern comparison layout with clear sections
- **Quick Edit Feature**: Inline budget adjustments on results page
- **Color-coded Warnings**: Visual indicators for affordability status
- **Progressive Disclosure**: Information shown when needed
- **Mobile-optimized**: Responsive design for all devices

### Form Improvements
- **Parking UI**: Compact dropdown with conditional price input
- **School Net**: Plain text input without auto-fill
- **Management Fees**: Monthly costs with per sq ft rate suggestion
- **Budget Inputs**: 萬 HKD units for better understanding

## 🔒 Privacy & Data

- **Client-side Only**: No backend required
- **Local Storage**: Data stays on user's device
- **No Tracking**: No analytics or user tracking
- **Open Source**: Transparent codebase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check existing issues
2. Create a new issue with detailed description
3. Include browser/OS information

---

**Built with ❤️ for Hong Kong property buyers** 