import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daily Fit",
  description: "Acompanhe seu treino e dieta de forma inteligente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen`}>
        <Providers>
          {children}
        </Providers>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
