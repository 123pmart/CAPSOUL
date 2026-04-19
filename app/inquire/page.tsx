import type { Metadata } from "next";

import { InquiryScene } from "@/components/inquiry-scene";
import { getResolvedInquiryScene } from "@/lib/live-scenes";

export const metadata: Metadata = {
  title: "Inquire",
  description:
    "A compact full-screen CAPSOUL inquiry scene designed to feel private, fast, and thoughtfully guided.",
};

export const dynamic = "force-dynamic";

export default async function InquirePage() {
  const inquiryScene = await getResolvedInquiryScene();
  return <InquiryScene sceneData={inquiryScene} />;
}
