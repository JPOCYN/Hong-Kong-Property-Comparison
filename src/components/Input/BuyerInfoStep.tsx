'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { MortgageType } from '@/utils/mortgage';

export default function BuyerInfoStep() {
  const { buyerInfo, updateBuyerInfo, language } = useAppStore();
  const t = (key: string) => getTranslation(key, language);

  const handleInputChange = (field: keyof typeof buyerInfo, value: any) => {
    updateBuyerInfo({ [field]: value });
  };

  const getMortgageRate = (): number => {
    switch (buyerInfo.mortgageType) {
      case 'H-mortgage':
        return buyerInfo.hiborRate + buyerInfo.hiborSpread;
      case 'P-mortgage':
        return buyerInfo.primeRate - buyerInfo.primeDiscount;
      case 'manual':
        return buyerInfo.manualRate;
      default:
        return 4.125;
    }
  };

  const getRateFormula = (): string => {
    switch (buyerInfo.mortgageType) {
      case 'H-mortgage':
        return `${buyerInfo.hiborRate}% + ${buyerInfo.hiborSpread}% = ${getMortgageRate().toFixed(2)}%`;
      case 'P-mortgage':
        return `${buyerInfo.primeRate}% − ${buyerInfo.primeDiscount}% = ${getMortgageRate().toFixed(2)}%`;
      case 'manual':
        return `${buyerInfo.manualRate}%`;
      default:
        return '4.125%';
    }
  };

  const isFormValid = (): boolean => {
    return buyerInfo.monthlyIncome > 0 && buyerInfo.downpaymentBudget > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('buyerInfo.stepTitle')}
        </h2>
        <p className="text-gray-600">
          {t('buyerInfo.stepDescription')}
        </p>
      </div>

      {/* Banner Tip */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-xl">💡</span>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">
              {t('buyerInfo.tipTitle')}
            </h3>
            <p className="text-sm text-blue-700">
              {t('buyerInfo.tipDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Income Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">💰</span>
          {t('buyerInfo.incomeSection')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('buyerInfo.monthlyIncome')} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={buyerInfo.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                className="input-field pl-8"
                placeholder="50000"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('buyerInfo.monthlyIncomeHelp')}
            </p>
          </div>

          {/* Downpayment Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('buyerInfo.downpaymentBudget')} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={buyerInfo.downpaymentBudget}
                onChange={(e) => handleInputChange('downpaymentBudget', Number(e.target.value))}
                className="input-field pl-8"
                placeholder="2000000"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('buyerInfo.downpaymentBudgetHelp')}
            </p>
          </div>
        </div>
      </div>

      {/* Buyer Type Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">👤</span>
          {t('buyerInfo.buyerTypeSection')}
        </h3>
        
        <div className="space-y-4">
          {/* First-time Buyer Toggle */}
          <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={buyerInfo.isFirstTimeBuyer}
              onChange={(e) => handleInputChange('isFirstTimeBuyer', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {t('buyerInfo.firstTimeBuyer')}
                </span>
                <span className="text-gray-400 cursor-help" title={t('buyerInfo.firstTimeBuyerTooltip')}>
                  ℹ️
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('buyerInfo.firstTimeBuyerHelp')}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Mortgage Options Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">🏦</span>
          {t('buyerInfo.mortgageSection')}
        </h3>
        
        <div className="space-y-6">
          {/* Mortgage Type and Years */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mortgage Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('buyerInfo.mortgageType')}
              </label>
              <select
                value={buyerInfo.mortgageType}
                onChange={(e) => handleInputChange('mortgageType', e.target.value as MortgageType)}
                className="input-field"
              >
                <option value="H-mortgage">{t('mortgage.h')}</option>
                <option value="P-mortgage">{t('mortgage.p')}</option>
                <option value="manual">{t('mortgage.manual')}</option>
              </select>
            </div>

            {/* Mortgage Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('buyerInfo.mortgageYears')}
              </label>
              <select
                value={buyerInfo.mortgageYears}
                onChange={(e) => handleInputChange('mortgageYears', Number(e.target.value))}
                className="input-field"
              >
                <option value={15}>15 {t('common.years')}</option>
                <option value={20}>20 {t('common.years')}</option>
                <option value={25}>25 {t('common.years')}</option>
                <option value={30}>30 {t('common.years')}</option>
              </select>
            </div>
          </div>

          {/* Current Rate Display Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {t('buyerInfo.currentRate')}:
                </span>
                <p className="text-xs text-blue-600 mt-1">
                  {getRateFormula()}
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {getMortgageRate().toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Mortgage Rate Configuration */}
          {buyerInfo.mortgageType === 'H-mortgage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  HIBOR Rate (%)
                  <span className="text-gray-400 cursor-help ml-1" title={t('buyerInfo.hiborTooltip')}>
                    ℹ️
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={buyerInfo.hiborRate}
                  onChange={(e) => handleInputChange('hiborRate', Number(e.target.value))}
                  className="input-field"
                  placeholder="1.07"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Spread (%)
                  <span className="text-gray-400 cursor-help ml-1" title={t('buyerInfo.spreadTooltip')}>
                    ℹ️
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={buyerInfo.hiborSpread}
                  onChange={(e) => handleInputChange('hiborSpread', Number(e.target.value))}
                  className="input-field"
                  placeholder="1.3"
                />
              </div>
            </div>
          )}

          {buyerInfo.mortgageType === 'P-mortgage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Prime Rate (%)
                  <span className="text-gray-400 cursor-help ml-1" title={t('buyerInfo.primeTooltip')}>
                    ℹ️
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={buyerInfo.primeRate}
                  onChange={(e) => handleInputChange('primeRate', Number(e.target.value))}
                  className="input-field"
                  placeholder="5.25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Discount (%)
                  <span className="text-gray-400 cursor-help ml-1" title={t('buyerInfo.discountTooltip')}>
                    ℹ️
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={buyerInfo.primeDiscount}
                  onChange={(e) => handleInputChange('primeDiscount', Number(e.target.value))}
                  className="input-field"
                  placeholder="2.0"
                />
              </div>
            </div>
          )}

          {buyerInfo.mortgageType === 'manual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manual Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={buyerInfo.manualRate}
                onChange={(e) => handleInputChange('manualRate', Number(e.target.value))}
                className="input-field"
                placeholder="4.125"
              />
            </div>
          )}
        </div>
      </div>

      {/* Form Validation Status */}
      {!isFormValid() && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-medium text-yellow-800">{t('buyerInfo.validationTitle')}</h3>
              <p className="text-sm text-yellow-700">{t('buyerInfo.validationMessage')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 