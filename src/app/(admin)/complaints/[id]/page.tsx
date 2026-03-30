"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface ComplaintDetail {
  id: string;
  complaintNumber: string;
  category: string;
  severity: string;
  status: string;
  originalText: string;
  originalLanguage: string;
  translatedText: string | null;
  aiCategoryConfidence: number | null;
  aiSummary: string | null;
  incidentLocation: string | null;
  fareCharged: number | null;
  fareExpected: number | null;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  tourist?: {
    fullName: string;
    nationality: string | null;
    phone: string;
    preferredLang: string;
  } | null;
  taxiPermit?: {
    permitNumber: string;
    driverName: string;
    vehicleNumber: string;
    zone: string | null;
    complaintCount: number;
  } | null;
  escalations: Array<{
    id: string;
    assignedAt: string;
    status: string;
    officer: {
      id: string;
      name: string;
      zone: string;
      designation: string | null;
      dutyStatus: string;
    };
  }>;
}

const SEVERITY_COLORS: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-amber-100 text-amber-700", medium: "bg-blue-100 text-blue-700", low: "bg-gray-100 text-gray-600" };
const STATUS_COLORS: Record<string, string> = { open: "bg-blue-100 text-blue-700", acknowledged: "bg-yellow-100 text-yellow-700", investigating: "bg-purple-100 text-purple-700", escalated: "bg-orange-100 text-orange-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600" };

function formatDate(d: string) { return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/complaints/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setComplaint(data.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !complaint) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Complaint Not Found</h2>
        <Link href="/complaints" className="mt-4 inline-block text-blue-600 hover:underline">&larr; Back to Complaints</Link>
      </div>
    );
  }

  const overchargeRatio = complaint.fareCharged && complaint.fareExpected ? (complaint.fareCharged / complaint.fareExpected).toFixed(2) : null;

  return (
    <div>
      <Link href="/complaints" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Complaints
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <h1 className="font-mono text-2xl font-bold text-gray-900">{complaint.complaintNumber}</h1>
        <span className={`badge ${STATUS_COLORS[complaint.status]}`}>{complaint.status}</span>
        <span className={`badge ${SEVERITY_COLORS[complaint.severity]}`}>{complaint.severity}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-3">
          {/* Complaint Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Complaint Details</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium uppercase text-gray-400">Category</div>
                <div className="mt-1 text-sm font-semibold capitalize text-gray-900">{complaint.category.replace(/_/g, " ")}</div>
              </div>
              {complaint.originalLanguage !== "en" && (
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase text-gray-400">Original ({complaint.originalLanguage.toUpperCase()})</span>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-sm italic text-gray-700">{complaint.originalText}</div>
                </div>
              )}
              <div>
                <div className="text-xs font-medium uppercase text-gray-400">{complaint.originalLanguage !== "en" ? "AI Translation (English)" : "Complaint Text"}</div>
                <div className="mt-1 rounded-lg bg-blue-50 p-3 text-sm text-gray-800">{complaint.translatedText || complaint.originalText}</div>
              </div>
            </div>
          </div>

          {/* AI Classification */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">AI Classification</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium uppercase text-gray-400">Category</div>
                <div className="mt-1 text-sm font-semibold capitalize">{complaint.category.replace(/_/g, " ")}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-gray-400">Confidence</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${(complaint.aiCategoryConfidence || 0) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold">{((complaint.aiCategoryConfidence || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-gray-400">Severity</div>
                <span className={`badge ${SEVERITY_COLORS[complaint.severity]}`}>{complaint.severity}</span>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-gray-400">Summary</div>
                <div className="mt-1 text-sm text-gray-600">{complaint.aiSummary}</div>
              </div>
            </div>
          </div>

          {/* Fare Analysis */}
          {complaint.fareCharged && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Fare Analysis</h2>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xs font-medium uppercase text-gray-400">Charged</div>
                  <div className="mt-1 text-2xl font-bold text-red-600">{"\u20B9"}{complaint.fareCharged}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium uppercase text-gray-400">Expected</div>
                  <div className="mt-1 text-2xl font-bold text-green-600">{"\u20B9"}{complaint.fareExpected}</div>
                </div>
                {overchargeRatio && (
                  <div className="text-center">
                    <div className="text-xs font-medium uppercase text-gray-400">Overcharge</div>
                    <div className={`mt-1 text-2xl font-bold ${parseFloat(overchargeRatio) >= 2 ? "text-red-600" : "text-amber-600"}`}>{overchargeRatio}x</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Tourist Info */}
          {complaint.tourist && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900">Tourist</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{complaint.tourist.fullName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Nationality</span><span>{complaint.tourist.nationality}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-mono">{complaint.tourist.phone}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Language</span><span>{complaint.tourist.preferredLang.toUpperCase()}</span></div>
              </div>
            </div>
          )}

          {/* Taxi Info */}
          {complaint.taxiPermit && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900">Taxi Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-mono font-semibold">{complaint.taxiPermit.vehicleNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Driver</span><span>{complaint.taxiPermit.driverName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Permit</span><span className="font-mono">{complaint.taxiPermit.permitNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Zone</span><span>{complaint.taxiPermit.zone}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Past Complaints</span>
                  <span className={`font-bold ${complaint.taxiPermit.complaintCount >= 5 ? "text-red-600" : complaint.taxiPermit.complaintCount >= 3 ? "text-amber-600" : "text-gray-900"}`}>
                    {complaint.taxiPermit.complaintCount}
                  </span>
                </div>
              </div>
              {complaint.taxiPermit.complaintCount >= 3 && (
                <div className="mt-3 rounded-lg bg-red-50 p-2 text-center text-xs font-semibold text-red-600">
                  Repeat Offender -- {complaint.taxiPermit.complaintCount} previous complaints
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-600" />
                  <div className="w-px flex-1 bg-gray-200" />
                </div>
                <div>
                  <div className="text-sm font-medium">Submitted</div>
                  <div className="text-xs text-gray-400">{formatDate(complaint.createdAt)}</div>
                </div>
              </div>
              {complaint.acknowledgedAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="w-px flex-1 bg-gray-200" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Acknowledged</div>
                    <div className="text-xs text-gray-400">{formatDate(complaint.acknowledgedAt)}</div>
                    <div className="text-xs font-medium text-green-600">
                      {((new Date(complaint.acknowledgedAt).getTime() - new Date(complaint.createdAt).getTime()) / 1000).toFixed(1)}s response time
                    </div>
                  </div>
                </div>
              )}
              {complaint.escalations.length > 0 && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <div className="w-px flex-1 bg-gray-200" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Assigned to {complaint.escalations[0].officer.name}</div>
                    <div className="text-xs text-gray-400">{formatDate(complaint.escalations[0].assignedAt)}</div>
                  </div>
                </div>
              )}
              {complaint.resolvedAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Resolved</div>
                    <div className="text-xs text-gray-400">{formatDate(complaint.resolvedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Escalate</button>
            <button className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">Mark Resolved</button>
            <button className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Reassign Officer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
