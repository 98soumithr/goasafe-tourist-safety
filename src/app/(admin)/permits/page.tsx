"use client";

import { useState, useEffect, useCallback } from "react";

interface Permit {
  id: string;
  permitNumber: string;
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  zone: string;
  permitStatus: string;
  complaintCount: number;
  expiryDate: string;
}

const PERMIT_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-amber-100 text-amber-700",
  revoked: "bg-red-100 text-red-700",
};

export default function PermitsPage() {
  const [search, setSearch] = useState("");
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/permits?${params.toString()}`);
      const data = await res.json();
      if (data.success) setPermits(data.data || []);
    } catch (error) {
      console.error("Failed to fetch permits:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Taxi Permits</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Add Permit</button>
      </div>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by vehicle number, driver name, or permit..."
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Permit #</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Vehicle #</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Zone</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Complaints</th>
                <th className="px-5 py-3">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {permits.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">No permits found</td></tr>
              ) : (
                permits.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-sm text-gray-600">{p.permitNumber}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{p.driverName}</td>
                    <td className="px-5 py-3 font-mono font-semibold text-gray-900">{p.vehicleNumber}</td>
                    <td className="px-5 py-3 capitalize text-gray-600">{p.vehicleType}</td>
                    <td className="px-5 py-3 text-gray-600">{p.zone}</td>
                    <td className="px-5 py-3"><span className={`badge ${PERMIT_STATUS_COLORS[p.permitStatus] || "bg-gray-100 text-gray-500"}`}>{p.permitStatus}</span></td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${p.complaintCount >= 5 ? "text-red-600" : p.complaintCount >= 3 ? "text-amber-600" : "text-gray-600"}`}>
                        {p.complaintCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(p.expiryDate).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
