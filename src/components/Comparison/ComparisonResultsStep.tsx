'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { calculatePropertyAffordability, getAffordabilityColor, getAffordabilityBackgroundColor } from '@/utils/affordability';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { exportToPDF } from '@/utils/pdfExport';
import { useState, useEffect } from 'react';

export default function ComparisonResultsStep() {
  const { properties, buyerInfo, removeProperty, clearProperties, language, setCurrentStep } = useAppStore();
  const [showClearModal, setShowClearModal] = useState(false);
  const t = (key: string) => getTranslation(key, language);

  // Auto-redirect to Step 2 when all properties are deleted
  useEffect(() => {
    if (properties.length === 0) {
      setCurrentStep(2);
    }
  }, [properties.length, setCurrentStep]);

  if (properties.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="space-y-4">
          <p className="text-gray-500 text-lg">{t('message.noProperties')}</p>
          <p className="text-gray-400 text-sm">{t('message.redirectingToStep2')}</p>
        </div>
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
  const averageMonthly = calculations.reduce((sum, calc) => sum + calc.monthlyRecurringCosts, 0) / calculations.length;

  // Check if any properties are under safe affordability level
  const safeProperties = calculations.filter(calc => calc.affordabilityPercentage <= 50);
  const hasSafeOptions = safeProperties.length > 0;

  const getAffordabilityLabel = (percentage: number) => {
    if (percentage <= 30) return t('affordability.healthy');
    if (percentage <= 50) return t('affordability.manageable');
    return t('affordability.strained');
  };

  const handleClearAll = () => {
    clearProperties();
    setShowClearModal(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <div className="card bg-success-50 border-success-200 p-3 lg:p-4">
          <div className="flex items-center mb-2 lg:mb-3">
            <span className="text-xl lg:text-2xl mr-2 lg:mr-3">💰</span>
            <div>
              <h3 className="text-xs lg:text-sm font-medium text-success-800">
                {mostAffordable.affordabilityPercentage > 60 ? t('results.bestFitBasedOnIncome') : t('results.mostAffordable')}
              </h3>
              <div className="flex items-center">
                <span className="text-xs text-success-600 mr-1">ℹ️</span>
                <span className="text-xs text-success-600">{t('results.affordabilityTooltip')}</span>
              </div>
            </div>
          </div>
          <p className="text-base lg:text-lg font-semibold text-success-900">
            {mostAffordable.property.name}
          </p>
          <p className="text-xs lg:text-sm text-success-700">
            {formatNumber(mostAffordable.affordabilityPercentage)}% of income
          </p>
        </div>

        <div className="card bg-blue-50 border-blue-200 p-3 lg:p-4">
          <div className="flex items-center mb-2 lg:mb-3">
            <span className="text-xl lg:text-2xl mr-2 lg:mr-3">🏆</span>
            <h3 className="text-xs lg:text-sm font-medium text-blue-800">
              {t('results.bestValue')}
            </h3>
          </div>
          <p className="text-base lg:text-lg font-semibold text-blue-900">
            {bestValue.property.name}
          </p>
          <p className="text-xs lg:text-sm text-blue-700">
            {formatCurrency(bestValue.costPerSqFt)}/ft²
          </p>
        </div>

        <div className="card bg-gray-50 border-gray-200 p-3 lg:p-4">
          <div className="flex items-center mb-2 lg:mb-3">
            <span className="text-xl lg:text-2xl mr-2 lg:mr-3">📊</span>
            <h3 className="text-xs lg:text-sm font-medium text-gray-800">
              {t('results.averageMonthly')}
            </h3>
          </div>
          <p className="text-base lg:text-lg font-semibold text-gray-900">
            {formatCurrency(averageMonthly)}
          </p>
          <p className="text-xs lg:text-sm text-gray-700">per month</p>
        </div>
      </div>

      {/* Affordability Alert */}
      {!hasSafeOptions && (
        <div className="card bg-warning-50 border-warning-200 p-3 lg:p-4">
          <div className="flex items-center">
            <span className="text-lg lg:text-xl mr-2 lg:mr-3">⚠️</span>
            <div>
              <h3 className="font-medium text-warning-800 text-sm lg:text-base">{t('results.affordabilityAlert')}</h3>
              <p className="text-xs lg:text-sm text-warning-700">{t('results.affordabilityAlertDesc')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Comparison Table */}
      <div className="card p-4 lg:p-6">
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <h2 className="text-xl font-semibold">{t('results.detailedComparison')}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="btn-secondary text-sm"
            >
              ✏️ {t('actions.editProperties')}
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="btn-secondary text-sm"
            >
              🏠 {t('actions.goHome')}
            </button>
            <button
              onClick={() => exportToPDF(calculations, language)}
              className="btn-primary text-sm"
            >
              📄 {t('actions.downloadPDF')}
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              className="btn-secondary text-sm"
            >
              🗑️ {t('actions.clearAll')}
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
                  {t('results.affordability')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {calculations.map((calc, index) => {
                const isBestValue = calc.property.id === bestValue.property.id;
                const isMostAffordable = calc.property.id === mostAffordable.property.id;
                
                return (
                  <>
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
                                🏆 Best Value
                              </span>
                            )}
                            {isMostAffordable && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                💰 Most Affordable
                              </span>
                            )}
                          </h3>
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
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${getAffordabilityColor(calc.affordabilityStatus)}`}>
                            {calc.affordabilityPercentage <= 30 ? '🟢' : 
                             calc.affordabilityPercentage <= 50 ? '🟡' : '🔴'}
                          </span>
                          <div>
                            <span className={`font-medium ${getAffordabilityColor(calc.affordabilityStatus)}`}>
                              {formatNumber(calc.affordabilityPercentage)}%
                            </span>
                            <p className="text-xs text-gray-500">
                              {getAffordabilityLabel(calc.affordabilityPercentage)}
                            </p>
                          </div>
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
                    {/* Property Details Row */}
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={6} className="py-3 px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Size:</span> {calc.property.size} ft²
                          </div>
                          <div>
                            <span className="font-medium">Rooms:</span> {calc.property.rooms} • {calc.property.toilets} toilets
                          </div>
                          {calc.property.buildingAge > 0 && (
                            <div>
                              <span className="font-medium">Age:</span> {calc.property.buildingAge} years
                            </div>
                          )}
                          {calc.property.district && (
                            <div>
                              <span className="font-medium">District:</span> {calc.property.district}
                              {calc.property.schoolNet && ` (${calc.property.schoolNet})`}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Monthly Burden Breakdown */}
      <div className="card p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">{t('results.monthlyBurdenBreakdown')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {calculations.map((calc) => (
            <div 
              key={calc.property.id}
              className={`p-4 rounded-lg border ${getAffordabilityBackgroundColor(calc.affordabilityStatus)}`}
            >
              <h4 className="font-medium text-gray-900 mb-3">{calc.property.name}</h4>
              <div className="space-y-3 text-sm">
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
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>0%</span>
                    <span>30%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        calc.affordabilityStatus === 'affordable' ? 'bg-success-500' :
                        calc.affordabilityStatus === 'moderate' ? 'bg-warning-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(calc.affordabilityPercentage, 100)}%` }}
                    />
                    <div className="absolute inset-0 flex justify-between px-1">
                      <div className="w-0.5 h-3 bg-gray-300"></div>
                      <div className="w-0.5 h-3 bg-gray-300"></div>
                      <div className="w-0.5 h-3 bg-gray-300"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('results.healthyMortgageHint')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('modal.clearAllTitle')}</h3>
            <p className="text-gray-600 mb-6">{t('modal.clearAllMessage')}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="btn-secondary"
              >
                {t('modal.cancel')}
              </button>
              <button
                onClick={handleClearAll}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                {t('modal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 