'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { calculatePropertyAffordability, getAffordabilityColor, getAffordabilityBackgroundColor } from '@/utils/affordability';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { exportToPDF } from '@/utils/pdfExport';
import { calculateStampDuty, getTotalStampDuty } from '@/utils/stampDuty';
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

  // Check if any properties are within the user's maximum monthly payment
  const affordableProperties = calculations.filter(calc => calc.monthlyMortgage <= buyerInfo.maxMonthlyPayment);
  const hasAffordableOptions = affordableProperties.length > 0;

  const getAffordabilityLabel = (percentage: number) => {
    if (percentage <= 80) return t('affordability.healthy');
    if (percentage <= 100) return t('affordability.manageable');
    return t('affordability.strained');
  };

  // Enhanced DSR and income suggestion calculations
  const calculateDSR = (monthlyMortgage: number, maxMonthlyPayment: number, propertyPrice: number, hasExistingMortgage: boolean) => {
    // Calculate DSR based on user's max monthly payment
    const dsrRatio = (monthlyMortgage / maxMonthlyPayment) * 100;
    
    // Calculate required income for bank approval (50% DSR rule)
    const requiredMonthlyIncome = monthlyMortgage / 0.5; // 50% DSR threshold
    const requiredAnnualIncome = requiredMonthlyIncome * 12;
    
    // Check if user's max payment is sufficient for bank approval
    const isCompliant = dsrRatio <= 100;
    const needsHigherIncome = requiredMonthlyIncome > maxMonthlyPayment;
    
    // Calculate income gap if insufficient
    const incomeGap = needsHigherIncome ? requiredMonthlyIncome - maxMonthlyPayment : 0;
    
    return {
      dsrRatio,
      requiredMonthlyIncome,
      requiredAnnualIncome,
      isCompliant,
      needsHigherIncome,
      incomeGap,
      maxDebtToIncome: 0.5
    };
  };

  const calculateMIP = (propertyPrice: number, downpaymentBudget: number, isFirstTime: boolean, isSalaried: boolean) => {
    // Calculate upfront costs first
    const stampDuty = getTotalStampDuty(
      calculateStampDuty(propertyPrice, isFirstTime)
    );
    const legalFees = 5000; // Estimated legal fees
    const agentFees = propertyPrice * 0.01; // 1% agent commission
    const upfrontCosts = stampDuty + legalFees + agentFees;
    
    // Calculate available funds for downpayment after covering upfront costs
    const availableForDownpayment = downpaymentBudget - upfrontCosts;
    
    // Use all available funds for downpayment to minimize mortgage ratio
    const actualDownpayment = Math.max(0, Math.min(availableForDownpayment, propertyPrice * 0.9)); // Cap at 90% of property price
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
            {formatNumber(mostAffordable.affordabilityPercentage)}% of max payment
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
      {!hasAffordableOptions && (
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

        {/* Modern Card-Based Comparison */}
        <div className="space-y-4">
          {calculations.map((calc, index) => {
            const isBestValue = calc.property.id === bestValue.property.id;
            const isMostAffordable = calc.property.id === mostAffordable.property.id;
            const dsrAnalysis = calculateDSR(
              calc.monthlyMortgage, 
              buyerInfo.maxMonthlyPayment, 
              calc.property.price, 
              false
            );
            const mipAnalysis = calculateMIP(
              calc.property.price, 
              buyerInfo.downpaymentBudget,
              buyerInfo.isFirstTimeBuyer, 
              true
            );
            
            return (
              <div 
                key={calc.property.id}
                className={`relative rounded-xl border-2 shadow-sm transition-all duration-200 hover:shadow-md ${
                  isBestValue 
                    ? 'border-success-200 bg-success-50' 
                    : isMostAffordable 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Property Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {calc.property.name}
                        </h3>
                        {isBestValue && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200">
                            🏆 {t('results.bestValue')}
                          </span>
                        )}
                        {isMostAffordable && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            💰 {t('results.mostAffordable')}
                          </span>
                        )}
                      </div>
                      
                      {/* Property Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {calc.property.district && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            📍 {calc.property.district}
                          </span>
                        )}
                        {calc.property.schoolNet && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            🎓 {t('results.schoolNet')}：{calc.property.schoolNet}
                          </span>
                        )}
                      </div>
                      
                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(calc.property.price)}
                          </div>
                          <div className="text-xs text-gray-500">總價</div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-blue-600">
                            {formatCurrency(calc.monthlyMortgage)}
                          </div>
                          <div className="text-xs text-gray-500">月供</div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-purple-600">
                            {formatCurrency(calc.costPerSqFt)}/ft²
                          </div>
                          <div className="text-xs text-gray-500">呎價</div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className={`text-xl font-bold ${getAffordabilityColor(calc.affordabilityStatus)}`}>
                            {formatNumber(calc.affordabilityPercentage)}%
                          </div>
                          <div className="text-xs text-gray-500">負擔能力</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingProperty(calc.property.id);
                          setCurrentStep(2);
                        }}
                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        ✏️ {t('actions.editProperty')}
                      </button>
                      <button
                        onClick={() => removeProperty(calc.property.id)}
                        className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️ {t('actions.removeProperty')}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Property Specs */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 text-sm">🏠 物業規格</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.size')}:</span>
                          <span className="font-medium">{calc.property.size} {t('common.ft2')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.rooms')}:</span>
                          <span className="font-medium text-blue-600">{calc.property.rooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.toilets')}:</span>
                          <span className="font-medium text-blue-600">{calc.property.toilets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.buildingAge')}:</span>
                          <span className={`font-medium ${calc.property.buildingAge > 30 ? 'text-red-600' : 'text-gray-700'}`}>
                            {calc.property.buildingAge} {t('common.years')}
                            {calc.property.buildingAge > 30 && <span className="ml-1">⚠️</span>}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.parking')}:</span>
                          <span className={`font-medium ${calc.property.carParkIncluded ? 'text-green-600' : 'text-red-600'}`}>
                            {calc.property.carParkIncluded ? 
                              (calc.property.carParkPrice > 0 
                                ? `${t('results.parkingPrice').replace('$XXX', formatCurrency(calc.property.carParkPrice).replace('$', ''))}`
                                : t('results.parkingIncluded'))
                              : t('results.noParking')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Financial Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 text-sm">💰 財務分析</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.upfrontCosts')}:</span>
                          <span className="font-medium">{formatCurrency(calc.upfrontCosts)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{t('results.stampDuty')}:</span>
                          <span>{formatCurrency(calc.stampDuty)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.actualLTV')}:</span>
                          <span className="font-medium text-blue-600">{(mipAnalysis.actualLTV * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.actualLoan')}:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(mipAnalysis.actualLoan)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('results.actualDownpayment')}:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(mipAnalysis.actualDownpayment)}</span>
                        </div>
                      </div>
                    </div>
                    
                                         {/* Income Requirements */}
                     <div className="space-y-3">
                       <h4 className="font-medium text-gray-900 text-sm">💼 銀行批核所需收入建議</h4>
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                           <span className="text-gray-600">{t('results.requiredMonthlyIncome')}:</span>
                           <span className="font-medium text-blue-600">
                             {formatCurrency(dsrAnalysis.requiredMonthlyIncome)}
                           </span>
                         </div>
                         {dsrAnalysis.needsHigherIncome && (
                           <div className="flex justify-between">
                             <span className="text-gray-600">{t('results.incomeGap')}:</span>
                             <span className="font-medium text-orange-600">
                               {formatCurrency(dsrAnalysis.incomeGap)}
                             </span>
                           </div>
                         )}
                         <div className="text-xs text-gray-500 mt-2">
                           💡 {t('results.incomeHint')}
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
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
                  <span className="text-gray-600">{t('results.maxMonthlyPayment')}:</span>
                  <span className="font-medium">{formatCurrency(buyerInfo.maxMonthlyPayment)}</span>
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
                    <span>80%</span>
                    <span>100%</span>
                    <span>120%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        calc.affordabilityStatus === 'affordable' ? 'bg-success-500' :
                        calc.affordabilityStatus === 'moderate' ? 'bg-warning-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(calc.affordabilityPercentage, 120)}%` }}
                    />
                    <div className="absolute inset-0 flex justify-between px-1">
                      <div className="w-0.5 h-3 bg-gray-300"></div>
                      <div className="w-0.5 h-3 bg-gray-300"></div>
                      <div className="w-0.5 h-3 bg-gray-300"></div>
                    </div>
                    {/* Current position marker */}
                    <div 
                      className="absolute top-0 w-1 h-3 bg-black rounded-full"
                      style={{ left: `${Math.min(calc.affordabilityPercentage, 120)}%`, transform: 'translateX(-50%)' }}
                    />
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