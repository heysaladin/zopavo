# Tech Spec Template

**Hyperfantasy Studio | Template**
**Owner:** Dita → Tech Bot
**Phase:** 6 — Development

---
<!-- This spec is issued to Tech Bot before development begins. It defines the technical scope, stack, and requirements for building the deliverable. -->

---

## Spec Identity

| Field | Detail |
|---|---|
| Project | [CLIENT — PROJECT NAME] |
| Project ID | [PROJ-YYYY-XXX] |
| Spec version | [v1.0] |
| Issued by | Dita |
| Assigned to | Tech Bot |
| Spec date | [DD/MM/YYYY] |
| Dev start | [DD/MM/YYYY] |
| Staging due | [DD/MM/YYYY] |
| Launch due | [DD/MM/YYYY] |

---

## 1. Project Type

- [ ] Website (informational)
- [ ] Website (with CMS / blog)
- [ ] Landing page
- [ ] Web application
- [ ] E-commerce
- [ ] Design system / component library
- [ ] Other: [specify]

---

## 2. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | [e.g. Next.js 14 / Webflow / Framer] | |
| Language | [TypeScript / JavaScript] | |
| Styling | [Tailwind CSS / CSS Modules / styled-components] | |
| CMS | [Sanity / Contentful / Webflow CMS / None] | |
| Database | [Supabase / PlanetScale / None] | |
| Auth | [Clerk / NextAuth / None] | |
| Hosting | [Vercel / Netlify / AWS / client-managed] | |
| Domain | [Client provides / We configure] | |
| Analytics | [Vercel Analytics / GA4 / Plausible / None] | |

---

## 3. Pages & Routes

| Route | Page name | Dynamic? | CMS-driven? | Notes |
|---|---|---|---|---|
| `/` | Home | No | No | |
| `/about` | About | No | No | |
| `/services` | Services | No | No | |
| `/work` | Portfolio | No | Yes — project cards | |
| `/work/[slug]` | Project detail | Yes | Yes | |
| `/contact` | Contact | No | No | Form to [email] |
| `/[other]` | | | | |

---

## 4. Features & Functionality

| Feature | Priority | Notes |
|---|---|---|
| Contact form | Must-have | Submit to [email] via [Resend / Formspree] |
| Mobile responsive | Must-have | 390px, 768px, 1440px breakpoints |
| Page transitions | Nice-to-have | [Fade / Slide / None] |
| Animation | [level] | [e.g. Scroll-triggered via Framer Motion] |
| Dark/light mode | [Yes/No] | |
| Multi-language | [Yes/No] | Languages: [list] |
| Search | [Yes/No] | |
| [Other feature] | | |

---

## 5. Third-Party Integrations

| Service | Purpose | API key needed? | Notes |
|---|---|---|---|
| [e.g. Mailchimp] | Newsletter signup | Yes | Client provides key |
| [e.g. WhatsApp] | CTA button | No | Link only |
| [e.g. Google Maps] | Location embed | Yes | Studio Google account |
| [e.g. Calendly] | Booking widget | No | Embed code |

---

## 6. Design Handoff Reference

| Item | Location |
|---|---|
| Figma file | [Link] |
| Design token export | [Link / File] |
| Component inventory | [List or Figma page] |
| Asset exports | [Folder link] |
| Font files / licences | [Link] |

---

## 7. Performance Requirements

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 85 |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| First Input Delay | < 100ms |
| Image formats | WebP with fallback |
| Max page weight (home) | < 1MB |

---

## 8. SEO Requirements

- [ ] Unique `<title>` and `<meta description>` per page
- [ ] OG tags for social sharing
- [ ] `robots.txt` configured
- [ ] `sitemap.xml` generated
- [ ] Canonical URLs set
- [ ] Heading hierarchy correct (one H1 per page)
- [ ] Alt text on all meaningful images

---

## 9. Staging & Deployment

| Step | Owner | Notes |
|---|---|---|
| Staging URL | Tech Bot | [e.g. client-name.vercel.app] |
| Staging review | Adin + Client | Before launch |
| DNS transfer | [Tech Bot / Client IT] | |
| Go-live approval | Dita + Client | Sign-off required |
| Post-launch check | Tech Bot | 30-min smoke test |

---

## 10. Out of Scope

- [ ] [e.g. Backend API development]
- [ ] [e.g. Payment processing setup]
- [ ] [e.g. Ongoing content updates after handover]
- [ ] [e.g. Email hosting configuration]

---

## 11. Dev Completion Checklist

Before staging handoff:
- [ ] All routes functional and linked
- [ ] Forms tested with real submissions
- [ ] Mobile tested on physical device
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Performance audit run (Lighthouse)
- [ ] No console errors in production build
- [ ] Environment variables documented
- [ ] README updated with setup instructions

---

*Spec by: Dita | Date: [DD/MM/YYYY] | Project: [PROJECT ID]*
