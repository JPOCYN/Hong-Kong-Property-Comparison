export interface Translations {
  [key: string]: {
    en: string;
    zh: string;
  };
}

export const translations: Translations = {
  // Navigation
  'app.title': {
    en: 'Buy What House Ho?',
    zh: '買乜樓好?',
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
    en: 'Maximum Monthly Payment',
    zh: '最大可月供',
  },
  'buyerInfo.monthlyIncomeHelp': {
    en: 'Maximum amount you can afford to pay monthly for mortgage',
    zh: '您每月能負擔的最大按揭供款金額',
  },
  'buyerInfo.downpaymentBudget': {
    en: 'Downpayment Budget',
    zh: '首期預算',
  },
  'buyerInfo.downpaymentBudgetHelp': {
    en: 'Maximum amount you can pay upfront (in M HKD)',
    zh: '您能支付的最大前期金額（以萬港元為單位）',
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
  'buyerInfo.stepTitle': {
    en: 'Step 1: Enter Your Maximum Monthly Payment & Budget',
    zh: '第1步：輸入您的最大可月供與預算',
  },
  'buyerInfo.stepDescription': {
    en: 'Tell us about your maximum monthly payment capacity and budget',
    zh: '告訴我們您的最大可月供能力和預算',
  },
  'buyerInfo.tipTitle': {
    en: 'Pro Tip',
    zh: '專業提示',
  },
  'buyerInfo.tipDescription': {
    en: 'Most buyers choose 30-year mortgages with Prime − 2% for better affordability',
    zh: '大多數買家選擇30年期按揭，Prime減2%，以獲得更好的負擔能力',
  },
  'buyerInfo.incomeSection': {
    en: 'Monthly Payment & Budget',
    zh: '月供與預算',
  },
  'buyerInfo.buyerTypeSection': {
    en: 'Buyer Type',
    zh: '買家類型',
  },
  'buyerInfo.mortgageSection': {
    en: 'Mortgage Options',
    zh: '按揭選項',
  },
  'buyerInfo.firstTimeBuyerTooltip': {
    en: 'First-time buyers get reduced stamp duty rates in Hong Kong',
    zh: '首置買家在香港享有減免印花稅優惠',
  },
  'buyerInfo.hiborTooltip': {
    en: 'Hong Kong Interbank Offered Rate - the benchmark interest rate',
    zh: '香港銀行同業拆息 - 基準利率',
  },
  'buyerInfo.spreadTooltip': {
    en: 'Additional percentage added to HIBOR by the bank',
    zh: '銀行在HIBOR基礎上增加的百分比',
  },
  'buyerInfo.primeTooltip': {
    en: 'Prime rate set by major Hong Kong banks',
    zh: '香港主要銀行設定的最優惠利率',
  },
  'buyerInfo.discountTooltip': {
    en: 'Discount percentage applied to the prime rate',
    zh: '應用於最優惠利率的折扣百分比',
  },
  'buyerInfo.validationTitle': {
    en: 'Required Fields Missing',
    zh: '缺少必填欄位',
  },
  'buyerInfo.validationMessage': {
    en: 'Please enter your maximum monthly payment and downpayment budget to continue',
    zh: '請輸入您的最大可月供和首期預算以繼續',
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
  'results.bestForFamily': {
    en: 'Best for Family Living',
    zh: '最適合家庭居住',
  },
  'results.noFamilySuitable': {
    en: 'No properties meet family criteria',
    zh: '沒有符合家庭標準的物業',
  },
  'results.familyCriteria': {
    en: 'Need: 2+ rooms, 1+ toilet, 600+ ft²',
    zh: '需要：2房以上，1廁以上，600呎以上',
  },
  'results.improvementSuggestions': {
    en: 'Improvement Suggestions',
    zh: '改善建議',
  },
  'results.improvementDescription': {
    en: 'Display the recommended monthly income and downpayment amount for each property to achieve "mortgage payment not exceeding 50% of income" as the goal.',
    zh: '顯示每個物業所需的建議月收入與首期金額，以達到「供款不超過收入 50%」為目標。',
  },
  'results.suggestedMonthlyIncome': {
    en: 'Suggested Monthly Income',
    zh: '建議月入',
  },
  'results.suggestedDownpayment': {
    en: 'Suggested Downpayment',
    zh: '建議首期',
  },
  'results.budgetGap': {
    en: 'Budget Gap Analysis',
    zh: '與您預算的差距',
  },
  'results.monthlyPaymentGap': {
    en: 'Monthly Payment Gap',
    zh: '每月供款差距',
  },
  'results.downpaymentGap': {
    en: 'Downpayment Gap',
    zh: '首期預算差距',
  },
  'results.monthlyPaymentExcess': {
    en: 'Monthly Payment Excess',
    zh: '每月供款超出',
  },
  'results.downpaymentShortfall': {
    en: 'Downpayment Shortfall',
    zh: '首期預算不足',
  },
  'results.monthlyPaymentRatio': {
    en: 'Monthly Payment Ratio',
    zh: '每月供款佔最高可接受供款比例',
  },
  'results.downpaymentRemaining': {
    en: 'Downpayment Remaining',
    zh: '首期預算剩餘',
  },
  'results.downpaymentSurplus': {
    en: 'Downpayment Surplus',
    zh: '首期預算剩餘',
  },
  'results.monthlyPaymentExceeded': {
    en: 'Monthly payment exceeds maximum acceptable payment',
    zh: '每月供款超出最高可接受供款',
  },
  'results.downpaymentInsufficient': {
    en: 'Insufficient downpayment budget',
    zh: '首期預算不足',
  },
  'results.withinBudget': {
    en: 'Within Budget',
    zh: '在預算範圍內',
  },
  'results.dsrCompliant': {
    en: '✅ DSR Compliant',
    zh: '✅ DSR 合格',
  },
  'results.dsrExceeded': {
    en: '🛑 May not qualify for loan (exceeds DSR limit)',
    zh: '🛑 可能申請不到貸款（超出DSR上限）',
  },
  'results.dsrExplanation': {
    en: 'Bank mortgage common limit: monthly payment cannot exceed 50% of income (HKMA guidelines)',
    zh: '銀行按揭常見上限：月供不得超過收入50%（HKMA指引）',
  },
  'results.dsr': {
    en: 'DSR',
    zh: 'DSR',
  },
  'results.maxLTV': {
    en: 'Max LTV',
    zh: '最高按揭成數',
  },
  'results.maxLoan': {
    en: 'Max Loan',
    zh: '最高貸款額',
  },
  'results.requiredDownpayment': {
    en: 'Required Downpayment',
    zh: '所需首期',
  },
  'results.actualLTV': {
    en: 'Actual LTV',
    zh: '實際按揭成數',
  },
  'results.actualLoan': {
    en: 'Actual Loan',
    zh: '實際貸款額',
  },
  'results.actualDownpayment': {
    en: 'Actual Downpayment',
    zh: '實際首期',
  },
  'results.detailedComparison': {
    en: 'Detailed Comparison',
    zh: '詳細比較',
  },
  'results.affordabilityAnalysis': {
    en: 'Affordability Analysis',
    zh: '負擔能力分析',
  },
  'results.monthlyBurdenBreakdown': {
    en: 'Monthly Burden Breakdown',
    zh: '每月負擔明細',
  },
  'results.bestFitBasedOnIncome': {
    en: 'Best Fit Based on Income',
    zh: '基於收入的最佳選擇',
  },
  'results.affordabilityTooltip': {
    en: 'Lowest monthly burden vs income',
    zh: '最低月負擔與收入比',
  },
  'results.affordabilityAlert': {
    en: 'Affordability Warning',
    zh: '負擔能力警告',
  },
  'results.affordabilityAlertDesc': {
    en: 'All properties exceed 50% of your monthly income. Consider increasing your budget or looking at smaller properties.',
    zh: '所有物業都超過您月收入的50%。考慮增加預算或尋找較小的物業。',
  },
  'results.comparisonTip': {
    en: '**Compare building age, parking, and room-toilet ratios to understand if the unit is truly suitable for family self-use.**',
    zh: '**比較樓齡、車位與房廁比例，有助了解單位是否真正適合家庭自住。**',
  },
  'results.buildingAge': {
    en: 'Building Age',
    zh: '樓齡',
  },
  'results.parking': {
    en: 'Parking',
    zh: '車位',
  },
  'results.parkingIncluded': {
    en: 'Included',
    zh: '有（已包）',
  },
  'results.parkingPrice': {
    en: 'Available ($XXX M)',
    zh: '有（$XXX萬）',
  },
  'results.noParking': {
    en: 'None 🚫',
    zh: '無 🚫',
  },

  'results.healthyMortgageHint': {
    en: 'Healthy mortgage ratio: < 50% of income',
    zh: '健康按揭比例：< 收入的50%',
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
  'actions.editProperty': {
    en: 'Edit',
    zh: '編輯',
  },
  'actions.updateProperty': {
    en: 'Update Property',
    zh: '更新物業',
  },
  'actions.clearAll': {
    en: 'Clear All',
    zh: '清除全部',
  },
  'actions.editProperties': {
    en: 'Edit Properties',
    zh: '編輯物業',
  },
  'actions.goHome': {
    en: 'Go Home',
    zh: '返回首頁',
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
  
  // Affordability Labels
  'affordability.healthy': {
    en: 'Healthy',
    zh: '健康',
  },
  'affordability.manageable': {
    en: 'Manageable',
    zh: '可管理',
  },
  'affordability.strained': {
    en: 'Strained',
    zh: '緊張',
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
  'message.redirectingToStep2': {
    en: 'Redirecting to Step 2 to add properties...',
    zh: '正在返回第2步添加物業...',
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
  'common.tenThousand': {
    en: 'M',
    zh: '萬',
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
  
  // Modal
  'modal.clearAllTitle': {
    en: 'Clear All Properties',
    zh: '清除所有物業',
  },
  'modal.clearAllMessage': {
    en: 'Are you sure you want to remove all properties? This action cannot be undone.',
    zh: '您確定要移除所有物業嗎？此操作無法撤銷。',
  },
  'modal.cancel': {
    en: 'Cancel',
    zh: '取消',
  },
  'modal.confirm': {
    en: 'Clear All',
    zh: '清除全部',
  },
  
  // Property Input Step
  'propertyInput.stepTitle': {
    en: 'Step 2: Add Properties to Compare',
    zh: '第2步：添加要比較的物業',
  },
  'propertyInput.stepDescription': {
    en: 'Enter details for up to 3 properties you want to compare',
    zh: '輸入您要比較的物業詳情（最多3個）',
  },
  'propertyInput.basicInfoSection': {
    en: 'Basic Information',
    zh: '基本資料',
  },
  'propertyInput.layoutLocationSection': {
    en: 'Layout & Location',
    zh: '佈局與位置',
  },
  'propertyInput.extrasFeesSection': {
    en: 'Extras & Fees',
    zh: '額外項目與費用',
  },
  'propertyInput.propertyName': {
    en: 'Property Name',
    zh: '物業名稱',
  },
  'propertyInput.propertyNamePlaceholder': {
    en: 'Start typing estate name...',
    zh: '開始輸入樓盤名稱...',
  },
  'propertyInput.size': {
    en: 'Size',
    zh: '面積',
  },
  'propertyInput.price': {
    en: 'Price (M HKD)',
    zh: '價格（萬港元）',
  },
  'propertyInput.costPerSqFt': {
    en: 'Cost per ft²',
    zh: '每呎價格',
  },
  'propertyInput.expensiveWarning': {
    en: 'This is quite expensive!',
    zh: '這個價格相當高！',
  },
  'propertyInput.rooms': {
    en: 'Rooms',
    zh: '房間',
  },
  'propertyInput.room': {
    en: 'Room',
    zh: '房',
  },
  'propertyInput.toilets': {
    en: 'Toilets',
    zh: '洗手間',
  },
  'propertyInput.roomsHint': {
    en: 'Number of bedrooms',
    zh: '房間數量',
  },
  'propertyInput.toiletsHint': {
    en: 'Number of bathrooms',
    zh: '洗手間數量',
  },
  'propertyInput.toilet': {
    en: 'Toilet',
    zh: '廁',
  },
  'propertyInput.buildingAge': {
    en: 'Building Age',
    zh: '樓齡',
  },
  'propertyInput.years': {
    en: 'years',
    zh: '年',
  },
  'propertyInput.district': {
    en: 'District',
    zh: '地區',
  },
  'propertyInput.districtPlaceholder': {
    en: 'Start typing district name...',
    zh: '開始輸入地區名稱...',
  },
  'propertyInput.selectDistrict': {
    en: 'Select District',
    zh: '選擇地區',
  },
  'propertyInput.schoolNet': {
    en: 'School Net',
    zh: '校網',
  },
  'propertyInput.hasCarPark': {
    en: 'Has Car Park',
    zh: '有車位',
  },
  'propertyInput.carParkTooltip': {
    en: 'Include car park in the property price',
    zh: '車位包含在物業價格內',
  },
  'propertyInput.carParkHelp': {
    en: 'Check if car park is included in the property price',
    zh: '勾選如果車位包含在物業價格內',
  },
  'propertyInput.carParkPrice': {
    en: 'Car Park Price',
    zh: '車位價格',
  },
  'propertyInput.parkingSection': {
    en: '🚗 Parking',
    zh: '🚗 車位',
  },
  'propertyInput.parkingNone': {
    en: 'No parking',
    zh: '無車位',
  },
  'propertyInput.parkingIncluded': {
    en: 'Parking included',
    zh: '已包車位',
  },
  'propertyInput.parkingAdditional': {
    en: 'Additional purchase (HK$)',
    zh: '需額外購買（HK$）',
  },
  'propertyInput.additionalParkingPrice': {
    en: 'Additional parking price (HK$)',
    zh: '額外車位價格 (HK$)',
  },
  'propertyInput.parkingHelp': {
    en: 'Select "Parking included" if parking is included in total price; "Additional purchase" requires extra payment.',
    zh: '選擇「已包車位」表示車位已包含於總價；「需額外購買」則需另付金額。',
  },
  'propertyInput.managementFee': {
    en: 'Management Fee',
    zh: '管理費',
  },
  'propertyInput.perMonth': {
    en: 'per month',
    zh: '每月',
  },
  'propertyInput.managementFeeSuggestion': {
    en: 'Estimated',
    zh: '估算',
  },
  'propertyInput.managementFeeWarning': {
    en: 'Most units have monthly management fees',
    zh: '大多數單位都有每月管理費',
  },
  'propertyInput.autoFilled': {
    en: 'Auto-filled from district',
    zh: '根據地區自動填寫',
  },
  'propertyInput.addProperty': {
    en: 'Add Property',
    zh: '添加物業',
  },
  'propertyInput.addedProperties': {
    en: 'Added Properties',
    zh: '已添加的物業',
  },
  'propertyInput.remove': {
    en: 'Remove',
    zh: '移除',
  },
  'propertyInput.newProperty': {
    en: 'New Property',
    zh: '新增物業',
  },
  'propertyInput.editProperty': {
    en: 'Edit Property',
    zh: '編輯物業',
  },
  'propertyInput.schoolNetPlaceholder': {
    en: 'Enter school net code...',
    zh: '請輸入校網',
  },
  'propertyInput.schoolNetRequired': {
    en: 'Please select at least one school net',
    zh: '請選擇至少一個校網',
  },
  
  // Additional Results
  'results.rooms': {
    en: 'Rooms',
    zh: '房間',
  },
  'results.toilets': {
    en: 'toilets',
    zh: '廁所',
  },
  'results.age': {
    en: 'Age',
    zh: '樓齡',
  },
  'results.years': {
    en: 'years',
    zh: '年',
  },
  'results.district': {
    en: 'District',
    zh: '地區',
  },
  'results.monthlyIncome': {
    en: 'Monthly Income',
    zh: '月收入',
  },
  'results.monthlyBurden': {
    en: 'Monthly Burden',
    zh: '每月負擔',
  },
};

export const getTranslation = (key: string, language: 'en' | 'zh'): string => {
  return translations[key]?.[language] || key;
}; 