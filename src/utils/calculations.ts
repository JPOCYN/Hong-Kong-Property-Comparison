import { calculateStampDuty, getTotalStampDuty } from './stampDuty';
import { calculateMonthlyMortgage, MortgageConfig } from './mortgage';

export type { MortgageConfig } from './mortgage';

export interface Property {
  id: string;
  name: string;
  size: number; // in ft²
  price: number;
  rooms: number;
  toilets: number;
  carParkIncluded: boolean;
  carParkPrice: number;
  managementFee: number;
}

export interface UserFinancials {
  monthlySalary: number;
  downpaymentBudget: number;
  isFirstTimeBuyer: boolean;
  mortgageConfig: MortgageConfig;
  mortgageYears: number;
}

export interface PropertyCalculation {
  property: Property;
  stampDuty: number;
  upfrontCosts: number;
  monthlyMortgage: number;
  monthlyRecurringCosts: number;
  affordabilityPercentage: number;
  costPerSqFt: number;
  totalMonthlyBurden: number;
}

export const calculateRates = (propertyPrice: number): number => {
  // Rates (差餉) - assume 3% annually ÷ 12 = 0.25% monthly
  return (propertyPrice * 0.03) / 12;
};

export const calculateCostPerSqFt = (price: number, size: number): number => {
  return price / size;
};

export const calculateUpfrontCosts = (
  property: Property,
  downpayment: number,
  isFirstTimeBuyer: boolean
): number => {
  const stampDutyRates = calculateStampDuty(property.price, isFirstTimeBuyer);
  const totalStampDuty = getTotalStampDuty(stampDutyRates);
  
  // Upfront costs: downpayment + stamp duty + legal fees + agent fees + parking
  const legalFees = 5000; // Estimated legal fees
  const agentFees = property.price * 0.01; // 1% agent commission
  const parkingCost = property.carParkIncluded ? 0 : property.carParkPrice;
  
  return downpayment + totalStampDuty + legalFees + agentFees + parkingCost;
};

export const calculateMonthlyRecurringCosts = (
  monthlyMortgage: number,
  managementFee: number,
  propertyPrice: number
): number => {
  const rates = calculateRates(propertyPrice);
  return monthlyMortgage + managementFee + rates;
};

export const calculateAffordability = (
  monthlyRecurringCosts: number,
  monthlySalary: number
): number => {
  return (monthlyRecurringCosts / monthlySalary) * 100;
};

export const calculatePropertyDetails = (
  property: Property,
  userFinancials: UserFinancials
): PropertyCalculation => {
  const downpayment = Math.min(
    userFinancials.downpaymentBudget,
    property.price * 0.3 // Assume 30% downpayment
  );
  
  const loanAmount = property.price - downpayment;
  const monthlyMortgage = calculateMonthlyMortgage(
    loanAmount,
    userFinancials.mortgageYears,
    userFinancials.mortgageConfig
  );
  
  const stampDuty = getTotalStampDuty(
    calculateStampDuty(property.price, userFinancials.isFirstTimeBuyer)
  );
  
  const upfrontCosts = calculateUpfrontCosts(
    property,
    downpayment,
    userFinancials.isFirstTimeBuyer
  );
  
  const monthlyRecurringCosts = calculateMonthlyRecurringCosts(
    monthlyMortgage,
    property.managementFee,
    property.price
  );
  
  const affordabilityPercentage = calculateAffordability(
    monthlyRecurringCosts,
    userFinancials.monthlySalary
  );
  
  const costPerSqFt = calculateCostPerSqFt(property.price, property.size);
  
  return {
    property,
    stampDuty,
    upfrontCosts,
    monthlyMortgage,
    monthlyRecurringCosts,
    affordabilityPercentage,
    costPerSqFt,
    totalMonthlyBurden: monthlyRecurringCosts,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-HK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}; 