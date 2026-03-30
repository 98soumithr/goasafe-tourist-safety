"use client";

import { useState } from "react";
import Link from "next/link";
import { UI_TRANSLATIONS, SUPPORTED_LANGUAGES, type SupportedLanguageCode } from "@/lib/constants/languages";

const LANG_FLAGS: Record<SupportedLanguageCode, string> = { en: "🇬🇧", ru: "🇷🇺", de: "🇩🇪", he: "🇮🇱", fr: "🇫🇷" };

export default function ComplaintPage() {
  const [lang, setLang] = useState<SupportedLanguageCode>("en");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ complaintNumber: string; trackingUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = UI_TRANSLATIONS[lang];
  const dir = SUPPORTED_LANGUAGES[lang].dir;

  const [form, setForm] = useState({
    touristName: "", touristPhone: "", touristEmail: "", nationality: "",
    complaintText: "", vehicleNumber: "", incidentLocation: "", fareCharged: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preferredLanguage: lang,
          fareCharged: form.fareCharged ? parseFloat(form.fareCharged) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ complaintNumber: data.data.complaintNumber, trackingUrl: data.data.trackingUrl });

        // Trigger admin notification for new complaint
        fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new_complaint",
            title: `New Complaint: ${data.data.complaintNumber}`,
            message: `${data.data.category?.replace(/_/g, " ") || "New"} complaint (${data.data.severity || "medium"} severity) submitted by ${form.touristName}`,
            complaintId: data.data.id || null,
            targetRole: "admin",
          }),
        }).catch(() => {}); // Fire-and-forget — do not block the success screen
      } else {
        setError(data.error || t.errorMessage);
      }
    } catch {
      setError(t.errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4" dir={dir}>
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{t.successTitle}</h2>
          <p className="mt-2 text-gray-500">{t.successMessage}</p>
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <div className="text-sm text-blue-600">{t.complaintNumber}</div>
            <div className="mt-1 font-mono text-2xl font-bold text-blue-700">{result.complaintNumber}</div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link href={`/status/${result.complaintNumber}`} className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700">
              {t.trackStatus}
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Header */}
      <div className="bg-blue-600 px-4 py-4 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            GoaSafe
          </Link>
          <span className="text-sm text-blue-100">{t.appTitle}</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Language Selector */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-gray-600">{t.selectLanguage}</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguageCode[]).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  lang === code ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                }`}
              >
                <span>{LANG_FLAGS[code]}</span>
                {SUPPORTED_LANGUAGES[code].nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Complaint Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t.submitComplaint}</h2>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.yourName} *</label>
                  <input type="text" required value={form.touristName} onChange={(e) => update("touristName", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.phoneNumber} *</label>
                  <input type="tel" required value={form.touristPhone} onChange={(e) => update("touristPhone", e.target.value)}
                    placeholder="+49-170-1234567"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.email}</label>
                  <input type="email" value={form.touristEmail} onChange={(e) => update("touristEmail", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.nationality}</label>
                  <input type="text" value={form.nationality} onChange={(e) => update("nationality", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t.describeIncident}</h2>
            <div className="space-y-4">
              <div>
                <textarea required rows={5} value={form.complaintText} onChange={(e) => update("complaintText", e.target.value)}
                  placeholder={lang === "en" ? "Describe what happened in detail..." : ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.vehicleNumber}</label>
                  <input type="text" value={form.vehicleNumber} onChange={(e) => update("vehicleNumber", e.target.value)}
                    placeholder="GA-01-T-4521"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.fareCharged}</label>
                  <input type="number" value={form.fareCharged} onChange={(e) => update("fareCharged", e.target.value)}
                    placeholder="2000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.incidentLocation}</label>
                <input type="text" value={form.incidentLocation} onChange={(e) => update("incidentLocation", e.target.value)}
                  placeholder={lang === "en" ? "e.g., Dabolim Airport → Calangute" : ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              {/* Evidence Upload Placeholder */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.uploadEvidence}</label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <div>
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="mt-2 text-sm text-gray-500">Drag & drop or click to upload</p>
                    <p className="text-xs text-gray-400">JPG, PNG, MP4 — max 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <strong>{t.errorTitle}:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
