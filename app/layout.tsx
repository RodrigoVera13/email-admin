import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Panel dde Notificaciones',
  description: 'Manifiestos numerados',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}
        <Toaster richColors position="top-right" />
      </body>
      
    </html>
  )
}
