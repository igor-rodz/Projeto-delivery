import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delivio - Crie seu cardápio digital",
  description: "Plataforma SaaS para restaurantes criarem seu cardápio digital e receberem pedidos online. Fácil, rápido e profissional.",
  keywords: "cardápio digital, delivery, restaurante, pedidos online, delivio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </body>
    </html>
  );
}
