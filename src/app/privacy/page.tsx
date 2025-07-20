import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - 買乜樓好? | Buy What House Ho?',
  description: 'Privacy policy for the Hong Kong Property Comparison Tool',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Information We Collect
            </h2>
            <p className="text-gray-700 mb-4">
              Our Hong Kong Property Comparison Tool is designed with privacy in mind. We do not collect, store, or transmit any personal information to external servers. All data is stored locally on your device using browser localStorage.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Local Storage
            </h2>
            <p className="text-gray-700 mb-4">
              The application uses localStorage to save your property comparisons and financial information. This data remains on your device and is not shared with us or any third parties.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Tracking
            </h2>
            <p className="text-gray-700 mb-4">
              We do not use cookies, analytics, or any tracking technologies. Your browsing activity remains private and is not monitored.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              For privacy-related questions, please contact us at privacy@bbreveal.com
            </p>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Created by OC | www.bbreveal.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 