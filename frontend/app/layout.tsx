import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display, Roboto_Condensed, Lobster_Two } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["100", "300", "400", "700", "900"] });
const lobsterTwo = Lobster_Two({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: 'WellNest - AI Mental Health Companion',
  description: 'Your personal mental health companion powered by AI. Track your mood, journal your thoughts, and get personalized wellness support.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfairDisplay.className} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
