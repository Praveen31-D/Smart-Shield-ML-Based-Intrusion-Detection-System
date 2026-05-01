import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Menu, X, ExternalLink } from "lucide-react";
import { useState } from "react";

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Details", path: "/details" },
    { label: "Operations", path: "/operations" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="container mx-auto px-6 flex items-center justify-between h-14">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-mono font-bold text-sm"
          style={{ color: "hsl(150, 100%, 45%)" }}
        >
          <Shield className="w-5 h-5" />
          IDS-ML
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`text-xs font-mono transition-all duration-200 ${
                isActive(item.path)
                  ? "text-emerald-400 border-b border-emerald-400 pb-0.5"
                  : "text-slate-400 hover:text-emerald-400"
              }`}
            >
              {item.label}
            </button>
          ))}

          {location.pathname === "/details" && (
            <button
              onClick={() => navigate("/operations")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded btn-primary text-xs"
              id="goto-operations-btn"
            >
              <ExternalLink className="w-3 h-3" />
              Go to Operations
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-slate-800 px-6 py-4 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className="block text-sm font-mono text-slate-400 hover:text-emerald-400 w-full text-left"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default TopNav;
