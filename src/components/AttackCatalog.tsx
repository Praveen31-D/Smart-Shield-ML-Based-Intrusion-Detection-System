import { useState } from "react";
import { attackTypes, severityColors, severityBgColors } from "@/data/attackData";
import { ChevronDown, ChevronUp } from "lucide-react";

const AttackCatalog = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section id="attacks" className="py-20 bg-grid">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary text-glow">Attack</span>{" "}
            <span className="text-foreground">Classification Catalog</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The IDS classifies network traffic into 10 distinct categories. Each type includes 
            3 reference samples with realistic network flow data.
          </p>
        </div>

        <div className="grid gap-4 max-w-5xl mx-auto">
          {attackTypes.map((attack) => (
            <div
              key={attack.name}
              className={`card-cyber rounded-lg overflow-hidden transition-all duration-300 ${
                expanded === attack.name ? "border-glow" : ""
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(expanded === attack.name ? null : attack.name)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{attack.icon}</span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-mono font-bold text-foreground">{attack.name}</h3>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded border ${severityBgColors[attack.severity]} ${severityColors[attack.severity]}`}>
                        {attack.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{attack.description}</p>
                  </div>
                </div>
                {expanded === attack.name ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Expanded content */}
              {expanded === attack.name && (
                <div className="px-5 pb-5 border-t border-border animate-fade-in">
                  {/* Technical detail */}
                  <div className="mt-4 mb-4 p-4 rounded bg-secondary/50">
                    <h4 className="text-xs font-mono text-primary mb-2 uppercase tracking-wider">Technical Detail</h4>
                    <p className="text-sm text-card-foreground">{attack.technicalDetail}</p>
                  </div>

                  {/* Indicators */}
                  <div className="mb-4">
                    <h4 className="text-xs font-mono text-primary mb-2 uppercase tracking-wider">Key Indicators</h4>
                    <div className="flex flex-wrap gap-2">
                      {attack.indicators.map((ind) => (
                        <span key={ind} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sample data table */}
                  <div>
                    <h4 className="text-xs font-mono text-primary mb-2 uppercase tracking-wider">
                      Reference Samples (3 sets)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground">#</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Source IP</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Dest IP</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Src Port</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Dst Port</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Proto</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Duration</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Bytes</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Packets</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attack.samples.map((s) => (
                            <tr key={s.id} className="border-b border-border/50 hover:bg-primary/5">
                              <td className="py-2 px-3 text-muted-foreground">{s.id}</td>
                              <td className="py-2 px-3 text-accent">{s.srcIp}</td>
                              <td className="py-2 px-3 text-accent">{s.dstIp}</td>
                              <td className="py-2 px-3 text-foreground">{s.srcPort}</td>
                              <td className="py-2 px-3 text-foreground">{s.dstPort}</td>
                              <td className="py-2 px-3 text-primary">{s.protocol}</td>
                              <td className="py-2 px-3 text-foreground">{s.duration}s</td>
                              <td className="py-2 px-3 text-foreground">{s.bytes.toLocaleString()}</td>
                              <td className="py-2 px-3 text-foreground">{s.packets}</td>
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
  );
};

export default AttackCatalog;
