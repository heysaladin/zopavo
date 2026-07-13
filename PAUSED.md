# Zopavo

> **STATUS: ⏸ PAUSED** — sejak 2026-07-13

## Apa ini
Zopavo — internal pipeline/workflow tool untuk agency. Melacak klien dari
marketing sampai handover lewat 8 step pipeline (Marketing → Enquiry → Deal →
Project → Approval → Development → QC → Handover), lengkap dengan doc browser
per fase, dashboard funnel interaktif, dan library/calendar/templates untuk
fase marketing.

## Kondisi terakhir
- Sampai mana: sudah **initial deploy** (commit `1daba2c` + favicon `87cc9e5`).
  Fitur inti jalan: 8-step pipeline stepper di semua phase page, sidebar
  vertical stepper, dashboard funnel dengan filter + aksi "Advance" (PATCH
  status connection ke step berikutnya), phase file browser untuk docs.
- Stack: Next.js 14 (App Router) + TypeScript, Tailwind v3, Prisma + SQLite
  (`prisma/dev.db`), Zustand, next-themes. Design system: **Cubicle**
  (github.com/heysaladin/cubicle) — tokens di `app/globals.css`, komponen di
  `components/ui/`, font Geist via Google Fonts.
- Repo: https://github.com/heysaladin/zopavo (branch `main`, clean)
- Dev server: `npm run dev` → port 3001
- Keputusan yang sudah dibuat:
  - Single source of truth pipeline: `lib/pipeline.ts` (step data + helpers)
  - `Connection.status` pakai 8 step ID pipeline (komentar schema
    PROSPECT/LEAD sudah outdated — jangan bingung)
  - Warna: netral hitam-putih Cubicle, purple primary sudah dibuang
  - Docs base path: env `ZOPAVO_DOCS_BASE`, fallback `<cwd>/docs`
  - `/templates` = phase browser untuk docs 01-marketing (bukan post templates)
- Known issue: TS error di `ui/calendar.tsx` & `ui/chart.tsx` (version
  mismatch recharts/react-day-picker — komponen belum dipakai, aman diabaikan)

## Kenapa dipause
Fokus ke project lain dulu.

## What next (kalau dilanjut)
- [ ] `npm install && npm run dev` (port 3001), buka dashboard — refresh
  ingatan soal flow 8-step pipeline
- [ ] Baca `lib/pipeline.ts` + `components/docs/phase-file-browser.tsx` —
  dua file ini inti dari semuanya
- [ ] Perbaiki komentar outdated di `prisma/schema.prisma` soal
  Connection.status (biar nggak menyesatkan)
- [ ] Putuskan: SQLite lokal cukup, atau migrasi ke DB hosted kalau mau
  dipakai beneran multi-user

## Syarat dilanjut
Ada kebutuhan nyata — klien atau tim yang benar-benar butuh pipeline tool
ini untuk dipakai sehari-hari. Jangan dilanjut cuma karena gatel ngoding.
