import { BuyerInfo, Property } from '@/store/useAppStore';
import { calculateMonthlyMortgage, MortgageConfig } from './mortgage';
import { calculateStampDuty, getTotalStampDuty } from './stampDuty';

export interface AffordabilityAnalysis {
  monthlyMortgage: number;
  monthlyRecurringCosts: number;
  affordabilityPercentage: number;
  affordabilityStatus: 'affordable' | 'moderate' | 'expensive';
  upfrontCosts: number;
  costPerSqFt: number;
  ratesPerMonth: number;
  totalMonthlyBurden: number;
}

export interface PropertyCalculation extends AffordabilityAnalysis {
  property: Property;
  stampDuty: number;
}

export const calculateRates = (propertyPrice: number): number => {
  // Rates (差餉) - 3% annually ÷ 12 = 0.25% monthly
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
  monthlyIncome: number
): number => {
  return (monthlyRecurringCosts / monthlyIncome) * 100;
};

export const getAffordabilityStatus = (percentage: number): 'affordable' | 'moderate' | 'expensive' => {
  if (percentage <= 40) return 'affordable';
  if (percentage <= 60) return 'moderate';
  return 'expensive';
};

export const calculatePropertyAffordability = (
  property: Property,
  buyerInfo: BuyerInfo
): PropertyCalculation => {
  const downpayment = Math.min(
    buyerInfo.downpaymentBudget,
    property.price * 0.3 // Assume 30% downpayment
  );
  
  const loanAmount = property.price - downpayment;
  
  // Create mortgage config from buyer info
  const mortgageConfig: MortgageConfig = {
    type: buyerInfo.mortgageType,
    hibor: buyerInfo.hiborRate,
    hSpread: buyerInfo.hiborSpread,
    prime: buyerInfo.primeRate,
    pDiscount: buyerInfo.primeDiscount,
    manualRate: buyerInfo.manualRate,
  };
  
  const monthlyMortgage = calculateMonthlyMortgage(
    loanAmount,
    buyerInfo.mortgageYears,
    mortgageConfig
  );
  
  const stampDuty = getTotalStampDuty(
    calculateStampDuty(property.price, buyerInfo.isFirstTimeBuyer)
  );
  
  const upfrontCosts = calculateUpfrontCosts(
    property,
    downpayment,
    buyerInfo.isFirstTimeBuyer
  );
  
  const monthlyRecurringCosts = calculateMonthlyRecurringCosts(
    monthlyMortgage,
    property.managementFee,
    property.price
  );
  
  const affordabilityPercentage = calculateAffordability(
    monthlyRecurringCosts,
    buyerInfo.monthlyIncome
  );
  
  const costPerSqFt = calculateCostPerSqFt(property.price, property.size);
  const ratesPerMonth = calculateRates(property.price);
  
  return {
    property,
    monthlyMortgage,
    monthlyRecurringCosts,
    affordabilityPercentage,
    affordabilityStatus: getAffordabilityStatus(affordabilityPercentage),
    upfrontCosts,
    costPerSqFt,
    ratesPerMonth,
    totalMonthlyBurden: monthlyRecurringCosts,
    stampDuty,
  };
};

export const estimateManagementFee = (size: number): number => {
  // Estimate management fee based on size: $2.5/ft²
  return size * 2.5;
};

export const getAffordabilityColor = (status: 'affordable' | 'moderate' | 'expensive'): string => {
  switch (status) {
    case 'affordable':
      return 'text-success-600';
    case 'moderate':
      return 'text-warning-600';
    case 'expensive':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getAffordabilityBackgroundColor = (status: 'affordable' | 'moderate' | 'expensive'): string => {
  switch (status) {
    case 'affordable':
      return 'bg-success-50';
    case 'moderate':
      return 'bg-warning-50';
    case 'expensive':
      return 'bg-red-50';
    default:
      return 'bg-gray-50';
  }
}; 