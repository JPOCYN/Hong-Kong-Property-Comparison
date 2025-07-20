'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { calculatePropertyAffordability, getAffordabilityColor, getAffordabilityBackgroundColor } from '@/utils/affordability';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { exportToPDF } from '@/utils/pdfExport';
import { useState, useEffect } from 'react';

export default function ComparisonResultsStep() {
  const { properties, buyerInfo, removeProperty, clearProperties, language, setCurrentStep, setEditingProperty } = useAppStore();
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

  // Enhanced DSR and MIP calculations
  const calculateDSR = (monthlyMortgage: number, maxMonthlyPayment: number, propertyPrice: number, hasExistingMortgage: boolean) => {
    const dsr = monthlyMortgage / maxMonthlyPayment;
    const threshold = (propertyPrice > 30000000 || hasExistingMortgage) ? 0.4 : 0.5;
    const isCompliant = dsr <= threshold;
    const requiredMaxPayment = monthlyMortgage / threshold;
    
    return {
      dsr,
      threshold,
      isCompliant,
      requiredMaxPayment
    };
  };

  const calculateMIP = (propertyPrice: number, downpaymentBudget: number, isFirstTime: boolean, isSalaried: boolean) => {
    // Calculate actual LTV based on user's downpayment budget
    const actualDownpayment = Math.min(downpaymentBudget, propertyPrice * 0.3); // Cap at 30% of property price
    const actualLoan = propertyPrice - actualDownpayment;
    const actualLTV = actualLoan / propertyPrice;
    
    // Calculate maximum allowed LTV for reference
    let maxAllowedLTV = 0.7; // Default for non-first-time buyers
    
    if (isFirstTime && isSalaried) {
      if (propertyPrice <= 4000000) {
        maxAllowedLTV = 0.9;
      } else if (propertyPrice <= 6000000) {
        maxAllowedLTV = 0.8;
      } else if (propertyPrice <= 10000000) {
        maxAllowedLTV = 0.9;
      } else if (propertyPrice <= 11250000) {
        maxAllowedLTV = Math.min(0.9, 9000000 / propertyPrice);
      } else if (propertyPrice <= 15000000) {
        maxAllowedLTV = 0.8;
      } else if (propertyPrice <= 17150000) {
        maxAllowedLTV = Math.min(0.8, 12000000 / propertyPrice);
      } else {
        maxAllowedLTV = 0.7;
      }
    }
    
    const maxAllowedLoan = propertyPrice * maxAllowedLTV;
    const requiredDownpayment = propertyPrice - maxAllowedLoan;
    
    return {
      actualLTV,
      actualLoan,
      actualDownpayment,
      maxAllowedLTV,
      maxAllowedLoan,
      requiredDownpayment
    };
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

        <div className="card bg-purple-50 border-purple-200 p-3 lg:p-4">
          <div className="flex items-center mb-2 lg:mb-3">
            <span className="text-xl lg:text-2xl mr-2 lg:mr-3">👨‍👩‍👧‍👦</span>
            <h3 className="text-xs lg:text-sm font-medium text-purple-800">
              {t('results.bestForFamily')}
            </h3>
          </div>
          {(() => {
            // Find the best property for family living
            const familyProperties = calculations.filter(calc => 
              calc.property.rooms >= 2 && 
              calc.property.toilets >= 1 && 
              calc.property.size >= 600
            );
            
            if (familyProperties.length === 0) {
              return (
                <div>
                  <p className="text-sm text-purple-700 mb-1">
                    {t('results.noFamilySuitable')}
                  </p>
                  <p className="text-xs text-purple-600">
                    {t('results.familyCriteria')}
                  </p>
                </div>
              );
            }
            
            // Prioritize properties with car park, then by size
            const bestFamilyProperty = familyProperties.sort((a, b) => {
              // First priority: has car park
              if (a.property.carParkIncluded && !b.property.carParkIncluded) return -1;
              if (!a.property.carParkIncluded && b.property.carParkIncluded) return 1;
              // Second priority: larger size
              return b.property.size - a.property.size;
            })[0];
            
            const parkingText = bestFamilyProperty.property.carParkIncluded 
              ? (bestFamilyProperty.property.carParkPrice > 0 
                ? `${t('results.parkingPrice').replace('$XXX', formatCurrency(bestFamilyProperty.property.carParkPrice).replace('$', ''))}`
                : t('results.parkingIncluded'))
              : t('results.noParking');
            
            return (
              <div>
                <p className="text-base lg:text-lg font-semibold text-purple-900 mb-1">
                  {bestFamilyProperty.property.name}
                </p>
                <p className="text-sm text-purple-700">
                  {bestFamilyProperty.property.rooms}{t('results.rooms')} {bestFamilyProperty.property.toilets}{t('results.toilets')}，{bestFamilyProperty.property.size}{t('common.ft2')}，{parkingText}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Affordability Alert */}
      {!hasSafeOptions && (
        <>
          <div className="card bg-warning-50 border-warning-200 p-3 lg:p-4">
            <div className="flex items-center">
              <span className="text-lg lg:text-xl mr-2 lg:mr-3">⚠️</span>
              <div>
                <h3 className="font-medium text-warning-800 text-sm lg:text-base">{t('results.affordabilityAlert')}</h3>
                <p className="text-xs lg:text-sm text-warning-700">{t('results.affordabilityAlertDesc')}</p>
              </div>
            </div>
          </div>
          

        </>
      )}
      
      {/* Budget Gap Analysis */}
      <div className="card bg-blue-50 border-blue-200 p-4 lg:p-6">
        <div className="flex items-center mb-4">
          <span className="text-lg lg:text-xl mr-2 lg:mr-3">📉</span>
          <h3 className="font-medium text-blue-800 text-base lg:text-lg">{t('results.budgetGap')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calculations.map((calc) => {
            // Calculate monthly payment gap (target: 50% of income)
            const targetMonthlyPayment = buyerInfo.monthlyIncome * 0.5;
            const monthlyPaymentGap = calc.monthlyRecurringCosts - targetMonthlyPayment;
            
            // Calculate downpayment gap (target: user's budget)
            const downpaymentGap = calc.upfrontCosts - buyerInfo.downpaymentBudget;
            
            return (
              <div key={calc.property.id} className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">
                  【{calc.property.name}】
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t('results.monthlyPaymentRatio')}:</span>
                      <span className={`font-medium ${(calc.monthlyMortgage / (buyerInfo.monthlyIncome * 0.5)) <= 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {((calc.monthlyMortgage / (buyerInfo.monthlyIncome * 0.5)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t('results.downpaymentSurplus')}:</span>
                      <span className={`font-medium ${downpaymentGap <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        HK${formatCurrency(Math.abs(downpaymentGap)).replace('$', '')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  {(calc.monthlyMortgage / (buyerInfo.monthlyIncome * 0.5)) <= 1 && downpaymentGap <= 0 && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                      ✅ {t('results.withinBudget')}
                    </div>
                  )}
                  {(calc.monthlyMortgage / (buyerInfo.monthlyIncome * 0.5)) > 1 && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                      🛑 {t('results.monthlyPaymentExceeded')}
                    </div>
                  )}
                  {downpaymentGap > 0 && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                      🛑 {t('results.downpaymentInsufficient')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Comparison Table */}
      <div className="card p-4 lg:p-6 mt-6 lg:mt-8">
        {/* Summary Tip */}
        <div className="mb-4 lg:mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            {t('results.comparisonTip')}
          </p>
        </div>
        
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
                                🏆 {t('results.bestValue')}
                              </span>
                            )}
                            {isMostAffordable && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                💰 {t('results.mostAffordable')}
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingProperty(calc.property.id);
                              setCurrentStep(2);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            ✏️ {t('actions.editProperty')}
                          </button>
                          <button
                            onClick={() => removeProperty(calc.property.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            🗑️ {t('actions.removeProperty')}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Property Details Row */}
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={6} className="py-3 px-4">
                        {/* Property Tags */}
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {calc.property.district && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {calc.property.district}
                              </span>
                            )}
                            {calc.property.schoolNet && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {t('results.schoolNet')}：{calc.property.schoolNet}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Property Details - 2 Column Mobile Layout */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          {/* Critical Info - Rooms & Toilets (Prominent Position) */}
                          <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{t('results.rooms')}:</span>
                              <span className="text-lg font-semibold text-blue-600">{calc.property.rooms}</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-medium text-gray-900">{t('results.toilets')}:</span>
                              <span className="text-lg font-semibold text-blue-600">{calc.property.toilets}</span>
                            </div>
                          </div>
                          
                          {/* Building Age with Warning */}
                          <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{t('results.buildingAge')}:</span>
                              <span className={`text-lg font-semibold ${calc.property.buildingAge > 30 ? 'text-red-600' : 'text-gray-700'}`}>
                                {calc.property.buildingAge} {t('common.years')}
                              </span>
                              {calc.property.buildingAge > 30 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  ⚠️ {t('results.age')} {t('common.years')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Parking Information */}
                          <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{t('results.parking')}:</span>
                              {calc.property.carParkIncluded ? (
                                <span className="text-green-600 font-medium">
                                  {calc.property.carParkPrice > 0 
                                    ? `${t('results.parkingPrice').replace('$XXX', formatCurrency(calc.property.carParkPrice).replace('$', ''))}`
                                    : t('results.parkingIncluded')
                                  }
                                </span>
                              ) : (
                                <span className="text-red-600 font-medium">{t('results.noParking')}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Size */}
                          <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{t('results.size')}:</span>
                              <span className="text-lg font-semibold text-gray-700">{calc.property.size} {t('common.ft2')}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* DSR and MIP Analysis */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {(() => {
                              const dsrAnalysis = calculateDSR(
                                calc.monthlyMortgage, 
                                buyerInfo.monthlyIncome, 
                                calc.property.price, 
                                false // Assuming no existing mortgage for now
                              );
                              
                              const mipAnalysis = calculateMIP(
                                calc.property.price, 
                                buyerInfo.downpaymentBudget,
                                buyerInfo.isFirstTimeBuyer, 
                                true // Assuming salaried for now
                              );
                              
                              return (
                                <>
                                  {/* DSR Analysis */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900">{t('results.dsr')}:</span>
                                      <span className={`font-medium ${dsrAnalysis.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                                        {(dsrAnalysis.dsr * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="text-xs">
                                      {dsrAnalysis.isCompliant ? (
                                        <span className="text-green-600">{t('results.dsrCompliant')}</span>
                                      ) : (
                                        <div className="space-y-1">
                                          <span className="text-red-600">{t('results.dsrExceeded')}</span>
                                          <div className="text-gray-600 text-xs" style={{ fontSize: '0.85em' }}>
                                            {t('results.dsrExplanation')}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* MIP Analysis */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900">{t('results.actualLTV')}:</span>
                                      <span className="font-medium text-blue-600">
                                        {(mipAnalysis.actualLTV * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900">{t('results.actualLoan')}:</span>
                                      <span className="font-medium text-blue-600">
                                        {formatCurrency(mipAnalysis.actualLoan)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900">{t('results.actualDownpayment')}:</span>
                                      <span className="font-medium text-blue-600">
                                        {formatCurrency(mipAnalysis.actualDownpayment)}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
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
      <div className="card p-4 lg:p-6 mt-6 lg:mt-8">
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
                  <span className="text-gray-600">{t('results.monthlyIncome')}:</span>
                  <span className="font-medium">{formatCurrency(buyerInfo.monthlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('results.monthlyMortgage')}:</span>
                  <span className="font-medium">{formatCurrency(calc.monthlyMortgage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('results.affordability')}:</span>
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