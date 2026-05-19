import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComplaintById, updateComplaintStatus, deleteComplaint, analyzeComplaint } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Trash2, Sparkles, ArrowLeft, MapPin, Tag, Calendar, User, Mail } from "lucide-react";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved", "Rejected"];

const getStatusBadgeClass = (status) => {
  const map = { "Pending": "badge-pending", "In Progress": "badge-progress", "Resolved": "badge-resolved", "Rejected": "badge-rejected" };
  return map[status] || "badge-pending";
};

const getPriorityBadgeClass = (priority) => {
  const map = { "Low": "badge-low", "Medium": "badge-medium", "High": "badge-high", "Critical": "badge-critical" };
  return map[priority] || "badge-medium";
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getComplaintById(id);
        setComplaint(res.data.data);
        setSelectedStatus(res.data.data.status);
      } catch (err) {
        toast.error("Complaint not found");
        navigate("/complaints");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (selectedStatus === complaint.status) return;
    setStatusUpdating(true);
    try {
      const res = await updateComplaintStatus(id, selectedStatus);
      setComplaint(res.data.data);
      toast.success("Status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeComplaint(id);
      setComplaint((prev) => ({ ...prev, aiAnalysis: res.data.data.analysis }));
      toast.success("AI analysis complete!");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this complaint? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteComplaint(id);
      toast.success("Complaint removed");
      navigate("/complaints");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
      setDeleting(false);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px" }}><div className="loading-spinner" /></div>;
  }

  if (!complaint) return null;

  const isOwnerOrAdmin = complaint.user === user?.id || user?.role === "admin";
  const hasAI = complaint.aiAnalysis?.priority;

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px", maxWidth: "800px" }}>
      {/* Back button */}
      <button onClick={() => navigate("/complaints")} className="btn btn-outline" style={{ padding: "7px 14px", fontSize: "13px", marginBottom: "24px" }}>
        <ArrowLeft size={14} /> Back to complaints
      </button>

      {/* Title + badges */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>{complaint.status}</span>
          {hasAI && <span className={`badge ${getPriorityBadgeClass(complaint.aiAnalysis.priority)}`}>{complaint.aiAnalysis.priority} Priority</span>}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, marginBottom: "12px" }}>{complaint.title}</h1>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {[
            { icon: <User size={13} />, text: complaint.name },
            { icon: <Mail size={13} />, text: complaint.email },
            { icon: <Tag size={13} />, text: complaint.category },
            { icon: <MapPin size={13} />, text: complaint.location },
            { icon: <Calendar size={13} />, text: new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
          ].map(({ icon, text }) => (
            <span key={text} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>
              {icon} {text}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Description</h3>
        <p style={{ lineHeight: 1.7, color: "var(--text-primary)", fontSize: "14px" }}>{complaint.description}</p>
      </div>

      {/* Status Update (for owners/admins) */}
      {isOwnerOrAdmin && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>Update Status</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                style={{
                  padding: "8px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500,
                  border: selectedStatus === s ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: selectedStatus === s ? "var(--accent-muted)" : "transparent",
                  color: selectedStatus === s ? "var(--accent)" : "var(--text-secondary)",
                  transition: "all 0.15s",
                }}
              >{s}</button>
            ))}
          </div>
          <button
            onClick={handleStatusUpdate}
            className="btn btn-primary"
            style={{ marginTop: "14px" }}
            disabled={statusUpdating || selectedStatus === complaint.status}
          >
            {statusUpdating ? <><div className="loading-spinner" /> Updating...</> : "Save Status"}
          </button>
        </div>
      )}

      {/* AI Analysis */}
      <div className="card" style={{ marginBottom: "16px", borderColor: hasAI ? "rgba(99,102,241,0.3)" : "var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hasAI ? "20px" : "0" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "7px" }}>
            <Sparkles size={14} color="var(--accent)" /> AI Analysis
          </h3>
          <button onClick={handleAnalyze} className="btn btn-outline" style={{ padding: "7px 14px", fontSize: "13px" }} disabled={analyzing}>
            {analyzing ? <><div className="loading-spinner" /> Analyzing...</> : hasAI ? "Re-analyze" : "Run AI Analysis"}
          </button>
        </div>

        {hasAI ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "160px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Priority</p>
                <span className={`badge ${getPriorityBadgeClass(complaint.aiAnalysis.priority)}`}>{complaint.aiAnalysis.priority}</span>
              </div>
              <div style={{ flex: 2, minWidth: "200px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Responsible Department</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{complaint.aiAnalysis.department}</p>
              </div>
            </div>

            <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>AI Summary</p>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-primary)" }}>{complaint.aiAnalysis.summary}</p>
            </div>

            <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
              <p style={{ fontSize: "11px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Auto-generated Response to Citizen</p>
              <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-primary)", fontStyle: "italic" }}>{complaint.aiAnalysis.autoResponse}</p>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "12px" }}>
            Click "Run AI Analysis" to detect priority, department, and generate an automated response.
          </p>
        )}
      </div>

      {/* Delete */}
      {isOwnerOrAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
            {deleting ? <><div className="loading-spinner" /> Deleting...</> : <><Trash2 size={14} /> Delete Complaint</>}
          </button>
        </div>
      )}
    </div>
  );
}
