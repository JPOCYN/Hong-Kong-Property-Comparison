'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { calculatePropertyAffordability, getAffordabilityColor, getAffordabilityBackgroundColor } from '@/utils/affordability';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { exportToPDF } from '@/utils/pdfExport';
import { calculateStampDuty, getTotalStampDuty } from '@/utils/stampDuty';
import { calculateHongKongRanking, getRankingExplanation, getRankingBadgeColor, getRankingBadgeText } from '@/utils/ranking';
import { useState, useEffect } from 'react';

export default function ComparisonResultsStep() {
  const { properties, buyerInfo, removeProperty, clearProperties, language, setCurrentStep, setEditingProperty, updateBuyerInfo } = useAppStore();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  // Calculate Hong Kong-specific rankings
  const rankings = calculateHongKongRanking(calculations);
  const topRankedProperty = rankings[0];

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
            <span className="text-xl lg:text-2xl mr-2 lg:mr-3">🏆</span>
            <h3 className="text-xs lg:text-sm font-medium text-purple-800">
              {t('results.topRanked')}
            </h3>
          </div>
          {(() => {
            if (!topRankedProperty) {
              return (
                <div>
                  <p className="text-sm text-purple-700 mb-1">
                    {t('results.noRankingAvailable')}
                  </p>
                </div>
              );
            }
            
            const topProperty = calculations.find(calc => calc.property.id === topRankedProperty.propertyId);
            if (!topProperty) return null;
            
            const rankingBadge = getRankingBadgeText(topRankedProperty.totalScore, language);
            const rankingExplanation = getRankingExplanation(topRankedProperty, language);
            
            return (
              <div>
                <p className="text-base lg:text-lg font-semibold text-purple-900">
                  {topProperty.property.name}
                </p>
                <p className="text-xs lg:text-sm text-purple-700">
                  {rankingBadge} ({topRankedProperty.totalScore.toFixed(0)}分)
                </p>
                <p className="text-xs text-purple-600">
                  {rankingExplanation}
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
              onClick={async () => {
                setIsGeneratingPDF(true);
                try {
                  await exportToPDF(calculations, language);
                } catch (error) {
                  console.error('PDF generation failed:', error);
                } finally {
                  setIsGeneratingPDF(false);
                }
              }}
              disabled={isGeneratingPDF}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('actions.generatingPDF')}
                </>
              ) : (
                <>📄 {t('actions.downloadPDF')}</>
              )}
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              className="btn-secondary text-sm"
            >
              🗑️ {t('actions.clearAll')}
            </button>
          </div>
        </div>

        {/* Budget Settings Section - Collapsible */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowBudgetSettings(!showBudgetSettings)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">💰</span>
              <h3 className="text-lg font-medium text-gray-900">預算設定</h3>
            </div>
            <span className={`transform transition-transform duration-200 ${showBudgetSettings ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showBudgetSettings && (
            <div className="px-4 pb-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💰 {t('results.maxMonthlyPayment')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={buyerInfo.maxMonthlyPayment || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        updateBuyerInfo({
                          ...buyerInfo,
                          maxMonthlyPayment: value
                        });
                      }}
                      className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('placeholder.maxMonthlyPayment')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('results.maxMonthlyPaymentHint')}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💳 {t('buyerInfo.downpaymentBudget')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={buyerInfo.downpaymentBudget / 10000 || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value) * 10000;
                        updateBuyerInfo({
                          ...buyerInfo,
                          downpaymentBudget: value
                        });
                      }}
                      className="w-full px-3 py-2 pl-8 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('placeholder.downpaymentBudget')}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {t('common.tenThousand')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('results.downpaymentBudgetHint')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Card-Based Comparison - Auto-sorted by affordability */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📊</span>
              <span className="text-sm font-medium text-blue-800">
                已按香港買家偏好排序（綜合評分）
              </span>
            </div>
            <div className="text-xs text-blue-600">
              💡 評分標準：價錢(30%) + 尺數(20%) + 房數(15%) + 廁所(10%) + 車位(10%) + 負擔能力(10%) + 呎價(3%) + 樓齡(2%)
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {rankings.map((ranking, index) => {
            const calc = calculations.find(c => c.property.id === ranking.propertyId);
            if (!calc) return null;
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
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-green-500 text-white' :
                            index === 1 ? 'bg-blue-500 text-white' :
                            index === 2 ? 'bg-purple-500 text-white' :
                            index === 3 ? 'bg-orange-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {calc.property.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRankingBadgeColor(ranking.totalScore)}`}>
                            {getRankingBadgeText(ranking.totalScore, language)}
                          </span>
                        </div>
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
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                            {formatCurrency(calc.property.price)}
                          </div>
                          <div className="text-xs text-gray-500">總價</div>
                        </div>
                        
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-lg sm:text-xl font-bold text-blue-600 truncate">
                            {formatCurrency(calc.monthlyMortgage)}
                          </div>
                          <div className="text-xs text-gray-500">月供</div>
                        </div>
                        
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-lg sm:text-xl font-bold text-purple-600 truncate">
                            {formatCurrency(calc.costPerSqFt)}/ft²
                          </div>
                          <div className="text-xs text-gray-500">呎價</div>
                        </div>
                        
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                          <div className={`text-lg sm:text-xl font-bold ${getAffordabilityColor(calc.affordabilityStatus)} truncate`}>
                            {formatNumber(calc.affordabilityPercentage)}%
                          </div>
                          <div className="text-xs text-gray-500">月供佔比</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {calc.affordabilityPercentage <= 80 ? '✅ 健康 (≤80%)' : 
                             calc.affordabilityPercentage <= 100 ? '⚠️ 可接受 (≤100%)' : '❌ 偏高 (>100%)'}
                          </div>
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
                        <div className="flex justify-between">
                          <span className="text-gray-600">管理費:</span>
                          <span className="font-medium">{formatCurrency(calc.property.managementFee)}/月</span>
                        </div>
                        {calc.property.schoolNet && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('results.schoolNet')}:</span>
                            <span className="font-medium text-green-600">{calc.property.schoolNet}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Financial Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 text-sm">💰 財務分析</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('results.upfrontCosts')}:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{formatCurrency(calc.upfrontCosts)}</span>
                            <div className="relative group">
                              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span>印花稅:</span>
                                    <span>{formatCurrency(calc.stampDuty)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>律師費:</span>
                                    <span>{formatCurrency(5000)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>代理佣金 (1%):</span>
                                    <span>{formatCurrency(calc.property.price * 0.01)}</span>
                                  </div>
                                  {!calc.property.carParkIncluded && calc.property.carParkPrice > 0 && (
                                    <div className="flex justify-between">
                                      <span>車位費用:</span>
                                      <span>{formatCurrency(calc.property.carParkPrice)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
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
                  <span className="text-gray-600">月供佔比:</span>
                  <span className={`font-medium ${getAffordabilityColor(calc.affordabilityStatus)}`}>
                    {formatNumber(calc.affordabilityPercentage)}%
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  {/* Progress bar labels with overflow protection */}
                  <div className="flex justify-between text-xs text-gray-500 mb-1 relative">
                    <span>0%</span>
                    <span>80%</span>
                    <span>100%</span>
                    <span>120%</span>
                    {calc.affordabilityPercentage > 120 && (
                      <span className="text-red-500 font-medium truncate max-w-16">
                        {formatNumber(calc.affordabilityPercentage)}%
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar container with overflow protection */}
                  <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
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
                    
                    {/* Current position marker with boundary protection */}
                    <div 
                      className="absolute top-0 w-1 h-3 bg-black rounded-full"
                      style={{ 
                        left: `${Math.min(Math.max(calc.affordabilityPercentage, 0), 120)}%`, 
                        transform: 'translateX(-50%)'
                      }}
                    />
                    
                    {/* Exceeded indicator with better positioning */}
                    {calc.affordabilityPercentage > 120 && (
                      <div className="absolute top-0 w-1 h-3 bg-red-600 rounded-full" style={{ left: 'calc(100% - 2px)' }}>
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-red-600 font-medium bg-white px-1 rounded">
                          ⚠️
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Status message with overflow protection */}
                  <div className="mt-1 min-h-[1rem]">
                    <p className="text-xs text-gray-500 truncate">
                      {calc.affordabilityPercentage > 120 ? 
                        `⚠️ 超出預算 ${formatNumber(calc.affordabilityPercentage - 100)}%` : 
                        t('results.healthyMortgageHint')
                      }
                    </p>
                  </div>
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