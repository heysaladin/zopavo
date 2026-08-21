# Zopavo — Site Map

> Base URL: `http://localhost:3001`

---

## Pages

### General

| Page | URL | Keterangan |
|------|-----|------------|
| Home (redirect) | [`/`](http://localhost:3001/) | Root — kemungkinan redirect ke dashboard |
| Dashboard | [`/dashboard`](http://localhost:3001/dashboard) | Funnel interaktif + ringkasan pipeline |

---

### Pipeline — 8 Tahap

| Step | Page | URL | Keterangan |
|------|------|-----|------------|
| 01 | Marketing – Library | [`/library`](http://localhost:3001/library) | Daftar semua post/template |
| 01 | Marketing – Calendar | [`/calendar`](http://localhost:3001/calendar) | Kalender konten |
| 01 | Marketing – Templates | [`/templates`](http://localhost:3001/templates) | Browser dokumen fase marketing |
| 02 | Enquiry | [`/enquiries`](http://localhost:3001/enquiries) | Daftar enquiry masuk |
| 02 | Inquiries (alias) | [`/inquiries`](http://localhost:3001/inquiries) | Alias enquiries |
| 03 | Deal | [`/deals`](http://localhost:3001/deals) | Daftar deal |
| 04 | Project | [`/projects`](http://localhost:3001/projects) | Daftar project |
| 05 | Approval | [`/approval`](http://localhost:3001/approval) | Halaman approval |
| 06 | Development | [`/development`](http://localhost:3001/development) | Halaman development |
| 07 | QC | [`/qc`](http://localhost:3001/qc) | Halaman quality control |
| 08 | Handover | [`/handover`](http://localhost:3001/handover) | Halaman handover |

---

### Library (Sub-pages)

| Page | URL | Keterangan |
|------|-----|------------|
| Buat Post Baru | [`/library/new`](http://localhost:3001/library/new) | Form tambah post baru |
| Detail Post | [`/library/[id]`](http://localhost:3001/library/:id) | Detail post berdasarkan ID |
| Edit Post | [`/library/[id]/edit`](http://localhost:3001/library/:id/edit) | Edit post |
| Execute Post | [`/library/[id]/execute`](http://localhost:3001/library/:id/execute) | Eksekusi/gunakan post |

---

### Docs

| Page | URL | Keterangan |
|------|-----|------------|
| Docs Browser | [`/docs`](http://localhost:3001/docs) | Browser dokumen fase (phase-file-browser) |

---

### Projects (Sub-pages)

| Page | URL | Keterangan |
|------|-----|------------|
| Detail Project | [`/projects/[id]`](http://localhost:3001/projects/:id) | Detail project berdasarkan ID |

---

### Deliverables

| Page | URL | Keterangan |
|------|-----|------------|
| Daftar Deliverable | [`/deliverables`](http://localhost:3001/deliverables) | Semua deliverable |
| Detail Deliverable | [`/deliverables/[id]`](http://localhost:3001/deliverables/:id) | Detail deliverable |

---

## API Routes

### Posts (Library)

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET, POST | `/api/posts` | List / buat post baru |
| GET, PATCH, DELETE | `/api/posts/[id]` | Detail / edit / hapus post |

### Templates

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/templates` | List template dokumen |

### Docs

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/docs` | List file dokumen per fase |
| GET | `/api/docs/file` | Ambil konten file dokumen |

### Clients

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET, POST | `/api/clients` | List / tambah client |

### Enquiries

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET, POST | `/api/enquiries` | List / tambah enquiry |
| GET, PATCH, DELETE | `/api/enquiries/[id]` | Detail / edit / hapus enquiry |

### Deals

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET, POST | `/api/deals` | List / tambah deal |
| GET, PATCH, DELETE | `/api/deals/[id]` | Detail / edit / hapus deal |
| GET, POST | `/api/deals/[id]/agreement` | Agreement per deal |

### Projects

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET, POST | `/api/projects` | List / tambah project |
| GET, PATCH, DELETE | `/api/projects/[id]` | Detail / edit / hapus project |

### Approvals

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET, PATCH, DELETE | `/api/approvals/[id]` | Detail / update / hapus approval |

### Deliverables

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET, POST | `/api/deliverables` | List / tambah deliverable |
| GET, PATCH, DELETE | `/api/deliverables/[id]` | Detail / edit / hapus deliverable |
| POST | `/api/deliverables/[id]/advance` | Naikkan status ke step berikutnya |
| POST | `/api/deliverables/[id]/retreat` | Turunkan status ke step sebelumnya |
| GET, POST | `/api/deliverables/[id]/approvals` | Approval per deliverable |
| GET, POST | `/api/deliverables/[id]/assets` | Asset per deliverable |
| GET, POST | `/api/deliverables/[id]/issues` | Issue per deliverable |
| POST | `/api/deliverables/[id]/handover` | Proses handover deliverable |

### Assets & Issues

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET, PATCH, DELETE | `/api/assets/[id]` | Detail / edit / hapus asset |
| GET, PATCH, DELETE | `/api/issues/[id]` | Detail / edit / hapus issue |

---

## Struktur Folder `app/`

```
app/
├── page.tsx                          → /
├── dashboard/page.tsx                → /dashboard
├── library/
│   ├── page.tsx                      → /library
│   ├── new/page.tsx                  → /library/new
│   └── [id]/
│       ├── page.tsx                  → /library/:id
│       ├── edit/page.tsx             → /library/:id/edit
│       └── execute/page.tsx          → /library/:id/execute
├── calendar/page.tsx                 → /calendar
├── templates/page.tsx                → /templates
├── docs/page.tsx                     → /docs
├── enquiries/page.tsx                → /enquiries
├── inquiries/page.tsx                → /inquiries
├── deals/page.tsx                    → /deals
├── projects/
│   ├── page.tsx                      → /projects
│   └── [id]/page.tsx                 → /projects/:id
├── approval/page.tsx                 → /approval
├── development/page.tsx              → /development
├── qc/page.tsx                       → /qc
├── handover/page.tsx                 → /handover
├── deliverables/
│   ├── page.tsx                      → /deliverables
│   └── [id]/page.tsx                 → /deliverables/:id
└── api/
    ├── posts/...
    ├── templates/...
    ├── docs/...
    ├── clients/...
    ├── enquiries/...
    ├── deals/...
    ├── projects/...
    ├── approvals/...
    ├── deliverables/...
    ├── assets/...
    └── issues/...
```
