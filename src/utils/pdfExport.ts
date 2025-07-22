import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PropertyCalculation } from './affordability';
import { formatCurrency, formatNumber } from './calculations';
import { getTranslation } from './translations';

// Add Chinese font support
import 'jspdf-font';

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
    },
    detailedComparison: {
      en: 'Detailed Comparison',
      zh: 'Detailed Comparison'
    },
    monthlyBurdenBreakdown: {
      en: 'Monthly Burden Breakdown',
      zh: 'Monthly Burden Breakdown'
    }
  };
  
  return translations[key]?.[language] || key;
};

// Function to get affordability status and color
const getAffordabilityStatus = (percentage: number): { status: string; color: number[] } => {
  if (percentage <= 50) {
    return { status: 'Affordable', color: [34, 197, 94] }; // Green
  } else if (percentage <= 80) {
    return { status: 'Moderate', color: [251, 191, 36] }; // Yellow
  } else {
    return { status: 'Expensive', color: [239, 68, 68] }; // Red
  }
};

// Function to add Chinese font support
const addChineseFont = (doc: jsPDF, language: 'en' | 'zh'): boolean => {
  // Always use Helvetica for now to avoid font loading issues
  doc.setFont('helvetica');
  return false;
};

export const exportToPDF = (
  calculations: PropertyCalculation[],
  language: 'en' | 'zh',
  buyerInfo?: any
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
  
  // Add Chinese font support
  addChineseFont(doc, language);
  
  // Title
  doc.setFontSize(20);
  const title = getLocalizedText('title', language);
  doc.text(title, 20, 20);
  
  // Date
  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString(language === 'zh' ? 'zh-HK' : 'en-US');
  const dateText = `${getLocalizedText('generated', language)}: ${currentDate}`;
  doc.text(dateText, 20, 30);
  
  // Calculate summary statistics
  const mostAffordable = calculations.reduce((min, calc) => 
    calc.affordabilityPercentage < min.affordabilityPercentage ? calc : min
  );
  
  const bestValue = calculations.reduce((best, calc) => 
    calc.costPerSqFt < best.costPerSqFt ? calc : best
  );
  
  const avgMonthlyCost = calculations.reduce((sum, calc) => 
    sum + calc.monthlyRecurringCosts, 0
  ) / calculations.length;
  
  // Enhanced Summary Cards Section (matching the result page layout)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Cards', 20, 45);
  
  // Most Affordable Card
  doc.setFillColor(240, 253, 244); // Light green background
  doc.rect(20, 50, 55, 25, 'F');
  doc.setDrawColor(34, 197, 94); // Green border
  doc.rect(20, 50, 55, 25, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // Dark green text
  doc.text('💰 Most Affordable', 25, 57);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(mostAffordable.property.name, 25, 65);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatNumber(mostAffordable.affordabilityPercentage)}% of max payment`, 25, 72);
  
  // Best Value Card
  doc.setFillColor(239, 246, 255); // Light blue background
  doc.rect(80, 50, 55, 25, 'F');
  doc.setDrawColor(59, 130, 246); // Blue border
  doc.rect(80, 50, 55, 25, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // Dark blue text
  doc.text('🏆 Best Value', 85, 57);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(bestValue.property.name, 85, 65);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatCurrency(bestValue.costPerSqFt)}/ft²`, 85, 72);
  
  // Average Monthly Cost Card
  doc.setFillColor(250, 245, 255); // Light purple background
  doc.rect(140, 50, 55, 25, 'F');
  doc.setDrawColor(147, 51, 234); // Purple border
  doc.rect(140, 50, 55, 25, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(88, 28, 135); // Dark purple text
  doc.text('📊 Average Monthly', 145, 57);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(avgMonthlyCost), 145, 65);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Total recurring costs', 145, 72);
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(255, 255, 255);
  
  // Detailed Comparison Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(getLocalizedText('detailedComparison', language), 20, 90);
  
  // Property comparison table with improved formatting
  const tableData = calculations.map(calc => {
    const affordability = getAffordabilityStatus(calc.affordabilityPercentage);
    return [
      calc.property.name,
      `${calc.property.size} ft²`,
      formatCurrency(calc.property.price),
      formatCurrency(calc.costPerSqFt) + '/ft²',
      formatCurrency(calc.monthlyMortgage),
      formatCurrency(calc.monthlyRecurringCosts),
      `${formatNumber(calc.affordabilityPercentage)}% (${affordability.status})`,
    ];
  });
  
  const headers = [
    getLocalizedText('property', language),
    getLocalizedText('size', language),
    getLocalizedText('price', language),
    getLocalizedText('costPerFt', language),
    getLocalizedText('monthlyMortgage', language),
    getLocalizedText('monthlyExpenses', language),
    getLocalizedText('affordability', language)
  ];
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 100,
    styles: {
      fontSize: 8,
      font: 'helvetica',
      cellPadding: 3,
      lineWidth: 0.2,
      lineColor: [200, 200, 200],
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    columnStyles: {
      0: { cellWidth: 32 }, // Property name
      1: { cellWidth: 18 }, // Size
      2: { cellWidth: 22 }, // Price
      3: { cellWidth: 18 }, // Cost per ft²
      4: { cellWidth: 22 }, // Monthly mortgage
      5: { cellWidth: 22 }, // Monthly expenses
      6: { cellWidth: 25 }, // Affordability
    },
    tableWidth: 160,
    theme: 'grid',
  });
  
  // Monthly Burden Breakdown Section
  let currentY = 150; // Start after the table
  
  if (calculations.length > 0) {
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.height - 80) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(getLocalizedText('monthlyBurdenBreakdown', language), 20, currentY);
    
    currentY += 15;
    
    // Show monthly burden breakdown for each property
    calculations.forEach((calc, index) => {
      if (currentY > doc.internal.pageSize.height - 60) {
        doc.addPage();
        currentY = 20;
      }
      
      const affordability = getAffordabilityStatus(calc.affordabilityPercentage);
      
      // Property header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${calc.property.name}`, 20, currentY);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      currentY += 8;
      
              // Monthly details
        const details = [
          `Max Monthly Payment: ${formatCurrency(buyerInfo?.maxMonthlyPayment || 0)}`,
          `Monthly Mortgage: ${formatCurrency(calc.monthlyMortgage)}`,
          `Monthly Expenses: ${formatCurrency(calc.monthlyRecurringCosts)}`,
        ];
      
      details.forEach(detail => {
        doc.text(detail, 25, currentY);
        currentY += 5;
      });
      
      // Affordability percentage with color
      doc.setTextColor(affordability.color[0], affordability.color[1], affordability.color[2]);
      doc.text(`Affordability: ${formatNumber(calc.affordabilityPercentage)}% (${affordability.status})`, 25, currentY);
      doc.setTextColor(0, 0, 0); // Reset to black
      currentY += 8;
      
      // Progress bar representation
      const progressWidth = Math.min(calc.affordabilityPercentage, 120);
      const barWidth = 60; // 60mm wide progress bar
      const barHeight = 3;
      
      // Progress bar background
      doc.setFillColor(229, 231, 235);
      doc.rect(25, currentY, barWidth, barHeight, 'F');
      
      // Progress bar fill
      const fillColor = affordability.color;
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      doc.rect(25, currentY, (progressWidth / 120) * barWidth, barHeight, 'F');
      
      // Progress bar labels
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text('0%', 25, currentY + 8);
      doc.text('80%', 25 + (barWidth * 0.67), currentY + 8);
      doc.text('100%', 25 + (barWidth * 0.83), currentY + 8);
      doc.text('120%', 25 + barWidth, currentY + 8);
      
      currentY += 15;
    });
  }
  
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