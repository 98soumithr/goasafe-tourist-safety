# Tourist Safety & Taxi Grievance AI — Goa

## Project Overview

AI-powered complaint intake and escalation system for tourist safety in Goa, India. Tourists report taxi overcharging/harassment → AI categorizes, cross-references taxi permit database, escalates to nearest tourism officer, sends SMS acknowledgement within 60 seconds, and generates weekly blacklist reports.

**Client**: Goa Tourism Department
**Type**: Prototype / MVP for client presentation
**Status**: Active Development

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                     │
│                                                              │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │  Tourist App      │    │  Admin Dashboard               │  │
│  │  /complaint/*     │    │  /admin/*                      │  │
│  │  Multilingual UI  │    │  Real-time feed, analytics,    │  │
│  │  Mobile-first     │    │  blacklist mgmt, officer view  │  │
│  └──────────────────┘    └───────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   API ROUTES (Next.js)                       │
│  /api/complaints, /api/admin/*, /api/auth/*                 │
├─────────────────────────────────────────────────────────────┤
│                    SERVICES LAYER                            │
│  ┌────────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Complaint  │ │ AI Engine │ │ SMS      │ │ Escalation │ │
│  │ Service    │ │ (Categorize│ │ Service  │ │ Engine     │ │
│  │            │ │ Translate) │ │ (Twilio) │ │ (Officers) │ │
│  └────────────┘ └───────────┘ └──────────┘ └────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                │
│  PostgreSQL (Prisma ORM) │ Redis (queues, cache)            │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui | SSR, built-in i18n, fast prototyping |
| Backend | Next.js API Routes + Server Actions | Unified codebase, no separate server |
| Database | PostgreSQL 16 + Prisma ORM | JSONB, PostGIS for geo, type-safe |
| Cache/Queue | Redis + BullMQ | SMS queue, rate limiting |
| AI/NLP | OpenAI GPT-4o-mini (categorization) | Zero-shot, no training data needed |
| Translation | Google Cloud Translation API | Supports all 5 languages inc. Hebrew |
| SMS | Twilio (international) + MSG91 (India) | Reliable intl delivery |
| Auth | NextAuth.js + JWT | Role-based: tourist, officer, admin |
| Real-time | Socket.IO or Pusher | Officer alerts, dashboard live feed |
| Deployment | Vercel (frontend) + Railway (DB/Redis) | Free/cheap tier, production URLs |

### Database Schema (Core Tables)

1. **tourists** — name, phone, email, nationality, preferred_language
2. **taxi_permits** — permit_number, driver_name, vehicle_number, zone, status, complaint_count
3. **complaints** — complaint_number, tourist_id, taxi_permit_id, category, severity, status, original_text, original_language, translated_text, ai_category_confidence, fare_charged, fare_expected, incident_location, evidence_urls
4. **tourism_officers** — name, phone, zone, duty_status, current_lat/lng
5. **escalations** — complaint_id, officer_id, priority, status, timestamps
6. **blacklist** — taxi_permit_id, reason, complaint_ids, report_week
7. **sms_log** — complaint_id, recipient_phone, message_type, status, latency_ms

### API Endpoints

**Tourist-facing:**
- `POST /api/complaints` — submit complaint (multilingual)
- `GET /api/complaints/[id]/status` — check status by complaint number
- `POST /api/complaints/[id]/evidence` — upload photos
- `GET /api/fare-estimate` — estimate fair fare for route

**Officer:**
- `GET /api/officer/assignments` — current assignments
- `PATCH /api/officer/assignments/[id]` — accept/update
- `POST /api/officer/complaints/[id]/resolve` — submit resolution

**Admin:**
- `GET /api/admin/complaints` — list all (paginated, filterable)
- `GET /api/admin/analytics/*` — dashboard stats, trends, heatmap
- `GET/POST /api/admin/blacklist` — manage blacklist
- `GET /api/admin/blacklist/report` — generate weekly report PDF
- `GET/POST /api/admin/permits` — taxi permit database
- `GET/POST /api/admin/officers` — officer management

---

## Parallel Development Workstreams

This project uses multiple agents working in parallel on independent packages.

### Workstream A: Backend API & Database
- Prisma schema + migrations
- API routes for complaints, auth, admin
- SMS queue with BullMQ
- Seed data (50 permits, 8 officers, 100 complaints)

### Workstream B: Tourist Complaint App (Frontend)
- Multilingual complaint form (5 languages)
- Status tracking page
- Mobile-first responsive design
- Photo evidence upload

### Workstream C: Admin Dashboard
- Live complaint feed with real-time updates
- Analytics charts (recharts)
- Goa map with complaint heatmap (Leaflet)
- Blacklist management + PDF export
- Officer status panel

### Workstream D: AI Categorization Service
- Language detection + translation pipeline
- Zero-shot complaint categorization (GPT-4o-mini)
- Severity scoring + fare estimation
- Entity extraction (vehicle numbers, locations, amounts)

### Workstream E: SMS & Notification Service
- Twilio integration (international)
- MSG91 integration (India)
- 60-second SLA monitoring
- Multilingual SMS templates (EN, RU, DE, HE, FR)

---

## Development Rules

### Code Standards
- TypeScript strict mode everywhere
- Prisma for all database operations (never raw SQL in app code)
- Server Components by default, Client Components only when needed
- All API routes validate input with Zod schemas
- Error handling: return structured JSON errors, never expose stack traces

### File Organization
```
src/
├── app/                    # Next.js App Router pages
│   ├── (tourist)/          # Tourist-facing routes
│   │   ├── complaint/      # Complaint form + status
│   │   └── layout.tsx
│   ├── (admin)/            # Admin dashboard routes
│   │   ├── dashboard/
│   │   ├── complaints/
│   │   ├── blacklist/
│   │   ├── permits/
│   │   ├── officers/
│   │   └── layout.tsx
│   ├── (officer)/          # Officer routes
│   │   └── assignments/
│   └── api/                # API routes
│       ├── complaints/
│       ├── admin/
│       ├── officer/
│       └── auth/
├── components/             # Shared UI components
│   ├── ui/                 # shadcn/ui components
│   ├── forms/
│   ├── charts/
│   └── maps/
├── lib/                    # Core business logic
│   ├── services/           # Business services
│   │   ├── complaint.ts
│   │   ├── ai-categorization.ts
│   │   ├── sms.ts
│   │   ├── escalation.ts
│   │   ├── blacklist.ts
│   │   └── fare-estimation.ts
│   ├── db/                 # Database utilities
│   │   └── prisma.ts
│   ├── queue/              # BullMQ queue definitions
│   ├── utils/
│   └── constants/
├── i18n/                   # Internationalization
│   ├── messages/
│   │   ├── en.json
│   │   ├── ru.json
│   │   ├── de.json
│   │   ├── he.json
│   │   └── fr.json
│   └── config.ts
├── types/                  # TypeScript type definitions
│   ├── complaint.ts
│   ├── taxi.ts
│   ├── officer.ts
│   └── api.ts
└── styles/
    └── globals.css
```

### Security Rules
- NEVER hardcode API keys — use environment variables
- Validate all user input with Zod at API boundaries
- Sanitize complaint text before storage (XSS prevention)
- PII encryption at rest for phone numbers and emails
- RBAC: tourist endpoints don't require auth, officer/admin require JWT
- Rate limit complaint submission: 10/hour per phone number
- CORS restricted to known frontend domains
- File uploads: max 10MB, image/video MIME types only
- GDPR compliance: data export + deletion endpoints for EU tourists

### Multilingual Support
- 5 languages: English (en), Russian (ru), German (de), Hebrew (he), French (fr)
- Hebrew requires RTL layout support (`dir="rtl"`)
- Store complaints in original language + English translation
- All internal processing on English translation
- SMS acknowledgements in tourist's preferred language
- Admin dashboard always in English

### SMS Templates

**English:**
```
[GoaSafe] Complaint #{number} registered. A tourism officer will contact you within 4 hours. Track: {url} Helpline: 1800-XXX-XXXX
```

**Russian:**
```
[GoaSafe] Жалоба #{number} зарегистрирована. Сотрудник туризма свяжется с вами в течение 4 часов. Статус: {url}
```

**German:**
```
[GoaSafe] Beschwerde #{number} registriert. Ein Tourismusbeamter wird Sie innerhalb von 4 Stunden kontaktieren. Status: {url}
```

**Hebrew:**
```
[GoaSafe] תלונה #{number} נרשמה. פקיד תיירות ייצור איתך קשר תוך 4 שעות. מצב: {url}
```

**French:**
```
[GoaSafe] Plainte #{number} enregistrée. Un agent du tourisme vous contactera dans les 4 heures. Suivi: {url}
```

### AI Categorization Categories
1. overcharging — fare above 1.5x estimated fair fare
2. refusal_of_service — refusing to take passenger or use meter
3. harassment — verbal abuse, intimidation, aggressive behavior
4. unsafe_driving — reckless driving, drunk driving
5. meter_tampering — rigged or non-functional meter
6. route_deviation — unnecessarily long route
7. luggage_issues — holding luggage hostage, damage
8. other — does not fit above categories

### Severity Levels
- **critical** — physical threat, assault, stranding in remote area
- **high** — extreme overcharging (>3x), verbal abuse, refusal with stranding
- **medium** — moderate overcharging (1.5-3x), meter tampering, route deviation
- **low** — minor overcharging (<1.5x), general rudeness

### Goa Taxi Fare Reference (2024-2025)
```
Auto rickshaw: ₹30 base + ₹15/km
Taxi sedan: ₹100 base + ₹22/km
Taxi SUV: ₹150 base + ₹30/km
Airport fixed rates:
  → Panjim: ₹900
  → Calangute: ₹750
  → Margao: ₹500
  → Vasco: ₹350
```

### Blacklist Rules
- Auto-flag: 3+ complaints within 30 days
- Auto-blacklist: 5+ complaints within 90 days
- Weekly report generated every Monday 00:00 IST
- Report includes: driver details, complaint count, categories, severity breakdown
- Tourist PII fully anonymized in reports

---

## Demo Script (Client Presentation Flow)

1. Open tourist complaint form → switch to Russian, show language selector
2. Submit a complaint in German about overcharging
3. Show real-time appearance on admin dashboard
4. Click complaint → show AI categorization, fare comparison, translated text
5. Show taxi cross-reference: "This driver has 4 previous complaints"
6. Show officer getting real-time alert
7. Show SMS log: "Acknowledgement sent in 8.3 seconds"
8. Navigate to analytics: heatmap, category breakdown, trends
9. Open blacklist report: auto-generated weekly PDF

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# AI
OPENAI_API_KEY=...

# Translation
GOOGLE_TRANSLATE_API_KEY=...

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
MSG91_AUTH_KEY=...

# File Storage
AWS_S3_BUCKET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Real-time
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
```

---

## Mock Data Strategy

For demo, pre-seed database with:
- 50 taxi permits (realistic GA-XX-T-XXXX numbers)
- 8 tourism officers across 4 zones (Calangute, Panjim, Margao, Vasco)
- 100 historical complaints (all categories, all 5 languages)
- 5 active complaints (for live demo)
- 3 blacklisted permits (with complaint history)
- SMS logs showing 99.5% SLA compliance
