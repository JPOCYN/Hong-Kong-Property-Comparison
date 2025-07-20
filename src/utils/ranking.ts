import { PropertyCalculation } from './affordability';

export interface RankingScore {
  propertyId: string;
  totalScore: number;
  priceScore: number;
  sizeScore: number;
  roomsScore: number;
  toiletsScore: number;
  parkingScore: number;
  affordabilityScore: number;
  costPerSqFtScore: number;
  buildingAgeScore: number;
  breakdown: {
    price: { score: number; weight: number; reason: string };
    size: { score: number; weight: number; reason: string };
    rooms: { score: number; weight: number; reason: string };
    toilets: { score: number; weight: number; reason: string };
    parking: { score: number; weight: number; reason: string };
    affordability: { score: number; weight: number; reason: string };
    costPerSqFt: { score: number; weight: number; reason: string };
    buildingAge: { score: number; weight: number; reason: string };
  };
}

/**
 * Hong Kong Property Ranking Algorithm
 * Based on local buyer preferences and market conditions
 */
export function calculateHongKongRanking(
  calculations: PropertyCalculation[]
): RankingScore[] {
  if (calculations.length === 0) return [];

  // Get min/max values for normalization
  const prices = calculations.map(c => c.property.price);
  const sizes = calculations.map(c => c.property.size);
  const affordabilityPercentages = calculations.map(c => c.affordabilityPercentage);
  const costPerSqFtValues = calculations.map(c => c.costPerSqFt);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  const minAffordability = Math.min(...affordabilityPercentages);
  const maxAffordability = Math.max(...affordabilityPercentages);
  const minCostPerSqFt = Math.min(...costPerSqFtValues);
  const maxCostPerSqFt = Math.max(...costPerSqFtValues);

  return calculations.map(calc => {
    const property = calc.property;

    // 1. 價錢 (Price) - Lower is better (30% weight)
    const priceScore = maxPrice === minPrice ? 100 : 
      Math.max(0, 100 - ((property.price - minPrice) / (maxPrice - minPrice)) * 100);
    
    // 2. 尺數 (Size) - Higher is better (20% weight)
    const sizeScore = maxSize === minSize ? 100 : 
      ((property.size - minSize) / (maxSize - minSize)) * 100;
    
    // 3. 房數 (Rooms) - More is better (15% weight)
    const roomsScore = Math.min(100, property.rooms * 25); // 4+ rooms = 100%
    
    // 4. 廁所 (Toilets) - More is better (10% weight)
    const toiletsScore = Math.min(100, property.toilets * 50); // 2+ toilets = 100%
    
    // 5. 車位 (Parking) - Has parking is better (10% weight)
    const parkingScore = property.carParkIncluded ? 100 : 
      (property.carParkPrice > 0 ? 50 : 0); // Included = 100%, Additional cost = 50%, None = 0
    
    // 6. 負擔能力 (Affordability) - Lower percentage is better (10% weight)
    const affordabilityScore = maxAffordability === minAffordability ? 100 :
      Math.max(0, 100 - ((calc.affordabilityPercentage - minAffordability) / (maxAffordability - minAffordability)) * 100);
    
    // 7. 呎價 (Cost per sq ft) - Lower is better (3% weight)
    const costPerSqFtScore = maxCostPerSqFt === minCostPerSqFt ? 100 :
      Math.max(0, 100 - ((calc.costPerSqFt - minCostPerSqFt) / (maxCostPerSqFt - minCostPerSqFt)) * 100);
    
    // 8. 樓齡 (Building Age) - Younger is better (2% weight)
    const buildingAgeScore = Math.max(0, 100 - (property.buildingAge * 2)); // 50 years = 0%, 0 years = 100%

    // Calculate weighted total score
    const weights = {
      price: 0.30,
      size: 0.20,
      rooms: 0.15,
      toilets: 0.10,
      parking: 0.10,
      affordability: 0.10,
      costPerSqFt: 0.03,
      buildingAge: 0.02
    };

    const totalScore = 
      priceScore * weights.price +
      sizeScore * weights.size +
      roomsScore * weights.rooms +
      toiletsScore * weights.toilets +
      parkingScore * weights.parking +
      affordabilityScore * weights.affordability +
      costPerSqFtScore * weights.costPerSqFt +
      buildingAgeScore * weights.buildingAge;

    // Generate reasoning for each factor
    const breakdown = {
      price: {
        score: priceScore,
        weight: weights.price,
        reason: priceScore >= 80 ? '價格合理' : priceScore >= 60 ? '價格中等' : '價格偏高'
      },
      size: {
        score: sizeScore,
        weight: weights.size,
        reason: sizeScore >= 80 ? '面積寬敞' : sizeScore >= 60 ? '面積適中' : '面積偏小'
      },
      rooms: {
        score: roomsScore,
        weight: weights.rooms,
        reason: property.rooms >= 3 ? '房間充足' : property.rooms >= 2 ? '房間適中' : '房間偏少'
      },
      toilets: {
        score: toiletsScore,
        weight: weights.toilets,
        reason: property.toilets >= 2 ? '廁所充足' : '廁所偏少'
      },
      parking: {
        score: parkingScore,
        weight: weights.parking,
        reason: property.carParkIncluded ? '車位已包' : property.carParkPrice > 0 ? '車位另購' : '無車位'
      },
      affordability: {
        score: affordabilityScore,
        weight: weights.affordability,
        reason: calc.affordabilityPercentage <= 80 ? '負擔輕鬆' : 
                calc.affordabilityPercentage <= 100 ? '負擔可接受' : '負擔較重'
      },
      costPerSqFt: {
        score: costPerSqFtScore,
        weight: weights.costPerSqFt,
        reason: costPerSqFtScore >= 80 ? '呎價合理' : costPerSqFtScore >= 60 ? '呎價中等' : '呎價偏高'
      },
      buildingAge: {
        score: buildingAgeScore,
        weight: weights.buildingAge,
        reason: property.buildingAge <= 10 ? '樓齡新' : 
                property.buildingAge <= 20 ? '樓齡中等' : '樓齡較舊'
      }
    };

    return {
      propertyId: property.id,
      totalScore,
      priceScore,
      sizeScore,
      roomsScore,
      toiletsScore,
      parkingScore,
      affordabilityScore,
      costPerSqFtScore,
      buildingAgeScore,
      breakdown
    };
  }).sort((a, b) => b.totalScore - a.totalScore); // Sort by total score (highest first)
}

/**
 * Get ranking explanation for a property
 */
export function getRankingExplanation(ranking: RankingScore, language: 'en' | 'zh' = 'zh'): string {
  const topFactors = Object.entries(ranking.breakdown)
    .sort(([,a], [,b]) => (b.score * b.weight) - (a.score * a.weight))
    .slice(0, 3);

  if (language === 'zh') {
    const factors = topFactors.map(([key, factor]) => factor.reason).join('、');
    return `主要優勢：${factors}`;
  } else {
    const factors = topFactors.map(([key, factor]) => {
      const factorNames = {
        price: 'Price',
        size: 'Size',
        rooms: 'Rooms',
        toilets: 'Toilets',
        parking: 'Parking',
        affordability: 'Affordability',
        costPerSqFt: 'Cost per ft²',
        buildingAge: 'Building Age'
      };
      return `${factorNames[key as keyof typeof factorNames]} (${factor.score.toFixed(0)}%)`;
    }).join(', ');
    return `Top factors: ${factors}`;
  }
}

/**
 * Get ranking badge color based on total score
 */
export function getRankingBadgeColor(score: number): string {
  if (score >= 85) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (score >= 55) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

/**
 * Get ranking badge text
 */
export function getRankingBadgeText(score: number, language: 'en' | 'zh' = 'zh'): string {
  if (language === 'zh') {
    if (score >= 85) return '🏆 極佳';
    if (score >= 70) return '🥈 優秀';
    if (score >= 55) return '🥉 良好';
    if (score >= 40) return '4️⃣ 一般';
    return '5️⃣ 較差';
  } else {
    if (score >= 85) return '🏆 Excellent';
    if (score >= 70) return '🥈 Great';
    if (score >= 55) return '🥉 Good';
    if (score >= 40) return '4️⃣ Fair';
    return '5️⃣ Poor';
  }
} 