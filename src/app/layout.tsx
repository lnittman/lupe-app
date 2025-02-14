import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { serverMono } from "@/styles/fonts"
import { Providers } from "@/components/providers"
import { Header } from "@/components/header"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "lupe",
  description: "audio stem separation",
  icons: {
    icon: "/favicon.ico",
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'lupe',
  },
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${serverMono.variable}`} suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.className} overflow-hidden`}>
        <Providers>
          <Header />
          <main className="relative flex min-h-screen flex-col pt-16">
            {children}
          </main>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
} 