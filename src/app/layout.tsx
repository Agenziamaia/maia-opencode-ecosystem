import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'MAIA - 21 Agents. One Purpose.',
  description: 'Amplify Human Potential through autonomous agent collaboration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
