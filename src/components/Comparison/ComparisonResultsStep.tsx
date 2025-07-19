'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { calculatePropertyAffordability, getAffordabilityColor, getAffordabilityBackgroundColor } from '@/utils/affordability';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { exportToPDF } from '@/utils/pdfExport';

export default function ComparisonResultsStep() {
  const { properties, buyerInfo, removeProperty, clearProperties, language } = useAppStore();
  const t = (key: string) => getTranslation(key, language);

  if (properties.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">{t('message.noProperties')}</p>
      </div>
    );
  }

  const calculations = properties.map(property => 
    calculatePropertyAffordability(property, buyerInfo)
  );

  const getBestValueProperty = () => {
    return calculations.reduce((best, current) => 
      current.costPerSqFt < best.costPerSqFt ? current : best
    );
  };

  const getMostAffordableProperty = () => {
    return calculations.reduce((most, current) => 
      current.affordabilityPercentage < most.affordabilityPercentage ? current : most
    );
  };

  const bestValue = getBestValueProperty();
  const mostAffordable = getMostAffordableProperty();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-success-50 border-success-200">
          <h3 className="text-sm font-medium text-success-800 mb-2">
            {t('results.mostAffordable')}
          </h3>
          <p className="text-lg font-semibold text-success-900">
            {mostAffordable.property.name}
          </p>
          <p className="text-sm text-success-700">
            {formatNumber(mostAffordable.affordabilityPercentage)}% of income
          </p>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            {t('results.bestValue')}
          </h3>
          <p className="text-lg font-semibold text-blue-900">
            {bestValue.property.name}
          </p>
          <p className="text-sm text-blue-700">
            {formatCurrency(bestValue.costPerSqFt)}/ft²
          </p>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            {t('results.averageMonthly')}
          </h3>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(
              calculations.reduce((sum, calc) => sum + calc.monthlyRecurringCosts, 0) / calculations.length
            )}
          </p>
          <p className="text-sm text-gray-700">per month</p>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('results.detailedComparison')}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => exportToPDF(calculations, language)}
              className="btn-primary text-sm"
            >
              {t('actions.downloadPDF')}
            </button>
            <button
              onClick={clearProperties}
              className="btn-secondary text-sm"
            >
              {t('actions.clearAll')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Property
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  {t('results.costPerSqFt')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  {t('results.upfrontCosts')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  {t('results.monthlyMortgage')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  {t('results.monthlyRecurring')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  {t('results.affordability')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {calculations.map((calc) => {
                const isBestValue = calc.property.id === bestValue.property.id;
                const isMostAffordable = calc.property.id === mostAffordable.property.id;
                
                return (
                  <tr 
                    key={calc.property.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      isBestValue ? 'bg-success-50' : isMostAffordable ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {calc.property.name}
                          {isBestValue && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                              Best Value
                            </span>
                          )}
                          {isMostAffordable && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Most Affordable
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {calc.property.size} ft² • {calc.property.rooms} rooms • {calc.property.toilets} toilets
                          {calc.property.buildingAge > 0 && ` • ${calc.property.buildingAge} years old`}
                          {calc.property.district && ` • ${calc.property.district}`}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatCurrency(calc.property.price)}
                        </p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <span className="font-medium">
                        {formatCurrency(calc.costPerSqFt)}/ft²
                      </span>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{formatCurrency(calc.upfrontCosts)}</p>
                        <p className="text-xs text-gray-500">
                          {t('results.stampDuty')}: {formatCurrency(calc.stampDuty)}
                        </p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <span className="font-medium">
                        {formatCurrency(calc.monthlyMortgage)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-medium">
                          {formatCurrency(calc.monthlyRecurringCosts)}
                        </span>
                        <p className="text-xs text-gray-500">
                          + {formatCurrency(calc.ratesPerMonth)} rates
                        </p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div>
                        <span className={`font-medium ${getAffordabilityColor(calc.affordabilityStatus)}`}>
                          {formatNumber(calc.affordabilityPercentage)}%
                        </span>
                        <p className="text-xs text-gray-500">
                          {t(`status.${calc.affordabilityStatus}`)}
                        </p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <button
                        onClick={() => removeProperty(calc.property.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        {t('actions.removeProperty')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affordability Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t('results.affordabilityAnalysis')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {calculations.map((calc) => (
            <div 
              key={calc.property.id}
              className={`p-4 rounded-lg border ${getAffordabilityBackgroundColor(calc.affordabilityStatus)}`}
            >
              <h4 className="font-medium text-gray-900 mb-2">{calc.property.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income:</span>
                  <span className="font-medium">{formatCurrency(buyerInfo.monthlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Burden:</span>
                  <span className="font-medium">{formatCurrency(calc.monthlyRecurringCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Affordability:</span>
                  <span className={`font-medium ${getAffordabilityColor(calc.affordabilityStatus)}`}>
                    {formatNumber(calc.affordabilityPercentage)}%
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        calc.affordabilityStatus === 'affordable' ? 'bg-success-500' :
                        calc.affordabilityStatus === 'moderate' ? 'bg-warning-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(calc.affordabilityPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 