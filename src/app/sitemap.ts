import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_PATHS } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : path === "/conditions-utilisation" ? "monthly" : "monthly",
    priority: path === "" ? 1 : path === "/inscription" ? 0.9 : 0.7,
  }));
}
