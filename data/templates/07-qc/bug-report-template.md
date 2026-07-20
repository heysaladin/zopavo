# Bug Report Template

**Hyperfantasy Studio | Template**
**Owner:** Tech Bot
**Phase:** 7 — QC

---
<!-- Use for any bug found during internal QC, client review, or post-launch monitoring. One form per bug. -->

---

## Bug #[XXX]

| Field | Detail |
|---|---|
| Project | [CLIENT — PROJECT NAME] |
| Reporter | [Tech Bot / Adin / Client / Other] |
| Date reported | [DD/MM/YYYY] |
| Assigned to | [Tech Bot] |
| Priority | [P1 — Critical / P2 — High / P3 — Medium / P4 — Low] |
| Status | [Open / In progress / Fixed / Closed / Won't fix] |

---

## Priority Guide

| Level | Meaning | SLA |
|---|---|---|
| P1 — Critical | Site down, data loss, security issue, launch blocker | Fix within 4 hours |
| P2 — High | Major feature broken, affects most users | Fix within 1 business day |
| P3 — Medium | Feature broken but workaround exists | Fix within 3 business days |
| P4 — Low | Visual issue, minor UX problem | Fix in next sprint / batch |

---

## Bug Description

**Summary (one line):**
> [e.g. Contact form does not send on Safari mobile]

**Full description:**
> [Detailed explanation of what is happening and what should happen instead]

---

## Steps to Reproduce

1. [Step 1 — e.g. Open site on Safari iOS 17]
2. [Step 2 — e.g. Navigate to /contact]
3. [Step 3 — e.g. Fill in all fields]
4. [Step 4 — e.g. Click Submit]
5. **Result:** [e.g. Page refreshes, no confirmation message, email not received]
6. **Expected:** [e.g. Success message appears, email sent to studio@hyperfantasy.co]

---

## Environment

| Field | Detail |
|---|---|
| URL / page | [https://staging.client.com/contact] |
| Browser | [e.g. Safari 17.2] |
| OS | [e.g. iOS 17.2.1] |
| Device | [e.g. iPhone 14 Pro] |
| Screen width | [e.g. 390px] |
| Reproducible | [Always / Sometimes / Once] |

---

## Evidence

| Type | Link / file |
|---|---|
| Screenshot | [Attach or paste link] |
| Screen recording | [Link] |
| Console error | [Paste error message] |
| Network log | [Attach if relevant] |

**Console error (if any):**
```
[Paste error here]
```

---

## Root Cause (Tech Bot fills after investigation)

> [Explanation of why the bug occurs — component, function, or configuration involved]

---

## Fix Applied

**Fix description:**
> [What was changed to resolve this]

**Files changed:**
- `[filename.tsx]` — [what changed]
- `[filename.ts]` — [what changed]

**Fix date:** [DD/MM/YYYY]
**Fix version / commit:** [commit hash or deploy ID]

---

## Verification

- [ ] Fix tested by Tech Bot
- [ ] Fix verified by Adin
- [ ] Tested on original failing environment
- [ ] No regression introduced (related flows tested)
- [ ] Closed date: [DD/MM/YYYY]

---

*Reported: [DD/MM/YYYY] | Project: [PROJECT ID] | Bug ID: [BUG-XXX]*
