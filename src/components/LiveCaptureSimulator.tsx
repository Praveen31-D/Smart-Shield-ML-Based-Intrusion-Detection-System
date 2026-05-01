import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Radio } from "lucide-react";
import { attackTypes } from "@/data/attackData";
import { SEVERITY_MAP, randomIp, PROTOCOLS } from "@/lib/constants";

interface LiveFlow {
  id: number;
  timestamp: string;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: string;
  bytes: number;
  packets: number;
  prediction: string;
  confidence: number;
  severity: "safe" | "medium" | "high" | "critical";
}

const commonPorts = [22, 53, 80, 443, 445, 3389, 8080, 21, 25, 110, 3306, 5432];

const severityStyle: Record<string, string> = {
  safe: "text-success",
  medium: "text-accent",
  high: "text-warning",
  critical: "text-destructive",
};

const LiveCaptureSimulator = () => {
  const [running, setRunning] = useState(false);
  const [flows, setFlows] = useState<LiveFlow[]>([]);
  const [stats, setStats] = useState({ total: 0, normal: 0, attacks: 0, critical: 0 });
  const counterRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const generateFlow = useCallback((): LiveFlow => {
    counterRef.current += 1;
    const isAttack = Math.random() < 0.35;
    const attackPool = attackTypes.filter((a) => a.name !== "Normal");
    const chosen = isAttack
      ? attackPool[Math.floor(Math.random() * attackPool.length)]
      : attackTypes.find((a) => a.name === "Normal")!;

    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

    return {
      id: counterRef.current,
      timestamp: ts,
      srcIp: randomIp(),
      dstIp: randomIp(),
      srcPort: Math.floor(Math.random() * 60000) + 1024,
      dstPort: commonPorts[Math.floor(Math.random() * commonPorts.length)],
      protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
      bytes: Math.floor(Math.random() * 50000) + 40,
      packets: Math.floor(Math.random() * 100) + 1,
      prediction: chosen.name,
      confidence: 0.75 + Math.random() * 0.24,
      severity: SEVERITY_MAP[chosen.name] || "safe",
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const newFlow = generateFlow();
      setFlows((prev) => {
        const updated = [...prev, newFlow].slice(-50); // Keep last 50
        return updated;
      });
      setStats((prev) => ({
        total: prev.total + 1,
        normal: prev.normal + (newFlow.prediction === "Normal" ? 1 : 0),
        attacks: prev.attacks + (newFlow.prediction !== "Normal" ? 1 : 0),
        critical: prev.critical + (newFlow.severity === "critical" ? 1 : 0),
      }));
    }, 600);
    return () => clearInterval(interval);
  }, [running, generateFlow]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [flows]);

  const reset = () => {
    setRunning(false);
    setFlows([]);
    setStats({ total: 0, normal: 0, attacks: 0, critical: 0 });
    counterRef.current = 0;
  };

  return (
    <section id="live" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary text-glow">Live</span>{" "}
            <span className="text-foreground">Capture Simulator</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simulated real-time network traffic analysis with ML-based classification. 
            Watch as the dual-model engine classifies each flow in real-time.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRunning(!running)}
                className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition-all ${
                  running
                    ? "bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30"
                    : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                }`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? "Pause" : "Start Capture"}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded font-mono text-sm text-muted-foreground border border-border hover:text-foreground hover:border-border transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div className="flex items-center gap-2">
              {running && (
                <>
                  <Radio className="w-4 h-4 text-destructive animate-pulse" />
                  <span className="text-xs font-mono text-destructive">LIVE</span>
                </>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Total Flows", value: stats.total, cls: "text-foreground" },
              { label: "Normal", value: stats.normal, cls: "text-success" },
              { label: "Attacks", value: stats.attacks, cls: "text-warning" },
              { label: "Critical", value: stats.critical, cls: "text-destructive" },
            ].map((s) => (
              <div key={s.label} className="card-cyber rounded-lg p-3 text-center">
                <div className={`text-lg font-mono font-bold ${s.cls}`}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Live feed table */}
          <div className="card-cyber rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div ref={scrollRef} className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs font-mono">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground">Time</th>
                      <th className="text-left py-2 px-3 text-muted-foreground">Source</th>
                      <th className="text-left py-2 px-3 text-muted-foreground">Destination</th>
                      <th className="text-left py-2 px-3 text-muted-foreground">Proto</th>
                      <th className="text-left py-2 px-3 text-muted-foreground">Bytes</th>
                      <th className="text-left py-2 px-3 text-muted-foreground">Prediction</th>
                      <th className="text-left py-2 px-3 text-muted-foreground">Conf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          Press "Start Capture" to begin simulation...
                        </td>
                      </tr>
                    ) : (
                      flows.map((flow) => (
                        <tr key={flow.id} className="border-b border-border/30 hover:bg-primary/5 animate-fade-in">
                          <td className="py-1.5 px-3 text-muted-foreground">{flow.timestamp}</td>
                          <td className="py-1.5 px-3 text-accent">{flow.srcIp}:{flow.srcPort}</td>
                          <td className="py-1.5 px-3 text-accent">{flow.dstIp}:{flow.dstPort}</td>
                          <td className="py-1.5 px-3 text-primary">{flow.protocol}</td>
                          <td className="py-1.5 px-3 text-foreground">{flow.bytes.toLocaleString()}</td>
                          <td className={`py-1.5 px-3 font-bold ${severityStyle[flow.severity]}`}>
                            {flow.prediction}
                          </td>
                          <td className="py-1.5 px-3 text-muted-foreground">{(flow.confidence * 100).toFixed(1)}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveCaptureSimulator;
