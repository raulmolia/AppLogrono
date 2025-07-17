import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const fontSans = FontSans({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Sistema Gestión Logroño",
  description: "Sistema de Gestión Integral - Escolapios Logroño",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Toaster />
      </body>
    </html>
  );
}