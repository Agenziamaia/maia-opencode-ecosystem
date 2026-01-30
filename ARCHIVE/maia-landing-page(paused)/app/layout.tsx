import './globals.css'

export const metadata = {
  title: 'MAIA Skills Demo',
  description: 'Interactive demonstrations of MAIA agentic capabilities',
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
