import { useState, useMemo } from "react";
import { X, Search, Filter, ChevronLeft, ChevronRight, FileText, Database, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { ReportData } from "./ProfessionalReport";

export interface ArchivedReport {
  id: string;
  timestamp: string;
  model: string;
  threatStatus: "Safe" | "Elevated" | "Critical";
  threatIntensity: number;
  totalFlows: number;
}

interface Props {
  reports: ArchivedReport[];
  onClose: () => void;
  onViewReport: (mockData: ReportData) => void;
}

const statusColors = {
  Safe: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Elevated: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Critical: "text-red-500 bg-red-500/10 border-red-500/20",
};

const statusIcons = {
  Safe: <CheckCircle className="w-3.5 h-3.5" />,
  Elevated: <AlertTriangle className="w-3.5 h-3.5" />,
  Critical: <ShieldAlert className="w-3.5 h-3.5" />,
};

const ReportsArchiveModal = ({ reports, onClose, onViewReport }: Props) => {
  const [data] = useState<ArchivedReport[]>(reports);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sortField, setSortField] = useState<keyof ArchivedReport>("timestamp");
  const [sortParam, setSortParam] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filter and Sort
  const filteredData = useMemo(() => {
    let result = data;
    
    // Status Filter
    if (filterStatus !== "All") {
      result = result.filter(r => r.threatStatus === filterStatus);
    }
    
    // Search Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.id.toLowerCase().includes(q) || 
        r.model.toLowerCase().includes(q) ||
        r.timestamp.includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (valA < valB) return sortParam === "asc" ? -1 : 1;
      if (valA > valB) return sortParam === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, search, filterStatus, sortField, sortParam]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (field: keyof ArchivedReport) => {
    if (sortField === field) {
      setSortParam(sortParam === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortParam("desc");
    }
    setPage(1);
  };

  const constructMockReport = (row: ArchivedReport) => {
    // Generate a mock ReportData payload based on the clicked history row
    const isCritical = row.threatStatus === "Critical";
    const attackFlows = isCritical ? Math.floor(row.totalFlows * 0.4) : (row.threatStatus === "Elevated" ? Math.floor(row.totalFlows * 0.15) : Math.floor(row.totalFlows * 0.02));
    const normalFlows = row.totalFlows - attackFlows;

    const dummyReport: ReportData = {
      source: "file",
      fileName: `Archive_${row.id}.pcap`,
      modelUsed: row.model,
      totalFlows: row.totalFlows,
      normalFlows,
      attackFlows,
      criticalFlows: isCritical ? Math.floor(attackFlows * 0.3) : 0,
      attackBreakdown: isCritical ? [{label: "DoS", count: attackFlows}] : [],
      timeline: [],
      topSrcIps: [],
      topDstIps: [],
      l7Protocols: [],
      timestamp: row.timestamp
    };
    
    onViewReport(dummyReport);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in" id="reports-archive-modal">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-slate-100 text-lg">PostgreSQL Reports Archive</h2>
              <p className="text-xs font-mono text-slate-500">Historical Network Traffic Scans & Threat Classification Reports</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between border-b border-slate-800 bg-slate-900/30">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by ID, Model, Date..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-300 focus:outline-none appearance-none pr-8 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Safe">Safe</option>
              <option value="Elevated">Elevated</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-800">
              <tr>
                {[{key: "id", label: "Report ID"}, {key: "timestamp", label: "Timestamp (UTC)"}, {key: "model", label: "ML Engine"}, {key: "threatStatus", label: "Security Status"}, {key: "threatIntensity", label: "Intensity"}, {key: "totalFlows", label: "Flow Volume"}].map((col) => (
                  <th 
                    key={col.key} 
                    className="p-4 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                    onClick={() => handleSort(col.key as keyof ArchivedReport)}
                  >
                    <div className="flex items-center gap-2">
                       {col.label}
                       {sortField === col.key && (
                         <span className="text-emerald-400">{sortParam === "asc" ? "↑" : "↓"}</span>
                       )}
                    </div>
                  </th>
                ))}
                <th className="p-4 text-right text-xs font-mono font-bold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((row) => (
                <tr key={row.id} className="border-b border-slate-800/40 hover:bg-emerald-400/5 group transition-colors">
                  <td className="p-4 text-sm font-mono text-slate-400">{row.id}</td>
                  <td className="p-4 text-sm font-mono text-slate-300">{row.timestamp}</td>
                  <td className="p-4 text-sm font-mono text-cyan-400">{row.model}</td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${statusColors[row.threatStatus]}`}>
                      {statusIcons[row.threatStatus]} {row.threatStatus}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-400 tabular-nums">{row.threatIntensity.toFixed(2)}</td>
                  <td className="p-4 text-sm font-mono text-slate-400 tabular-nums">{row.totalFlows.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => constructMockReport(row)} className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-xs font-mono transition-all">
                      <FileText className="w-3.5 h-3.5" /> View Tensor
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-mono text-sm">
                    {reports.length === 0 
                       ? "No reports available in the archive. Run a live capture to populate."
                       : "No database records found matching the current filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-500">
            Showing <span className="text-slate-300">{Math.min((page - 1) * rowsPerPage + 1, filteredData.length)}</span> to <span className="text-slate-300">{Math.min(page * rowsPerPage, filteredData.length)}</span> of <span className="text-slate-300">{filteredData.length}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-2">Page {page} of {Math.max(1, totalPages)}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsArchiveModal;
