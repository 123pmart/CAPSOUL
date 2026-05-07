import type { Metadata } from "next";

import { PublicExperiencePage } from "@/components/public/public-experience-page";

export const metadata: Metadata = {
  title: "What We Preserve",
  description:
    "A full-screen CAPSOUL scene exploring the story chapters a family can preserve through a private legacy documentary.",
};

export const dynamic = "force-dynamic";

export default async function WhatWePreservePage() {
  return <PublicExperiencePage />;
}
