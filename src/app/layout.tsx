import type { Metadata, Viewport } from "next";
import { Inter, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitPlan — Treino & Nutrição com IA",
  description:
    "Planos de treino e alimentação personalizados por inteligência artificial. Registre cargas, acompanhe sua evolução e alcance seus objetivos.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitPlan",
  },
  openGraph: {
    title: "FitPlan — Treino & Nutrição com IA",
    description: "Planos personalizados de treino e alimentação gerados por IA.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F0F13",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
