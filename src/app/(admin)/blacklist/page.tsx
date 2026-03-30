"use client";

import { useState, useEffect } from "react";

interface BlacklistEntry {
  id: string;
  reason: string;
  totalComplaints: number;
  blacklistedAt: string;
  status: string;
  taxiPermit: {
    driverName: string;
    permitNumber: string;
    vehicleNumber: string;
    zone: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-red-100 text-red-700",
  under_review: "bg-amber-100 text-amber-700",
  removed: "bg-gray-100 text-gray-500",
};

export default function BlacklistPage() {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blacklist")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBlacklist(data.data || []);
      })
      .catch((err) => console.error("Failed to fetch blacklist:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blacklist</h1>
          <p className="text-sm text-gray-500">Auto-generated from complaint patterns -- drivers with 5+ complaints in 90 days</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Export PDF</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Generate Weekly Report</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Driver</th>
              <th className="px-5 py-3">Vehicle #</th>
              <th className="px-5 py-3">Zone</th>
              <th className="px-5 py-3">Total Complaints</th>
              <th className="px-5 py-3">Reason</th>
              <th className="px-5 py-3">Blacklisted</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {blacklist.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No blacklisted entries found</td></tr>
            ) : (
              blacklist.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{entry.taxiPermit.driverName}</div>
                    <div className="font-mono text-xs text-gray-400">{entry.taxiPermit.permitNumber}</div>
                  </td>
                  <td className="px-5 py-4 font-mono font-semibold text-gray-900">{entry.taxiPermit.vehicleNumber}</td>
                  <td className="px-5 py-4 text-gray-600">{entry.taxiPermit.zone}</td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-red-600">{entry.totalComplaints}</span>
                  </td>
                  <td className="max-w-xs px-5 py-4 text-xs text-gray-500">{entry.reason}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">{new Date(entry.blacklistedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${STATUS_COLORS[entry.status] || "bg-gray-100 text-gray-500"}`}>{entry.status.replace(/_/g, " ")}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
