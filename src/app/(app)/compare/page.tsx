import type { Metadata } from "next";
import { CompareView } from "@/components/pages/(app)";

export const metadata: Metadata = {
  title: "zMAAI | Compare",
  description:
    "Side-by-side vault comparison. Stack APY, TVL, and risk across protocols and chains — pick the best yield route in seconds.",
};

export default function ComparePage() {
  return <CompareView />;
}
