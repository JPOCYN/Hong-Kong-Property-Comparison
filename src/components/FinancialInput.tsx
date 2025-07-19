'use client';

import { usePropertyStore } from '@/store/propertyStore';
import { getTranslation } from '@/utils/translations';
import { MortgageType } from '@/utils/mortgage';

export default function FinancialInput() {
  const { userFinancials, updateUserFinancials, language } = usePropertyStore();
  const t = (key: string) => getTranslation(key, language);

  const handleInputChange = (field: string, value: any) => {
    if (field === 'mortgageConfig') {
      updateUserFinancials({ mortgageConfig: { ...userFinancials.mortgageConfig, ...value } });
    } else {
      updateUserFinancials({ [field]: value });
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">{t('financial.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('financial.monthlySalary')}
          </label>
          <input
            type="number"
            value={userFinancials.monthlySalary}
            onChange={(e) => handleInputChange('monthlySalary', Number(e.target.value))}
            className="input-field"
            placeholder="50000"
          />
        </div>

        {/* Downpayment Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('financial.downpaymentBudget')}
          </label>
          <input
            type="number"
            value={userFinancials.downpaymentBudget}
            onChange={(e) => handleInputChange('downpaymentBudget', Number(e.target.value))}
            className="input-field"
            placeholder="2000000"
          />
        </div>

        {/* First-time Buyer Toggle */}
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={userFinancials.isFirstTimeBuyer}
              onChange={(e) => handleInputChange('isFirstTimeBuyer', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {t('financial.firstTimeBuyer')}
            </span>
          </label>
        </div>

        {/* Mortgage Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('financial.mortgageType')}
          </label>
          <select
            value={userFinancials.mortgageConfig.type}
            onChange={(e) => handleInputChange('mortgageConfig', { type: e.target.value as MortgageType })}
            className="input-field"
          >
            <option value="H-mortgage">{t('mortgage.h')}</option>
            <option value="P-mortgage">{t('mortgage.p')}</option>
            <option value="manual">{t('mortgage.manual')}</option>
          </select>
        </div>

        {/* Mortgage Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('financial.mortgageYears')}
          </label>
          <select
            value={userFinancials.mortgageYears}
            onChange={(e) => handleInputChange('mortgageYears', Number(e.target.value))}
            className="input-field"
          >
            <option value={15}>15 years</option>
            <option value={20}>20 years</option>
            <option value={25}>25 years</option>
            <option value={30}>30 years</option>
          </select>
        </div>

        {/* Mortgage Rate Configuration */}
        {userFinancials.mortgageConfig.type === 'H-mortgage' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HIBOR Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={userFinancials.mortgageConfig.hibor}
                onChange={(e) => handleInputChange('mortgageConfig', { hibor: Number(e.target.value) })}
                className="input-field"
                placeholder="1.07"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spread (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={userFinancials.mortgageConfig.hSpread}
                onChange={(e) => handleInputChange('mortgageConfig', { hSpread: Number(e.target.value) })}
                className="input-field"
                placeholder="1.3"
              />
            </div>
          </>
        )}

        {userFinancials.mortgageConfig.type === 'P-mortgage' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prime Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={userFinancials.mortgageConfig.prime}
                onChange={(e) => handleInputChange('mortgageConfig', { prime: Number(e.target.value) })}
                className="input-field"
                placeholder="5.25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={userFinancials.mortgageConfig.pDiscount}
                onChange={(e) => handleInputChange('mortgageConfig', { pDiscount: Number(e.target.value) })}
                className="input-field"
                placeholder="2.0"
              />
            </div>
          </>
        )}

        {userFinancials.mortgageConfig.type === 'manual' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manual Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={userFinancials.mortgageConfig.manualRate}
              onChange={(e) => handleInputChange('mortgageConfig', { manualRate: Number(e.target.value) })}
              className="input-field"
              placeholder="4.125"
            />
          </div>
        )}
      </div>
    </div>
  );
} 