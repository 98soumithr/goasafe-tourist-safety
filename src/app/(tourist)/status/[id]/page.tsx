"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface ComplaintData {
  id: string;
  complaintNumber: string;
  category: string;
  severity: string;
  status: string;
  incidentLocation: string | null;
  fareCharged: number | null;
  fareExpected: number | null;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  taxiPermit?: { vehicleNumber: string; driverName: string; permitNumber: string; zone: string | null } | null;
  escalations: Array<{ id: string; assignedAt: string; officer: { name: string; zone: string } }>;
}

const STATUS_STEPS = [
  { key: "open", label: "Submitted", icon: "M12 4v16m8-8H4" },
  { key: "acknowledged", label: "Acknowledged", icon: "M5 13l4 4L19 7" },
  { key: "investigating", label: "Investigating", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { key: "resolved", label: "Resolved", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const STATUS_ORDER = ["open", "acknowledged", "investigating", "escalated", "resolved", "closed"];

function getStatusIndex(status: string): number {
  if (status === "escalated") return 2;
  if (status === "closed") return 3;
  return STATUS_ORDER.indexOf(status);
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

export default function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [searchId, setSearchId] = useState(id === "track" ? "" : id);
  const [loading, setLoading] = useState(id !== "track");

  useEffect(() => {
    if (id !== "track") loadComplaint(id);
  }, [id]);

  async function loadComplaint(cid: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${cid}`);
      const data = await res.json();
      if (data.success && data.data) {
        setComplaint(data.data);
      } else {
        setComplaint(null);
      }
    } catch {
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchId.trim()) loadComplaint(searchId.trim());
  }

  const currentStep = complaint ? getStatusIndex(complaint.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 px-4 py-4 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            GoaSafe
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <label className="mb-2 block text-sm font-medium text-gray-700">Track Your Complaint</label>
          <div className="flex gap-2">
            <input
              type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter complaint number (e.g. GOA-2026-00142)"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">Track</button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        )}

        {!loading && !complaint && id !== "track" && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Complaint Not Found</h3>
            <p className="mt-1 text-gray-500">Check the complaint number and try again.</p>
          </div>
        )}

        {complaint && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Complaint</div>
                  <div className="font-mono text-xl font-bold text-blue-700">{complaint.complaintNumber}</div>
                </div>
                <span className={`badge ${SEVERITY_COLORS[complaint.severity]}`}>{complaint.severity.toUpperCase()}</span>
              </div>

              {/* Progress Steps */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step.key} className="flex flex-1 flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        i <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                      }`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} /></svg>
                      </div>
                      <div className={`mt-2 text-xs font-medium ${i <= currentStep ? "text-blue-600" : "text-gray-400"}`}>{step.label}</div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`absolute mt-5 h-0.5 w-16 ${i < currentStep ? "bg-blue-600" : "bg-gray-200"}`} style={{ marginLeft: "4rem" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">Incident Details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium capitalize">{complaint.category.replace(/_/g, " ")}</span></div>
                {complaint.incidentLocation && <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{complaint.incidentLocation}</span></div>}
                {complaint.fareCharged && <div className="flex justify-between"><span className="text-gray-500">Fare Charged</span><span className="font-medium text-red-600">₹{complaint.fareCharged}</span></div>}
                {complaint.fareExpected && <div className="flex justify-between"><span className="text-gray-500">Expected Fare</span><span className="font-medium text-green-600">₹{complaint.fareExpected}</span></div>}
                {complaint.taxiPermit && <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-mono font-medium">{complaint.taxiPermit.vehicleNumber}</span></div>}
              </div>
            </div>

            {/* Assigned Officer */}
            {complaint.escalations.length > 0 && (
              <div className="rounded-xl bg-blue-50 p-6">
                <h3 className="font-semibold text-blue-900">Assigned Officer</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="font-medium">{complaint.escalations[0].officer.name}</p>
                  <p>Zone: {complaint.escalations[0].officer.zone}</p>
                  <p className="mt-1 text-blue-500">Estimated response: within 4 hours</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
