"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Complaint {
  id: string;
  complaintNumber: string;
  category: string;
  severity: string;
  status: string;
  originalText: string;
  aiSummary: string | null;
  incidentLocation: string | null;
  createdAt: string;
  tourist?: { fullName: string; nationality: string | null } | null;
}

const SEVERITY_COLORS: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-amber-100 text-amber-700", medium: "bg-blue-100 text-blue-700", low: "bg-gray-100 text-gray-600" };
const STATUS_COLORS: Record<string, string> = { open: "bg-blue-100 text-blue-700", acknowledged: "bg-yellow-100 text-yellow-700", investigating: "bg-purple-100 text-purple-700", escalated: "bg-orange-100 text-orange-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600" };

function timeAgo(d: string) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

export default function ComplaintsListPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (severityFilter) params.set("severity", severityFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, severityFilter, search]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Complaints</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaints..." className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {["open", "acknowledged", "investigating", "escalated", "resolved", "closed"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {["overcharging", "refusal_of_service", "harassment", "unsafe_driving", "meter_tampering", "route_deviation", "luggage_issues", "other"].map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Severities</option>
          {["critical", "high", "medium", "low"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Tourist</th>
                <th className="px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {complaints.map((c) => (
                <tr key={c.id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/complaints/${c.id}`} className="font-mono text-sm font-semibold text-blue-600 hover:underline">{c.complaintNumber}</Link>
                  </td>
                  <td className="px-5 py-3 capitalize text-gray-700">{c.category.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3"><span className={`badge ${SEVERITY_COLORS[c.severity]}`}>{c.severity}</span></td>
                  <td className="px-5 py-3 text-gray-500">{c.incidentLocation || "\u2014"}</td>
                  <td className="px-5 py-3"><span className={`badge ${STATUS_COLORS[c.status]}`}>{c.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="text-gray-900">{c.tourist?.fullName || "Anonymous"}</div>
                    <div className="text-xs text-gray-400">{c.tourist?.nationality}</div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{timeAgo(c.createdAt)}</td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No complaints match the filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
