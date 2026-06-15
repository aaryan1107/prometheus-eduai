-- Prometheus EduAI production database schema.
-- Recommended target: Supabase/Postgres.

create extension if not exists pgcrypto;

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  full_name text not null,
  email text unique,
  role text not null check (role in ('student', 'teacher', 'admin', 'hod')),
  created_at timestamptz not null default now()
);

create table if not exists roster_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  academic_session text not null,
  session_end_date date not null,
  source_file text,
  imported_by uuid references users(id),
  imported_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  roster_session_id uuid references roster_sessions(id) on delete set null,
  full_name text not null,
  grade text not null,
  class_section text,
  roll_no text,
  email text,
  phone text,
  guardian text,
  created_at timestamptz not null default now()
);

create table if not exists library_sources (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  title text not null,
  type text not null,
  grade text,
  subject text,
  chapter text,
  student_id uuid references students(id) on delete set null,
  file_name text,
  file_url text,
  content_text text,
  comment text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references library_sources(id) on delete cascade,
  chunk_index integer not null,
  chunk_text text not null,
  embedding vector,
  created_at timestamptz not null default now()
);

create table if not exists evaluation_packages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  assessment_name text not null,
  grade text not null,
  class_section text,
  subject text not null,
  assigned_teacher_id uuid references users(id) on delete set null,
  original_marks text,
  grading_status text not null default 'Not Started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evaluation_assets (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references evaluation_packages(id) on delete cascade,
  asset_type text not null check (asset_type in ('question_paper', 'marking_scheme', 'student_answer_script')),
  source_id uuid references library_sources(id) on delete set null,
  file_name text,
  file_url text,
  extracted_text text,
  selection_source text not null default 'upload',
  created_at timestamptz not null default now()
);

create table if not exists vault_records (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references evaluation_packages(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  file_name text,
  extracted_text_preview text,
  extraction_method text,
  script_type text,
  locked_by uuid references users(id) on delete set null,
  locked_at timestamptz not null default now()
);

create table if not exists ai_evaluations (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references evaluation_packages(id) on delete cascade,
  vault_record_id uuid references vault_records(id) on delete set null,
  model_name text,
  confidence numeric,
  report jsonb not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists evaluation_audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  package_id uuid references evaluation_packages(id) on delete set null,
  student_id uuid references students(id) on delete set null,
  action text not null,
  detail text,
  actor_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_students_grade_section on students(grade, class_section);
create index if not exists idx_library_sources_type_context on library_sources(type, grade, subject);
create index if not exists idx_evaluation_packages_student on evaluation_packages(student_id);
create index if not exists idx_audit_logs_student on evaluation_audit_logs(student_id, created_at desc);
create index if not exists idx_ai_evaluations_package on ai_evaluations(package_id, created_at desc);
