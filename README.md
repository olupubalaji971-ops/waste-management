# 🌿 BioWaste Smart
> **Smart Medical Waste Collection, Segregation and Tracking System**  
> *Smart India Hackathon (SIH) 2026 • Problem Statement ID: SIH26115 • Organization: Autodesk*

[![Theme](https://img.shields.io/badge/Theme-Wildflowers%20Palette-519755?style=flat-square)](#-wildflowers-design-theme)
[![Stack](https://img.shields.io/badge/Tech_Stack-React_|_Node.js_|_MongoDB_|_Leaflet-3C733F?style=flat-square)](#-technology-stack)
[![Status](https://img.shields.io/badge/Status-100%25_Functional-A8DCAB?style=flat-square)](#-key-features)
[![Compliance](https://img.shields.io/badge/Compliance-BMW_Rules_2016-BE91BE?style=flat-square)](#-smart-waste-segregation-assistant)

---

## 📌 Problem Statement & Overview

Hospitals generate tons of hazardous biomedical waste every day. Major challenges include:
1. **Improper waste segregation** at the point of care leading to biohazard contamination.
2. **Delayed collections** with zero real-time visibility into collection vehicle ETAs.
3. **No centralized digital tracking** across hospitals, fleet vehicles, and regulatory boards.
4. **Lack of verifiable chain-of-custody** from clinical ward generation to final high-temperature incineration/autoclaving.

**BioWaste Smart** digitally unifies the complete biomedical waste supply chain:
$$\text{HOSPITAL} \longrightarrow \text{STATE ADMIN} \longrightarrow \text{COLLECTION FLEET} \longrightarrow \text{TREATMENT FACILITY (CBMWTF)}$$

---

## 🎨 "Wildflowers" Design Theme

The interface strictly adopts the **Wildflowers** design system:
- **`#519755` (Leaf Green)**: Primary navigation brand, active states, CTA buttons
- **`#A8DCAB` (Mint Green)**: Secondary badges, soft card backgrounds, highlights
- **`#DBAAA7` (Dusty Rose)**: Priority indicators, urgent dispatch alerts, accent borders
- **`#BE91BE` (Heather Violet)**: Pollution Control Authority tools, QR scanner accents, analytics
- **Biomedical Waste Category Colors (BMW Rules 2016)**:
  - 🟡 **Yellow**: Human/animal anatomical tissue, blood-soiled cotton/swabs, expired pharmaceuticals
  - 🔴 **Red**: Contaminated recyclable plastics, IV lines, catheters, disposable gloves
  - ⚪ **White**: Sharps, needles, scalpel blades, lancets (puncture-proof containers)
  - 🔵 **Blue**: Medicine vials, ampoules, glassware, metallic implants
  - 🟢 **General**: Non-infectious municipal dry & wet waste

---

## 🚀 Key Features

1. **🏥 Hospital Portal**:
   - Log medical waste batches with measured weights and ward locations.
   - Built-in **Smart Segregation Assistant**: Instant rule-based classification matching 60+ medical items.
   - **Dynamic QR Code Generation**: High-resolution SVG/PNG generation with printable bag tags and batch ID slips.
   - Request pickups with **Emergency, High, and Normal** priority queuing.
   - Live ETA and vehicle assignment tracking.

2. **⚡ 1-Click SIH Jury Role Switcher**:
   - Fixed top bar allowing hackathon evaluators to toggle seamlessly between **Super Admin**, **Hospital Admin (Gandhi Hospital)**, **Fleet Driver**, and **TSPCB Authority** without manual password re-entry.

3. **🚛 Driver Mobile Field Console**:
   - View assigned hospital pickups with direct phone dialer links.
   - Step-by-step state progression: `Pending → Dispatched → Arrived → Collected → Completed`.
   - Simulated QR barcode scanner for verifying loaded bags on-site.

4. **🛰️ Live GPS Fleet Tracking & GIS Map**:
   - Leaflet.js & OpenStreetMap interactive GIS map of Telangana.
   - Verified hospital markers across districts with popup details.
   - Moving collection vehicle animation with live speed, load capacity, and telemetry waypoints.

5. **🏛️ State Admin & Authority Command**:
   - Complete directory of verified Telangana hospitals (Gandhi Hospital, Osmania General Hospital, NIMS, Niloufer, MNJ Cancer, Sarojini Devi Eye, MGM Warangal, etc.).
   - CSV Hospital Import & Export.
   - District-wise waste generation leaderboard and compliance index.
   - Automated multi-role notifications.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS (Wildflowers custom palette), React Router v6, Lucide Icons, Recharts, Leaflet & React-Leaflet, qrcode.react, Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.IO, Multer, CSV-Parser, Dotenv, Cors |
| **Database** | MongoDB / Mongoose with resilient fallback in-memory persistence engine |
| **Security** | JWT (JSON Web Tokens), bcryptjs password hashing, Protected Routes |

---

## 👥 Demo Accounts (Pre-Seeded)

| Role | Name / Facility | Email | Password |
|---|---|---|---|
| **Super Admin** | State Waste Officer | `admin@biowaste.gov.in` | `password123` |
| **Hospital Admin** | Dr. M. Raja Rao (Gandhi Hospital) | `gandhi@telangana.gov.in` | `password123` |
| **Hospital Admin** | Dr. B. Nagender (Osmania Hospital) | `osmania@telangana.gov.in` | `password123` |
| **Fleet Driver** | Kiran Kumar (Vehicle: TS-09-UB-4501) | `driver.kiran@biowaste.gov.in` | `driver123` |
| **Authority** | Dr. S.V. Krishna Murthy (TSPCB) | `authority@tspcb.gov.in` | `password123` |

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Quick Monorepo Start
```bash
# 1. Install dependencies for root, backend and frontend
npm --prefix backend install
npm --prefix frontend install

# 2. Run Backend Server (Port 5000)
npm --prefix backend start

# 3. Run Frontend Client (Port 5173) in a second terminal
npm --prefix frontend run dev
```

### 3. Open in Browser
Visit: **`http://localhost:5173`**

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` — Register hospital & admin account
- `POST /api/auth/login` — Login by email or Hospital ID
- `GET /api/auth/me` — Get current user session

### Medical Waste Batches
- `POST /api/waste` — Create waste batch & generate QR payload
- `GET /api/waste` — Filter batches by hospital, category, status
- `POST /api/waste/segregate` — Query Smart Segregation Assistant rule engine
- `GET /api/waste/qr/:qrCode` — Scan & retrieve batch by QR code

### Pickup Requests
- `POST /api/pickups` — Create pickup request with priority
- `GET /api/pickups` — Get pickup queue
- `POST /api/pickups/:id/assign` — Assign vehicle & driver
- `PUT /api/pickups/:id/status` — Update stage (`Dispatched` → `Arrived` → `Collected` → `Completed`)

### Fleet & GIS
- `GET /api/vehicles` — Get collection fleet telemetry & GPS waypoints
- `POST /api/vehicles/:id/location` — Ping updated vehicle coordinates

### Hospitals & Reports
- `GET /api/hospitals` — Search and filter hospitals across 33 Telangana districts
- `POST /api/hospitals/import-csv` — Bulk upload hospitals from CSV
- `GET /api/hospitals/export-csv` — Export hospital directory
- `GET /api/reports/summary` — State-wide aggregated metrics
- `GET /api/reports/district` — District waste breakdown
- `GET /api/reports/export-csv` — Download comprehensive audit CSV

---

## 🏆 Smart India Hackathon 2026 Demonstration Workflow

1. **Landing Page**: View system metrics, live counter, and test the interactive **BMW 2016 Segregation Guide**.
2. **Hospital Flow**: Click 1-Click login for **Gandhi Hospital** → Open **Add Medical Waste** → Type `"Blood soiled gauze"` → Observe auto-classification to **YELLOW STREAM** → Click **Generate Batch & QR** → Print or download the QR label.
3. **Pickup Flow**: Go to **Request Pickup** → Select generated batches → Set priority to **Emergency** → Submit request.
4. **State Admin Flow**: Switch to **Super Admin** via top bar → View **State Command Center** → Open **Pending Pickups** → Click **Dispatch Fleet** → Assign Bio-Carrier `TS-09-UB-4501`.
5. **Driver Flow**: Switch to **Fleet Driver** → View assigned pickup → Click **Start Dispatch** → Click **Mark as Arrived** → Click **Verify & Collect**.
6. **Live GPS Map**: Open **Live GPS Map** to observe the animated collection vehicle traversing Hyderabad medical centers.
7. **Authority Audit**: Switch to **TSPCB Authority** → View state compliance rate and download official CSV audit logs.

---
*Built with ❤️ for Smart India Hackathon 2026 • Autodesk Problem Statement SIH26115*
