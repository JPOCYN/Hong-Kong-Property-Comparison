export interface StampDutyRates {
  adValorem: number;
  special: number;
  buyer: number;
}

export const calculateStampDuty = (
  propertyPrice: number,
  isFirstTimeBuyer: boolean
): StampDutyRates => {
  // 2024 Hong Kong Stamp Duty rates
  const adValorem = calculateAdValoremDuty(propertyPrice);
  const special = calculateSpecialStampDuty(propertyPrice, isFirstTimeBuyer);
  const buyer = calculateBuyerStampDuty(propertyPrice, isFirstTimeBuyer);

  return {
    adValorem,
    special,
    buyer,
  };
};

const calculateAdValoremDuty = (price: number): number => {
  // Ad Valorem Stamp Duty (AVD) - 1.5% for residential properties
  return price * 0.015;
};

const calculateSpecialStampDuty = (price: number, isFirstTime: boolean): number => {
  if (isFirstTime) {
    // First-time buyers are exempt from SSD
    return 0;
  }

  // Special Stamp Duty (SSD) rates
  if (price <= 2000000) {
    return price * 0.10; // 10%
  } else if (price <= 2176470) {
    return price * 0.10; // 10%
  } else if (price <= 3000000) {
    return price * 0.10; // 10%
  } else if (price <= 4000000) {
    return price * 0.10; // 10%
  } else if (price <= 6000000) {
    return price * 0.10; // 10%
  } else if (price <= 20000000) {
    return price * 0.10; // 10%
  } else {
    return price * 0.10; // 10%
  }
};

const calculateBuyerStampDuty = (price: number, isFirstTime: boolean): number => {
  if (isFirstTime) {
    // First-time buyers get reduced BSD rates
    if (price <= 2000000) {
      return price * 0.01; // 1%
    } else if (price <= 2176470) {
      return 20000 + (price - 2000000) * 0.10; // Progressive rate
    } else if (price <= 3000000) {
      return 20000 + (price - 2000000) * 0.10;
    } else if (price <= 4000000) {
      return 20000 + (price - 2000000) * 0.10;
    } else if (price <= 6000000) {
      return 20000 + (price - 2000000) * 0.10;
    } else if (price <= 20000000) {
      return 20000 + (price - 2000000) * 0.10;
    } else {
      return 20000 + (price - 2000000) * 0.10;
    }
  } else {
    // Non-first-time buyers pay full BSD
    if (price <= 2000000) {
      return price * 0.015; // 1.5%
    } else if (price <= 2176470) {
      return 30000 + (price - 2000000) * 0.10; // Progressive rate
    } else if (price <= 3000000) {
      return 30000 + (price - 2000000) * 0.10;
    } else if (price <= 4000000) {
      return 30000 + (price - 2000000) * 0.10;
    } else if (price <= 6000000) {
      return 30000 + (price - 2000000) * 0.10;
    } else if (price <= 20000000) {
      return 30000 + (price - 2000000) * 0.10;
    } else {
      return 30000 + (price - 2000000) * 0.10;
    }
  }
};

export const getTotalStampDuty = (rates: StampDutyRates): number => {
  return rates.adValorem + rates.special + rates.buyer;
}; 