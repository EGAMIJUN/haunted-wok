import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haunted Wok',
  description: 'A horror game set in a haunted Chinese restaurant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
