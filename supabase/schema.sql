-- ════════════════════════════════════════════════════════════════
--  FESTIFY — estrutura do banco no Supabase
--  Como usar: Supabase → SQL Editor → New query → cole TUDO → Run.
--  Pode rodar de novo sem problema (o script é idempotente).
-- ════════════════════════════════════════════════════════════════


-- ── Tabelas ─────────────────────────────────────────────────────

-- Ajustes do buffet (uma única linha, id = 1)
create table if not exists public.settings (
  id          int primary key default 1 check (id = 1),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
insert into public.settings (id, data)
values (1, '{"buffetName":"Meu Buffet","tagline":"Escolha o tema da sua festa e receba o convite online","whatsapp":""}')
on conflict (id) do nothing;

-- Biblioteca de temas
create table if not exists public.themes (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  data        jsonb not null,             -- nome, gênero, tags, fotos, estilo...
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Convites (festas)
create table if not exists public.parties (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  client_token  uuid not null unique default gen_random_uuid(),  -- link privado da lista do cliente
  data          jsonb not null,           -- título, data, local, pix, capa, tema...
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Confirmações de presença
create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  party_id    uuid not null references public.parties(id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 80),
  adults      int  not null default 0 check (adults between 0 and 50),
  children    int  not null default 0 check (children between 0 and 50),
  message     text check (message is null or char_length(message) <= 280),
  created_at  timestamptz not null default now()
);
create index if not exists rsvps_party_idx on public.rsvps (party_id, created_at desc);

-- Administradores (só quem estiver aqui pode editar)
create table if not exists public.admins (
  user_id     uuid primary key,
  created_at  timestamptz not null default now()
);

-- ── Funções ─────────────────────────────────────────────────────

-- É administrador?
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Convite público (sem expor o token da lista do cliente)
create or replace function public.public_party(p_slug text)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object('id', p.id, 'slug', p.slug, 'data', p.data, 'created_at', p.created_at)
  from public.parties p
  where p.slug = p_slug;
$$;

-- Lista privada do cliente: festa + confirmações, acessada pelo token secreto
create or replace function public.client_list(p_token uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'party', jsonb_build_object('id', p.id, 'slug', p.slug, 'data', p.data, 'created_at', p.created_at),
    'rsvps', coalesce(
      (select jsonb_agg(to_jsonb(r) order by r.created_at desc) from public.rsvps r where r.party_id = p.id),
      '[]'::jsonb
    )
  )
  from public.parties p
  where p.client_token = p_token;
$$;

revoke all on function public.public_party(text) from public;
revoke all on function public.client_list(uuid) from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.public_party(text) to anon, authenticated;
grant execute on function public.client_list(uuid) to anon, authenticated;

-- ── Permissões (Row Level Security) ─────────────────────────────

alter table public.settings enable row level security;
alter table public.themes   enable row level security;
alter table public.parties  enable row level security;
alter table public.rsvps    enable row level security;
alter table public.admins   enable row level security;

-- settings: todos leem, só admin altera
drop policy if exists settings_read  on public.settings;
drop policy if exists settings_write on public.settings;
create policy settings_read  on public.settings for select using (true);
create policy settings_write on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- themes: todos leem, só admin altera
drop policy if exists themes_read  on public.themes;
drop policy if exists themes_write on public.themes;
create policy themes_read  on public.themes for select using (true);
create policy themes_write on public.themes for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- parties: só admin (o público usa a função public_party)
drop policy if exists parties_admin on public.parties;
create policy parties_admin on public.parties for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- rsvps: qualquer convidado pode confirmar; só admin lê e apaga
drop policy if exists rsvps_insert on public.rsvps;
drop policy if exists rsvps_admin  on public.rsvps;
create policy rsvps_insert on public.rsvps for insert to anon, authenticated with check (true);
create policy rsvps_admin  on public.rsvps for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admins: cada admin enxerga só a própria linha
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());

grant select on public.settings, public.themes to anon, authenticated;
grant insert on public.rsvps to anon, authenticated;
grant all on public.settings, public.themes, public.parties, public.rsvps to authenticated;
grant select on public.admins to authenticated;

-- ── Fotos (Storage) ─────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('festify', 'festify', true)
on conflict (id) do update set public = true;

drop policy if exists festify_read   on storage.objects;
drop policy if exists festify_insert on storage.objects;
drop policy if exists festify_update on storage.objects;
drop policy if exists festify_delete on storage.objects;
create policy festify_read   on storage.objects for select using (bucket_id = 'festify');
create policy festify_insert on storage.objects for insert to authenticated with check (bucket_id = 'festify' and public.is_admin());
create policy festify_update on storage.objects for update to authenticated using (bucket_id = 'festify' and public.is_admin());
create policy festify_delete on storage.objects for delete to authenticated using (bucket_id = 'festify' and public.is_admin());

-- ── Tempo real (lista de presença atualiza sozinha) ─────────────

do $$
declare t text;
begin
  foreach t in array array['rsvps', 'parties', 'themes', 'settings'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
              when undefined_object then null;
    end;
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════
--  ÚLTIMO PASSO (rode separado, depois de criar seu usuário em
--  Authentication → Users → Add user). Troque pelo SEU e-mail:
--
--  insert into public.admins (user_id)
--  select id from auth.users where email = 'seu-email@exemplo.com'
--  on conflict do nothing;
-- ════════════════════════════════════════════════════════════════
