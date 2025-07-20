import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '買乜樓好? | Buy What House Ho? - Hong Kong Property Comparison Tool',
  description: 'Compare Hong Kong residential properties with intelligent autocomplete, mortgage calculations, and stamp duty analysis. Perfect for first-time buyers and property investors.',
  keywords: 'Hong Kong property, property comparison, mortgage calculator, stamp duty, first-time buyer, property investment, 買樓, 物業比較, 按揭計算',
  authors: [{ name: 'OC' }],
  creator: 'OC',
  publisher: '買乜樓好?',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.bbreveal.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '買乜樓好? | Buy What House Ho?',
    description: 'Compare Hong Kong residential properties with intelligent autocomplete, mortgage calculations, and stamp duty analysis. Perfect for first-time buyers and property investors.',
    url: 'https://www.bbreveal.com',
    siteName: '買乜樓好? | Buy What House Ho?',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hong Kong Property Comparison Tool - 買乜樓好?',
      },
    ],
    locale: 'zh_HK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '買乜樓好? | Buy What House Ho?',
    description: 'Compare Hong Kong residential properties with intelligent autocomplete, mortgage calculations, and stamp duty analysis.',
    images: ['/og-image.png'],
    creator: '@bbreveal',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "買乜樓好? | Buy What House Ho?",
    "description": "Compare Hong Kong residential properties with intelligent autocomplete, mortgage calculations, and stamp duty analysis.",
    "url": "https://www.bbreveal.com",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "author": {
      "@type": "Person",
      "name": "OC"
    },
    "creator": {
      "@type": "Person",
      "name": "OC"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "HKD"
    },
    "featureList": [
      "Hong Kong Property Comparison",
      "Intelligent Autocomplete",
      "Mortgage Calculator",
      "Stamp Duty Analysis",
      "PDF Export"
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
} 