import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllComplaints, searchByLocation } from "../api";
import { Search, Filter, PlusCircle, ArrowRight, FileText } from "lucide-react";

const CATEGORIES = ["All", "Water Supply", "Electricity", "Roads", "Sanitation", "Public Safety", "Healthcare", "Education", "Other"];
const STATUSES = ["All", "Pending", "In Progress", "Resolved", "Rejected"];

const getStatusBadgeClass = (status) => {
  const map = { "Pending": "badge-pending", "In Progress": "badge-progress", "Resolved": "badge-resolved", "Rejected": "badge-rejected" };
  return map[status] || "badge-pending";
};

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedStatus !== "All") params.status = selectedStatus;
      const res = await getAllComplaints(params);
      setComplaints(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedCategory, selectedStatus]);

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationSearch.trim()) {
      fetchComplaints();
      return;
    }
    setLoading(true);
    try {
      const res = await searchByLocation(locationSearch.trim());
      setComplaints(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setLocationSearch("");
    fetchComplaints();
  };

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 className="page-title">All Complaints</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Track and manage your filed complaints.</p>
        </div>
        <Link to="/complaints/new" className="btn btn-primary">
          <PlusCircle size={16} /> New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Location search */}
          <form onSubmit={handleLocationSearch} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "200px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search by location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                style={{ paddingLeft: "36px", width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "9px 12px 9px 36px", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "14px", outline: "none" }}
              />
            </div>
            <button type="submit" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: "13px" }}>Search</button>
            {locationSearch && <button type="button" className="btn btn-outline" onClick={clearSearch} style={{ padding: "8px 14px", fontSize: "13px" }}>Clear</button>}
          </form>

          {/* Category filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "9px 12px", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none" }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "9px 12px", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none" }}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Complaint list */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}><div className="loading-spinner" /></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={36} />
            <p>No complaints found.</p>
          </div>
        ) : (
          complaints.map((c, i) => (
            <Link
              key={c._id}
              to={`/complaints/${c._id}`}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 24px", textDecoration: "none",
                borderBottom: i < complaints.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</p>
                  {c.aiAnalysis?.priority && (
                    <span className={`badge badge-${c.aiAnalysis.priority.toLowerCase()}`}>{c.aiAnalysis.priority}</span>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {c.category} · {c.location} · {new Date(c.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            </Link>
          ))
        )}
      </div>

      {!loading && complaints.length > 0 && (
        <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "right", marginTop: "12px" }}>
          {complaints.length} complaint{complaints.length !== 1 ? "s" : ""} found
        </p>
      )}
    </div>
  );
}
