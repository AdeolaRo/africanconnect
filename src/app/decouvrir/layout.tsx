import type { Metadata } from "next";
import { privateAreaMetadata } from "@/lib/seo";

export const metadata: Metadata = privateAreaMetadata;

export default function DecouvrirLayout({ children }: { children: React.ReactNode }) {
  return children;
}
