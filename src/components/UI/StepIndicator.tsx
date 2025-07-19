'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';

interface Step {
  number: number;
  title: string;
  description: string;
}

export default function StepIndicator() {
  const { currentStep, maxSteps, language } = useAppStore();
  const t = (key: string) => getTranslation(key, language);

  const steps: Step[] = [
    {
      number: 1,
      title: t('steps.buyerInfo'),
      description: t('steps.buyerInfoDesc'),
    },
    {
      number: 2,
      title: t('steps.propertyInput'),
      description: t('steps.propertyInputDesc'),
    },
    {
      number: 3,
      title: t('steps.results'),
      description: t('steps.resultsDesc'),
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm ${
                step.number <= currentStep
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              {step.number}
            </div>
            
            {/* Step Info */}
            <div className="ml-3 hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {step.title}
              </div>
              <div className="text-xs text-gray-500">
                {step.description}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  step.number < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile Step Title */}
      <div className="sm:hidden mt-4 text-center">
        <div className="text-lg font-semibold text-gray-900">
          {steps[currentStep - 1]?.title}
        </div>
        <div className="text-sm text-gray-500">
          {steps[currentStep - 1]?.description}
        </div>
      </div>
    </div>
  );
} 