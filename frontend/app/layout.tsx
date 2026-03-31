import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { CssBaseline } from '@mui/material'
import { appTheme } from './lib/config/appTheme'
import './globals.css'

export const metadata: Metadata = {
  title: 'DocuMind',
  description: 'Resume analysis frontend',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: appTheme.appBackground, fontFamily: appTheme.uiFontFamily }}>
        <AppRouterCacheProvider>
          <CssBaseline />
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
