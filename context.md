# Build Prompt — Social Media Posting Assistant for Designers

Create a desktop-first web application called HyperFlow.

The app is NOT a full automation tool.
It is a HUMAN-IN-THE-LOOP posting assistant.

The goal:
Help creators manage and execute scheduled social media posts manually with maximum speed and minimum friction.

The app should focus ONLY on:
- Instagram
- LinkedIn

The app should NOT auto-publish using APIs.
Instead, it should:
1. Store scheduled content
2. Organize posts in a queue/calendar
3. Open browser posting pages
4. Paste/copy prepared content
5. Let the user review and publish manually

This avoids API complexity and keeps the workflow human-controlled.

---

# Main Concept

The user creates content entries.

Each entry contains:
- title
- platform
- caption
- hashtags
- media files
- scheduled date
- status
- notes

When user clicks:
EXECUTE POST

The app should:
- open Instagram create-post related page in browser
- open LinkedIn create post page in browser
- automatically copy caption into clipboard
- optionally auto-paste using browser automation
- open media folder/file picker reference
- guide the user step-by-step

The user then manually reviews and clicks Publish.

This is NOT a bot.
This is a creator workflow assistant.

---

# Tech Stack

Preferred stack:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Electron or Tauri for desktop capabilities
- Prisma + SQLite for local database
- Playwright for browser automation
- Zustand for state management

---

# Core Features

## 1. Dashboard

Show:
- upcoming posts
- weekly schedule
- queue
- recent posts
- drafts

Design should feel:
- minimal
- premium
- creative
- macOS-inspired
- not corporate

---

## 2. Content Library

User can:
- create post
- duplicate post
- edit post
- archive post
- filter by platform/status

Each post contains:
- cover thumbnail
- title
- caption
- hashtags
- media
- scheduled date
- platform tags

Statuses:
- Draft
- Scheduled
- Ready
- Posted
- Archived

---

## 3. Scheduler Calendar

Calendar view:
- week
- month
- agenda

Drag-and-drop scheduling.

Visual indicators per platform.

---

## 4. Execute Workflow

MOST IMPORTANT FEATURE.

When clicking EXECUTE:
- launch browser automation
- open:
  - https://www.instagram.com/
  - https://www.linkedin.com/feed/

Then:
- focus browser window
- copy content automatically into clipboard
- optionally simulate paste
- open upload dialog or media folder
- guide user with a clean floating instruction UI

Example flow:
1. Open LinkedIn create post
2. Paste prepared caption
3. Upload selected media
4. Wait for user confirmation
5. Move to Instagram flow
6. Mark task complete

Important:
The user ALWAYS clicks final Publish manually.

---

## 5. Clipboard Manager

Add:
- quick copy caption
- quick copy hashtags
- quick copy first comment
- quick copy CTA

---

## 6. Content Templates

Templates for:
- carousel launch
- case study
- UI showcase
- build in public
- motion showcase

---

## 7. AI Helpers

Optional AI tools:
- rewrite caption for LinkedIn tone
- shorten caption
- generate hashtags
- convert IG caption into professional LinkedIn version

Do NOT overcomplicate with AI agents.

---

# UX Style

The product should feel like:
- Linear
- Raycast
- Notion
- Arc Browser
- Minimal creator OS

Avoid:
- marketing SaaS look
- bright corporate dashboards
- excessive charts

Focus on:
- typography
- spacing
- clean panels
- glassmorphism accents
- elegant dark mode

---

# Important Product Philosophy

This app is:
- calm
- fast
- beautiful
- creator-focused

NOT:
- enterprise social media manager
- agency tool
- analytics-heavy platform

The audience is:
- solo creators
- designers
- frontend creatives
- indie makers

---

# MVP Requirements

Build MVP first with:
- authentication
- local database
- create/edit post
- scheduling
- execute workflow
- clipboard support
- browser opening automation

Do NOT build analytics initially.

---

# File Structure

Use scalable architecture:
- app/
- components/
- features/
- lib/
- db/
- automation/
- templates/

Keep code modular and production-ready.

---

# Deliverables

Generate:
1. project architecture
2. database schema
3. UI layout
4. automation flow
5. Playwright integration
6. scheduling logic
7. beautiful responsive UI
8. local-first workflow
9. dark mode
10. onboarding screen

Also:
- include setup instructions
- include npm scripts
- include environment setup
- include desktop packaging approach

Make the result production-quality and visually impressive.