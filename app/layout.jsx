import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

export const metadata = {
  metadataBase: new URL("https://mahtender.vercel.app"),
  title: {
    default: "MahTender — Maharashtra Government Tender Discovery",
    template: "%s — MahTender",
  },
  description:
    "Search, monitor and analyze Maharashtra government procurement opportunities with a fast, modern interface. Tender information is sourced from the official Maharashtra eProcurement portal.",
  keywords: [
    "Maharashtra tenders",
    "government tenders",
    "eProcurement",
    "mahatenders",
    "tender search",
    "public procurement",
  ],
  openGraph: {
    title: "MahTender — Maharashtra Government Tender Discovery",
    description:
      "A modern way to discover, track and analyze Maharashtra government tenders.",
    type: "website",
  },
  robots: { index: true, follow: true },
  generator: "v0.app",
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1320" },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
