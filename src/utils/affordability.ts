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
  monthlyMortgage: number,
  maxMonthlyPayment: number
): number => {
  return (monthlyMortgage / maxMonthlyPayment) * 100;
};

export const getAffordabilityStatus = (percentage: number): 'affordable' | 'moderate' | 'expensive' => {
  if (percentage <= 80) return 'affordable';
  if (percentage <= 100) return 'moderate';
  return 'expensive';
};

export const calculatePropertyAffordability = (
  property: Property,
  buyerInfo: BuyerInfo
): PropertyCalculation => {
  // Calculate upfront costs first (stamp duty, legal fees, agent fees, parking)
  const stampDuty = getTotalStampDuty(
    calculateStampDuty(property.price, buyerInfo.isFirstTimeBuyer)
  );
  
  const legalFees = 5000; // Estimated legal fees
  const agentFees = property.price * 0.01; // 1% agent commission
  const parkingCost = property.carParkIncluded ? 0 : property.carParkPrice;
  const upfrontCosts = stampDuty + legalFees + agentFees + parkingCost;
  
  // Calculate available funds for downpayment after covering upfront costs
  const availableForDownpayment = buyerInfo.downpaymentBudget - upfrontCosts;
  
  // Use all available funds for downpayment to minimize mortgage ratio
  const actualDownpayment = Math.max(0, Math.min(availableForDownpayment, property.price * 0.9)); // Cap at 90% of property price
  
  const loanAmount = property.price - actualDownpayment;
  
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
  
  // Use the already calculated stamp duty and upfront costs
  const totalUpfrontCosts = upfrontCosts;
  
  const monthlyRecurringCosts = calculateMonthlyRecurringCosts(
    monthlyMortgage,
    property.managementFee,
    property.price
  );
  
  const affordabilityPercentage = calculateAffordability(
    monthlyMortgage,
    buyerInfo.maxMonthlyPayment
  );
  
  const costPerSqFt = calculateCostPerSqFt(property.price, property.size);
  const ratesPerMonth = calculateRates(property.price);
  
  return {
    property,
    monthlyMortgage,
    monthlyRecurringCosts,
    affordabilityPercentage,
    affordabilityStatus: getAffordabilityStatus(affordabilityPercentage),
    upfrontCosts: totalUpfrontCosts,
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