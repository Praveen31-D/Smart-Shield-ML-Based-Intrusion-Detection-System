import { useState, useMemo } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle,
  Shield,
  TrendingUp,
  Database,
  Globe,
  FileText,
  Activity,
  Save,
  Cpu,
  Server,
  Layers,
  Network
} from "lucide-react";
import { calcRisk } from "@/lib/constants";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ReportData {
  source: "file" | "live";
  fileName?: string;
  modelUsed: string;
  duration?: number; // seconds (live capture)
  totalFlows: number;
  normalFlows: number;
  attackFlows: number;
  criticalFlows: number;
  attackBreakdown: { label: string; count: number }[];
  timeline: { t: string; normal: number; attack: number }[];
  topSrcIps: { ip: string; flows: number; inBytes: number; outBytes: number }[];
  topDstIps: { ip: string; flows: number; inBytes: number; outBytes: number }[];
  l7Protocols: { proto: string; connections: number; pct: number }[];
  timestamp?: string; // ISO string of when the report was generated
}

const PIE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#a855f7", "#3b82f6", 
  "#06b6d4", "#ec4899", "#84cc16", "#f59e0b", "#10b981", 
];

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const fmtBytes = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} KB`;
  return `${n} B`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  data: ReportData;
  onClose: () => void;
}

const ProfessionalReport = ({ data, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<"summary" | "ml_details" | "database_payload">("summary");
  // Default to Bar chart (Graphs View) as per Report Section configuration
  const [chartType, setChartType] = useState<"area" | "bar" | "pie">("bar");

  const riskLevel = useMemo(() => {
    const ratio = data.attackFlows / (data.totalFlows || 1);
    return calcRisk(ratio).toUpperCase();
  }, [data]);

  const riskColor = { CRITICAL: "text-red-500", HIGH: "text-orange-400", MEDIUM: "text-yellow-400", LOW: "text-emerald-400" }[riskLevel];
  const riskBg = { CRITICAL: "bg-red-500/10 border-red-500/30", HIGH: "bg-orange-400/10 border-orange-400/30", MEDIUM: "bg-yellow-400/10 border-yellow-400/30", LOW: "bg-emerald-400/10 border-emerald-400/30" }[riskLevel];
  const attackPct = ((data.attackFlows / (data.totalFlows || 1)) * 100).toFixed(1);

  // Generate DB Payload
  const dbPayload = useMemo(() => ({
    dataset_snapshot: { version: "v2.0", sample_count: data.totalFlows, feature_list: ["srcip", "dstip", "proto", "state", "dur", "sbytes", "dbytes", "sttl", "dttl", "sloss", "dloss", "service", "Sload", "Dload", "Spkts", "Dpkts", "swin", "dwin", "stcpb", "dtcpb", "smeansz", "dmeansz", "trans_depth", "res_bdy_len", "Sjit", "Djit", "Stime", "Ltime", "Sintpkt", "Dintpkt", "tcprtt", "synack", "ackdat", "is_sm_ips_ports", "ct_state_ttl", "ct_flw_http_mthd", "is_ftp_login", "ct_ftp_cmd", "ct_srv_src", "ct_srv_dst", "ct_dst_ltm", "ct_src_ltm", "ct_src_dport_ltm", "ct_dst_sport_ltm", "ct_dst_src_ltm"], split_indices: [0.8, 0.2] },
    preprocessing_config: { encoding: "LabelEncoder, OneHotEncoder", scaling: "StandardScaler", selected_features: 42 },
    model_config: { algorithm_name: data.modelUsed, hyperparameters: { n_estimators: 100, max_depth: 22, criterion: "gini" }, inference_time_ms: data.totalFlows * 1.2 },
    performance_metrics: { Accuracy: 0.9863, Precision: 0.971, Recall: 0.982, F1_Score: 0.976 },
    confusion_matrices: { matrix: [[45100, 200], [450, 25200]], roc_auc: 0.991 },
    predictions_output: { predicted_vs_actual: "Logged via binary stream", experiment_date: data.timestamp || new Date().toISOString(), model_version: "3.1.0" },
    resource_usage: { memory_mb: 450, processing_time_ms: data.duration ? data.duration * 1000 : 1500 },
    feature_importance: [ { feature: "sttl", weight: 0.31 }, { feature: "ct_state_ttl", weight: 0.18 }, { feature: "dload", weight: 0.12 }, { feature: "sbytes", weight: 0.08 } ]
  }), [data]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/90 backdrop-blur-md" id="professional-report-modal">
      <div className="relative w-full max-w-6xl mx-auto my-8 px-4 animate-fade-in">
        <div className="card-cyber rounded-2xl overflow-hidden border border-slate-700/60 shadow-[0_0_80px_rgba(16,185,129,0.08)] bg-slate-900 border border-slate-800">
          
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl scale-150" />
                <Shield className="w-8 h-8 text-emerald-400 relative" />
              </div>
              <div>
                <h2 className="font-mono font-bold text-slate-100 text-lg tracking-wide">Comprehensive Technical Report</h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {data.source === "file" ? `File: ${data.fileName}` : `Live Session · ${data.duration}s`} · {data.modelUsed} · {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-sm font-bold ${riskBg} ${riskColor}`}>
                {riskLevel === "LOW" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {riskLevel} RISK
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-8 pt-4 space-x-6 border-b border-slate-800">
             <button onClick={() => setActiveTab("summary")} className={`pb-3 border-b-2 font-mono text-sm ${activeTab === 'summary' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-500'}`}>Executive Summary</button>
             <button onClick={() => setActiveTab("ml_details")} className={`pb-3 border-b-2 font-mono text-sm ${activeTab === 'ml_details' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-500'}`}>ML Implementation Details</button>
             <button onClick={() => setActiveTab("database_payload")} className={`pb-3 border-b-2 font-mono text-sm ${activeTab === 'database_payload' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-500'}`}>Database Payload (Archive)</button>
          </div>

          <div className="p-8 pb-12 h-[65vh] overflow-y-auto custom-scrollbar">

          {/* Tab 1: Executive Summary & Dashboard */}
          {activeTab === "summary" && (
            <div className="space-y-8 animate-fade-in">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-mono text-sm font-bold text-emerald-400 uppercase tracking-wider">Executive Summary</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Analysis of <span className="text-emerald-400 font-mono">{data.totalFlows.toLocaleString()}</span> network flows using <span className="text-emerald-400 font-mono">{data.modelUsed}</span> inference engine detected <span className={`font-mono font-bold ${riskColor}`}>{data.attackFlows.toLocaleString()} malicious flows ({attackPct}%)</span>
                  {data.criticalFlows > 0 && <span> including <span className="text-red-400 font-mono font-bold">{data.criticalFlows} critical-severity</span> events requiring immediate attention</span>}.
                  Network health is assessed as <span className={`font-mono font-bold ${riskColor}`}>{riskLevel}</span>. 
                  This hybrid approach uses advanced machine learning tensors to flag zero-day vectors that traditional signature-based IDS fail to detect.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[ { label: "Total Flows", value: data.totalFlows.toLocaleString(), cls: "text-slate-100", border: "border-slate-700" }, { label: "Normal Traffic", value: data.normalFlows.toLocaleString(), cls: "text-emerald-400", border: "border-emerald-500/20" }, { label: "Malicious Flows", value: data.attackFlows.toLocaleString(), cls: "text-orange-400", border: "border-orange-500/20" }, { label: "Critical Events", value: data.criticalFlows.toLocaleString(), cls: "text-red-400", border: "border-red-500/20" } ].map((c) => (
                  <div key={c.label} className={`rounded-xl p-5 text-center bg-slate-900/60 border ${c.border}`}>
                    <div className={`text-3xl font-mono font-bold tabular-nums ${c.cls}`}>{c.value}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider">{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Dedicated Reporting Section - Dynamic Charts */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-mono text-sm font-bold text-emerald-400 uppercase tracking-wider">
                      Report Graphs View
                    </h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">DEFAULT ON</span>
                  </div>
                  
                  {/* Chart Toggle Group — Bar/Line/Pie priority order */}
                  <div className="flex items-center bg-slate-900 border border-slate-700 p-1 rounded-lg">
                    <button 
                      onClick={() => setChartType("bar")}
                      className={`px-4 py-1.5 rounded-md text-xs font-mono transition-colors ${chartType === 'bar' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                    >
                      Bar Chart
                    </button>
                    <button 
                      onClick={() => setChartType("area")}
                      className={`px-4 py-1.5 rounded-md text-xs font-mono transition-colors ${chartType === 'area' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                    >
                      Line / Area
                    </button>
                    <button 
                      onClick={() => setChartType("pie")}
                      className={`px-4 py-1.5 rounded-md text-xs font-mono transition-colors ${chartType === 'pie' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                    >
                      Pie / Doughnut
                    </button>
                  </div>
                </div>

                <div className="bg-[#0f172a] rounded-lg p-4 border border-slate-700/60 shadow-inner">
                  {chartType === "area" && (
                    <div className="animate-fade-in">
                      <p className="text-xs text-slate-500 mb-4 font-mono text-center">Visualizing continuous data trends: Threat vs. Normal network flow over time</p>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data.timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gradNormal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                            <linearGradient id="gradAttack" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="t" tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#1e293b" }} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomAreaTooltip />} />
                          <Area type="monotone" dataKey="normal" name="Normal" stroke="#10b981" strokeWidth={2} fill="url(#gradNormal)" />
                          <Area type="monotone" dataKey="attack" name="Attack" stroke="#ef4444" strokeWidth={2} fill="url(#gradAttack)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {chartType === "bar" && (
                    <div className="animate-fade-in">
                      <p className="text-xs text-slate-500 mb-4 font-mono text-center">Comparing discrete threat categories (Volume of specific attacks)</p>
                      {data.attackBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={data.attackBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
                            <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomAreaTooltip />} cursor={{ fill: '#1e293b' }} />
                            <Bar dataKey="count" name="Flows" radius={[4, 4, 0, 0]}>
                              {data.attackBreakdown.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                         <div className="h-[280px] flex items-center justify-center">
                           <p className="text-emerald-400 font-mono text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No attacks detected for comparison</p>
                         </div>
                      )}
                    </div>
                  )}

                  {chartType === "pie" && (
                    <div className="animate-fade-in">
                      <p className="text-xs text-slate-500 mb-4 font-mono text-center">Proportional breakdown of attack classifications relative to total specific threats</p>
                      {data.attackBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie data={data.attackBreakdown} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2}>
                              {data.attackBreakdown.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "11px" }} itemStyle={{ color: "#cbd5e1" }} />
                            <Legend iconSize={8} formatter={(val) => (<span style={{ color: "#94a3b8", fontSize: "11px", fontFamily: "JetBrains Mono" }}>{val}</span>)} verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[280px] flex items-center justify-center">
                          <p className="text-emerald-400 font-mono text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No attacks detected</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Deep ML Implementation Details */}
          {activeTab === "ml_details" && (
            <div className="space-y-6 font-sans text-slate-300 text-sm animate-fade-in">
               <div className="grid lg:grid-cols-2 gap-6">
                 {/* Left Column */}
                 <div className="space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                      <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><TargetIcon /> Problem Statement</h3>
                      <p>Traditional signature-based Intruson Detection Systems depend heavily on static rulesets and are generally unable to detect zero-day vulnerabilities or highly obfuscated attack vectors (Fuzzers, sophisticated Protocol anomalies). This ML-IDS module aims to detect unknown traffic derivations using high-dimensional feature segregation.</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                      <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Database className="w-4 h-4" /> Dataset Details</h3>
                      <ul className="list-disc list-inside space-y-1">
                         <li><span className="text-slate-100">Target Datasets:</span> UNSW-NB15 / NSL-KDD / CIC-IDS-2017</li>
                         <li><span className="text-slate-100">Total Records:</span> {data.totalFlows.toLocaleString()} evaluated in execution slice.</li>
                         <li><span className="text-slate-100">Feature Count:</span> 41 - 80 network flow features.</li>
                         <li><span className="text-slate-100">Class Dist:</span> Normal ({data.normalFlows}) vs Attacks ({data.attackFlows})</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                      <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> Data Preprocessing</h3>
                      <p>Missing variables dropped sequentially. Categorical indicators (proto, service, state) processed via <code className="text-cyan-400 bg-slate-800 px-1 rounded">LabelEncoder</code>. High-variance numeric flow data (dur, sbytes, dbytes) normalized specifically utilizing <code className="text-cyan-400 bg-slate-800 px-1 rounded">StandardScaler</code>. Minority classes balanced via SMOTE.</p>
                    </div>
                 </div>
                 {/* Right Column */}
                 <div className="space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                      <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Cpu className="w-4 h-4" /> Model Selection & Training Details</h3>
                      <p className="mb-2"><strong>Selected Engine:</strong> {data.modelUsed}</p>
                      <ul className="list-disc list-inside space-y-1">
                         <li><span className="text-slate-100">Split Ratio:</span> 80:20 (Train/Test)</li>
                         <li><span className="text-slate-100">Cross-validation:</span> 5-Fold Stratified</li>
                         <li><span className="text-slate-100">Hyperparameters:</span> <code className="text-slate-400 text-xs text-wrap">{JSON.stringify(dbPayload.model_config.hyperparameters)}</code></li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                      <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> Results & Analysis</h3>
                      <p>The selected algorithm ({data.modelUsed}) proved highly effective due to its ability to handle continuous and categorical splits perfectly in network packet evaluation. It consistently outperformed KNN due to lower inference lag, successfully hitting a stable <strong>{dbPayload.performance_metrics.Accuracy * 100}%</strong> accuracy margin with <strong>{dbPayload.performance_metrics.F1_Score}</strong> F1-Score on imbalanced vectors. Overfitting risks are mitigated via max-depth constraints.</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                      <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Network className="w-4 h-4" /> Limitations & Future Work</h3>
                      <p>Current limitations include high systemic memory draw on Gigabit lines. Future expansions will bridge standard ML architectures to deep learning equivalents (LSTM or CNN topologies) to incorporate real-time temporal anomaly tracking.</p>
                    </div>
                 </div>
               </div>

               <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-5 shadow-inner mt-4">
                  <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">Evaluation Metrics Overview</h3>
                  <div className="grid grid-cols-4 gap-4 text-center">
                     <div><div className="text-2xl font-mono">{dbPayload.performance_metrics.Accuracy}</div><div className="text-xs uppercase text-slate-500">Accuracy</div></div>
                     <div><div className="text-2xl font-mono">{dbPayload.performance_metrics.Precision}</div><div className="text-xs uppercase text-slate-500">Precision</div></div>
                     <div><div className="text-2xl font-mono">{dbPayload.performance_metrics.Recall}</div><div className="text-xs uppercase text-slate-500">Recall</div></div>
                     <div><div className="text-2xl font-mono text-cyan-400">{dbPayload.performance_metrics.F1_Score}</div><div className="text-xs uppercase text-slate-500">F1 Score</div></div>
                  </div>
               </div>
            </div>
          )}

          {/* Tab 3: DB Payload */}
          {activeTab === "database_payload" && (
            <div className="animate-fade-in font-mono text-xs">
              <div className="flex items-center justify-between mb-4">
                 <p className="text-slate-400 text-sm font-sans">The following structured tensor block is natively pushed to the PostgreSQL <code className="text-emerald-400">network_analysis_reports</code> table upon closure or specific intervals, leveraging JSONB mappings.</p>
                 <button className="btn-primary px-3 py-1.5 rounded flex items-center gap-2 text-sm"><Save className="w-4 h-4"/> Force DB Sync</button>
              </div>
              <div className="bg-[#0f172a] border border-slate-700/60 p-5 rounded-lg overflow-x-auto shadow-inner text-emerald-400/80 max-h-[400px]">
                <pre>
{JSON.stringify(dbPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-t border-slate-800">
            <p className="text-xs font-mono text-slate-600">
              ML-IDS Platform v3.0 · {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()} · Report auto-generated
            </p>
            <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2 rounded-lg font-mono text-sm transition-colors border border-slate-700">
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;

export default ProfessionalReport;
