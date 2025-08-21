-- 1. Sessions table
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  track text check (track in ('behavioral','technical')),
  num_questions int default 3,
  status text default 'in_progress',
  created_at timestamptz default now(),
  finished_at timestamptz
);

-- 2. QA table (each question + answer belongs to a session)
create table if not exists qa_pairs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  turn_index int not null,
  question text not null,
  answer text,
  created_at timestamptz default now()
);

-- 3. Evaluations table (judge feedback belongs to a QA pair)
create table if not exists evals (
  id uuid primary key default gen_random_uuid(),
  qa_id uuid references qa_pairs(id) on delete cascade,
  ai_interviewer_score int check (ai_interviewer_score between 1 and 5),
  ai_interviewer_feedback text,
  created_at timestamptz default now()
);

create extension if not exists "pgcrypto";