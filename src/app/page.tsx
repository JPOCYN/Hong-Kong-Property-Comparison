import Link from 'next/link'
import { FaCalculator, FaChartLine, FaFilePdf, FaSearch, FaMobile, FaShieldAlt } from 'react-icons/fa'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">買乜樓好?</h1>
              <span className="ml-2 text-sm text-gray-500">| Buy What House Ho?</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link 
                href="/compare" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Comparing
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
              Compare Hong Kong Properties
              <span className="block text-blue-600">Like a Pro</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Make informed property decisions with our intelligent comparison tool. 
              Calculate mortgages, stamp duty, and affordability in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/compare"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free Comparison
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No registration required • Free forever
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Compare Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From mortgage calculations to stamp duty analysis, we've got you covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <FaCalculator className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Mortgage Calculator</h3>
              <p className="text-gray-600">
                Calculate monthly payments, interest rates, and affordability based on Hong Kong's DSR rules.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <FaChartLine className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Stamp Duty Analysis</h3>
              <p className="text-gray-600">
                Automatic calculation of Hong Kong stamp duty, legal fees, and upfront costs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <FaSearch className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Intelligent Autocomplete</h3>
              <p className="text-gray-600">
                Find properties quickly with our comprehensive Hong Kong property database.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-xl border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <FaFilePdf className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">PDF Export</h3>
              <p className="text-gray-600">
                Download detailed comparison reports to share with family or advisors.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-xl border border-teal-100">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
                <FaMobile className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile Optimized</h3>
              <p className="text-gray-600">
                Compare properties on any device with our responsive design.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-xl border border-red-100">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy First</h3>
              <p className="text-gray-600">
                Your data stays private. No registration required, no data stored.
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
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your property comparison in 3 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Properties</h3>
              <p className="text-gray-600">
                Enter property details or use our autocomplete to find properties quickly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Set Your Budget</h3>
              <p className="text-gray-600">
                Input your maximum monthly payment and downpayment budget.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Compare & Decide</h3>
              <p className="text-gray-600">
                Get detailed comparisons with affordability analysis and PDF export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Hong Kong buyers making informed property decisions.
          </p>
          <Link 
            href="/compare"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block"
          >
            Start Comparing Now
          </Link>
          <p className="text-blue-200 mt-4 text-sm">
            Free • No registration • Instant results
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">買乜樓好?</h3>
              <p className="text-gray-400">
                The smart way to compare Hong Kong properties and make informed buying decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mortgage Calculator</li>
                <li>Stamp Duty Analysis</li>
                <li>Property Comparison</li>
                <li>PDF Export</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li>Hong Kong Property Guide</li>
                <li>Mortgage Tips</li>
                <li>Stamp Duty Guide</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>FAQ</li>
                <li>Contact Us</li>
                <li>Feedback</li>
                <li>Bug Report</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 買乜樓好? | Buy What House Ho?. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 