# VAMKOR WhatsApp CRM

A full-stack CRM application for managing WhatsApp communications.

## Features

- Manage customers
- Send and receive messages
- Sync data between backend and frontend

## Setup

### Backend

1. Navigate to `backend` directory
2. Copy `backend/.env.example` to `backend/.env`
3. Add your Supabase values:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Create Supabase tables named `customers` and `messages`
   - `customers`: `id`, `name`, `phone`, `email`, `created_at`
   - `messages`: `id`, `customer_id`, `message`, `direction`, `created_at`
5. Run `npm install`
6. Run `npm start` to start the server on port 5000

### Frontend

1. Navigate to `frontend` directory
2. Copy `frontend/.env.example` to `frontend/.env`
3. Update `REACT_APP_API_URL` if the backend is not at `http://localhost:5000`
4. Run `npm install`
5. Run `npm start` to start the React app on port 3000

### Deployment

- Frontend: run `npm run build` in `frontend`, then deploy the `frontend/build` folder to Netlify, Vercel, or any static host.
- Backend: deploy the `backend` folder to Heroku, Render, Fly.io, or similar hosting. Use `backend/Procfile` if deploying to Heroku.
- Set production env vars on the host:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `REACT_APP_API_URL`
- For Netlify, update `frontend/netlify.toml` with your backend URL and add `REACT_APP_API_URL` in site environment settings.

## Usage

- Add customers via API or database
- Select a customer to view chat history
- Send messages which are stored in the backend

## WhatsApp Integration

Placeholder for WhatsApp webhook at `/api/whatsapp/webhook`. Integrate with WhatsApp Business API or Twilio.