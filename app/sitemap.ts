import type { MetadataRoute } from "next";

const baseUrl = "https://capsoulfilms.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/faq",
    "/the-experience",
    "/how-it-works",
    "/what-we-preserve",
    "/inquire",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}
