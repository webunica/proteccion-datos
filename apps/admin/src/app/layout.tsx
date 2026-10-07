import type { Metadata } from 'next';
import { Poppins, DM_Sans } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Panel Ley 21.719 | Cumplimiento Protección de Datos',
  description:
    'Sistema de cumplimiento Ley 21.719 para tiendas Shopify y WooCommerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${dmSans.variable} scroll-smooth`}>
      <body className="font-sans antialiased text-navy-800 bg-white selection:bg-teal-100 selection:text-navy">
        {children}
      </body>
    </html>
  );
}
