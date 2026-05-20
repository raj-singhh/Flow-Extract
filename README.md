# FlowExtract

A high-precision resume parsing engine built with Next.js 15. Drop resumes from your email directly into the browser — FlowExtract extracts emails, phone numbers, skills, work history, education, and suggested job profiles in seconds using Groq's LLaMA 3.3 70B model.

---

## What it does

- **Batch upload** — drag and drop up to 15 resumes at once (PDF, TXT, PNG, JPG, WEBP), or paste `Ctrl+V` directly from your email attachments
- **Text paste** — paste raw resume text for instant extraction
- **Configurable fields** — tick only what you need: Email, Phone, Skills, Experience, Companies, College, Suggested Profiles, Total YOE
- **Contact aggregator** — all extracted emails and phone numbers collected in one place with a one-click copy button (comma-separated, ready to paste into Gmail)
- **Candidate table** — full breakdown per candidate: name, contact, education with CGPA/percentage, work history with durations, all skills, and matching job profiles
- **Image resume fallback** — PNG/JPG resumes are processed via Gemini 1.5 Flash vision when Groq can't handle them

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| AI — text extraction | [Groq](https://console.groq.com) — `llama-3.3-70b-versatile` |
| AI — image/vision fallback | Google Gemini 1.5 Flash via Genkit |
| PDF parsing | `pdf-parse` (server-side, Node.js only) |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) |
| Language | TypeScript |

---

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd FlowExtract
npm install
```

### 2. Get API keys

**Groq (required — primary AI engine)**
1. Sign up free at [console.groq.com](https://console.groq.com)
2. Go to **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_`)

**Gemini (optional — only needed for image/PNG resumes)**
1. Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 3. Configure environment

Create a `.env` file in the project root:

```env
GROQ_API_KEY=gsk_your_key_here
GEMINI_API_KEY=your_gemini_key_here
```

> Never commit `.env` to git — it's already in `.gitignore`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002).

---

## How to use

1. **Configure fields** — use the top bar checkboxes to select what to extract (Email, Phone, Skills, etc.)
2. **Drop resumes** — drag PDF/TXT files from your email client into the drop zone, or press `Ctrl+V` to paste clipboard attachments
3. **Or paste text** — switch to "Paste Text" mode and paste raw resume content
4. **Copy emails** — once extraction is done, hit **Copy List** in the Aggregated Emails box to get all emails comma-separated, ready for Gmail
5. **Review candidates** — scroll down to the candidate table for full details on each profile
6. **Clear** — hit **Clear Data** in the top bar to reset everything

---

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Main page — orchestrates state and processing
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── ai/
│   ├── genkit.ts             # Genkit + Gemini setup (image fallback)
│   └── flows/
│       └── extract-resume-details-flow.ts  # Core extraction logic (Groq + pdf-parse)
└── components/
    ├── ExtractionConfigBar.tsx   # Top bar with field toggles
    ├── ContactAggregator.tsx     # Email + phone collector with copy button
    ├── ResumeDropZone.tsx        # Drag-drop + paste zone
    └── CandidateTable.tsx        # Results table
```

---

## Supported file types

| Format | How it's processed |
|---|---|
| PDF | Text extracted server-side with `pdf-parse`, sent to Groq |
| TXT | Read as UTF-8, sent to Groq |
| PNG / JPG / WEBP | Sent to Gemini 1.5 Flash vision model |
| Pasted text | Sent directly to Groq |

---

## Free tier limits

| Service | Free limit |
|---|---|
| Groq | 14,400 requests/day · 500,000 tokens/min |
| Gemini 1.5 Flash | 1,500 requests/day · 1M tokens/min |

For daily resume batches this is more than sufficient.

---

## Scripts

```bash
npm run dev          # Start dev server on port 9002 (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run typecheck    # TypeScript type check
npm run genkit:dev   # Start Genkit dev UI (for debugging AI flows)
```

---

## Deployment

This project is ready to deploy on [Vercel](https://vercel.com).

```bash
vercel deploy
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**, or sync them with:

```bash
vercel env pull
```

The `pdf-parse` and `pdfjs-dist` packages are configured as `serverExternalPackages` in `next.config.ts` so they run as native Node.js modules on Vercel Functions — no bundling issues.
