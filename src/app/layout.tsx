import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🎮 Melon Games - English Learning Games for Kids',
  description: 'Interactive English learning games for kids. Play with arrow keys!',
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
