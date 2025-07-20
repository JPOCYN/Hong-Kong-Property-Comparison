'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import StepIndicator from '@/components/UI/StepIndicator';
import BuyerInfoStep from '@/components/Input/BuyerInfoStep';
import PropertyInputStep from '@/components/Property/PropertyInputStep';
import ComparisonResultsStep from '@/components/Comparison/ComparisonResultsStep';
import LanguageToggle from '@/components/LanguageToggle';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ComparePage() {
  const { currentStep, nextStep, prevStep, canProceedToNextStep, language } = useAppStore();
  const t = (key: string) => getTranslation(key, language);

  // Scroll to top when step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BuyerInfoStep />;
      case 2:
        return <PropertyInputStep />;
      case 3:
        return <ComparisonResultsStep />;
      default:
        return <BuyerInfoStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-gray-600 hover:text-gray-900 mr-4">
                ← Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">🏠</span>
                {t('app.title')}
              </h1>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Step Indicator */}
        <div className="mb-4 lg:mb-6">
          <StepIndicator />
        </div>

        {/* Current Step Content */}
        <div className="mb-4 lg:mb-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('navigation.previous')}
            </button>
            
            <button
              onClick={nextStep}
              disabled={!canProceedToNextStep()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 3 ? t('navigation.finish') : t('navigation.next')}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 lg:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="text-center text-gray-500 text-xs lg:text-sm">
            <p>© 2025 Creator: OC</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 