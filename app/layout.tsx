import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaRun — Criaturas & Plataformas",
  description:
    "Juego de plataformas 2D con criaturas originales. Elige tu criatura y conquista los niveles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
