export interface Translations {
  [key: string]: {
    en: string;
    zh: string;
  };
}

export const translations: Translations = {
  // Navigation
  'app.title': {
    en: 'Hong Kong Property Comparison',
    zh: '香港物業比較',
  },
  
  // Steps
  'steps.buyerInfo': {
    en: 'Buyer Information',
    zh: '買家資料',
  },
  'steps.buyerInfoDesc': {
    en: 'Enter your financial details',
    zh: '輸入您的財務資料',
  },
  'steps.propertyInput': {
    en: 'Property Details',
    zh: '物業詳情',
  },
  'steps.propertyInputDesc': {
    en: 'Add properties to compare',
    zh: '添加物業進行比較',
  },
  'steps.results': {
    en: 'Comparison Results',
    zh: '比較結果',
  },
  'steps.resultsDesc': {
    en: 'View detailed analysis',
    zh: '查看詳細分析',
  },
  
  // Buyer Info
  'buyerInfo.title': {
    en: 'Your Financial Information',
    zh: '您的財務資料',
  },
  'buyerInfo.monthlyIncome': {
    en: 'Monthly Income',
    zh: '月收入',
  },
  'buyerInfo.monthlyIncomeHelp': {
    en: 'Your total monthly income before tax',
    zh: '您的稅前月收入總額',
  },
  'buyerInfo.downpaymentBudget': {
    en: 'Downpayment Budget',
    zh: '首期預算',
  },
  'buyerInfo.downpaymentBudgetHelp': {
    en: 'Maximum amount you can pay upfront',
    zh: '您能支付的最大前期金額',
  },
  'buyerInfo.firstTimeBuyer': {
    en: 'First-time Buyer (首置)',
    zh: '首置買家',
  },
  'buyerInfo.firstTimeBuyerHelp': {
    en: 'Eligible for reduced stamp duty rates',
    zh: '符合減免印花稅資格',
  },
  'buyerInfo.mortgageType': {
    en: 'Mortgage Type',
    zh: '按揭類型',
  },
  'buyerInfo.mortgageYears': {
    en: 'Mortgage Term',
    zh: '按揭年期',
  },
  'buyerInfo.currentRate': {
    en: 'Current Rate',
    zh: '當前利率',
  },
  'financial.monthlySalary': {
    en: 'Monthly Salary',
    zh: '月薪',
  },
  'financial.downpaymentBudget': {
    en: 'Downpayment Budget',
    zh: '首期預算',
  },
  'financial.firstTimeBuyer': {
    en: 'First-time Buyer (首置)',
    zh: '首置買家',
  },
  'financial.mortgageType': {
    en: 'Mortgage Type',
    zh: '按揭類型',
  },
  'financial.mortgageYears': {
    en: 'Mortgage Term (Years)',
    zh: '按揭年期',
  },
  
  // Mortgage Types
  'mortgage.h': {
    en: 'HIBOR Mortgage (H + X%)',
    zh: 'HIBOR按揭 (H + X%)',
  },
  'mortgage.p': {
    en: 'Prime Rate Mortgage (Prime – Y%)',
    zh: '最優惠利率按揭 (Prime – Y%)',
  },
  'mortgage.manual': {
    en: 'Manual Rate',
    zh: '自訂利率',
  },
  
  // Property Input
  'property.title': {
    en: 'Add Properties to Compare',
    zh: '添加物業進行比較',
  },
  'property.name': {
    en: 'Property Name',
    zh: '物業名稱',
  },
  'property.size': {
    en: 'Size (ft²)',
    zh: '面積 (平方呎)',
  },
  'property.price': {
    en: 'Total Price',
    zh: '總價',
  },
  'property.rooms': {
    en: 'Rooms',
    zh: '房間數',
  },
  'property.toilets': {
    en: 'Toilets',
    zh: '廁所數',
  },
  'property.carPark': {
    en: 'Car Park',
    zh: '車位',
  },
  'property.carParkIncluded': {
    en: 'Included',
    zh: '已包括',
  },
  'property.carParkPrice': {
    en: 'Additional Price',
    zh: '額外價格',
  },
  'property.managementFee': {
    en: 'Management Fee (Monthly)',
    zh: '管理費 (每月)',
  },
  'property.buildingAge': {
    en: 'Building Age (樓齡)',
    zh: '樓齡',
  },
  'property.district': {
    en: 'District (地區)',
    zh: '地區',
  },
  'property.schoolNet': {
    en: 'Primary School Net (小學校網)',
    zh: '小學校網',
  },
  'property.costPerSqFt': {
    en: 'Cost per ft²',
    zh: '每平方呎成本',
  },
  'property.ratesPerMonth': {
    en: 'Rates per month (差餉)',
    zh: '每月差餉',
  },
  
  // Results
  'results.title': {
    en: 'Property Comparison Results',
    zh: '物業比較結果',
  },
  'results.costPerSqFt': {
    en: 'Cost per ft²',
    zh: '每平方呎成本',
  },
  'results.upfrontCosts': {
    en: 'Upfront Costs',
    zh: '前期費用',
  },
  'results.monthlyMortgage': {
    en: 'Monthly Mortgage',
    zh: '每月按揭',
  },
  'results.monthlyRecurring': {
    en: 'Monthly Recurring Costs',
    zh: '每月經常性開支',
  },
  'results.affordability': {
    en: 'Affordability %',
    zh: '負擔能力 %',
  },
  'results.mostAffordable': {
    en: 'Most Affordable',
    zh: '最可負擔',
  },
  'results.bestValue': {
    en: 'Best Value',
    zh: '最佳價值',
  },
  'results.averageMonthly': {
    en: 'Average Monthly',
    zh: '平均每月',
  },
  'results.detailedComparison': {
    en: 'Detailed Comparison',
    zh: '詳細比較',
  },
  'results.affordabilityAnalysis': {
    en: 'Affordability Analysis',
    zh: '負擔能力分析',
  },
  'results.stampDuty': {
    en: 'Stamp Duty',
    zh: '印花稅',
  },
  
  // Actions
  'actions.addProperty': {
    en: 'Add Property',
    zh: '添加物業',
  },
  'actions.removeProperty': {
    en: 'Remove',
    zh: '移除',
  },
  'actions.clearAll': {
    en: 'Clear All',
    zh: '清除全部',
  },
  'actions.downloadPDF': {
    en: 'Download PDF',
    zh: '下載PDF',
  },
  'actions.language': {
    en: 'Language',
    zh: '語言',
  },
  
  // Status
  'status.affordable': {
    en: 'Affordable',
    zh: '可負擔',
  },
  'status.moderate': {
    en: 'Moderate',
    zh: '中等',
  },
  'status.expensive': {
    en: 'Expensive',
    zh: '昂貴',
  },
  
  // Placeholders
  'placeholder.propertyName': {
    en: 'e.g., Kowloon Bay Apartment',
    zh: '例如：九龍灣公寓',
  },
  'placeholder.size': {
    en: '500',
    zh: '500',
  },
  'placeholder.price': {
    en: '8000000',
    zh: '8000000',
  },
  
  // Messages
  'message.maxProperties': {
    en: 'You can compare up to 3 properties',
    zh: '您最多可以比較3個物業',
  },
  'message.noProperties': {
    en: 'Add properties to start comparing',
    zh: '添加物業開始比較',
  },
  
  // Common
  'common.years': {
    en: 'years',
    zh: '年',
  },
  'common.ft2': {
    en: 'ft²',
    zh: '平方呎',
  },
  'common.optional': {
    en: 'Optional',
    zh: '可選',
  },
  
  // Navigation
  'navigation.previous': {
    en: 'Previous',
    zh: '上一步',
  },
  'navigation.next': {
    en: 'Next',
    zh: '下一步',
  },
  'navigation.finish': {
    en: 'Finish',
    zh: '完成',
  },
};

export const getTranslation = (key: string, language: 'en' | 'zh'): string => {
  return translations[key]?.[language] || key;
}; 