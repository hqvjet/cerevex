import Hero from "@/components/sections/Hero";
import InstantAnalysis from "@/components/sections/InstantAnalysis";
import UseCases from "@/components/sections/UseCases";
import Team from "@/components/sections/Team";
import Publications from "@/components/sections/Publications";
import Footer from "@/components/sections/Footer";

export default function Landing() {
  return (
    <div className="font-sans">
      <Hero />
      <InstantAnalysis />
      <UseCases />
      <Team />
      <Publications />
      <Footer />
    </div>
  );
}
