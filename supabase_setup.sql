-- =====================================================================
-- 1. EXTENSIONS & FUNCTIONS
-- =====================================================================
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 2. PROFILES TABLE & AUTH AUTO-SYNC TRIGGER
-- =====================================================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text,
    email text,
    phone text,
    occupation text,
    avatar_url text,
    fcm_token text,
    language text default 'bn',
    currency text default '৳',
    role text default 'user' check (role in ('user', 'admin')),
    reminder_times text[] default '{}'::text[],
    createdat timestamp with time zone default timezone('utc'::text, now())
);

-- Auto-create profile on Auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, language, currency)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'user',
    'bn',
    '৳'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 3. CORE BUSINESS LOGIC TABLES
-- =====================================================================

create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    contact text,
    totalprojects int default 0,
    totalearnings numeric default 0,
    userid uuid not null references auth.users(id) on delete cascade
);

create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    clientname text not null,
    type text default 'NasheedSong',
    totalamount numeric default 0,
    paidamount numeric default 0,
    dueamount numeric default 0,
    status text default 'Pending',
    deadline timestamp with time zone,
    notes text,
    userid uuid not null references auth.users(id) on delete cascade,
    createdat timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.income_records (
    id uuid primary key default gen_random_uuid(),
    projectid uuid references public.projects(id) on delete set null,
    projectname text not null,
    clientname text not null,
    amount numeric default 0,
    date date not null,
    method text default 'Cash',
    userid uuid not null references auth.users(id) on delete cascade,
    createdat timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.expenses (
    id uuid primary key default gen_random_uuid(),
    category text not null,
    amount numeric default 0,
    date date not null,
    notes text,
    userid uuid not null references auth.users(id) on delete cascade,
    createdat timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.ghazal_notes (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    lyrics text not null,
    userid uuid not null references auth.users(id) on delete cascade,
    createdat timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.shopping_lists (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    date date not null,
    items jsonb default '[]'::jsonb,
    totalamount numeric default 0,
    notes text,
    userid uuid not null references auth.users(id) on delete cascade,
    createdat timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.due_persons (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text,
    address text,
    date date not null,
    avatar text,
    transactions jsonb default '[]'::jsonb,
    userid uuid not null references auth.users(id) on delete cascade,
    createdat timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.wallets (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    balance numeric default 0,
    isDefault boolean default false,
    lastTransactionDate timestamp with time zone,
    userid uuid not null references auth.users(id) on delete cascade,
    createdAt timestamp with time zone default timezone('utc'::text, now())
);

-- =====================================================================
-- 4. CAR RENT MANAGEMENT (গাড়ির খতিয়ান)
-- =====================================================================

create table if not exists public.car_rent_friends (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text,
    userid uuid not null references auth.users(id) on delete cascade,
    createdAt timestamp with time zone default timezone('utc'::text, now()),
    updatedAt timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.car_rent_trips (
    id uuid primary key default gen_random_uuid(),
    date date not null,
    examName text not null,
    totalRent numeric default 0,
    participantIds text[] default '{}'::text[],
    userid uuid not null references auth.users(id) on delete cascade,
    createdAt timestamp with time zone default timezone('utc'::text, now()),
    updatedAt timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.car_rent_collections (
    id uuid primary key default gen_random_uuid(),
    date date not null,
    friendId uuid not null references public.car_rent_friends(id) on delete cascade,
    amount numeric default 0,
    tripId uuid references public.car_rent_trips(id) on delete set null,
    paymentMethod text default 'cash',
    userid uuid not null references auth.users(id) on delete cascade,
    createdAt timestamp with time zone default timezone('utc'::text, now()),
    updatedAt timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.car_rent_driver_payments (
    id uuid primary key default gen_random_uuid(),
    date date not null,
    amount numeric default 0,
    remarks text,
    userid uuid not null references auth.users(id) on delete cascade,
    createdAt timestamp with time zone default timezone('utc'::text, now()),
    updatedAt timestamp with time zone default timezone('utc'::text, now())
);

-- =====================================================================
-- 5. ADMINISTRATIVE TABLES
-- =====================================================================

create table if not exists public.app_updates (
    id bigint primary key generated always as identity,
    version_code int not null unique,
    version_name text not null,
    download_url text not null,
    is_force_update boolean default false,
    update_message text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.app_settings (
    id bigint primary key generated always as identity,
    firebase_service_account jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert dummy initial version if not exists
insert into public.app_updates (version_code, version_name, download_url, is_force_update, update_message)
values (10, '2.0.0', '#', false, 'প্রথম সংস্করণ রিলিজ')
on conflict (version_code) do nothing;

-- =====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.income_records enable row level security;
alter table public.expenses enable row level security;
alter table public.ghazal_notes enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.due_persons enable row level security;
alter table public.wallets enable row level security;
alter table public.car_rent_friends enable row level security;
alter table public.car_rent_trips enable row level security;
alter table public.car_rent_collections enable row level security;
alter table public.car_rent_driver_payments enable row level security;
alter table public.app_updates enable row level security;
alter table public.app_settings enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can manage all profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Helper function to define policy logic succinctly for standard tables
-- Standard user policy template (applied per table)

-- Clients
create policy "Clients user access" on public.clients for all using (auth.uid() = userid);
-- Projects
create policy "Projects user access" on public.projects for all using (auth.uid() = userid);
-- Income Records
create policy "Income Records user access" on public.income_records for all using (auth.uid() = userid);
-- Expenses
create policy "Expenses user access" on public.expenses for all using (auth.uid() = userid);
-- Ghazal Notes
create policy "Ghazal Notes user access" on public.ghazal_notes for all using (auth.uid() = userid);
-- Shopping Lists
create policy "Shopping Lists user access" on public.shopping_lists for all using (auth.uid() = userid);
-- Due Persons
create policy "Due Persons user access" on public.due_persons for all using (auth.uid() = userid);
-- Wallets
create policy "Wallets user access" on public.wallets for all using (auth.uid() = userid);

-- Car Rent Friends
create policy "Car Rent Friends user access" on public.car_rent_friends for all using (auth.uid() = userid);
-- Car Rent Trips
create policy "Car Rent Trips user access" on public.car_rent_trips for all using (auth.uid() = userid);
-- Car Rent Collections
create policy "Car Rent Collections user access" on public.car_rent_collections for all using (auth.uid() = userid);
-- Car Rent Driver Payments
create policy "Car Rent Driver Payments user access" on public.car_rent_driver_payments for all using (auth.uid() = userid);

-- App Updates (Anyone can read, Admins can manage)
create policy "App Updates read access" on public.app_updates for select using (true);
create policy "App Updates admin write access" on public.app_updates for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- App Settings (Admins can manage)
create policy "App Settings admin access" on public.app_settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
