-- Run this entire script in the Supabase SQL Editor

-- 1. Enable UUID Extension (Usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID, -- References auth.users or a separate agency table later
    user_email TEXT,
    action TEXT,
    resource TEXT,
    ip_address TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Roles and Permissions Matrix
CREATE TABLE IF NOT EXISTS public.roles_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID,
    role_name TEXT,
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customers Table (Leads)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID NOT NULL,
    name TEXT,
    phone TEXT,
    email TEXT,
    country_code TEXT,
    dial_code TEXT,
    source TEXT,
    tag TEXT,
    campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    message TEXT,
    direction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID NOT NULL,
    name TEXT,
    content TEXT,
    category TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID NOT NULL,
    name TEXT,
    type TEXT,
    status TEXT DEFAULT 'Active',
    budget_used NUMERIC DEFAULT 0,
    messages_limit INTEGER DEFAULT 0,
    sent INTEGER DEFAULT 0,
    delivered INTEGER DEFAULT 0,
    opened INTEGER DEFAULT 0,
    replied INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    data_added INTEGER DEFAULT 0,
    assigned_agent TEXT,
    open_time TEXT,
    language TEXT,
    approval_status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Subscriptions Table (Billing)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    agency_id UUID PRIMARY KEY,
    plan TEXT DEFAULT 'Free',
    status TEXT DEFAULT 'active',
    next_billing_date TIMESTAMP WITH TIME ZONE
);

-- 9. Payment History Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID NOT NULL,
    amount NUMERIC,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Integration Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    agency_id UUID NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    PRIMARY KEY (agency_id, key)
);

-- 11. Profile Extensions (Extending auth.users)
-- Since Supabase handles auth.users internally, we store app-specific user data here
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    agency_id UUID, -- If they own an agency, this matches their id. If an agent, it matches their admin's id.
    role TEXT DEFAULT 'ADMIN',
    username TEXT,
    company_name TEXT,
    contact_number TEXT,
    assigned_campaigns JSONB DEFAULT '[]'::jsonb,
    assigned_countries JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Active',
    two_factor_enabled BOOLEAN DEFAULT false,
    whitelisted_ips JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: RLS (Row Level Security) Policies
-- By default, RLS is disabled on these tables so your backend can query freely.
-- If you want the frontend to query directly, you should enable RLS.
-- For this migration, we will assume the backend handles the database calls initially.

-- Enable Realtime for Messages and Customers (Optional but recommended for CRM)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.customers;
