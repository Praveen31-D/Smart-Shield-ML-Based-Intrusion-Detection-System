import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AttackCatalog from "@/components/AttackCatalog";
import FileAnalyzer from "@/components/FileAnalyzer";
import LiveCaptureSimulator from "@/components/LiveCaptureSimulator";
import ArchitectureSection from "@/components/ArchitectureSection";
import MetricsSection from "@/components/MetricsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AttackCatalog />
      <FileAnalyzer />
      <LiveCaptureSimulator />
      <ArchitectureSection />
      <MetricsSection />

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            ML-Based Intrusion Detection System — Academic Major Project
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by Multi-Model IDS • UNSW-NB15, NSL-KDD & CIC-IDS-2017 Datasets • Advanced Architecture
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
