create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null,
  tier_units integer not null,
  amount_usdc numeric not null,
  tx_hash text not null,
  explorer_url text not null,
  buyer_address text,
  created_at timestamptz not null default now()
);
create index if not exists purchases_provider_id_idx on public.purchases (provider_id);
create index if not exists purchases_created_at_idx on public.purchases (created_at desc);
alter table public.purchases enable row level security;
drop policy if exists "anyone can read purchases" on public.purchases;
create policy "anyone can read purchases" on public.purchases for select using (true);
