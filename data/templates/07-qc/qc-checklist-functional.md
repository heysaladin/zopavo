# QC Checklist — Functional

**Hyperfantasy Studio | Template**
**Owner:** Tech Bot
**Phase:** 7 — QC

---
<!-- Run this checklist before any built product (website, app, component) is handed to Adin or the client. Tech Bot completes this. -->

---

## Checklist Info

| Field | Detail |
|---|---|
| Project | [CLIENT — PROJECT NAME] |
| Build type | [Website / Web app / Component library / Other] |
| Environment | [Staging URL: ] |
| QC round | [Pre-client / Final] |
| Reviewed by | Tech Bot |
| Date | [DD/MM/YYYY] |

---

## 1. Core Functionality

| # | Check | Pass | Fail | Notes |
|---|---|---|---|---|
| 1.1 | All pages load without errors | ☐ | ☐ | |
| 1.2 | All navigation links work correctly | ☐ | ☐ | |
| 1.3 | Internal links point to correct pages | ☐ | ☐ | |
| 1.4 | External links open in new tab | ☐ | ☐ | |
| 1.5 | No 404 errors on any page | ☐ | ☐ | |
| 1.6 | 404 page is custom and branded | ☐ | ☐ | |
| 1.7 | Back/forward browser buttons work | ☐ | ☐ | |
| 1.8 | Anchor links scroll to correct section | ☐ | ☐ | |

---

## 2. Forms

| # | Check | Pass | Fail | Notes |
|---|---|---|---|---|
| 2.1 | All forms submit successfully | ☐ | ☐ | |
| 2.2 | Submission goes to correct email/destination | ☐ | ☐ | |
| 2.3 | Required field validation works | ☐ | ☐ | |
| 2.4 | Email format validation works | ☐ | ☐ | |
| 2.5 | Success message shown after submission | ☐ | ☐ | |
| 2.6 | Error message shown on failed submission | ☐ | ☐ | |
| 2.7 | Spam protection active (reCAPTCHA / honeypot) | ☐ | ☐ | |
| 2.8 | Form works on mobile | ☐ | ☐ | |

---

## 3. Responsive Design

| # | Check | Pass | Fail | Notes |
|---|---|---|---|---|
| 3.1 | Desktop (1440px) — no layout issues | ☐ | ☐ | |
| 3.2 | Laptop (1280px) — no layout issues | ☐ | ☐ | |
| 3.3 | Tablet (768px) — no layout issues | ☐ | ☐ | |
| 3.4 | Mobile (390px) — no layout issues | ☐ | ☐ | |
| 3.5 | No horizontal scroll on any breakpoint | ☐ | ☐ | |
| 3.6 | Touch targets are minimum 44×44px on mobile | ☐ | ☐ | |
| 3.7 | Text does not overflow containers at any size | ☐ | ☐ | |
| 3.8 | Images do not stretch or distort | ☐ | ☐ | |

---

## 4. Cross-Browser

| Browser | Pass | Fail | Notes |
|---|---|---|---|
| Chrome (latest) | ☐ | ☐ | |
| Safari (latest) | ☐ | ☐ | |
| Firefox (latest) | ☐ | ☐ | |
| Chrome mobile (Android) | ☐ | ☐ | |
| Safari mobile (iOS) | ☐ | ☐ | |

---

## 5. Performance

Run Lighthouse audit on homepage and one content-heavy page.

| Metric | Target | Actual | Pass |
|---|---|---|---|
| Performance | ≥ 90 | | ☐ |
| Accessibility | ≥ 85 | | ☐ |
| Best Practices | ≥ 90 | | ☐ |
| SEO | ≥ 90 | | ☐ |
| LCP | < 2.5s | | ☐ |
| CLS | < 0.1 | | ☐ |

---

## 6. SEO & Meta

| # | Check | Pass | Fail | Notes |
|---|---|---|---|---|
| 6.1 | Unique `<title>` on every page | ☐ | ☐ | |
| 6.2 | `<meta description>` on every page | ☐ | ☐ | |
| 6.3 | OG image set for homepage | ☐ | ☐ | |
| 6.4 | `robots.txt` correct | ☐ | ☐ | |
| 6.5 | `sitemap.xml` generated and accessible | ☐ | ☐ | |
| 6.6 | No duplicate H1 tags on any page | ☐ | ☐ | |
| 6.7 | Alt text on all meaningful images | ☐ | ☐ | |

---

## 7. Security & Infrastructure

| # | Check | Pass | Fail | Notes |
|---|---|---|---|---|
| 7.1 | SSL certificate active (HTTPS) | ☐ | ☐ | |
| 7.2 | No sensitive keys exposed in client-side code | ☐ | ☐ | |
| 7.3 | Environment variables not committed to repo | ☐ | ☐ | |
| 7.4 | Analytics installed and tracking events | ☐ | ☐ | |
| 7.5 | No console errors in production | ☐ | ☐ | |

---

## 8. Content Accuracy

| # | Check | Pass | Fail | Notes |
|---|---|---|---|---|
| 8.1 | All placeholder/dummy content replaced | ☐ | ☐ | |
| 8.2 | Client name, logo, and contact info correct | ☐ | ☐ | |
| 8.3 | All images are final (not placeholders) | ☐ | ☐ | |
| 8.4 | Social media links point to correct accounts | ☐ | ☐ | |
| 8.5 | Phone numbers and emails are correct | ☐ | ☐ | |

---

## QC Result

- [ ] ✅ **PASS** — Ready for Adin review / staging handoff
- [ ] ⚠️ **PASS WITH NOTES** — Minor issues, proceed with caution
- [ ] ❌ **FAIL** — Fix before review

**Issues to fix:**
1. [Issue + page/component + severity]
2. [Issue + page/component + severity]

---

*QC by: Tech Bot | Date: [DD/MM/YYYY] | Project: [PROJECT ID] | Staging: [URL]*
