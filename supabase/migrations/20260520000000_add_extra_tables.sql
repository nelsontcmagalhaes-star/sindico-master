-- Funcionários
create table if not exists public.funcionarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  cargo text,
  telefone text,
  cpf text,
  data_admissao date,
  salario numeric(12,2),
  horas_extras numeric(10,2),
  endereco text,
  bairro text,
  cidade text,
  estado varchar(2),
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.funcionarios enable row level security;
create policy "Users manage their funcionarios" on public.funcionarios
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Moradores / Unidades
create table if not exists public.moradores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unidade text not null,
  responsavel text,
  telefone text,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.moradores enable row level security;
create policy "Users manage their moradores" on public.moradores
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reservas de áreas comuns
create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null,
  data date not null,
  morador_id uuid references public.moradores(id) on delete set null,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.reservas enable row level security;
create policy "Users manage their reservas" on public.reservas
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Assembleias
create table if not exists public.assembleias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  data date not null,
  horario time,
  local text,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.assembleias enable row level security;
create policy "Users manage their assembleias" on public.assembleias
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
