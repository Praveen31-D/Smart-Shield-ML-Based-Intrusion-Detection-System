import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ConfusionMatrixChart from "./ConfusionMatrixChart";

const performanceData = [
  { model: "NSL-KDD Multi", accuracy: 94.2, precision: 94.0, recall: 93.5, f1: 93.8 },
  { model: "UNSW-NB15 Multi", accuracy: 93.7, precision: 92.3, recall: 93.1, f1: 92.7 },
  { model: "CIC-IDS-2017 Binary", accuracy: 99.1, precision: 98.9, recall: 99.2, f1: 99.0 },
  { model: "CIC-IDS-2017 Multi", accuracy: 98.5, precision: 98.1, recall: 98.4, f1: 98.2 },
];

const datasetDistribution = [
  { name: "Normal", value: 37000, color: "hsl(150, 100%, 45%)" },
  { name: "Generic", value: 40000, color: "hsl(0, 72%, 51%)" },
  { name: "Exploits", value: 33393, color: "hsl(38, 92%, 50%)" },
  { name: "Fuzzers", value: 18184, color: "hsl(180, 100%, 40%)" },
  { name: "DoS", value: 12264, color: "hsl(280, 70%, 55%)" },
  { name: "Recon", value: 10491, color: "hsl(200, 80%, 50%)" },
  { name: "Analysis", value: 2000, color: "hsl(60, 80%, 50%)" },
  { name: "Backdoor", value: 1746, color: "hsl(320, 70%, 50%)" },
  { name: "Shellcode", value: 1133, color: "hsl(30, 80%, 50%)" },
  { name: "Worms", value: 130, color: "hsl(10, 80%, 50%)" },
];

const MetricsSection = () => {
  return (
    <section id="metrics" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary text-glow">Performance</span>{" "}
            <span className="text-foreground">Metrics</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Model evaluation results across binary and multi-class classification tasks.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="card-cyber rounded-lg p-6">
            <h3 className="font-mono text-sm text-primary mb-4">Accuracy by Model (%)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceData} barSize={20}>
                <XAxis dataKey="model" tick={{ fill: "hsl(220, 15%, 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <YAxis domain={[85, 100]} tick={{ fill: "hsl(220, 15%, 50%)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222, 40%, 9%)",
                    border: "1px solid hsl(222, 30%, 16%)",
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                  }}
                  labelStyle={{ color: "hsl(150, 100%, 45%)" }}
                />
                <Bar dataKey="accuracy" fill="hsl(150, 100%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1" fill="hsl(180, 100%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card-cyber rounded-lg p-6">
            <h3 className="font-mono text-sm text-primary mb-4">UNSW-NB15 Dataset Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={datasetDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {datasetDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(222, 40%, 9%)",
                    border: "1px solid hsl(222, 30%, 16%)",
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), "Samples"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {datasetDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics table */}
        <div className="max-w-5xl mx-auto mt-6">
          <div className="card-cyber rounded-lg p-6 overflow-x-auto">
            <h3 className="font-mono text-sm text-primary mb-4">Detailed Metrics</h3>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground">Model</th>
                  <th className="text-left py-2 px-3 text-muted-foreground">Accuracy</th>
                  <th className="text-left py-2 px-3 text-muted-foreground">Precision</th>
                  <th className="text-left py-2 px-3 text-muted-foreground">Recall</th>
                  <th className="text-left py-2 px-3 text-muted-foreground">F1-Score</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((d) => (
                  <tr key={d.model} className="border-b border-border/50">
                    <td className="py-2 px-3 text-foreground">{d.model}</td>
                    <td className="py-2 px-3 text-primary">{d.accuracy}%</td>
                    <td className="py-2 px-3 text-foreground">{d.precision}%</td>
                    <td className="py-2 px-3 text-foreground">{d.recall}%</td>
                    <td className="py-2 px-3 text-accent">{d.f1}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confusion Matrix & ROC Curves */}
        <div className="max-w-5xl mx-auto mt-6">
          <ConfusionMatrixChart />
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
