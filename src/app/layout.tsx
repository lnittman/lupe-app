import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { serverMono } from "@/styles/fonts"

import { Providers } from "@/components/providers"

import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "lupe",
  description: "audio stem separation",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${serverMono.variable}`}>
      <head />
      <body className={`${inter.className} font-mono`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 