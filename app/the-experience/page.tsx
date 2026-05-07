import type { Metadata } from "next";

import { PublicExperiencePage } from "@/components/public/public-experience-page";

export const metadata: Metadata = {
  title: "The Experience",
  description:
    "A full-screen CAPSOUL scene showing how the experience stays calm, prepared, and emotionally considerate from first conversation through final delivery.",
};

export const dynamic = "force-dynamic";

export default async function ExperiencePage() {
  return <PublicExperiencePage />;
}
