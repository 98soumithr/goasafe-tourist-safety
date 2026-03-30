import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-xl font-bold text-gray-900">GoaSafe</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/complaint" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Report Incident</Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Admin Dashboard</Link>
            <Link href="/complaint" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition">
              File Complaint
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTJ2NEgyNFYwSDEydjRIMHYyaDEyVjRoMTJWMmgyVjBoLTJ6TTEyIDMydi0ySDJ2Mkg4di0ySDJ2LTJoMnYyaDJ2MmgtMnYySDJ2MmgxMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Goa Tourism Department — Official Safety Portal
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              GoaSafe
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:text-xl">
              Your safety is our priority. Report taxi incidents instantly and get help from a tourism officer within hours.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/complaint"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50 hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Report an Incident
              </Link>
              <Link
                href="/status/track"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Track Your Complaint
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-8 z-10 mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { value: "500+", label: "Complaints Resolved", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { value: "< 60s", label: "SMS Response Time", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { value: "5", label: "Languages Supported", icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white p-6 text-center shadow-lg">
              <svg className="mx-auto h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900">How It Works</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-gray-500">Three simple steps to report and resolve taxi incidents in Goa</p>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { step: "1", title: "Report", desc: "Submit your complaint in any of 5 languages. Describe what happened, provide taxi details if available.", color: "bg-blue-100 text-blue-700" },
            { step: "2", title: "AI Processes", desc: "Our AI instantly categorizes the complaint, cross-references the taxi permit database, and assigns a severity level.", color: "bg-indigo-100 text-indigo-700" },
            { step: "3", title: "Officer Responds", desc: "The nearest tourism officer is assigned and will contact you. You receive an SMS confirmation within 60 seconds.", color: "bg-green-100 text-green-700" },
          ].map((item) => (
            <div key={item.step} className="relative rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${item.color}`}>
                {item.step}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Multilingual Support</h2>
          <p className="mt-2 text-gray-500">Report in your preferred language — we handle the translation</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { flag: "🇬🇧", lang: "English" },
              { flag: "🇷🇺", lang: "Русский" },
              { flag: "🇩🇪", lang: "Deutsch" },
              { flag: "🇮🇱", lang: "עברית" },
              { flag: "🇫🇷", lang: "Français" },
            ].map((l) => (
              <div key={l.lang} className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium shadow-sm">
                <span className="text-xl">{l.flag}</span>
                {l.lang}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 text-gray-400">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="text-xl font-bold text-white">GoaSafe</div>
          <p className="mt-2 text-sm">Goa Tourism Department — Tourist Safety & Grievance Redressal</p>
          <p className="mt-4 text-sm">Emergency Helpline: <span className="font-semibold text-white">1800-123-4567</span> (Toll-Free)</p>
          <p className="mt-1 text-xs text-gray-500">Powered by AI-driven complaint management</p>
        </div>
      </footer>
    </div>
  );
}
