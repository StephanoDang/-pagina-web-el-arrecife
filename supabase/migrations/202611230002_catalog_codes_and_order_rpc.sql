-- Correcciones de la auditoría del 23/11/2026 sobre 202611230001.
-- 1. Códigos estables para enlazar la carta estática (ids de texto) con las filas UUID.
-- 2. Creación de pedidos solo mediante public.create_order: transacción única,
--    precios recalculados desde el catálogo e idempotencia por request_id.
-- 3. Historial de líneas inmutable, administradores limitados a cambiar estados
--    válidos y fecha mínima de reserva según la hora de Lima.

-- 1. Códigos de catálogo -------------------------------------------------------

alter table public.menu_categories add column if not exists code text;
alter table public.dishes add column if not exists code text;
alter table public.dish_presentations add column if not exists code text;

update public.menu_categories set code = id::text where code is null;
update public.dishes set code = id::text where code is null;
update public.dish_presentations set code = id::text where code is null;

alter table public.menu_categories alter column code set not null,
  add constraint menu_categories_code_format check (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(code) <= 80);
alter table public.dishes alter column code set not null,
  add constraint dishes_code_format check (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(code) <= 80);
alter table public.dish_presentations alter column code set not null,
  add constraint dish_presentations_code_format check (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(code) <= 80);

create unique index if not exists menu_categories_code_key on public.menu_categories(code);
create unique index if not exists dishes_code_key on public.dishes(code);
create unique index if not exists dish_presentations_dish_code_key on public.dish_presentations(dish_id, code);

-- 2. Pedidos: idempotencia, costo de delivery pendiente y referencia a presentación --

alter table public.orders add column if not exists request_id uuid;
create unique index if not exists orders_request_id_key on public.orders(request_id);

-- El costo de delivery aún no está confirmado: null significa «no calculado» y el
-- total corresponde solo a los productos. Se reemplaza la restricción anónima previa.
do $$
declare constraint_name text;
begin
  select c.conname into constraint_name
  from pg_constraint c
  where c.conrelid = 'public.orders'::regclass and c.contype = 'c'
    and pg_get_constraintdef(c.oid) like '%total_cents = (subtotal_cents + delivery_fee_cents)%';
  if constraint_name is not null then
    execute format('alter table public.orders drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.orders alter column delivery_fee_cents drop not null,
  alter column delivery_fee_cents drop default,
  add constraint orders_total_matches check (total_cents = subtotal_cents + coalesce(delivery_fee_cents, 0));

alter table public.order_items add column if not exists presentation_id uuid
  references public.dish_presentations(id) on delete set null;

-- Sin inserciones directas: el navegador no puede fijar precios, totales ni estados.
drop policy if exists "Public creates pending orders" on public.orders;
drop policy if exists "Public creates order items" on public.order_items;
revoke insert on public.orders, public.order_items from anon, authenticated;

-- Las líneas son instantáneas históricas: los administradores solo las leen.
drop policy if exists "Admins read and manage order items" on public.order_items;
create policy "Admins read order items" on public.order_items for select to authenticated
  using ((select public.is_restaurant_admin()));
revoke insert, update, delete on public.order_items from authenticated;

-- Los administradores solo cambian el estado; datos del cliente e importes quedan fijos.
revoke update on public.orders, public.reservations from authenticated;
grant update (status) on public.orders, public.reservations to authenticated;

create or replace function public.enforce_order_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and not (
    (old.status = 'pending' and new.status in ('preparing', 'cancelled'))
    or (old.status = 'preparing' and new.status in ('delivered', 'cancelled'))
  ) then
    raise exception 'invalid_status_transition' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_status_transition on public.orders;
create trigger orders_status_transition before update of status on public.orders
  for each row execute function public.enforce_order_status_transition();

create or replace function public.create_order(
  p_request_id uuid,
  p_customer_name text,
  p_phone text,
  p_delivery_method text,
  p_delivery_address text,
  p_items jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  max_int constant bigint := 2147483647;
  v_name text := btrim(coalesce(p_customer_name, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_address text := nullif(btrim(coalesce(p_delivery_address, '')), '');
  v_order public.orders%rowtype;
  v_item_count integer;
  v_valid_count integer;
  v_subtotal bigint;
begin
  if p_request_id is null then
    raise exception 'invalid_request_id' using errcode = 'P0001';
  end if;

  -- Reintento del mismo envío: devolver el pedido existente sin crear otro.
  select * into v_order from public.orders where request_id = p_request_id;
  if found then
    return jsonb_build_object('order_id', v_order.id, 'status', v_order.status,
      'subtotal_cents', v_order.subtotal_cents, 'delivery_fee_cents', v_order.delivery_fee_cents,
      'total_cents', v_order.total_cents, 'received_at', v_order.received_at, 'duplicate', true);
  end if;

  if length(v_name) not between 1 and 100 then
    raise exception 'invalid_customer_name' using errcode = 'P0001';
  end if;
  if length(v_phone) > 40 or regexp_replace(v_phone, '[\s().-]', '', 'g') !~ '^\+?[0-9]{7,15}$' then
    raise exception 'invalid_phone' using errcode = 'P0001';
  end if;
  if p_delivery_method is null or p_delivery_method not in ('delivery', 'pickup') then
    raise exception 'invalid_delivery_method' using errcode = 'P0001';
  end if;
  if p_delivery_method = 'pickup' then
    v_address := null;
  elsif v_address is null or length(v_address) not between 5 and 200 then
    raise exception 'invalid_delivery_address' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'invalid_items' using errcode = 'P0001';
  end if;
  v_item_count := jsonb_array_length(p_items);
  -- Límite técnico contra cargas abusivas; la carta tiene 270 presentaciones.
  if v_item_count not between 1 and 100 then
    raise exception 'invalid_items' using errcode = 'P0001';
  end if;

  -- Cada línea: {"dish": código, "presentation": código, "quantity": entero positivo}.
  create temporary table if not exists pg_temp.create_order_lines (
    position integer, dish_code text, presentation_code text, quantity bigint
  ) on commit drop;
  truncate pg_temp.create_order_lines;

  insert into pg_temp.create_order_lines
  select e.ordinality::integer,
    e.value ->> 'dish',
    e.value ->> 'presentation',
    case when jsonb_typeof(e.value -> 'quantity') = 'number' and (e.value ->> 'quantity') ~ '^[0-9]{1,10}$'
      then (e.value ->> 'quantity')::bigint end
  from jsonb_array_elements(p_items) with ordinality as e(value, ordinality)
  where jsonb_typeof(e.value) = 'object';

  if (select count(*) from pg_temp.create_order_lines) <> v_item_count
    or exists (select 1 from pg_temp.create_order_lines
      where dish_code is null or presentation_code is null or quantity is null or quantity < 1)
    or (select count(distinct (dish_code, presentation_code)) from pg_temp.create_order_lines) <> v_item_count then
    raise exception 'invalid_items' using errcode = 'P0001';
  end if;

  select count(*), sum(l.quantity * p.price_cents)
    into v_valid_count, v_subtotal
  from pg_temp.create_order_lines l
  join public.dishes d on d.code = l.dish_code and d.available
  join public.dish_presentations p on p.dish_id = d.id and p.code = l.presentation_code;

  if v_valid_count <> v_item_count then
    raise exception 'unavailable_items' using errcode = 'P0001';
  end if;
  if v_subtotal > max_int or exists (
    select 1 from pg_temp.create_order_lines l
    join public.dishes d on d.code = l.dish_code
    join public.dish_presentations p on p.dish_id = d.id and p.code = l.presentation_code
    where l.quantity * p.price_cents > max_int
  ) then
    raise exception 'order_total_too_large' using errcode = 'P0001';
  end if;

  insert into public.orders (request_id, customer_name, phone, delivery_method, delivery_address,
    status, subtotal_cents, delivery_fee_cents, total_cents)
  values (p_request_id, v_name, v_phone, p_delivery_method, v_address,
    'pending', v_subtotal::integer, null, v_subtotal::integer)
  on conflict (request_id) do nothing
  returning * into v_order;

  -- Otra petición con el mismo request_id ganó la carrera: devolver ese pedido.
  if v_order.id is null then
    select * into v_order from public.orders where request_id = p_request_id;
    return jsonb_build_object('order_id', v_order.id, 'status', v_order.status,
      'subtotal_cents', v_order.subtotal_cents, 'delivery_fee_cents', v_order.delivery_fee_cents,
      'total_cents', v_order.total_cents, 'received_at', v_order.received_at, 'duplicate', true);
  end if;

  insert into public.order_items (order_id, dish_id, presentation_id, dish_name, presentation_name,
    quantity, unit_price_cents, line_total_cents)
  select v_order.id, d.id, p.id, d.name, p.name, l.quantity::integer, p.price_cents,
    (l.quantity * p.price_cents)::integer
  from pg_temp.create_order_lines l
  join public.dishes d on d.code = l.dish_code
  join public.dish_presentations p on p.dish_id = d.id and p.code = l.presentation_code
  order by l.position;

  return jsonb_build_object('order_id', v_order.id, 'status', v_order.status,
    'subtotal_cents', v_order.subtotal_cents, 'delivery_fee_cents', v_order.delivery_fee_cents,
    'total_cents', v_order.total_cents, 'received_at', v_order.received_at, 'duplicate', false);
end;
$$;

revoke all on function public.create_order(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.create_order(uuid, text, text, text, text, jsonb) to anon, authenticated;

-- 3. Reservas -----------------------------------------------------------------

-- Supabase usa UTC: current_date cambia a las 19:00 de Lima. Se usa la fecha local.
drop policy if exists "Public creates pending reservations" on public.reservations;
create policy "Public creates pending reservations" on public.reservations for insert to anon, authenticated
  with check (status = 'pending' and people between 1 and 10
    and visit_date >= (now() at time zone 'America/Lima')::date);

create or replace function public.set_reservation_created_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists reservations_created_at on public.reservations;
create trigger reservations_created_at before insert on public.reservations
  for each row execute function public.set_reservation_created_at();

create or replace function public.enforce_reservation_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status
    and not (old.status = 'pending' and new.status in ('confirmed', 'cancelled')) then
    raise exception 'invalid_status_transition' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reservations_status_transition on public.reservations;
create trigger reservations_status_transition before update of status on public.reservations
  for each row execute function public.enforce_reservation_status_transition();
