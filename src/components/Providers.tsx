"use client";

import { SessionProvider } from "next-auth/react";
import MobileBottomNav from "@/components/MobileBottomNav";
import PwaProvider from "@/components/PwaProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <MobileBottomNav />
      <PwaProvider />
    </SessionProvider>
  );
}
