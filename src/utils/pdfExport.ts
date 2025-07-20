import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PropertyCalculation } from './affordability';
import { formatCurrency, formatNumber } from './calculations';
import { getTranslation } from './translations';

// Enhanced sanitizeText function for better localization
const sanitizeText = (text: string, language: 'en' | 'zh') => {
  if (language === 'zh') {
    // Replace Chinese characters with English equivalents or transliterations
    return text
      .replace(/香港物業比較報告/g, 'Hong Kong Property Comparison Report')
      .replace(/總結/g, 'Summary')
      .replace(/最可負擔/g, 'Most Affordable')
      .replace(/最佳價值/g, 'Best Value')
      .replace(/呎價/g, 'Price per ft²')
      .replace(/平均月供/g, 'Average Monthly Payment')
      .replace(/物業名稱/g, 'Property Name')
      .replace(/面積/g, 'Size')
      .replace(/總價/g, 'Total Price')
      .replace(/呎價/g, 'Price/ft²')
      .replace(/前期費用/g, 'Upfront Costs')
      .replace(/月供/g, 'Monthly Payment')
      .replace(/月支出/g, 'Monthly Expenses')
      .replace(/負擔能力/g, 'Affordability')
      .replace(/平方呎/g, 'ft²')
      .replace(/呎/g, 'ft²')
      .replace(/第/g, 'Page ')
      .replace(/頁，共/g, ' of ')
      .replace(/頁/g, ' pages')
      .replace(/生成日期/g, 'Generated')
      .replace(/詳細比較/g, 'Detailed Comparison')
      .replace(/編輯物業/g, 'Edit Properties')
      .replace(/返回首頁/g, 'Go Home')
      .replace(/下載PDF/g, 'Download PDF')
      .replace(/清除全部/g, 'Clear All')
      .replace(/房間/g, 'Rooms')
      .replace(/廁所/g, 'Toilets')
      .replace(/樓齡/g, 'Building Age')
      .replace(/地區/g, 'District')
      .replace(/車位/g, 'Parking')
      .replace(/管理費/g, 'Management Fee')
      .replace(/校網/g, 'School Net');
  }
  return text;
};

// Function to get localized text based on language
const getLocalizedText = (key: string, language: 'en' | 'zh') => {
  const translations: Record<string, { en: string; zh: string }> = {
    title: {
      en: 'Hong Kong Property Comparison Report',
      zh: 'Hong Kong Property Comparison Report'
    },
    summary: {
      en: 'Summary',
      zh: 'Summary'
    },
    mostAffordable: {
      en: 'Most Affordable',
      zh: 'Most Affordable'
    },
    bestValue: {
      en: 'Best Value (per ft²)',
      zh: 'Best Value (per ft²)'
    },
    averageMonthlyCost: {
      en: 'Average Monthly Cost',
      zh: 'Average Monthly Cost'
    },
    property: {
      en: 'Property',
      zh: 'Property'
    },
    size: {
      en: 'Size',
      zh: 'Size'
    },
    price: {
      en: 'Price',
      zh: 'Price'
    },
    costPerFt: {
      en: 'Cost/ft²',
      zh: 'Cost/ft²'
    },
    upfrontCosts: {
      en: 'Upfront Costs',
      zh: 'Upfront Costs'
    },
    monthlyMortgage: {
      en: 'Monthly Mortgage',
      zh: 'Monthly Mortgage'
    },
    monthlyExpenses: {
      en: 'Monthly Expenses',
      zh: 'Monthly Expenses'
    },
    affordability: {
      en: 'Affordability %',
      zh: 'Affordability %'
    },
    generated: {
      en: 'Generated',
      zh: 'Generated'
    },
    page: {
      en: 'Page',
      zh: 'Page'
    },
    of: {
      en: 'of',
      zh: 'of'
    },
    brand: {
      en: 'Buy What House Ho?',
      zh: 'Buy What House Ho?'
    }
  };
  
  return translations[key]?.[language] || key;
};

export const exportToPDF = (
  calculations: PropertyCalculation[],
  language: 'en' | 'zh'
) => {
  const t = (key: string) => getTranslation(key, language);
  
  // Create PDF with proper configuration
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16
  });
  
  // Set font
  doc.setFont('helvetica');
  
  // Title
  doc.setFontSize(20);
  const title = getLocalizedText('title', language);
  doc.text(title, 20, 20);
  
  // Date
  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString(language === 'zh' ? 'zh-HK' : 'en-US');
  const dateText = `${getLocalizedText('generated', language)}: ${currentDate}`;
  doc.text(dateText, 20, 30);
  
  // Summary section
  doc.setFontSize(14);
  const summaryTitle = getLocalizedText('summary', language);
  doc.text(summaryTitle, 20, 45);
  
  const mostAffordable = calculations.reduce((min, calc) => 
    calc.affordabilityPercentage < min.affordabilityPercentage ? calc : min
  );
  
  const bestValue = calculations.reduce((best, calc) => 
    calc.costPerSqFt < best.costPerSqFt ? calc : best
  );
  
  const avgMonthlyCost = calculations.reduce((sum, calc) => 
    sum + calc.monthlyRecurringCosts, 0
  ) / calculations.length;
  
  doc.setFontSize(10);
  doc.text(`${getLocalizedText('mostAffordable', language)}: ${mostAffordable.property.name}`, 20, 55);
  doc.text(`${getLocalizedText('bestValue', language)}: ${bestValue.property.name}`, 20, 65);
  doc.text(`${getLocalizedText('averageMonthlyCost', language)}: ${formatCurrency(avgMonthlyCost)}`, 20, 75);
  
  // Property comparison table
  const tableData = calculations.map(calc => [
    calc.property.name,
    `${calc.property.size} ft²`,
    formatCurrency(calc.property.price),
    formatCurrency(calc.costPerSqFt) + '/ft²',
    formatCurrency(calc.upfrontCosts),
    formatCurrency(calc.monthlyMortgage),
    formatCurrency(calc.monthlyRecurringCosts),
    formatNumber(calc.affordabilityPercentage) + '%',
  ]);
  
  const headers = [
    getLocalizedText('property', language),
    getLocalizedText('size', language),
    getLocalizedText('price', language),
    getLocalizedText('costPerFt', language),
    getLocalizedText('upfrontCosts', language),
    getLocalizedText('monthlyMortgage', language),
    getLocalizedText('monthlyExpenses', language),
    getLocalizedText('affordability', language)
  ];
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 95,
    styles: {
      fontSize: 8,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
  });
  
  // Add detailed property information with proper page breaks
  let currentY = 150; // Start after the table
  
  calculations.forEach((calc, index) => {
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.height - 80) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${calc.property.name}`, 20, currentY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    currentY += 8;
    
    const details = [
      `${getLocalizedText('size', language)}: ${calc.property.size} ft²`,
      `${getLocalizedText('price', language)}: ${formatCurrency(calc.property.price)}`,
      `${getLocalizedText('costPerFt', language)}: ${formatCurrency(calc.costPerSqFt)}`,
      `${getLocalizedText('upfrontCosts', language)}: ${formatCurrency(calc.upfrontCosts)}`,
      `${getLocalizedText('monthlyMortgage', language)}: ${formatCurrency(calc.monthlyMortgage)}`,
      `${getLocalizedText('monthlyExpenses', language)}: ${formatCurrency(calc.monthlyRecurringCosts)}`,
      `${getLocalizedText('affordability', language)}: ${formatNumber(calc.affordabilityPercentage)}%`,
    ];
    
    details.forEach(detail => {
      doc.text(detail, 25, currentY);
      currentY += 5;
    });
    
    currentY += 10;
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `${getLocalizedText('page', language)} ${i} ${getLocalizedText('of', language)} ${pageCount}`,
      20, 
      doc.internal.pageSize.height - 10
    );
    
    // Add watermark
    doc.setFontSize(6);
    doc.setTextColor(200, 200, 200);
    doc.text(getLocalizedText('brand', language), doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 5);
    doc.setTextColor(0, 0, 0);
  }
  
  // Save the PDF with meaningful filename and timestamp
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `Hong-Kong-Property-Comparison-${timestamp}.pdf`;
  doc.save(filename);
}; 