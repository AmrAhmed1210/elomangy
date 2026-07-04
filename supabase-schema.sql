-- 3loomangy: run this once in Supabase SQL Editor
-- Creates all tables + RLS policies

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists vector; -- pgvector, for the AI assistant later


-- tracks (was "Departments")
create table tracks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  slug text unique not null,
  "order" int default 0,
  is_flat boolean default false,
  created_at timestamptz default now()
);

-- semesters
create table semesters (
  id uuid primary key default gen_random_uuid(),
  track_id uuid references tracks(id) on delete cascade,
  label text not null, -- "Semester 03"
  year int default 1, -- 1, 2, 3, 4
  "order" int default 0
);
create index idx_semesters_track on semesters(track_id, "order");
create index idx_semesters_year on semesters(year, "order");
create index idx_semesters_track_year on semesters(track_id, year, "order");

-- courses
create table courses (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid references semesters(id) on delete cascade,
  code text not null,      -- "Chem 241"
  name text not null,      -- "Organic Chemistry"
  instructor text default '',
  "order" int default 0
);
create index idx_courses_semester on courses(semester_id, "order");

-- resource_links — polymorphic, reused by courses / special_sections / diplomas
create type parent_kind as enum ('course', 'section', 'diploma');
create type link_type as enum ('drive_folder', 'drive_file', 'pdf', 'external_link', 'video');

create table resource_links (
  id uuid primary key default gen_random_uuid(),
  parent_type parent_kind not null,
  parent_id uuid not null,   -- points into courses / special_sections / diplomas
  label text not null,
  type link_type not null,
  url text not null,
  "order" int default 0
);
create index idx_links_parent on resource_links(parent_type, parent_id, "order");

-- special_sections (equivalency exams, other links — flat pages)
create table special_sections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,   -- English slug, e.g. "equivalency-exams"
  name_en text not null,
  name_ar text,
  "order" int default 0
);

-- diplomas
create table diplomas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  slug text unique not null,
  description text,
  eligibility text,
  "order" int default 0
);

-- training sessions
create table training_sessions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text,
  mode text not null, -- 'videos' or 'categories'
  "order" int default 0
);

-- training categories
create table training_categories (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references training_sessions(id) on delete cascade,
  name text not null,
  description text,
  "order" int default 0
);
create index idx_training_categories_session on training_categories(session_id, "order");

-- training videos
create table training_videos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references training_sessions(id) on delete cascade,
  category_id uuid references training_categories(id) on delete set null,
  title text not null,
  description text,
  youtube_url text,
  duration text, -- "12:30"
  "order" int default 0
);
create index idx_training_videos_session on training_videos(session_id, category_id, "order");

-- team work hub
create table team_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_url text,
  link text,
  date timestamptz,
  "order" int default 0
);

create table team_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date timestamptz,
  is_past boolean default false,
  location text,
  register_link text
);
create index idx_events_past_date on team_events(is_past, date desc);

create table team_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  contact_link text,
  "order" int default 0
);

-- trainings (separate from training_sessions - for future use)
create table trainings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date timestamptz,
  register_link text,
  is_past boolean default false
);

-- join requests (Join Us form submissions)
create table join_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  faculty_level text,
  message text,
  status text default 'new', -- 'new' | 'reviewed'
  created_at timestamptz default now()
);

-- admins whitelist
create table admins (
  email text primary key,
  role text default 'admin',
  added_at timestamptz default now()
);

-- siteConfig — single-row table
create table site_config (
  id int primary key default 1,
  whatsapp_number text,
  facebook_url text,
  youtube_url text,
  linkedin_url text,
  whatsapp_channel_url text,
  about_fscu_content text,
  constraint single_row check (id = 1)
);
insert into site_config (id) values (1);


-- Turn on RLS everywhere
alter table tracks enable row level security;
alter table semesters enable row level security;
alter table courses enable row level security;
alter table resource_links enable row level security;
alter table special_sections enable row level security;
alter table diplomas enable row level security;
alter table training_sessions enable row level security;
alter table training_categories enable row level security;
alter table training_videos enable row level security;
alter table team_projects enable row level security;
alter table team_events enable row level security;
alter table team_services enable row level security;
alter table trainings enable row level security;
alter table join_requests enable row level security;
alter table admins enable row level security;
alter table site_config enable row level security;

-- Helper: is the current authenticated user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from admins where email = auth.jwt() ->> 'email'
  );
$$ language sql stable security definer;

-- Public read / admin-only write, for every content table
create policy "public read" on tracks for select using (true);
create policy "admin write" on tracks for all using (is_admin()) with check (is_admin());

create policy "public read" on semesters for select using (true);
create policy "admin write" on semesters for all using (is_admin()) with check (is_admin());

create policy "public read" on courses for select using (true);
create policy "admin write" on courses for all using (is_admin()) with check (is_admin());

create policy "public read" on resource_links for select using (true);
create policy "admin write" on resource_links for all using (is_admin()) with check (is_admin());

create policy "public read" on special_sections for select using (true);
create policy "admin write" on special_sections for all using (is_admin()) with check (is_admin());

create policy "public read" on diplomas for select using (true);
create policy "admin write" on diplomas for all using (is_admin()) with check (is_admin());

create policy "public read" on training_sessions for select using (true);
create policy "admin write" on training_sessions for all using (is_admin()) with check (is_admin());

create policy "public read" on training_categories for select using (true);
create policy "admin write" on training_categories for all using (is_admin()) with check (is_admin());

create policy "public read" on training_videos for select using (true);
create policy "admin write" on training_videos for all using (is_admin()) with check (is_admin());

create policy "public read" on team_projects for select using (true);
create policy "admin write" on team_projects for all using (is_admin()) with check (is_admin());

create policy "public read" on team_events for select using (true);
create policy "admin write" on team_events for all using (is_admin()) with check (is_admin());

create policy "public read" on team_services for select using (true);
create policy "admin write" on team_services for all using (is_admin()) with check (is_admin());

create policy "public read" on trainings for select using (true);
create policy "admin write" on trainings for all using (is_admin()) with check (is_admin());

create policy "public read" on site_config for select using (true);
create policy "admin write" on site_config for all using (is_admin()) with check (is_admin());

-- join_requests: anyone can submit, only admins can read/manage
create policy "anyone can submit" on join_requests for insert with check (true);
create policy "admin manage" on join_requests for select using (is_admin());
create policy "admin update" on join_requests for update using (is_admin());
create policy "admin delete" on join_requests for delete using (is_admin());

-- admins table: a user can check their own row; writes are console/SQL-editor only
create policy "read own admin row" on admins for select using (auth.jwt() ->> 'email' = email);
