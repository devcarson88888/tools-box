create table if not exists public.user_birth_dates (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date not null,
  recorded_at timestamptz not null default now()
);

alter table public.user_birth_dates enable row level security;
revoke all on public.user_birth_dates from anon, authenticated;
grant all on public.user_birth_dates to service_role;

create or replace function public.enforce_minimum_signup_age()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  birth_date date;
begin
  begin
    birth_date := (new.raw_user_meta_data ->> 'date_of_birth')::date;
  exception when others then
    raise exception 'A valid date of birth is required to register.';
  end;

  if birth_date is null
    or birth_date > current_date
    or date_part('year', age(current_date, birth_date)) < 18 then
    raise exception 'You must be 18 or older to register.';
  end if;

  new.raw_app_meta_data :=
    coalesce(new.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('age_verified_at', now());
  return new;
end;
$$;

create or replace function public.store_signup_birth_date()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  birth_date date;
begin
  birth_date := (new.raw_user_meta_data ->> 'date_of_birth')::date;

  insert into public.user_birth_dates (user_id, birth_date)
  values (new.id, birth_date)
  on conflict (user_id) do update
    set birth_date = excluded.birth_date,
        recorded_at = now();

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'date_of_birth'
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists store_signup_birth_date on auth.users;
create trigger store_signup_birth_date
after insert on auth.users
for each row execute function public.store_signup_birth_date();
