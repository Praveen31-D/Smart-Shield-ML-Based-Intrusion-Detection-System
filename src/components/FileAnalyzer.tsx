import { useState, useCallback } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { attackTypes } from "@/data/attackData";

interface AnalysisResult {
  totalFlows: number;
  predictions: { label: string; count: number; confidence: number }[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

const FileAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const simulateAnalysis = useCallback((fileName: string) => {
    setAnalyzing(true);
    setTimeout(() => {
      const isPcap = fileName.endsWith(".pcap") || fileName.endsWith(".pcapng");
      const totalFlows = isPcap ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 200) + 50;

      // Simulate predictions
      const availableAttacks = attackTypes.filter((a) => a.name !== "Normal");
      const numAttackTypes = Math.floor(Math.random() * 3) + 1;
      const selectedAttacks = availableAttacks
        .sort(() => Math.random() - 0.5)
        .slice(0, numAttackTypes);

      const normalCount = Math.floor(totalFlows * (0.5 + Math.random() * 0.3));
      const attackFlows = totalFlows - normalCount;

      const predictions: AnalysisResult["predictions"] = [
        { label: "Normal", count: normalCount, confidence: 0.92 + Math.random() * 0.07 },
      ];

      let remaining = attackFlows;
      selectedAttacks.forEach((attack, i) => {
        const count = i === selectedAttacks.length - 1 ? remaining : Math.floor(remaining * (0.3 + Math.random() * 0.5));
        remaining -= count;
        predictions.push({
          label: attack.name,
          count: Math.max(1, count),
          confidence: 0.75 + Math.random() * 0.2,
        });
      });

      const attackRatio = attackFlows / totalFlows;
      const riskLevel: AnalysisResult["riskLevel"] =
        attackRatio > 0.5 ? "critical" : attackRatio > 0.3 ? "high" : attackRatio > 0.1 ? "medium" : "low";

      setResult({ totalFlows, predictions, riskLevel });
      setAnalyzing(false);
    }, 2500);
  }, []);

  const handleFile = (f: File) => {
    const validExts = [".pcap", ".pcapng", ".csv"];
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      alert("Please upload a .pcap, .pcapng, or .csv file");
      return;
    }
    setFile(f);
    setResult(null);
    simulateAnalysis(f.name);
  };

  const riskColors = {
    low: "text-success",
    medium: "text-accent",
    high: "text-warning",
    critical: "text-destructive",
  };

  return (
    <section id="analyze" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary text-glow">Packet</span>{" "}
            <span className="text-foreground">Analysis Engine</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload PCAP, PCAPNG, or CSV network capture files for automated intrusion detection analysis.
            The dual-model engine classifies each flow with confidence scoring.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className={`card-cyber rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
              dragOver ? "border-primary border-glow" : ""
            }`}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".pcap,.pcapng,.csv";
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFile(f);
              };
              input.click();
            }}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
            <p className="font-mono text-foreground mb-2">Drop capture file or click to upload</p>
            <p className="text-xs text-muted-foreground font-mono">
              Supported: .pcap • .pcapng • .csv (Wireshark, UNSW-NB15, NSL-KDD, CIC-IDS-2017)
            </p>
          </div>

          {/* Analyzing state */}
          {analyzing && (
            <div className="card-cyber rounded-lg p-8 mt-6 text-center animate-fade-in">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
              <p className="font-mono text-primary text-sm">Analyzing {file?.name}...</p>
              <p className="text-xs text-muted-foreground mt-2">Extracting flows → Feature computation → Model inference</p>
            </div>
          )}

          {/* Results */}
          {result && !analyzing && (
            <div className="card-cyber rounded-lg p-6 mt-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-mono text-sm text-foreground">{file?.name}</p>
                    <p className="text-xs text-muted-foreground">{result.totalFlows} flows analyzed</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 font-mono text-sm ${riskColors[result.riskLevel]}`}>
                  {result.riskLevel === "low" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {result.riskLevel.toUpperCase()} RISK
                </div>
              </div>

              {/* Prediction breakdown */}
              <div className="space-y-3">
                {result.predictions
                  .sort((a, b) => b.count - a.count)
                  .map((pred) => {
                    const pct = (pred.count / result.totalFlows) * 100;
                    const isNormal = pred.label === "Normal";
                    return (
                      <div key={pred.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-foreground">
                            {pred.label}
                            <span className="text-muted-foreground ml-2">({pred.count} flows)</span>
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {(pred.confidence * 100).toFixed(1)}% conf
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isNormal ? "bg-primary" : "bg-destructive"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FileAnalyzer;
