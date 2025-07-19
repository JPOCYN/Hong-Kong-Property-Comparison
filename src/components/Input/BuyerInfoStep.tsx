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

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">{t('buyerInfo.title')}</h2>
      
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

        {/* First-time Buyer Toggle */}
        <div className="md:col-span-2">
          <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={buyerInfo.isFirstTimeBuyer}
              onChange={(e) => handleInputChange('isFirstTimeBuyer', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                {t('buyerInfo.firstTimeBuyer')}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {t('buyerInfo.firstTimeBuyerHelp')}
              </p>
            </div>
          </label>
        </div>

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

        {/* Current Rate Display */}
        <div className="md:col-span-2">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t('buyerInfo.currentRate')}:
              </span>
              <span className="text-lg font-semibold text-blue-600">
                {getMortgageRate().toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Mortgage Rate Configuration */}
        {buyerInfo.mortgageType === 'H-mortgage' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HIBOR Rate (%)
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spread (%)
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
          </>
        )}

        {buyerInfo.mortgageType === 'P-mortgage' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prime Rate (%)
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
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
          </>
        )}

        {buyerInfo.mortgageType === 'manual' && (
          <div className="md:col-span-2">
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
  );
} 