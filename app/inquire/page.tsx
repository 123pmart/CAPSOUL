import type { Metadata } from "next";

import { InquiryScene } from "@/components/inquiry-scene";
import { getResolvedInquiryScene } from "@/lib/live-scenes";
import { getRequestSiteLocale } from "@/lib/site-locale";

export const metadata: Metadata = {
  title: "Inquire",
  description:
    "A compact full-screen CAPSOUL inquiry scene designed to feel private, fast, and thoughtfully guided.",
};

export const dynamic = "force-dynamic";

export default async function InquirePage() {
  const locale = await getRequestSiteLocale();
  const inquiryScene = await getResolvedInquiryScene(locale);
  return <InquiryScene sceneData={inquiryScene} />;
}
