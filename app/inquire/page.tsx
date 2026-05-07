import type { Metadata } from "next";

import { PublicExperiencePage } from "@/components/public/public-experience-page";

export const metadata: Metadata = {
  title: "Inquire",
  description:
    "A compact full-screen CAPSOUL inquiry scene designed to feel private, fast, and thoughtfully guided.",
};

export const dynamic = "force-dynamic";

export default async function InquirePage() {
  return <PublicExperiencePage />;
}
