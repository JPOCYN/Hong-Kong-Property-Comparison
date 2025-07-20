import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PropertyCalculation, formatCurrency, formatNumber } from './calculations';
import { getTranslation } from './translations';

// For Chinese text, we'll use a fallback approach
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
      .replace(/頁/g, ' pages');
  }
  return text;
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
  
  // Use standard font that works well
  doc.setFont('helvetica');
  
  // Title
  doc.setFontSize(20);
  doc.text(sanitizeText(language === 'zh' ? '香港物業比較報告' : 'Hong Kong Property Comparison Report', language), 20, 20);
  
  // Summary section
  doc.setFontSize(14);
  doc.text(sanitizeText(language === 'zh' ? '總結' : 'Summary', language), 20, 40);
  
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
  doc.text(sanitizeText(language === 'zh' ? `最可負擔: ${mostAffordable.property.name}` : `Most Affordable: ${mostAffordable.property.name}`, language), 20, 50);
  doc.text(sanitizeText(language === 'zh' ? `最佳價值 (呎價): ${bestValue.property.name}` : `Best Value (per ft²): ${bestValue.property.name}`, language), 20, 60);
  doc.text(sanitizeText(language === 'zh' ? `平均月供: ${formatCurrency(avgMonthlyCost)}` : `Average Monthly Cost: ${formatCurrency(avgMonthlyCost)}`, language), 20, 70);
  
  // Property comparison table
  const tableData = calculations.map(calc => [
    calc.property.name,
    `${calc.property.size} ${sanitizeText(language === 'zh' ? '平方呎' : 'ft²', language)}`,
    formatCurrency(calc.property.price),
    formatCurrency(calc.costPerSqFt) + sanitizeText(language === 'zh' ? '/呎' : '/ft²', language),
    formatCurrency(calc.upfrontCosts),
    formatCurrency(calc.monthlyMortgage),
    formatCurrency(calc.monthlyRecurringCosts),
    formatNumber(calc.affordabilityPercentage) + '%',
  ]);
  
  const headers = language === 'zh' ? [
    'Property Name',
    'Size',
    'Total Price',
    'Price/ft²',
    'Upfront Costs',
    'Monthly Payment',
    'Monthly Expenses',
    'Affordability %'
  ] : [
    'Property',
    'Size',
    'Price',
    'Cost/ft²',
    'Upfront Costs',
    'Monthly Mortgage',
    'Monthly Recurring',
    'Affordability %'
  ];
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 90,
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
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      sanitizeText(language === 'zh' ? `第 ${i} 頁，共 ${pageCount} 頁` : `Page ${i} of ${pageCount}`, language),
      20, 
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF with proper filename
  const filename = language === 'zh' ? 'Hong-Kong-Property-Comparison.pdf' : 'property-comparison.pdf';
  doc.save(filename);
}; 