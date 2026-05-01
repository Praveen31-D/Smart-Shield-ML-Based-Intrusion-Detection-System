import { useState } from "react";

// Confusion matrix data for UNSW-NB15 multi-class model
const classes = ["Normal", "Generic", "Exploits", "Fuzzers", "DoS", "Recon", "Analysis", "Backdoor", "Shellcode", "Worms"];

const confusionMatrixUNSW: number[][] = [
  [3520, 12, 8, 5, 3, 7, 2, 1, 0, 0],    // Normal
  [15, 3800, 25, 10, 8, 5, 3, 2, 1, 0],   // Generic
  [10, 30, 3150, 15, 12, 8, 5, 3, 2, 0],  // Exploits
  [8, 5, 18, 1700, 6, 4, 3, 2, 1, 0],     // Fuzzers
  [5, 8, 10, 4, 1150, 3, 2, 1, 0, 0],     // DoS
  [6, 4, 7, 3, 2, 990, 5, 1, 1, 0],       // Recon
  [3, 2, 5, 4, 1, 6, 180, 1, 0, 0],       // Analysis
  [2, 1, 3, 2, 1, 1, 1, 160, 1, 0],       // Backdoor
  [1, 0, 3, 1, 0, 1, 0, 1, 105, 0],       // Shellcode
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 12],        // Worms
];

// ROC curve data points for each class (simplified)
const rocCurves = [
  { name: "Normal", color: "hsl(150, 100%, 45%)", auc: 0.987, points: generateROC(0.987) },
  { name: "Generic", color: "hsl(0, 72%, 51%)", auc: 0.975, points: generateROC(0.975) },
  { name: "Exploits", color: "hsl(38, 92%, 50%)", auc: 0.962, points: generateROC(0.962) },
  { name: "Fuzzers", color: "hsl(180, 100%, 40%)", auc: 0.958, points: generateROC(0.958) },
  { name: "DoS", color: "hsl(280, 70%, 55%)", auc: 0.971, points: generateROC(0.971) },
  { name: "Recon", color: "hsl(200, 80%, 50%)", auc: 0.965, points: generateROC(0.965) },
  { name: "Backdoor", color: "hsl(320, 70%, 50%)", auc: 0.943, points: generateROC(0.943) },
  { name: "Shellcode", color: "hsl(30, 80%, 50%)", auc: 0.935, points: generateROC(0.935) },
];

function generateROC(auc: number): { fpr: number; tpr: number }[] {
  const points: { fpr: number; tpr: number }[] = [{ fpr: 0, tpr: 0 }];
  const steepness = auc * 8;
  for (let i = 1; i <= 20; i++) {
    const fpr = i / 20;
    const tpr = Math.min(1, 1 - Math.pow(1 - fpr, steepness));
    points.push({ fpr, tpr });
  }
  points.push({ fpr: 1, tpr: 1 });
  return points;
}

const ConfusionMatrixChart = () => {
  const [selectedModel, setSelectedModel] = useState<"unsw" | "cic">("unsw");

  // Get max value for color scaling
  const allValues = confusionMatrixUNSW.flat();
  const maxVal = Math.max(...allValues);

  const getCellColor = (value: number, row: number, col: number) => {
    if (row === col) {
      // Diagonal (correct predictions) - green intensity
      const intensity = Math.min(value / maxVal, 1);
      return `hsl(150, 100%, ${20 + intensity * 35}%)`;
    }
    if (value === 0) return "hsl(222, 30%, 8%)";
    // Off-diagonal (misclassifications) - red intensity
    const intensity = Math.min(value / 50, 1);
    return `hsl(0, ${50 + intensity * 40}%, ${15 + intensity * 25}%)`;
  };

  return (
    <div className="space-y-8">
      {/* Confusion Matrix */}
      <div className="card-cyber rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-sm text-primary">Confusion Matrix — Multi-class Classification</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedModel("unsw")}
              className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
                selectedModel === "unsw"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              UNSW-NB15
            </button>
            <button
              onClick={() => setSelectedModel("cic")}
              className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
                selectedModel === "cic"
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CIC-IDS-2017
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Column headers */}
            <div className="flex">
              <div className="w-20 shrink-0" />
              {classes.map((cls) => (
                <div
                  key={cls}
                  className="flex-1 text-center text-[9px] font-mono text-muted-foreground pb-1 truncate px-0.5"
                  title={cls}
                >
                  {cls.slice(0, 5)}
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            {confusionMatrixUNSW.map((row, i) => (
              <div key={i} className="flex items-center">
                <div className="w-20 shrink-0 text-[9px] font-mono text-muted-foreground text-right pr-2 truncate" title={classes[i]}>
                  {classes[i]}
                </div>
                {row.map((val, j) => {
                  const scaleFactor = selectedModel === "cic" ? 1.05 : 1;
                  const displayVal = selectedModel === "cic" && i === j
                    ? Math.round(val * scaleFactor)
                    : selectedModel === "cic" && i !== j
                    ? Math.max(0, Math.round(val * 0.3))
                    : val;
                  return (
                    <div
                      key={j}
                      className="flex-1 aspect-square flex items-center justify-center text-[8px] font-mono border border-background/50 transition-colors"
                      style={{ backgroundColor: getCellColor(displayVal, i, j) }}
                      title={`Actual: ${classes[i]} → Predicted: ${classes[j]}: ${displayVal}`}
                    >
                      <span className={displayVal > 0 ? "text-foreground/80" : "text-muted-foreground/30"}>
                        {displayVal > 0 ? displayVal : "·"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Labels */}
            <div className="flex justify-center mt-3">
              <span className="text-[10px] font-mono text-muted-foreground">← Predicted Label →</span>
            </div>
            <div className="flex justify-start mt-1 ml-2">
              <span className="text-[10px] font-mono text-muted-foreground">↑ Actual Label</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: "hsl(150, 100%, 40%)" }} />
            <span className="text-[10px] font-mono text-muted-foreground">Correct (diagonal)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: "hsl(0, 70%, 35%)" }} />
            <span className="text-[10px] font-mono text-muted-foreground">Misclassified</span>
          </div>
        </div>
      </div>

      {/* ROC Curves */}
      <div className="card-cyber rounded-lg p-6">
        <h3 className="font-mono text-sm text-primary mb-4">ROC Curves — One-vs-Rest (Multi-class)</h3>

        <div className="relative" style={{ height: 350 }}>
          {/* SVG ROC plot */}
          <svg viewBox="0 0 400 350" className="w-full h-full">
            {/* Grid lines */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((v) => (
              <g key={v}>
                <line
                  x1={50} y1={300 - v * 270} x2={380} y2={300 - v * 270}
                  stroke="hsl(222, 30%, 16%)" strokeWidth={0.5}
                />
                <line
                  x1={50 + v * 330} y1={30} x2={50 + v * 330} y2={300}
                  stroke="hsl(222, 30%, 16%)" strokeWidth={0.5}
                />
                <text x={40} y={304 - v * 270} textAnchor="end" fill="hsl(220, 15%, 50%)" fontSize={9} fontFamily="JetBrains Mono">
                  {v.toFixed(1)}
                </text>
                <text x={50 + v * 330} y={315} textAnchor="middle" fill="hsl(220, 15%, 50%)" fontSize={9} fontFamily="JetBrains Mono">
                  {v.toFixed(1)}
                </text>
              </g>
            ))}

            {/* Diagonal (random classifier) */}
            <line x1={50} y1={300} x2={380} y2={30} stroke="hsl(220, 15%, 30%)" strokeWidth={1} strokeDasharray="4 4" />

            {/* ROC curves */}
            {rocCurves.map((curve) => (
              <polyline
                key={curve.name}
                points={curve.points.map((p) => `${50 + p.fpr * 330},${300 - p.tpr * 270}`).join(" ")}
                fill="none"
                stroke={curve.color}
                strokeWidth={1.5}
                opacity={0.85}
              />
            ))}

            {/* Axis labels */}
            <text x={215} y={340} textAnchor="middle" fill="hsl(220, 15%, 50%)" fontSize={10} fontFamily="JetBrains Mono">
              False Positive Rate
            </text>
            <text x={15} y={165} textAnchor="middle" fill="hsl(220, 15%, 50%)" fontSize={10} fontFamily="JetBrains Mono" transform="rotate(-90, 15, 165)">
              True Positive Rate
            </text>
          </svg>
        </div>

        {/* Legend with AUC values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {rocCurves.map((curve) => (
            <div key={curve.name} className="flex items-center gap-2">
              <span className="w-3 h-0.5 shrink-0" style={{ background: curve.color }} />
              <span className="text-[10px] font-mono text-muted-foreground">
                {curve.name} <span style={{ color: curve.color }}>(AUC: {curve.auc})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrixChart;
