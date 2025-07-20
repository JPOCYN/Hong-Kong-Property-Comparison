export type MortgageType = 'H-mortgage' | 'P-mortgage' | 'manual';

export interface MortgageConfig {
  type: MortgageType;
  hibor?: number; // Default: 1.07%
  hSpread?: number; // Default: 1.3%
  prime?: number; // Default: 5.25%
  pDiscount?: number; // Default: 2.0%
  manualRate?: number; // For manual input
}

export const calculateMonthlyMortgage = (
  loanAmount: number,
  years: number,
  config: MortgageConfig
): number => {
  const monthlyRate = getMonthlyRate(config);
  const totalMonths = years * 12;
  
  // Standard Amortization Formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  // Where: P = monthly payment, L = loan amount, c = monthly interest rate, n = total number of payments
  const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
  const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
  
  return numerator / denominator;
};

const getMonthlyRate = (config: MortgageConfig): number => {
  let annualRate: number;
  
  switch (config.type) {
    case 'H-mortgage':
      const hRate = (config.hibor || 1.07) + (config.hSpread || 1.3);
      annualRate = hRate;
      break;
    case 'P-mortgage':
      const pRate = (config.prime || 5.25) - (config.pDiscount || 2.0);
      annualRate = pRate;
      break;
    case 'manual':
      annualRate = config.manualRate || 4.125;
      break;
    default:
      annualRate = 4.125; // Default fallback
  }
  
  return annualRate / 100 / 12; // Convert to monthly decimal rate
};

export const calculateTotalInterest = (
  loanAmount: number,
  years: number,
  monthlyPayment: number
): number => {
  const totalPayments = monthlyPayment * years * 12;
  return totalPayments - loanAmount;
};

export const getMortgageTypeLabel = (type: MortgageType): string => {
  switch (type) {
    case 'H-mortgage':
      return 'HIBOR Mortgage';
    case 'P-mortgage':
      return 'Prime Rate Mortgage';
    case 'manual':
      return 'Manual Rate';
    default:
      return 'Unknown';
  }
}; 