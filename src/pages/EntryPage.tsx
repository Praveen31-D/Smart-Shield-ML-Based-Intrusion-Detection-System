import { useNavigate } from "react-router-dom";
import { Shield, Zap, Lock, Eye } from "lucide-react";

const EntryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-main bg-grid flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-px bg-emerald-400/10 animate-scan" />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Shield logo */}
        <div className="flex justify-center mb-10">
          <div className="relative animate-float">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl scale-150" />
            <div className="relative w-32 h-32 flex items-center justify-center">
              <Shield
                className="w-28 h-28 shield-glow"
                style={{ color: "hsl(150, 100%, 45%)" }}
                fill="rgba(16, 185, 129, 0.1)"
                strokeWidth={1.5}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-6 h-6 rounded-full animate-pulse"
                  style={{ background: "hsl(150, 100%, 45%)", opacity: 0.9 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
            Neural Defense Network Online
          </span>
        </div>

        {/* Main title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          <span className="text-slate-100 font-mono">ML-Based</span>
          <br />
          <span className="text-glow font-mono" style={{ color: "hsl(150, 100%, 45%)" }}>
            Intrusion Detection
          </span>
          <br />
          <span className="text-slate-100 font-mono">System</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-4 font-sans leading-relaxed">
          Advanced multi-model AI architecture for real-time network defense.
        </p>
        <p className="text-sm text-slate-500 max-w-xl mx-auto mb-12 font-mono">
          XGBoost · Random Forest · SVM · KNN · 10-Class Detection · 3.8M+ Samples
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: Zap, label: "99.9% Peak Accuracy" },
            { icon: Eye, label: "Real-time Monitoring" },
            { icon: Lock, label: "Enterprise Security" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-700/50"
            >
              <Icon className="w-3.5 h-3.5" style={{ color: "hsl(150, 100%, 45%)" }} />
              <span className="text-xs font-mono text-slate-300">{label}</span>
            </div>
          ))}
        </div>

        {/* Initialize button */}
        <button
          onClick={() => navigate("/details")}
          className="btn-primary relative group px-10 py-4 rounded-lg text-base font-mono font-semibold tracking-wider uppercase"
          id="initialize-system-btn"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Shield className="w-5 h-5" />
            Initialize System
          </span>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>

        <p className="mt-6 text-xs text-slate-600 font-mono">
          VERSION 3.0 · MULTI-MODEL ARCHITECTURE · ULTRA-ENHANCED MODE
        </p>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-3 text-slate-700 text-xs font-mono">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-emerald-500/40" />
          ML-IDS PLATFORM v3.0
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-emerald-500/40" />
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
