import { useNavigate } from "react-router-dom";
import {
  Shield, Activity, Database, Cpu, FileText, Upload,
  ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Circle
} from "lucide-react";
import { useState, useMemo } from "react";
import TopNav from "@/components/layout/TopNav";
import { attackTypes } from "@/data/attackData";

// Severity indicator component
const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === "safe") return <CheckCircle className="w-4 h-4 severity-safe" />;
  if (severity === "medium") return <Circle className="w-4 h-4 fill-current severity-medium" />;
  if (severity === "high") return <Circle className="w-4 h-4 fill-current severity-high" />;
  return <Circle className="w-4 h-4 fill-current severity-critical" />;
};

const severityLabelColor: Record<string, string> = {
  safe: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  critical: "text-red-500 bg-red-500/10 border-red-500/30",
};

// Machine learning models documented
const mlModels = [
  {
    name: "XGBoost",
    accuracy: "99.9%",
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
    desc: "Extreme gradient boosting for maximum efficiency. Peak binary accuracy and sub-millisecond inference. Best for high-throughput IoT environments.",
    features: "42 UNSW features",
    training: "2.54M samples",
    highlights: ["Fastest inference", "Peak accuracy", "Best for IoT"],
  },
  {
    name: "Random Forest",
    accuracy: "95–99%",
    color: "text-cyan-400",
    dotColor: "bg-cyan-400",
    desc: "Robust ensemble of 100 decision trees using Gini impurity. Lowest false alarm rate of 1.36–1.94%. Ideal for multi-class attack classification.",
    features: "42 + 12 features",
    training: "3.8M balanced",
    highlights: ["Low FAR", "Multi-class expert", "Balanced performance"],
  },
  {
    name: "SVM",
    accuracy: "~90–93%",
    color: "text-purple-400",
    dotColor: "bg-purple-400",
    desc: "Margin-based classifier effective in high-dimensional feature spaces. Strong for binary intrusion detection, though heavier computationally.",
    features: "41 NSL-KDD features",
    training: "175K samples",
    highlights: ["High-dimensional", "Robust margins", "Binary expert"],
  },
  {
    name: "KNN",
    accuracy: "~85%",
    color: "text-blue-400",
    dotColor: "bg-blue-400",
    desc: "Instance-based learning grouping similar traffic behaviors. Excellent anomaly detection baseline with zero training time. Good for prototyping.",
    features: "80 CIC-IDS-2017 features",
    training: "Lazy learning",
    highlights: ["Zero training", "Anomaly baseline", "Instance-based"],
  },
];

// Stat cards definition
const statCards = [
  { icon: Shield, label: "Attack Types", value: "10", sub: "Multi-class" },
  { icon: Cpu, label: "Model Architecture", value: "4", sub: "Multi-Model" },
  { icon: Database, label: "Training Samples", value: "3.8M+", sub: "Balanced / SMOTE" },
  { icon: Activity, label: "Peak Accuracy", value: "99.9%", sub: "XGBoost" },
  { icon: FileText, label: "Input Formats", value: "PCAP/CSV", sub: "Wireshark · CIC-IDS-2017" },
  { icon: Upload, label: "Processing", value: "Real-time", sub: "Micro-second Stream" },
];

const DetailsPage = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleAttack = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  const sortedAttacks = useMemo(() => attackTypes, []);

  return (
    <div className="min-h-screen bg-main">
      <TopNav />
      
      {/* Hero section */}
      <section className="pt-28 pb-16 bg-grid relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-6">
          {/* Status badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-500/40 bg-emerald-500/8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-mono text-emerald-400 tracking-widest">
                SYSTEM ACTIVE — ULTRA-ENHANCED MODE
              </span>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-5 font-mono text-slate-100">
              Platform{" "}
              <span className="text-glow" style={{ color: "hsl(150, 100%, 45%)" }}>
                Intelligence
              </span>{" "}
              &amp; Architecture
            </h1>
            <p className="text-slate-400 text-lg">
              Enterprise-grade multi-model ML intrusion detection with comprehensive attack taxonomy, 
              empirical dataset validation, and production-ready inference pipelines.
            </p>
          </div>

          {/* Stat Grid — 6 large metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-6">
            {statCards.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="card-cyber rounded-xl p-6 metric-card-glow text-center hover:border-emerald-500/30 transition-all duration-200">
                <Icon className="w-6 h-6 mx-auto mb-3" style={{ color: "hsl(150, 100%, 45%)" }} />
                <div className="stat-number text-3xl md:text-4xl mb-1">{value}</div>
                <div className="text-xs font-mono text-slate-400">{sub}</div>
                <div className="text-[10px] text-slate-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* CTA to Operations */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/operations")}
              className="btn-primary px-8 py-3 rounded-lg font-mono text-sm"
              id="go-to-ops-cta"
            >
              Open Operations Dashboard →
            </button>
          </div>
        </div>
      </section>

      {/* Attack Classification Catalog */}
      <section className="py-20 bg-grid">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono">
              <span className="text-glow" style={{ color: "hsl(150, 100%, 45%)" }}>Attack</span>{" "}
              <span className="text-slate-100">Classification Catalog</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The IDS classifies network traffic into 10 distinct categories with empirically validated severity 
              levels and behavioral signatures.
            </p>
          </div>

          <div className="grid gap-3 max-w-5xl mx-auto">
            {sortedAttacks.map((attack) => (
              <div
                key={attack.name}
                className={`card-cyber rounded-xl overflow-hidden transition-all duration-300 ${
                  expanded === attack.name ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]" : ""
                }`}
              >
                <button
                  onClick={() => toggleAttack(attack.name)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-emerald-400/3 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{attack.icon}</span>
                    <div>
                      <div className="flex items-center gap-3">
                        <SeverityIcon severity={attack.severity} />
                        <h3 className="text-base font-mono font-bold text-slate-100">{attack.name}</h3>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            severityLabelColor[attack.severity]
                          }`}
                        >
                          {attack.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{attack.description}</p>
                    </div>
                  </div>
                  {expanded === attack.name ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {expanded === attack.name && (
                  <div className="px-5 pb-5 border-t border-slate-800 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-lg bg-slate-900/60">
                        <h4 className="text-[10px] font-mono text-emerald-400 mb-2 uppercase tracking-wider">
                          Technical Detail
                        </h4>
                        <p className="text-sm text-slate-300">{attack.technicalDetail}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-900/60">
                        <h4 className="text-[10px] font-mono text-emerald-400 mb-2 uppercase tracking-wider">
                          Key Indicators
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {attack.indicators.map((ind) => (
                            <span
                              key={ind}
                              className="text-xs px-2.5 py-1 rounded-full bg-emerald-400/8 text-emerald-300 border border-emerald-400/20 font-mono"
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-[10px] font-mono text-emerald-400 mb-2 uppercase tracking-wider">
                        Reference Samples (3 flows)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="border-b border-slate-800">
                              {["#", "Source IP", "Dest IP", "Port", "Proto", "Duration", "Bytes", "Packets"].map((h) => (
                                <th key={h} className="text-left py-2 px-2 text-slate-500 font-normal">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {attack.samples.map((s) => (
                              <tr key={s.id} className="border-b border-slate-800/50 hover:bg-emerald-400/3">
                                <td className="py-1.5 px-2 text-slate-500">{s.id}</td>
                                <td className="py-1.5 px-2 text-cyan-400">{s.srcIp}</td>
                                <td className="py-1.5 px-2 text-cyan-400">{s.dstIp}</td>
                                <td className="py-1.5 px-2 text-slate-300">{s.dstPort}</td>
                                <td className="py-1.5 px-2 text-emerald-400">{s.protocol}</td>
                                <td className="py-1.5 px-2 text-slate-300">{s.duration}s</td>
                                <td className="py-1.5 px-2 text-slate-300">{s.bytes.toLocaleString()}</td>
                                <td className="py-1.5 px-2 text-slate-300">{s.packets}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture & Model Accuracies */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono">
              <span className="text-glow" style={{ color: "hsl(150, 100%, 45%)" }}>System</span>{" "}
              <span className="text-slate-100">Architecture & Models</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Four integrated machine learning algorithms with empirically validated accuracy metrics 
              across the UNSW-NB15, NSL-KDD and CIC-IDS-2017 datasets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-10">
            {mlModels.map((model) => (
              <div key={model.name} className="card-cyber rounded-xl p-6 hover:border-emerald-500/20 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${model.dotColor} animate-pulse`} />
                    <h3 className={`font-mono font-bold text-lg ${model.color}`}>{model.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-mono font-bold ${model.color}`}>{model.accuracy}</div>
                    <div className="text-[10px] text-slate-500">accuracy</div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">{model.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {model.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <div className="text-slate-600">Features</div>
                    <div className="text-slate-300">{model.features}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Training</div>
                    <div className="text-slate-300">{model.training}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Processing Pipeline */}
          <div className="max-w-5xl mx-auto">
            <div className="card-cyber rounded-xl p-6">
              <h3 className="font-mono font-bold text-slate-100 mb-6 text-center text-sm">
                ML Inference Pipeline
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                {[
                  { label: "📁 Input File", color: "bg-slate-800 text-slate-300" },
                  { label: "→", color: "" },
                  { label: "🔍 Format Detection", color: "bg-slate-800 text-slate-300" },
                  { label: "→", color: "" },
                  { label: "⚙️ Feature Extraction", color: "bg-slate-800 text-slate-300" },
                  { label: "→", color: "" },
                  { label: "🔄 StandardScaler", color: "bg-slate-800 text-slate-300" },
                  { label: "→", color: "" },
                  { label: "🤖 Model Inference", color: "bg-emerald-900/40 text-emerald-300 border border-emerald-500/20" },
                  { label: "→", color: "" },
                  { label: "📊 Classification", color: "bg-slate-800 text-slate-300" },
                  { label: "→", color: "" },
                  { label: "📋 Report", color: "bg-slate-800 text-slate-300" },
                ].map((step, i) => (
                  <span
                    key={i}
                    className={
                      step.label === "→"
                        ? "text-emerald-400 text-base"
                        : `px-3 py-2 rounded ${step.color}`
                    }
                  >
                    {step.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Methodology grid */}
          <div className="max-w-5xl mx-auto mt-6 grid md:grid-cols-3 gap-4">
            {[
              {
                title: "Data Preprocessing",
                items: [
                  "Label Encoding: proto, service, state",
                  "StandardScaler normalization",
                  "SMOTE for class imbalance",
                  "IP encoding for datasets",
                ],
              },
              {
                title: "Training Strategy",
                items: [
                  "100 estimators (RF) / 200 rounds (XGB)",
                  "Multi-class: 10 attack category labels",
                  "Binary: Normal vs Attack",
                  "80/20 stratified cross-validation",
                ],
              },
              {
                title: "Inference Engine",
                items: [
                  "Auto-detect PCAP/CSV/CIC-IDS-2017 format",
                  "Flow-level feature extraction",
                  "Model selection by feature signature",
                  "Output: label + confidence per flow",
                ],
              },
            ].map((block) => (
              <div key={block.title} className="card-cyber rounded-xl p-5">
                <h4 className="font-mono text-sm text-emerald-400 mb-3">{block.title}</h4>
                <ol className="space-y-2">
                  {block.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-emerald-400 shrink-0">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-mono text-slate-600">
            ML-Based Intrusion Detection System — Academic Major Project · Multi-Model Architecture
          </p>
          <p className="text-xs text-slate-700 mt-1">
            XGBoost · Random Forest · SVM · KNN · UNSW-NB15 · NSL-KDD · CIC-IDS-2017 · 3.8M+ Training Samples
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DetailsPage;
