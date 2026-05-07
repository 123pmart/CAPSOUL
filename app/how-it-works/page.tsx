import type { Metadata } from "next";

import { PublicExperiencePage } from "@/components/public/public-experience-page";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "A full-screen CAPSOUL process scene showing the step-by-step path from inquiry and discovery through filming, editing, and delivery.",
};

export const dynamic = "force-dynamic";

export default async function HowItWorksPage() {
  return <PublicExperiencePage />;
}
