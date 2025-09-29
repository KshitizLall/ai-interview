import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { WebSocketProvider } from '@/components/websocket-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'InterviewBot',
  description: 'AI-powered interview preparation with real-time features',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
        <Analytics />
      </body>
    </html>
  )
}
