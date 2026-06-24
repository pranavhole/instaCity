import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Hero } from "@/components/landing/Hero";
import { PreviewStrip } from "@/components/landing/PreviewStrip";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <FeatureGrid />
      <PreviewStrip />
    </main>
  );
}
