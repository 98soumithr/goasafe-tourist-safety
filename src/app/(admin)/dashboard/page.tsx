"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface DashboardStats {
  openCases: number;
  inProgress: number;
  slaBreaches: number;
  todayTotal: number;
  resolvedToday: number;
  avgResolutionHours: number;
  slaComplianceRate: number;
  totalComplaints: number;
}

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

interface Officer {
  id: string;
  name: string;
  designation: string | null;
  zone: string;
  dutyStatus: string;
  activeCases: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  complaintId: string | null;
  isRead: boolean;
  createdAt: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  acknowledged: "bg-yellow-100 text-yellow-700",
  investigating: "bg-purple-100 text-purple-700",
  escalated: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const DUTY_COLORS: Record<string, string> = {
  on_duty: "bg-green-100 text-green-700",
  off_duty: "bg-gray-100 text-gray-500",
  on_leave: "bg-amber-100 text-amber-700",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, complaintsRes, officersRes, notifsRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/complaints?limit=8"),
        fetch("/api/admin/officers"),
        fetch("/api/notifications?role=admin&unread=true"),
      ]);

      const [statsData, complaintsData, officersData, notifsData] = await Promise.all([
        statsRes.json(),
        complaintsRes.json(),
        officersRes.json(),
        notifsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (complaintsData.success) setComplaints(complaintsData.data || []);
      if (officersData.success) setOfficers(officersData.data || []);
      if (notifsData.success) {
        const newNotifs = notifsData.data || [];
        // Show toast if new notifications appeared
        if (notifications.length > 0 && newNotifs.length > notifications.length) {
          const diff = newNotifs.length - notifications.length;
          setToast(`${diff} new complaint${diff > 1 ? "s" : ""} received`);
          setTimeout(() => setToast(null), 4000);
        }
        setNotifications(newNotifs);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [notifications.length]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/notifications?role=admin&unread=true")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const newNotifs = data.data || [];
            if (newNotifs.length > notifications.length && notifications.length > 0) {
              const diff = newNotifs.length - notifications.length;
              setToast(`${diff} new complaint${diff > 1 ? "s" : ""} received`);
              setTimeout(() => setToast(null), 4000);
            }
            setNotifications(newNotifs);
          }
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  async function markNotificationsRead() {
    if (notifications.length === 0) return;
    const ids = notifications.map((n) => n.id);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setNotifications([]);
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const recentComplaints = complaints.filter((c) => c.status !== "closed").slice(0, 8);

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 animate-bounce rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {toast}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time overview of tourist grievances across Goa</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full bg-white p-2 shadow-sm hover:bg-gray-50"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 z-40 w-80 rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={markNotificationsRead} className="text-xs text-blue-600 hover:text-blue-700">Mark all read</button>
                  )}
                </div>
                <div className="max-h-64 divide-y overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">No unread notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="text-sm font-medium text-gray-900">{n.title}</div>
                        <div className="text-xs text-gray-500">{n.message}</div>
                        <div className="mt-1 text-[10px] text-gray-400">{timeAgo(n.createdAt)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Live
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open Cases", value: stats?.openCases ?? 0, color: (stats?.openCases ?? 0) > 10 ? "text-red-600" : "text-blue-600", bgColor: "bg-blue-50", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "In Progress", value: stats?.inProgress ?? 0, color: "text-purple-600", bgColor: "bg-purple-50", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
          { label: "SLA Breaches", value: stats?.slaBreaches ?? 0, color: (stats?.slaBreaches ?? 0) > 0 ? "text-red-600" : "text-green-600", bgColor: (stats?.slaBreaches ?? 0) > 0 ? "bg-red-50" : "bg-green-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Today Total", value: stats?.todayTotal ?? 0, color: "text-gray-800", bgColor: "bg-gray-50", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl ${stat.bgColor} p-5`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} /></svg>
            </div>
            <div className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Live Complaint Feed */}
        <div className="lg:col-span-3">
          <div className="rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">Live Complaint Feed</h2>
              <Link href="/complaints" className="text-sm text-blue-600 hover:text-blue-700">View All &rarr;</Link>
            </div>
            <div className="max-h-[500px] divide-y overflow-y-auto">
              {recentComplaints.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400">No active complaints</div>
              ) : (
                recentComplaints.map((c) => {
                  const isNew = Date.now() - new Date(c.createdAt).getTime() < 3600000;
                  return (
                    <Link key={c.id} href={`/complaints/${c.id}`} className="flex items-center gap-4 px-5 py-3 transition hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-gray-900">{c.complaintNumber}</span>
                          {isNew && <span className="animate-pulse-dot rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-gray-500">{c.aiSummary || c.originalText.substring(0, 80)}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`badge ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                          <span className={`badge ${SEVERITY_COLORS[c.severity]}`}>{c.severity}</span>
                          {c.incidentLocation && <span className="text-xs text-gray-400">{c.incidentLocation}</span>}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Heatmap Placeholder */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">Goa Incident Heatmap</h2>
            </div>
            <div className="flex items-center justify-center rounded-b-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-12">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                <p className="mt-3 text-sm font-medium text-gray-500">Interactive map visualization</p>
                <p className="text-xs text-gray-400">Leaflet integration ready</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Performance</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Avg Resolution</span><span className="font-semibold">{stats?.avgResolutionHours ?? 0}h</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">SLA Compliance</span><span className="font-semibold text-green-600">{stats?.slaComplianceRate ?? 0}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Resolved Today</span><span className="font-semibold">{stats?.resolvedToday ?? 0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Complaints</span><span className="font-semibold">{stats?.totalComplaints ?? 0}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Officer Status Panel */}
      <div className="mt-6 rounded-xl bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Officer Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Officer</th>
                <th className="px-5 py-3">Zone</th>
                <th className="px-5 py-3">Duty Status</th>
                <th className="px-5 py-3">Active Cases</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {officers.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No officers found</td></tr>
              ) : (
                officers.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{o.name}</div>
                      <div className="text-xs text-gray-400">{o.designation}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{o.zone}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${DUTY_COLORS[o.dutyStatus] || "bg-gray-100 text-gray-500"}`}>{o.dutyStatus.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-5 py-3 font-medium">{o.activeCases}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
