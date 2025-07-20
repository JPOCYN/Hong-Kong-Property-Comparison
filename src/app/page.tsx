'use client';

import Link from 'next/link'
import { FaCalculator, FaChartLine, FaFilePdf, FaSearch, FaMobile, FaShieldAlt, FaHome, FaMoneyBillWave, FaGraduationCap } from 'react-icons/fa'
import { useState } from 'react'

export default function HomePage() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en')

  const content = {
    en: {
      nav: {
        privacy: 'Privacy',
        startComparing: 'Start Comparing'
      },
      hero: {
        title: 'Compare Hong Kong Properties',
        subtitle: 'Like a Pro',
        description: 'Stop guessing which property to buy! Our intelligent tool helps you compare mortgages, stamp duty, and affordability in seconds. No more property viewing fatigue! 🏠',
        ctaPrimary: 'Start Free Comparison',
        ctaSecondary: 'Watch Demo',
        trust: 'No registration required • Free forever • No agent pressure'
      },
      features: {
        title: 'Everything You Need to Compare Properties',
        subtitle: 'From mortgage calculations to stamp duty analysis, we\'ve got you covered.',
        mortgage: {
          title: 'Smart Mortgage Calculator',
          description: 'Calculate monthly payments based on Hong Kong\'s DSR rules. No more calculation headaches!'
        },
        stampDuty: {
          title: 'Stamp Duty Analysis',
          description: 'Automatic calculation of Hong Kong stamp duty, legal fees, and upfront costs. No more guessing!'
        },
        autocomplete: {
          title: 'Intelligent Autocomplete',
          description: 'Find properties quickly with our comprehensive Hong Kong property database. Faster than finding a job!'
        },
        pdf: {
          title: 'PDF Export',
          description: 'Download detailed comparison reports to share with family or advisors. Even mom can understand!'
        },
        mobile: {
          title: 'Mobile Optimized',
          description: 'Compare properties on any device. View properties even on the MTR!'
        },
        privacy: {
          title: 'Privacy First',
          description: 'Your data stays private. No registration required, no data stored. Privacy is everything!'
        }
      },
      howItWorks: {
        title: 'How It Works',
        subtitle: 'Get your property comparison in 3 simple steps',
        step1: {
          title: 'Enter Your Budget',
          description: 'Set your maximum monthly payment and downpayment budget. We\'ll calculate what you can afford!'
        },
        step2: {
          title: 'Add Properties',
          description: 'Enter property details or use our autocomplete to find properties quickly. Compare up to 5 properties!'
        },
        step3: {
          title: 'Get Results',
          description: 'View detailed comparisons with mortgage calculations, stamp duty analysis, and PDF export!'
        }
      },
      cta: {
        title: 'Ready to Find Your Perfect Property?',
        subtitle: 'Join thousands of Hong Kong buyers making informed property decisions.',
        button: 'Start Comparing Now',
        trust: 'Free • No registration • Instant results • No agent hassle!'
      },
      footer: {
        description: 'The smart way to compare Hong Kong properties and make informed buying decisions.',
        copyright: '© 2024 買乜樓好? | Buy What House Ho?. All rights reserved.'
      }
    },
    zh: {
      nav: {
        privacy: '私隱政策',
        startComparing: '開始比較'
      },
      hero: {
        title: '比較香港物業',
        subtitle: '專業級別',
        description: '唔好再估估下邊個樓盤最抵！我哋嘅智能工具幫你比較按揭、印花稅同負擔能力，幾秒搞掂。唔使再睇樓睇到眼都花！🏠',
        ctaPrimary: '免費開始比較',
        ctaSecondary: '睇示範',
        trust: '唔使註冊 • 永久免費 • 冇地產佬煩你'
      },
      features: {
        title: '比較物業需要嘅嘢，我哋都有',
        subtitle: '由按揭計算到印花稅分析，我哋包晒。',
        mortgage: {
          title: '智能按揭計算器',
          description: '根據香港DSR規則計算月供。唔使再計到頭都大！'
        },
        stampDuty: {
          title: '印花稅分析',
          description: '自動計算香港印花稅、律師費同前期費用。印花稅唔使估！'
        },
        autocomplete: {
          title: '智能自動完成',
          description: '用我哋嘅香港物業數據庫快速搵樓。搵樓快過搵工！'
        },
        pdf: {
          title: 'PDF匯出',
          description: '下載詳細比較報告同家人或顧問分享。阿媽都睇得明！'
        },
        mobile: {
          title: '手機優化',
          description: '任何設備都可以比較物業。搭地鐵都可以睇樓！'
        },
        privacy: {
          title: '私隱優先',
          description: '你嘅資料保持私密。唔使註冊，唔會儲存資料。私隱大過天！'
        }
      },
      howItWorks: {
        title: '點樣運作',
        subtitle: '3個簡單步驟就搞掂物業比較',
        step1: {
          title: '輸入預算',
          description: '設定最大月供同首期預算。我哋會計出你可以負擔幾多！'
        },
        step2: {
          title: '加入物業',
          description: '輸入物業詳情或用我哋嘅自動完成功能快速搵樓。最多可以比較5個物業！'
        },
        step3: {
          title: '睇結果',
          description: '睇詳細比較，包括按揭計算、印花稅分析，仲可以PDF匯出！'
        }
      },
      cta: {
        title: '準備搵你嘅完美物業？',
        subtitle: '加入數千個香港買家，做明智嘅物業決定。',
        button: '立即開始比較',
        trust: '免費 • 唔使註冊 • 即時結果 • 唔使俾地產佬煩！'
      },
      footer: {
        description: '比較香港物業嘅聰明方法，做明智嘅買樓決定。',
        copyright: '© 2024 買乜樓好? | Buy What House Ho?. 版權所有。'
      }
    }
  }

  const t = content[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Floating Language Selector for Mobile */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="bg-white/90 backdrop-blur-sm text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-sm font-medium"
        >
          {language === 'en' ? '中文' : 'EN'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">買乜樓好?</h1>
              <span className="ml-2 text-sm text-gray-500">| Buy What House Ho?</span>
            </div>
            <div className="flex items-center space-x-4 md:space-x-8">
              <button
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-1 rounded border border-gray-300 hover:border-gray-400"
              >
                {language === 'en' ? '中文' : 'English'}
              </button>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
                {t.nav.privacy}
              </Link>
              <Link 
                href="/compare" 
                className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
              >
                {t.nav.startComparing}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t.hero.title}
              <span className="block text-blue-600">{t.hero.subtitle}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/compare"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                {t.hero.ctaPrimary}
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors">
                {t.hero.ctaSecondary}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {t.hero.trust}
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
              >
                {language === 'en' ? '切換至繁體中文' : 'Switch to English'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <FaCalculator className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.features.mortgage.title}</h3>
              <p className="text-gray-600">
                {t.features.mortgage.description}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <FaChartLine className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.features.stampDuty.title}</h3>
              <p className="text-gray-600">
                {t.features.stampDuty.description}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <FaSearch className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.features.autocomplete.title}</h3>
              <p className="text-gray-600">
                {t.features.autocomplete.description}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-xl border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <FaFilePdf className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.features.pdf.title}</h3>
              <p className="text-gray-600">
                {t.features.pdf.description}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-xl border border-teal-100">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
                <FaMobile className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.features.mobile.title}</h3>
              <p className="text-gray-600">
                {t.features.mobile.description}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-xl border border-red-100">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.features.privacy.title}</h3>
              <p className="text-gray-600">
                {t.features.privacy.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600">
              {t.howItWorks.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.howItWorks.step1.title}</h3>
              <p className="text-gray-600">
                {t.howItWorks.step1.description}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.howItWorks.step2.title}</h3>
              <p className="text-gray-600">
                {t.howItWorks.step2.description}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.howItWorks.step3.title}</h3>
              <p className="text-gray-600">
                {t.howItWorks.step3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t.cta.subtitle}
          </p>
          <Link 
            href="/compare"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block"
          >
            {t.cta.button}
          </Link>
          <p className="text-blue-200 mt-4 text-sm">
            {t.cta.trust}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">買乜樓好?</h3>
                <p className="text-gray-400">
                  {t.footer.description}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/compare" className="hover:text-white transition-colors">Start Comparing</Link></li>
                </ul>
              </div>
            </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t.footer.copyright}</p>
            <p className="mt-2 text-sm">Creator: OC</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 