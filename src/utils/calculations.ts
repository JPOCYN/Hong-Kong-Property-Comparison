// Hong Kong Property Calculation Utilities

export interface MortgageCalculation {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  downPayment: number;
  monthlyIncomeRequired: number;
}

export interface StampDutyCalculation {
  basicRate: number;
  adValorem: number;
  specialRate: number;
  totalDuty: number;
  breakdown: {
    basic: number;
    adValorem: number;
    special: number;
  };
}

export interface PropertyComparison {
  propertyId: string;
  totalCost: number;
  monthlyPayment: number;
  totalInterest: number;
  stampDuty: number;
  costPerSqFt: number;
  affordabilityScore: number;
}

// Re-export PropertyCalculation from affordability for backward compatibility
export type { PropertyCalculation } from './affordability';

// Current Hong Kong mortgage rates (as of 2024)
export const CURRENT_RATES = {
  primeRate: 5.875, // HIBOR + 1.5%
  stressTestRate: 7.875, // Prime + 2%
  maxLoanToValue: 0.9, // 90% LTV for first-time buyers
  maxDebtToIncome: 0.5, // 50% DSR
  minDownPayment: 0.1, // 10% minimum
};

// Hong Kong Stamp Duty rates (as of 2024)
export const STAMP_DUTY_RATES = {
  // Basic rate (first $2M)
  basic: {
    threshold: 2000000,
    rate: 0.015, // 1.5%
  },
  // Ad valorem rate (over $2M)
  adValorem: {
    threshold: 2000000,
    rate: 0.075, // 7.5%
  },
  // Special rate (over $3M)
  special: {
    threshold: 3000000,
    rate: 0.15, // 15%
  },
};

/**
 * Calculate mortgage payments and affordability
 */
export function calculateMortgage(
  propertyPrice: number,
  downPayment: number,
  loanTerm: number = 30,
  interestRate: number = CURRENT_RATES.primeRate
): MortgageCalculation {
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Monthly payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  // Calculate required monthly income (50% DSR)
  const monthlyIncomeRequired = (monthlyPayment / CURRENT_RATES.maxDebtToIncome) * 12;

  return {
    loanAmount,
    monthlyPayment,
    totalInterest,
    totalPayment,
    downPayment,
    monthlyIncomeRequired,
  };
}

/**
 * Calculate Hong Kong Stamp Duty
 */
export function calculateStampDuty(propertyPrice: number): StampDutyCalculation {
  let basicDuty = 0;
  let adValoremDuty = 0;
  let specialDuty = 0;

  // Basic rate (first $2M)
  if (propertyPrice <= STAMP_DUTY_RATES.basic.threshold) {
    basicDuty = propertyPrice * STAMP_DUTY_RATES.basic.rate;
  } else {
    basicDuty = STAMP_DUTY_RATES.basic.threshold * STAMP_DUTY_RATES.basic.rate;
  }

  // Ad valorem rate (over $2M)
  if (propertyPrice > STAMP_DUTY_RATES.adValorem.threshold) {
    const adValoremAmount = propertyPrice - STAMP_DUTY_RATES.adValorem.threshold;
    adValoremDuty = adValoremAmount * STAMP_DUTY_RATES.adValorem.rate;
  }

  // Special rate (over $3M)
  if (propertyPrice > STAMP_DUTY_RATES.special.threshold) {
    const specialAmount = propertyPrice - STAMP_DUTY_RATES.special.threshold;
    specialDuty = specialAmount * STAMP_DUTY_RATES.special.rate;
  }

  const totalDuty = basicDuty + adValoremDuty + specialDuty;

  return {
    basicRate: STAMP_DUTY_RATES.basic.rate * 100,
    adValorem: STAMP_DUTY_RATES.adValorem.rate * 100,
    specialRate: STAMP_DUTY_RATES.special.rate * 100,
    totalDuty,
    breakdown: {
      basic: basicDuty,
      adValorem: adValoremDuty,
      special: specialDuty,
    },
  };
}

/**
 * Calculate cost per square foot
 */
export function calculateCostPerSqFt(propertyPrice: number, size: number): number {
  if (size <= 0) return 0;
  return propertyPrice / size;
}

/**
 * Calculate total property cost including stamp duty
 */
export function calculateTotalCost(
  propertyPrice: number,
  stampDuty: number,
  legalFees: number = 0
): number {
  return propertyPrice + stampDuty + legalFees;
}

/**
 * Calculate affordability score (0-100) based on maximum monthly payment
 */
export function calculateAffordabilityScore(
  maxMonthlyPayment: number,
  monthlyPayment: number,
  otherDebts: number = 0
): number {
  const totalMonthlyDebt = monthlyPayment + otherDebts;
  const paymentRatio = totalMonthlyDebt / maxMonthlyPayment;
  
  // Score based on payment ratio (lower is better)
  if (paymentRatio <= 0.5) return 100;
  if (paymentRatio <= 0.7) return 80;
  if (paymentRatio <= 0.9) return 60;
  if (paymentRatio <= 1.0) return 40;
  if (paymentRatio <= 1.2) return 20;
  return 0;
}

/**
 * Calculate maximum loan amount based on maximum monthly payment
 */
export function calculateMaxLoanAmount(
  maxMonthlyPayment: number,
  loanTerm: number = 30,
  interestRate: number = CURRENT_RATES.primeRate
): number {
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Reverse mortgage formula to find loan amount
  const maxLoanAmount = maxMonthlyPayment * 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

  return Math.floor(maxLoanAmount);
}

/**
 * Calculate maximum property price based on down payment and maximum monthly payment
 */
export function calculateMaxPropertyPrice(
  downPayment: number,
  maxMonthlyPayment: number,
  loanTerm: number = 30
): number {
  const maxLoanAmount = calculateMaxLoanAmount(maxMonthlyPayment, loanTerm);
  const maxPropertyPrice = downPayment + maxLoanAmount;
  
  return Math.floor(maxPropertyPrice);
}

/**
 * Format currency for display with full HK$ and thousand separators
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(amount);
}

/**
 * Format number for display
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('zh-HK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage for display with one decimal place
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Convert HKD 萬 to actual amount
 */
export function convertWanToHKD(wanAmount: number): number {
  return wanAmount * 10000;
}

/**
 * Convert actual amount to HKD 萬
 */
export function convertHKDToWan(hkdAmount: number): number {
  return hkdAmount / 10000;
}

/**
 * Calculate monthly management fee
 */
export function calculateManagementFee(
  size: number,
  feePerSqFt: number = 3.5
): number {
  return size * feePerSqFt;
}

/**
 * Calculate total monthly costs
 */
export function calculateTotalMonthlyCosts(
  mortgagePayment: number,
  managementFee: number,
  utilities: number = 0,
  insurance: number = 0
): number {
  return mortgagePayment + managementFee + utilities + insurance;
}

/**
 * Compare properties and return ranking
 */
export function compareProperties(
  properties: Array<{
    id: string;
    price: number;
    size: number;
    monthlyPayment: number;
    totalCost: number;
    costPerSqFt: number;
  }>
): PropertyComparison[] {
  return properties
    .map(property => ({
      propertyId: property.id,
      totalCost: property.totalCost,
      monthlyPayment: property.monthlyPayment,
      totalInterest: 0, // Would need mortgage calculation
      stampDuty: 0, // Would need stamp duty calculation
      costPerSqFt: property.costPerSqFt,
      affordabilityScore: 0, // Would need income data
    }))
    .sort((a, b) => a.costPerSqFt - b.costPerSqFt); // Sort by cost per sq ft
}

/**
 * Validate property data
 */
export function validatePropertyData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Property name is required');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Property price must be greater than 0');
  }

  if (!data.size || data.size <= 0) {
    errors.push('Property size must be greater than 0');
  }

  if (!data.district || data.district.trim() === '') {
    errors.push('District is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get mortgage rate based on loan amount and LTV
 */
export function getMortgageRate(
  loanAmount: number,
  propertyPrice: number,
  isFirstTimeBuyer: boolean = true
): number {
  const ltv = loanAmount / propertyPrice;
  
  // Higher LTV = higher rate
  if (ltv <= 0.6) return CURRENT_RATES.primeRate - 0.25;
  if (ltv <= 0.7) return CURRENT_RATES.primeRate - 0.1;
  if (ltv <= 0.8) return CURRENT_RATES.primeRate;
  if (ltv <= 0.9) return CURRENT_RATES.primeRate + 0.1;
  
  return CURRENT_RATES.primeRate + 0.25;
}

/**
 * Calculate property details for comparison (legacy function)
 */
export function calculatePropertyDetails(property: any, userFinancials: any) {
  // This is a legacy function for backward compatibility
  // It should be replaced with the new affordability calculations
  
  // Calculate upfront costs first
  const stampDuty = calculateStampDuty(property.price);
  const legalFees = 5000; // Estimated legal fees
  const agentFees = property.price * 0.01; // 1% agent commission
  const upfrontCosts = stampDuty.totalDuty + legalFees + agentFees;
  
  // Calculate available funds for downpayment after covering upfront costs
  const availableForDownpayment = userFinancials.downpaymentBudget - upfrontCosts;
  
  // Use all available funds for downpayment to minimize mortgage ratio
  const actualDownpayment = Math.max(0, Math.min(availableForDownpayment, property.price * 0.9)); // Cap at 90% of property price
  
  const loanAmount = property.price - actualDownpayment;
  const monthlyMortgage = calculateMortgage(loanAmount, property.price, 30);
  const monthlyRecurringCosts = monthlyMortgage.monthlyPayment + property.managementFee;
  const affordabilityPercentage = (monthlyRecurringCosts / userFinancials.maxMonthlyPayment) * 100;
  const ratesPerMonth = (property.price * 0.03) / 12; // 3% annually
  
      return {
      property,
      monthlyMortgage: monthlyMortgage.monthlyPayment,
      monthlyRecurringCosts,
      affordabilityPercentage,
      affordabilityStatus: (affordabilityPercentage <= 80 ? 'affordable' : affordabilityPercentage <= 100 ? 'moderate' : 'expensive') as 'affordable' | 'moderate' | 'expensive',
      upfrontCosts: upfrontCosts + actualDownpayment,
      costPerSqFt: calculateCostPerSqFt(property.price, property.size),
      stampDuty: stampDuty.totalDuty,
      ratesPerMonth,
      totalMonthlyBurden: monthlyRecurringCosts,
    };
} 