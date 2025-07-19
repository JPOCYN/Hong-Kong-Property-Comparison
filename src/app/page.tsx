'use client';

import FinancialInput from '@/components/FinancialInput';
import PropertyInput from '@/components/PropertyInput';
import ComparisonResults from '@/components/ComparisonResults';
import LanguageToggle from '@/components/LanguageToggle';
import { getTranslation } from '@/utils/translations';
import { usePropertyStore } from '@/store/propertyStore';

export default function Home() {
  const { language } = usePropertyStore();
  const t = (key: string) => getTranslation(key, language);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('app.title')}
            </h1>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Financial Input Section */}
          <FinancialInput />
          
          {/* Property Input Section */}
          <PropertyInput />
          
          {/* Comparison Results Section */}
          <ComparisonResults />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Hong Kong Property Comparison Tool for Self-Use Buyers</p>
            <p className="mt-2">© 2024 - Helping you make informed property decisions</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 