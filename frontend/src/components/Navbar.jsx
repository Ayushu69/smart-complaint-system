import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, FileText, PlusCircle, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav style={{
      background: "rgba(10, 10, 15, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)" }}>
            Civic<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { path: "/dashboard", icon: <LayoutDashboard size={15} />, label: "Dashboard" },
            { path: "/complaints", icon: <FileText size={15} />, label: "Complaints" },
            { path: "/complaints/new", icon: <PlusCircle size={15} />, label: "File Complaint" },
          ].map(({ path, icon, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "var(--radius-sm)",
                textDecoration: "none", fontSize: "13px", fontWeight: 500,
                color: isActive(path) ? "var(--accent)" : "var(--text-secondary)",
                background: isActive(path) ? "var(--accent-muted)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              {icon} {label}
            </Link>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {user.name}
            {user.role === "admin" && (
              <span style={{ marginLeft: "6px", fontSize: "10px", background: "var(--accent-muted)", color: "var(--accent)", padding: "2px 7px", borderRadius: "10px" }}>ADMIN</span>
            )}
          </span>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "13px" }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
