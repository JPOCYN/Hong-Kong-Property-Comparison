'use client';

import { usePropertyStore } from '@/store/propertyStore';
import { getTranslation } from '@/utils/translations';
import { calculatePropertyDetails, formatCurrency, formatNumber } from '@/utils/calculations';
import { exportToPDF } from '@/utils/pdfExport';

export default function ComparisonResults() {
  const { properties, userFinancials, removeProperty, clearProperties, language } = usePropertyStore();
  const t = (key: string) => getTranslation(key, language);

  if (properties.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">{t('message.noProperties')}</p>
      </div>
    );
  }

  const calculations = properties.map(property => 
    calculatePropertyDetails(property, userFinancials)
  );

  const getAffordabilityStatus = (percentage: number) => {
    if (percentage <= 40) return { status: 'affordable', color: 'text-success-600' };
    if (percentage <= 60) return { status: 'moderate', color: 'text-warning-600' };
    return { status: 'expensive', color: 'text-red-600' };
  };

  const getBestValueProperty = () => {
    return calculations.reduce((best, current) => 
      current.costPerSqFt < best.costPerSqFt ? current : best
    );
  };

  const bestValue = getBestValueProperty();

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('results.title')}</h2>
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
            {calculations.map((calc, index) => {
              const affordability = getAffordabilityStatus(calc.affordabilityPercentage);
              const isBestValue = calc.property.id === bestValue.property.id;
              
              return (
                <tr 
                  key={calc.property.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    isBestValue ? 'bg-success-50' : ''
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
                      </h3>
                      <p className="text-sm text-gray-500">
                        {calc.property.size} ft² • {calc.property.rooms} rooms • {calc.property.toilets} toilets
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
                    <span className="font-medium">
                      {formatCurrency(calc.monthlyRecurringCosts)}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div>
                      <span className={`font-medium ${affordability.color}`}>
                        {formatNumber(calc.affordabilityPercentage)}%
                      </span>
                      <p className="text-xs text-gray-500">
                        {t(`status.${affordability.status}`)}
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

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Most Affordable: </span>
            <span className="font-medium">
              {calculations.reduce((min, calc) => 
                calc.affordabilityPercentage < min.affordabilityPercentage ? calc : min
              ).property.name}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Best Value (per ft²): </span>
            <span className="font-medium">{bestValue.property.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Average Monthly Cost: </span>
            <span className="font-medium">
              {formatCurrency(
                calculations.reduce((sum, calc) => sum + calc.monthlyRecurringCosts, 0) / calculations.length
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 