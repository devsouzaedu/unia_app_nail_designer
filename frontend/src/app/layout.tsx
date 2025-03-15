// src/app/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import Header from "../components/Header"; 



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>Unia App</title>
        <link rel="icon" href="/favicon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.jpg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Unia App - Designs de unhas com IA" />
      </head>
      <body>
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
