# VAMKOR WhatsApp CRM: Codebase Analysis, Security Audit & Roadmap

## 1. Executive Summary

This report provides a senior-level architectural and security analysis of the **VAMKOR WhatsApp CRM** repository. 

VAMKOR WhatsApp CRM is structured as a full-stack, multi-tenant (agency-based) Customer Relationship Management (CRM) tool for managing outbound and inbound WhatsApp communications. It is designed to support both the official **Meta Cloud API** and personal/business automation via **WhatsApp Web (OpenWA)**.

However, in its current state, the project is **incomplete and contains critical, crash-inducing bugs** alongside several stubbed/mocked features that prevent production readiness.

---

## 2. Core Architecture & Tech Stack

The workspace is divided into two primary sub-projects:

### Backend (`/backend`)
*   **Engine**: Node.js & Express.
*   **Security/Middleware**: `helmet` (header protection), `cors`, `morgan` (logging), `express-rate-limit` (1000 reqs/15m limit).
*   **Database/Storage**: Integrated with **Supabase (PostgreSQL)** via `@supabase/supabase-js`.
*   **Orphaned/Dead Code**: There is a fully written SQLite configuration (`database.js` / `database.sqlite`) which defines an identical database structure but is **completely unused** by the main Express `server.js` engine.

### Frontend (`/frontend`)
*   **Framework**: React (Bootstrapped via Create React App).
*   **UI/UX**: Material UI (MUI v9), Emotion, Lucide icons, custom responsive dashboards, and Recharts for metrics.
*   **State & Auth**: React Context (`AuthContext.js`) wrapping the Supabase authentication client.

---

## 3. Core Feature Assessment

Below is a breakdown of what features are technically implemented versus what is currently stubbed, mocked, or missing.

| Feature Area | Frontend Status | Backend Status | Assessment |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | UI components ready (Supabase Auth Context, login, signup, role guards). | Partial (JWT Verification middleware `checkJwt` matches token with Supabase). | **Incomplete**. Backend missing custom role creation or agent registration. |
| **Contacts Database** | Implemented (CSV Import, Export, CRUD dialog, Tag filters). | Implemented (Supabase queries filtered by `agency_id`). | **Working** (requires fixing dialog button actions). |
| **1-to-1 Live Chat** | Implemented (MUI chat panel, file attachments upload to Supabase Storage). | Partial (Outbound messages routed via Meta/OpenWA). | **Faulty**. Missing real-time subscriptions; outbound message crashes. |
| **Campaigns Matrix** | Mocked/View-Only (Metric cards aggregate static DB values). | Partial (Simple CRUD on campaigns table). | **Stubbed**. No sending engine, scheduler, or queue to broadcast campaigns. |
| **Templates Directory** | Implemented (List template UI, Create template form). | Missing (No routes for `/api/templates`). | **Broken**. Backend template routes do not exist. |
| **Billing & Wallet** | Implemented (Wallet summary, Stripe/Razorpay mock buttons, Invoice history). | Implemented (Billing detail retrieval, mock wallet top-up, payment history logging). | **Functional** (mock payment integration). |
| **Integration Settings** | Implemented (Meta Creds Form, OpenWA QR Code generator panel). | Implemented (Saves settings to Supabase settings table, proxies OpenWA session). | **Broken**. Hardcoded URLs on client bypass environment configurations. |
| **Security Dashboard** | Mocked/View-Only (2FA dialog, IP Whitelisting text field). | Missing (No endpoints for 2FA setup, TOTP verification, or IP whitelisting checks). | **Stubbed**. Frontend forms point to non-existent backend APIs. |

---

## 4. Critical Fault Lines (Bugs & Structural Flaws)

### 🔴 Fault 1: Undefined `customer` Reference in Message Sender (Crash Bug)
In `backend/server.js`, inside the `POST /api/messages` route, the backend tries to send outbound WhatsApp messages via OpenWA or Meta API. However, it references `customer.phone` without fetching `customer` first. This causes a **500 Server Error / crash** whenever an outbound message is attempted.

```javascript
// backend/server.js L200
app.post('/api/messages', checkJwt, async (req, res) => {
  const { customerId, message, direction, mediaUrl, mediaType } = req.body;
  
  if (direction === 'OUTBOUND') {
    // ... retrieved settings ...
    
    if (config.whatsappConnectionType === 'openwa') {
      // CRASH: "customer" is not defined anywhere in the scope!
      const payload = {
        chatId: customer.phone.includes('@') ? customer.phone : `${customer.phone.replace(/[^0-9]/g, '')}@c.us`,
        text: mediaUrl ? `${message}\n\nMedia Link: ${mediaUrl}` : message
      };
      // ...
    } else {
      // CRASH: "customer" is not defined here either!
      let payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: customer.phone,
        type: mediaUrl ? mediaType : 'text',
      };
      // ...
```

### 🔴 Fault 2: Hardcoded Localhost URLs in Settings
In `frontend/src/pages/Integration.js`, all `axios` requests to settings, OpenWA session managers, and QR code generation are hardcoded to `http://localhost:5001`. Even though `API_URL` is defined at the top of the file using environment variables, it is completely ignored:

```javascript
// frontend/src/pages/Integration.js L39
const res = await axios.get('http://localhost:5001/api/integration', { ... }); // Bypasses API_URL env var
```

### 🟡 Fault 3: Missing Real-Time Synchronization in Live Chat
The live chat interface (`frontend/src/pages/Chat.js`) only fetches messages on first load or when a customer is manually clicked. There is no web socket connection, HTTP polling, or Supabase realtime subscription active on the frontend. If an inbound webhook inserts a new message into the database, **the agent will not see it without manually reloading the chat**.

### 🟡 Fault 4: Absent Profile Creation Trigger (Supabase Onboarding)
When users register via `Signup.js`, they are registered inside Supabase's internal auth engine (`auth.users`). However, no database trigger or API call creates corresponding records in `public.profiles` or `public.subscriptions`. Consequently:
1.  Admin profiles do not exist in the database after signup.
2.  The backend `checkJwt` relies on a fallback warning: `Could not load profile, using user.id as agency_id`.
3.  The frontend billing dashboard fails to load correct subscription data.

---

## 5. Security Audit

### 🚨 Risk 1: Missing Row-Level Security (RLS) Policies
According to `supabase_schema.sql`, RLS is mentioned as disabled:
```sql
-- Optional: RLS (Row Level Security) Policies
-- By default, RLS is disabled on these tables so your backend can query freely.
```
> Since the frontend is initialized with the Supabase client (`supabaseClient.js`), the Supabase endpoint URL and Anon key are exposed in the browser. Without active RLS policies, a malicious user could inspect the browser, extract the Anon key, and write scripts to download, overwrite, or delete all messages, customers, and integration settings for all agencies.

### 🚨 Risk 2: Backend Use of Supabase Service Role Key
The backend client (`backend/supabase.js`) is initialized with `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses all security rules and RLS entirely. While necessary for backend management tasks, if the backend server is ever compromised or exposes logs containing client instances, attackers gain administrative database privileges.

### 🔓 Risk 3: OpenWA Proxy Credentials Weakness
The backend retrieves the OpenWA API key by checking a file or falling back to `vamkor_openwa_secret`. If the connection type is `openwa`, the session starts, and webhooks are registered with a static secret (`vamkor_openwa_webhook_secret`).
*   There is no signature validation on the OpenWA webhook route (`/api/openwa/webhook/:agencyId`). Attackers could spoof requests to this route to forge inbound messages.

---

## 6. Actionable Development Roadmap

To transition VAMKOR WhatsApp CRM from a half-finished prototype into a production-grade, highly reliable platform, we recommend a phased engineering roadmap.

### Phase 1: Critical Hotfixes & Stability (Immediate)
1.  **Fix Outbound Messages**: Add a database query to `POST /api/messages` to fetch the customer's phone number before passing it to Meta/OpenWA.
2.  **Fix API Endpoint Bindings**: Replace the hardcoded `http://localhost:5001` URLs in `Integration.js` with `${API_URL}`.
3.  **Real-time Chat Integration**: Replace manual fetches in `Chat.js` with a Supabase Realtime channel listener.

### Phase 2: Missing Core API Implementations
1.  **Templates API**: Build backend endpoints for GET/POST `/api/templates` linked to the Supabase `templates` table.
2.  **RBAC & Team API**: Implement GET/POST `/api/auth/agents` in the backend. Integrate them with Supabase Admin Auth (`auth.admin.createUser`) so admins can invite managers and agents, automatically inserting permissions into the database.
3.  **Security API**: Write endpoints for `/api/auth/2fa/setup` and `/api/auth/2fa/verify` using `speakeasy` and `qrcode` (already in `package.json`).

### Phase 3: Reliability & Scalability Enhancements
1.  **PostgreSQL Auto-Onboarding Trigger**: Run the following trigger in the Supabase SQL editor to automate profile and free-tier subscription generation on user signups:
    ```sql
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (id, agency_id, role, username, company_name, contact_number)
      VALUES (
        new.id,
        new.id,
        'ADMIN',
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'company_name',
        new.raw_user_meta_data->>'contact_number'
      );
      
      INSERT INTO public.subscriptions (agency_id, plan, status, wallet_balance)
      VALUES (new.id, 'Free', 'active', 0.00);
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    ```
2.  **Broadcast Queue Engine**: Avoid sending thousands of campaign messages synchronously in Express. Set up a worker queue (e.g., BullMQ with Redis) to batch process outbound broadcasts, throttle them according to WhatsApp rate limits, and record logs for sent, delivered, and opened hooks.
3.  **Database Cleanup**: Remove `database.js` and `database.sqlite` from the repository to clean up dead code and avoid developer confusion.

---

## 7. Next Steps

Which of the following priorities would you like us to address first?
1.  **Apply Hotfixes**: Fix the `customer` undefined crash in `server.js` and localhost URLs in `Integration.js`.
2.  **Add Missing API Endpoints**: Implement the missing Templates, Team Agents, and 2FA backend APIs.
3.  **Implement Real-Time Chat**: Update the frontend Chat component to subscribe to live DB changes.
4.  **Database Automation**: Set up the Supabase PostgreSQL triggers and enable RLS policies.
