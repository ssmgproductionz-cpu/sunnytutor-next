import './globals.css';

export const metadata = {
  title: 'Sunny Tutor',
  description: 'Kid-friendly math learning',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
