import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";

const navItems = [
  { label: "Attacks", href: "#attacks" },
  { label: "Analyze", href: "#analyze" },
  { label: "Live", href: "#live" },
  { label: "Architecture", href: "#architecture" },
  { label: "Metrics", href: "#metrics" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 flex items-center justify-between h-14">
        <a href="#" className="flex items-center gap-2 font-mono font-bold text-primary text-sm">
          <Shield className="w-5 h-5" />
          IDS-ML
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 py-4 space-y-3">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-mono text-muted-foreground hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
