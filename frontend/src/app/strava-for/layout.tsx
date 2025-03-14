"use client";

import { SessionProvider } from "next-auth/react";

export default function StravaForLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="strava-for-layout">
      {children}
    </div>
  );
} 