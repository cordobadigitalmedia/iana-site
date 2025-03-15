import "@/styles/globals.css"
import "@/styles/styles.css"
import type { Metadata, Viewport } from "next"
import { Noto_Naskh_Arabic, Noto_Sans, Noto_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"

import { ThemeProvider } from "@/components/theme-provider"

// Default metadata
export const metadata: Metadata = {
  title: {
    default: "IANA Financial",
    template: "%s | IANA Financial",
  },
  description: "Interest Free Financial Services",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
}

export const viewport: Viewport = {
  width: "device-width",
}

interface RootLayoutProps {
  children: React.ReactNode
}

const noto_sans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
})

const noto_Naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-naskh",
})

const noto_serif = Noto_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-serif",
})

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={
            noto_sans.variable +
            " " +
            noto_Naskh.variable +
            " " +
            noto_serif.variable
          }
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </>
  )
}
