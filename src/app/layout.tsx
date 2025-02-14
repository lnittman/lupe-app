import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { serverMono } from "@/styles/fonts"
import { Providers } from "@/components/providers"
import { Header } from "@/components/header"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff"
}

export const metadata: Metadata = {
  title: "Lupe",
  description: "Stem player for your music",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lupe"
  },
  formatDetection: {
    telephone: false
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${serverMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/logo.png" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
      </head>
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