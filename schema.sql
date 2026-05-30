-- JHIC / Makerlab Document System — Supabase Schema
-- Run this in your Supabase SQL Editor

-- ─── Enable UUID extension ───
create extension if not exists "uuid-ossp";

-- ─── Profiles (extends auth.users) ───
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  department text,
  role text default 'staff',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ─── Documents ───
create table if not exists documents (
  id uuid default uuid_generate_v4() primary key,
  control_number text unique not null,
  doc_type text not null,        -- PPL, PRD, PSM, etc.
  doc_prefix text not null,      -- TR, TA, AS
  title text,
  status text default 'draft',   -- draft, submitted, approved, archived
  form_data jsonb default '{}',
  photos jsonb default '[]',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table documents enable row level security;
create policy "Authenticated users can read documents" on documents for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert documents" on documents for insert with check (auth.role() = 'authenticated');
create policy "Users can update own documents" on documents for update using (auth.uid() = created_by);
create policy "Users can delete own draft documents" on documents for delete using (auth.uid() = created_by and status = 'draft');

-- ─── Sequence counters (for control numbers) ───
create table if not exists doc_sequences (
  key text primary key,  -- e.g. "TR_PPL"
  seq integer default 0
);
alter table doc_sequences enable row level security;
create policy "Authenticated can read sequences" on doc_sequences for select using (auth.role() = 'authenticated');
create policy "Authenticated can upsert sequences" on doc_sequences for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update sequences" on doc_sequences for update using (auth.role() = 'authenticated');

-- ─── Auto-update updated_at ───
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger trg_documents_updated_at
  before update on documents
  for each row execute procedure update_updated_at();

-- ─── Auto-create profile on signup ───
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Seed sequences ───
insert into doc_sequences (key, seq) values
  ('TR_PPL', 0), ('TR_PRD', 0), ('TR_PSM', 0),
  ('TR_PRV', 0), ('TR_PTT', 0), ('TR_PRP', 0), ('TR_TRP', 0),
  ('TA_TAN', 0), ('TA_IDM', 0),
  ('AS_CRR', 0), ('AS_RPR', 0), ('AS_RFD', 0)
on conflict (key) do nothing;

-- ─── Increment sequence RPC ───
create or replace function increment_sequence(seq_key text)
returns integer language plpgsql security definer as $$
declare
  new_seq integer;
begin
  insert into doc_sequences (key, seq) values (seq_key, 1)
  on conflict (key) do update set seq = doc_sequences.seq + 1
  returning seq into new_seq;
  return new_seq;
end;
$$;
