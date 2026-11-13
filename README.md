# Identiq — Multimodal Brand Governance Platform

Identiq is a multimodal, evidence-driven brand governance platform designed to help enterprise brand, legal, and marketing teams audit campaign copy, social creative, press releases, and product documentation against verified brand knowledge.

---

## Key Features

1. **Dashboard (`/`)**: High-level compliance KPI summary, review status distribution, recent submissions grid with pastel theme cards, and a review activity breakdown chart.
2. **Brand Knowledge Hub (`/knowledge-hub`)**: Complete CRUD and approval management across 7 essential brand governance sections (Guidelines, Approved Facts, Terminology, Restricted Claims, Brand Voice, Colours & Typography, Usage Policies).
3. **Asset Library (`/assets`)**: Visual asset management for logos, photography, marketing assets, and icons with category filtering, preview inspection, and upload workflow.
4. **New Review (`/reviews/new`)**: Multimodal submission pipeline accepting copy text and visual assets, auditing against approved brand rules via server-side AI.
5. **Review Studio (`/studio`)**: Central workspace inspired by modern SaaS design systems featuring:
   - Split view preview of submitted copy with live highlighting of affected segments.
   - Findings categorized by severity and evidence status (**Supported**, **Conflicting**, **Unverified**).
   - Editable correction drafting with live `"Accept & Apply Fix"` updates.
   - Reviewer comment threads and manual finding creation.
   - Floating dark contextual toolbar.
6. **Approvals (`/approvals`)**: Dedicated queue for reviewers to inspect issues, review suggested corrections, post decision notes, and sign off with `Approve Content` or `Request Changes`.
7. **Activity / History (`/activity`)**: Comprehensive audit trail of submissions, review decisions, and knowledge updates.
8. **Settings (`/settings`)**: Reviewer profile customization, evidence policies, and integration configuration.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: Tailwind CSS v4, Lucide React icons, motion
- **AI Integration**: Server-side abstraction supporting **OpenRouter** (primary) and **Gemini** (`@google/genai` fallback) with structured JSON schema validation.
- **Data & Storage**: LocalStorage prototype state with full Supabase integration boundaries (`lib/supabase/client.ts`).
- **Deployment**: Vercel (standalone Node.js runtime)

---

## Getting Started

### Prerequisites
- Node.js 22+ & npm

### Installation & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (optional for live AI / Supabase):
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server on port 3000:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
