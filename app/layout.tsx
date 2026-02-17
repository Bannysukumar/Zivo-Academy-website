import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const metadata: Metadata = {
  title: {
    default: 'ZIVO Academy - Learn Skills. Build Projects. Get Hired.',
    template: '%s | ZIVO Academy',
  },
  description: 'Premium online courses in Web Development, Data Science, Cloud Computing, Mobile Development & more. Learn from industry experts with project-based curriculum.',
  keywords: ['online courses', 'web development', 'data science', 'programming', 'ZIVO Academy', 'learn coding'],
  authors: [{ name: 'ZIVO Academy' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'ZIVO Academy',
    title: 'ZIVO Academy - Learn Skills. Build Projects. Get Hired.',
    description: 'Premium online courses in Web Development, Data Science, Cloud Computing & more.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
