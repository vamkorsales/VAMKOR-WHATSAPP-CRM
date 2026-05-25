# VAMKOR WhatsApp CRM

A unified full-stack monorepo CRM application for managing WhatsApp communications, built using React, Node.js, and Supabase.

## Repository Restructure (Monorepo)

The project is organized as a unified monorepo using **NPM Workspaces**:

```text
VAMKOR-WHATSAPP-CRM/
├── apps/
│   ├── frontend/          # React client application (MUI)
│   ├── backend/           # Node.js Express server
│   └── whatsapp-gateway/  # WhatsApp Web integration gateway (wa-automate)
├── package.json           # Monorepo workspaces coordinator
├── supabase_schema.sql    # Core database schema
├── supabase_triggers.sql  # Onboarding automation triggers
└── README.md
```

---

## Prerequisites

Before starting, make sure you configure your environment variables:

1. **Backend Configuration (`apps/backend/.env`)**:
   Create `apps/backend/.env` using `apps/backend/.env.example` as a template and configure:
   * `SUPABASE_URL`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `JWT_SECRET`
   * `META_VERIFY_TOKEN` (for Official Meta API webhooks)

2. **Frontend Configuration (`apps/frontend/.env`)**:
   Create `apps/frontend/.env` using `apps/frontend/.env.example` as a template:
   * `REACT_APP_API_URL=http://localhost:5001`

3. **Gateway Configuration (`apps/whatsapp-gateway/.env`)**:
   Create `apps/whatsapp-gateway/.env` using `apps/whatsapp-gateway/.env.example`:
   * `PORT=2785`
   * `OPENWA_API_KEY=vamkor_openwa_secret`
   * `MOCK_MODE=true` (Runs sandbox mode to test flow without a real WhatsApp number)

---

## Setup & Running

### 1. Installation
Install all dependencies for all applications (frontend, backend, and gateway) simultaneously from the root directory:
```bash
npm install
```

### 2. Running in Development
Run all services (Frontend, Backend, and Gateway) concurrently with a single command from the root directory:
```bash
npm run dev
```

This starts:
* **Frontend**: `http://localhost:3000`
* **Backend API Server**: `http://localhost:5001`
* **WhatsApp Web Gateway**: `http://localhost:2785`

---

## Supabase Database Initialization

1. Execute [supabase_schema.sql](file:///home/swaraj/Desktop/WhatsApp%20CRM%20Prats/VAMKOR-WHATSAPP-CRM/supabase_schema.sql) in your Supabase SQL Editor to provision the tables.
2. Execute [supabase_triggers.sql](file:///home/swaraj/Desktop/WhatsApp%20CRM%20Prats/VAMKOR-WHATSAPP-CRM/supabase_triggers.sql) to configure automation functions that create profiles and subscription wallets when new users register.