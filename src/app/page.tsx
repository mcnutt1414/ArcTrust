import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyArcTrust } from "@/components/landing/WhyArcTrust";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <HowItWorks />
      <WhyArcTrust />
      <CallToAction />
      <Footer />
    </main>
  );
}
