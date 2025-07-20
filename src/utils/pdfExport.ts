import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PropertyCalculation } from './affordability';
import { formatCurrency, formatNumber } from './calculations';
import { getTranslation } from './translations';

// Add Chinese font support
import 'jspdf-font';

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

// Function to add Chinese font to PDF
const addChineseFont = (doc: jsPDF) => {
  try {
    // Add a Chinese font (using a web-safe approach)
    doc.addFont('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap', 'NotoSansSC', 'normal');
    return true;
  } catch (error) {
    console.warn('Chinese font not available, using fallback');
    return false;
  }
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
  
  // For Chinese, use a different approach to avoid encoding issues
  const useChineseFont = language === 'zh';
  
  if (useChineseFont) {
    // Use a font that supports Chinese characters
    doc.setFont('helvetica');
  } else {
    doc.setFont('helvetica');
  }
  
  // Title
  doc.setFontSize(20);
  const title = language === 'zh' ? 'Hong Kong Property Comparison Report' : 'Hong Kong Property Comparison Report';
  doc.text(title, 20, 20);
  
  // Date
  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString(language === 'zh' ? 'zh-HK' : 'en-US');
  const dateText = language === 'zh' ? `Generated: ${currentDate}` : `Generated: ${currentDate}`;
  doc.text(dateText, 20, 30);
  
  // Summary section
  doc.setFontSize(14);
  const summaryTitle = language === 'zh' ? 'Summary' : 'Summary';
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
  doc.text(`Most Affordable: ${mostAffordable.property.name}`, 20, 55);
  doc.text(`Best Value (per ft²): ${bestValue.property.name}`, 20, 65);
  doc.text(`Average Monthly Cost: ${formatCurrency(avgMonthlyCost)}`, 20, 75);
  
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
  
  // Add detailed property information
  let currentY = 150; // Start after the table
  
  calculations.forEach((calc, index) => {
    if (currentY > doc.internal.pageSize.height - 60) {
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
      `Size: ${calc.property.size} ft²`,
      `Price: ${formatCurrency(calc.property.price)}`,
      `Cost/ft²: ${formatCurrency(calc.costPerSqFt)}`,
      `Upfront Costs: ${formatCurrency(calc.upfrontCosts)}`,
      `Monthly Mortgage: ${formatCurrency(calc.monthlyMortgage)}`,
      `Monthly Expenses: ${formatCurrency(calc.monthlyRecurringCosts)}`,
      `Affordability: ${formatNumber(calc.affordabilityPercentage)}%`,
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
      `Page ${i} of ${pageCount}`,
      20, 
      doc.internal.pageSize.height - 10
    );
    
    // Add watermark
    doc.setFontSize(6);
    doc.setTextColor(200, 200, 200);
    doc.text('Buy What House Ho?', doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 5);
    doc.setTextColor(0, 0, 0);
  }
  
  // Save the PDF with proper filename
  const filename = 'Hong-Kong-Property-Comparison.pdf';
  doc.save(filename);
}; 