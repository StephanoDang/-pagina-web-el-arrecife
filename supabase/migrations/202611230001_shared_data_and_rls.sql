-- Esquema compartido inicial de El Arrecife.
-- Las escrituras públicas quedan limitadas a solicitudes pendientes; los
-- totales de pedidos deben calcularse en un endpoint confiable antes de usarlo.

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  description text not null default '',
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dish_category_links (
  dish_id uuid not null references public.dishes(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  primary key (dish_id, category_id)
);
create unique index if not exists dish_one_primary_category
  on public.dish_category_links(dish_id) where is_primary;

create table if not exists public.dish_presentations (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  price_cents integer not null check (price_cents >= 0),
  sort_order integer not null default 0
);

create table if not exists public.restaurant_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  address text not null default '',
  active boolean not null default true
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.restaurant_locations(id) on delete restrict,
  received_at timestamptz not null default now(),
  customer_name text not null check (length(trim(customer_name)) between 1 and 160),
  phone text not null check (length(trim(phone)) between 5 and 40),
  delivery_method text not null check (delivery_method in ('delivery', 'pickup')),
  delivery_address text,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'delivered', 'cancelled')),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  check (total_cents = subtotal_cents + delivery_fee_cents),
  check ((delivery_method = 'pickup') or length(trim(coalesce(delivery_address, ''))) > 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  dish_id uuid references public.dishes(id) on delete set null,
  dish_name text not null check (length(trim(dish_name)) between 1 and 160),
  presentation_name text not null check (length(trim(presentation_name)) between 1 and 100),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents = quantity * unit_price_cents)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.restaurant_locations(id) on delete restrict,
  visit_date date not null,
  visit_time time not null,
  customer_name text not null check (length(trim(customer_name)) between 1 and 160),
  phone text not null check (length(trim(phone)) between 5 and 40),
  people integer not null check (people between 1 and 10),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists orders_received_status_idx on public.orders(received_at, status);
create index if not exists reservations_visit_status_idx on public.reservations(visit_date, status);
create index if not exists dish_category_links_category_idx on public.dish_category_links(category_id);
create index if not exists dish_presentations_dish_idx on public.dish_presentations(dish_id);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- RLS uses trusted app_metadata, never user-editable user_metadata.
create or replace function public.is_restaurant_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.menu_categories enable row level security;
alter table public.dishes enable row level security;
alter table public.dish_category_links enable row level security;
alter table public.dish_presentations enable row level security;
alter table public.restaurant_locations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reservations enable row level security;

create policy "Public reads active categories" on public.menu_categories for select to anon, authenticated using (active);
create policy "Admins manage categories" on public.menu_categories for all to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
create policy "Public reads available dishes" on public.dishes for select to anon, authenticated using (available);
create policy "Admins manage dishes" on public.dishes for all to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
create policy "Public reads menu links" on public.dish_category_links for select to anon, authenticated
  using (exists (select 1 from public.dishes d join public.menu_categories c on c.id = category_id where d.id = dish_id and d.available and c.active));
create policy "Admins manage menu links" on public.dish_category_links for all to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
create policy "Public reads available presentations" on public.dish_presentations for select to anon, authenticated
  using (exists (select 1 from public.dishes d where d.id = dish_id and d.available));
create policy "Admins manage presentations" on public.dish_presentations for all to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
create policy "Public reads active locations" on public.restaurant_locations for select to anon, authenticated using (active);
create policy "Admins manage locations" on public.restaurant_locations for all to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());

-- No SELECT policy for orders, items, or reservations: public clients cannot read customer data.
create policy "Public creates pending orders" on public.orders for insert to anon, authenticated
  with check (status = 'pending' and received_at <= now() and subtotal_cents >= 0 and delivery_fee_cents >= 0);
create policy "Admins read orders" on public.orders for select to authenticated
  using (public.is_restaurant_admin());
create policy "Admins update orders" on public.orders for update to authenticated
  using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
create policy "Public creates order items" on public.order_items for insert to anon, authenticated
  with check (quantity > 0 and line_total_cents = quantity * unit_price_cents);
create policy "Admins read and manage order items" on public.order_items for all to authenticated
  using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
create policy "Public creates pending reservations" on public.reservations for insert to anon, authenticated
  with check (status = 'pending' and visit_date >= current_date and people between 1 and 10 and created_at <= now());
create policy "Admins read reservations" on public.reservations for select to authenticated
  using (public.is_restaurant_admin());
create policy "Admins update reservations" on public.reservations for update to authenticated
  using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());

revoke all on public.menu_categories, public.dishes, public.dish_category_links,
  public.dish_presentations, public.restaurant_locations, public.orders,
  public.order_items, public.reservations from anon, authenticated;

grant select on public.menu_categories, public.dishes, public.dish_category_links,
  public.dish_presentations, public.restaurant_locations to anon, authenticated;
grant insert on public.orders, public.order_items, public.reservations to anon, authenticated;
grant select, insert, update, delete on public.menu_categories, public.dishes,
  public.dish_category_links, public.dish_presentations, public.restaurant_locations to authenticated;
grant select, update on public.orders, public.reservations to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
