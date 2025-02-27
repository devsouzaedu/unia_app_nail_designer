// src/app/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import Header from "../components/Header";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>Unia App</title>
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
