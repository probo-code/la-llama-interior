-- Ejecutar esto en SQL Editor de Supabase
-- 1. Habilitar extensiones
create extension if not exists "pgcrypto";

-- 2. Tabla de perfiles (se crea automaticamente al registrarse)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamptz default now()
);

-- 3. Tabla de marcadores
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  verse_id text not null,
  created_at timestamptz default now(),
  unique(user_id, verse_id)
);

-- 4. Tabla de notas
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  verse_id text not null,
  content text not null,
  updated_at timestamptz default now(),
  unique(user_id, verse_id)
);

-- 5. Tabla de versiculos leidos
create table if not exists reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  verse_id text not null,
  read_at timestamptz default now(),
  unique(user_id, verse_id)
);

-- 6. Tabla de dias de lectura
create table if not exists reading_days (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  day_number int not null,
  updated_at timestamptz default now(),
  unique(user_id, day_number)
);

-- 7. RLS: habilitar row-level security en todas las tablas
alter table profiles enable row level security;
alter table bookmarks enable row level security;
alter table notes enable row level security;
alter table reading_progress enable row level security;
alter table reading_days enable row level security;

-- 8. RLS Policies: cada usuario solo ve/modifica sus propios datos
create policy "users can read own profile"
  on profiles for select using (auth.uid() = id);
create policy "users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "users can read own bookmarks"
  on bookmarks for select using (auth.uid() = user_id);
create policy "users can insert own bookmarks"
  on bookmarks for insert with check (auth.uid() = user_id);
create policy "users can delete own bookmarks"
  on bookmarks for delete using (auth.uid() = user_id);

create policy "users can read own notes"
  on notes for select using (auth.uid() = user_id);
create policy "users can insert own notes"
  on notes for insert with check (auth.uid() = user_id);
create policy "users can update own notes"
  on notes for update using (auth.uid() = user_id);

create policy "users can read own reading_progress"
  on reading_progress for select using (auth.uid() = user_id);
create policy "users can insert own reading_progress"
  on reading_progress for insert with check (auth.uid() = user_id);

create policy "users can read own reading_days"
  on reading_days for select using (auth.uid() = user_id);
create policy "users can insert own reading_days"
  on reading_days for insert with check (auth.uid() = user_id);
create policy "users can update own reading_days"
  on reading_days for update using (auth.uid() = user_id);

-- 9. Trigger: crear profile automaticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
