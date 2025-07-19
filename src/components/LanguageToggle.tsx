'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';

export default function LanguageToggle() {
  const { language, setLanguage } = useAppStore();
  const t = (key: string) => getTranslation(key, language);

  return (
    <div className="flex items-center space-x-3">
      <span className="text-lg">🌐</span>
      <span className="text-sm text-gray-600 hidden sm:inline">{t('actions.language')}:</span>
      <div className="flex bg-gray-200 rounded-lg p-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            language === 'en'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('zh')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            language === 'zh'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          中文
        </button>
      </div>
    </div>
  );
} 