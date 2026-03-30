"use client";

import { useState, useEffect } from "react";

interface Officer {
  id: string;
  name: string;
  designation: string | null;
  zone: string;
  phone: string;
  dutyStatus: string;
  activeCases: number;
  resolutionRate: number;
}

const DUTY_COLORS: Record<string, string> = {
  on_duty: "bg-green-100 text-green-700",
  off_duty: "bg-gray-100 text-gray-500",
  on_leave: "bg-amber-100 text-amber-700",
};

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/officers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOfficers(data.data || []);
      })
      .catch((err) => console.error("Failed to fetch officers:", err))
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
        <h1 className="text-2xl font-bold text-gray-900">Tourism Officers</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Add Officer</button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Designation</th>
              <th className="px-5 py-3">Zone</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Duty Status</th>
              <th className="px-5 py-3">Active Cases</th>
              <th className="px-5 py-3">Resolution Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {officers.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No officers found</td></tr>
            ) : (
              officers.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{o.name}</td>
                  <td className="px-5 py-3 text-gray-600">{o.designation || "Officer"}</td>
                  <td className="px-5 py-3 text-gray-600">{o.zone}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{o.phone}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${DUTY_COLORS[o.dutyStatus] || "bg-gray-100 text-gray-500"}`}>
                      {o.dutyStatus === "on_duty" && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />}
                      {o.dutyStatus.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium">{o.activeCases}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${o.resolutionRate}%` }} />
                      </div>
                      <span className="text-xs font-medium">{o.resolutionRate}%</span>
                    </div>
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
