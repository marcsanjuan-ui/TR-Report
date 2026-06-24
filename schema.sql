-- JHIC / Makerlab Document System — Supabase Schema
-- Run this in your Supabase SQL Editor

-- ─── Enable UUID extension ───
create extension if not exists "uuid-ossp";

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
  created_by text,               -- name of the report creator
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Sequence counters (for control numbers) ───
create table if not exists doc_sequences (
  key text primary key,  -- e.g. "TR_PPL"
  seq integer default 0
);

-- ─── Auto-update updated_at ───
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_documents_updated_at
  before update on documents
  for each row execute procedure update_updated_at();

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

-- ─── Migration: fix existing tables if already created ───
alter table documents drop constraint if exists documents_created_by_fkey;

-- Fix created_by column type if it was previously uuid
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'documents'
      and column_name = 'created_by'
      and data_type = 'uuid'
  ) then
    alter table documents alter column created_by type text using null;
  end if;
end $$;


do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'documents'
  loop
    execute format('drop policy if exists %I on documents', pol.policyname);
  end loop;
end $$;

do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'doc_sequences'
  loop
    execute format('drop policy if exists %I on doc_sequences', pol.policyname);
  end loop;
end $$;

alter table documents alter column created_by type text using created_by::text;
alter table documents disable row level security;
alter table doc_sequences disable row level security;
