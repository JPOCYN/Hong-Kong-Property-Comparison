import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PropertyCalculation, formatCurrency, formatNumber } from './calculations';
import { getTranslation } from './translations';

export const exportToPDF = (
  calculations: PropertyCalculation[],
  language: 'en' | 'zh'
) => {
  const t = (key: string) => getTranslation(key, language);
  
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text(t('app.title'), 20, 20);
  
  // Summary
  doc.setFontSize(12);
  doc.text('Summary', 20, 40);
  
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
  doc.text(`Most Affordable: ${mostAffordable.property.name}`, 20, 50);
  doc.text(`Best Value (per ft²): ${bestValue.property.name}`, 20, 60);
  doc.text(`Average Monthly Cost: ${formatCurrency(avgMonthlyCost)}`, 20, 70);
  
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
  
  autoTable(doc, {
    head: [[
      'Property',
      'Size',
      'Price',
      'Cost/ft²',
      'Upfront Costs',
      'Monthly Mortgage',
      'Monthly Recurring',
      'Affordability %'
    ]],
    body: tableData,
    startY: 90,
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [59, 130, 246],
    },
  });
  
  // Save the PDF
  doc.save('property-comparison.pdf');
}; 