import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Shell from '@/components/Shell'
import AuthGuard from '@/components/AuthGuard'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-offwhite`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthGuard>
            <Shell>{children}</Shell>
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  )
}
