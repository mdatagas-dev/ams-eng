import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { I18nProvider } from "@/components/i18n-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLang())
  return {
    title: t.metaTitle,
    description: t.metaDescription,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const lang = await getLang()
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={cn("font-sans antialiased", fontMono.variable, geist.variable)}
    >
      <body>
        <I18nProvider lang={lang}>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster richColors />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
