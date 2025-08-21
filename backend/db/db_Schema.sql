-- 1. Sessions table
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  track text check (track in ('behavioral','technical')),
  created_at timestamptz default now()
);

-- 2. QA table (each question + answer belongs to a session)
create table if not exists qa (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  question text not null,
  answer text,
  created_at timestamptz default now()
);

-- 3. Evaluations table (judge feedback belongs to a QA pair)
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  qa_id uuid references qa(id) on delete cascade,
  score int check (score between 1 and 5),
  feedback text,
  created_at timestamptz default now()
);