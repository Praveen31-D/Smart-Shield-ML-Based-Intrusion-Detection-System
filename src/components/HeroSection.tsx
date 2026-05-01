import { Shield, Activity, Database, Cpu, FileText, Upload } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-px bg-primary/20 animate-scan" />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-mono text-primary">SYSTEM ACTIVE — ULTRA-ENHANCED MODE</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-foreground">ML-Based</span>
            <br />
            <span className="text-primary text-glow">Intrusion Detection</span>
            <br />
            <span className="text-foreground">System</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-sans">
            Advanced network security powered by dual-model Random Forest architecture. 
            Real-time classification of 10 attack categories with 95-99% accuracy.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Shield, label: "10 Attack Types", value: "Multi-class" },
              { icon: Activity, label: "Accuracy", value: "95-99%" },
              { icon: Database, label: "Training Samples", value: "3.8M+" },
              { icon: Cpu, label: "Architecture", value: "Dual-Model" },
              { icon: FileText, label: "Input Formats", value: "PCAP / CSV" },
              { icon: Upload, label: "Processing", value: "Real-time" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="card-cyber rounded-lg p-4 text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-sm font-mono text-primary">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
