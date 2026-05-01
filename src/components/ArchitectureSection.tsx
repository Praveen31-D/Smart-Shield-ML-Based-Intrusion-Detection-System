const ArchitectureSection = () => {
  return (
    <section id="architecture" className="py-20 bg-grid">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary text-glow">System</span>{" "}
            <span className="text-foreground">Architecture</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dual-model Random Forest architecture with automatic feature detection and model selection.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* UNSW Model */}
          <div className="card-cyber rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <h3 className="font-mono font-bold text-foreground">UNSW-NB15 Model</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Features</span>
                <span className="font-mono text-primary">42 flow features</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Training Samples</span>
                <span className="font-mono text-primary">186K balanced</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-mono text-primary">~95%</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Algorithm</span>
                <span className="font-mono text-primary">Random Forest</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Input Formats</span>
                <span className="font-mono text-primary">PCAP, CSV, Wireshark</span>
              </div>
            </div>
          </div>

          {/* NetFlow Model */}
          <div className="card-cyber rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              <h3 className="font-mono font-bold text-foreground">CIC-IDS-2017 Model</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Features</span>
                <span className="font-mono text-accent">80 CIC-IDS-2017 features</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Training Samples</span>
                <span className="font-mono text-accent">3.6M balanced</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-mono text-accent">~99%</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Algorithm</span>
                <span className="font-mono text-accent">Random Forest</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Datasets</span>
                <span className="font-mono text-accent">ToN-IoT, BoT-IoT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline flow */}
        <div className="max-w-5xl mx-auto mt-10">
          <div className="card-cyber rounded-lg p-6">
            <h3 className="font-mono font-bold text-foreground mb-6 text-center">Processing Pipeline</h3>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
              {[
                "📁 Input File",
                "→",
                "🔍 Format Detection",
                "→",
                "⚙️ Feature Extraction",
                "→",
                "🔄 StandardScaler",
                "→",
                "🤖 Model Selection",
                "→",
                "📊 Classification",
                "→",
                "📋 Report",
              ].map((step, i) => (
                <span
                  key={i}
                  className={
                    step === "→"
                      ? "text-primary text-lg"
                      : "px-3 py-2 rounded bg-secondary text-secondary-foreground"
                  }
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="max-w-5xl mx-auto mt-10 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Data Preprocessing",
              steps: [
                "Label encoding for categorical features (proto, service, state)",
                "StandardScaler normalization across all numeric features",
                "SMOTE oversampling to balance attack classes",
                "IP address encoding via LabelEncoder for datasets",
              ],
            },
            {
              title: "Model Training",
              steps: [
                "Random Forest classifier with 100 estimators",
                "Binary model: Normal vs Attack classification",
                "Multi-class model: 10 attack category detection",
                "Cross-validated with 80/20 train-test split",
              ],
            },
            {
              title: "Inference Pipeline",
              steps: [
                "Auto-detect input format (PCAP/CSV)",
                "Extract flow-level features per connection",
                "Select model based on detected feature set",
                "Output: attack type + confidence score per flow",
              ],
            },
          ].map((block) => (
            <div key={block.title} className="card-cyber rounded-lg p-5">
              <h4 className="font-mono text-sm text-primary mb-3">{block.title}</h4>
              <ol className="space-y-2">
                {block.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-card-foreground">
                    <span className="text-primary shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;
