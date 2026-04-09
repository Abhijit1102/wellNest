import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display, Roboto_Condensed, Lobster_Two, Merriweather } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: '--font-playfair' });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["100", "300", "400", "700", "900"], variable: '--font-roboto-condensed' });
const lobsterTwo = Lobster_Two({ subsets: ["latin"], weight: ["400", "700"], variable: '--font-lobster' });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["300", "400", "700", "900"], variable: '--font-merriweather' });

export const metadata: Metadata = {
  title: 'WellNest - AI Mental Health Companion',
  description: 'Your personal mental health companion powered by AI. Track your mood, journal your thoughts, and get personalized wellness support.',
  generator: 'Abhijit Rajkumar',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${robotoCondensed.variable} ${lobsterTwo.variable} ${merriweather.variable}`} suppressHydrationWarning>
      <head />
      <body className={`${playfairDisplay.className} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
