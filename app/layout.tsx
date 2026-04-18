import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/ui/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AswardStore | Tienda Online",
  description: "Encuentra los mejores productos de ropa y zapatos con envío a todo el país",
  keywords: ["ropa", "zapatos", "moda", "e-commerce", "tienda online"],
  openGraph: {
    title: "AswardStore | Tienda Online",
    description: "Encuentra los mejores productos de ropa y zapatos",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col bg-void text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}