import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllComplaints } from "../api";
import { useAuth } from "../context/AuthContext";
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await getAllComplaints();
        setComplaints(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
    rejected: complaints.filter((c) => c.status === "Rejected").length,
  };

  const recentComplaints = complaints.slice(0, 5);

  const statCards = [
    { label: "Total Filed", value: stats.total, icon: <FileText size={20} />, color: "var(--accent)" },
    { label: "Pending", value: stats.pending, icon: <Clock size={20} />, color: "var(--warning)" },
    { label: "Resolved", value: stats.resolved, icon: <CheckCircle size={20} />, color: "var(--success)" },
    { label: "Rejected", value: stats.rejected, icon: <XCircle size={20} />, color: "var(--danger)" },
  ];

  const getStatusBadgeClass = (status) => {
    const map = { "Pending": "badge-pending", "In Progress": "badge-progress", "Resolved": "badge-resolved", "Rejected": "badge-rejected" };
    return map[status] || "badge-pending";
  };

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Welcome back, {user?.name}. Here's your complaint overview.
          </p>
        </div>
        <Link to="/complaints/new" className="btn btn-primary">
          <PlusCircle size={16} /> File Complaint
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {statCards.map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
                <p style={{ fontSize: "32px", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)" }}>
                  {loading ? "—" : stat.value}
                </p>
              </div>
              <div style={{ color: stat.color, background: `${stat.color}20`, padding: "10px", borderRadius: "10px" }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent complaints */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600 }}>Recent Complaints</h2>
          <Link to="/complaints" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--accent)", textDecoration: "none" }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}><div className="loading-spinner" /></div>
        ) : recentComplaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={36} />
            <p>No complaints filed yet.</p>
            <Link to="/complaints/new" className="btn btn-primary" style={{ marginTop: "16px" }}>File your first complaint</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {recentComplaints.map((c, i) => (
              <Link
                key={c._id}
                to={`/complaints/${c._id}`}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", borderRadius: "var(--radius-sm)", textDecoration: "none",
                  background: i % 2 === 0 ? "var(--bg-elevated)" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "2px" }}>{c.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.category} · {c.location}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
