import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addComplaint } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

const CATEGORIES = [
  "Water Supply", "Electricity", "Roads", "Sanitation",
  "Public Safety", "Healthcare", "Education", "Other",
];

export default function RegisterComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    title: "",
    description: "",
    category: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await addComplaint(form);
      toast.success("Complaint filed successfully!");
      navigate(`/complaints/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px", maxWidth: "720px" }}>
      <h1 className="page-title">File a Complaint</h1>
      <p className="page-subtitle">Describe your issue clearly for faster resolution and AI analysis.</p>

      <div className="card">
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Kumar" required />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@gmail.com" required />
            </div>
          </div>

          <div className="form-group">
            <label>Complaint Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Water Leakage Issue near Market" required />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the issue in detail. The more specific, the better the AI analysis." required style={{ minHeight: "120px" }} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Ghaziabad" required />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="loading-spinner" /> Submitting...</> : <><Send size={15} /> Submit Complaint</>}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/complaints")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
