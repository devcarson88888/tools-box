create table if not exists public.github_publisher_bans (
  github_user_id bigint primary key,
  github_login text not null,
  banned_at timestamptz not null default now(),
  reason_code text not null default 'explicit_adult_content'
);

alter table public.github_publisher_bans enable row level security;
revoke all on public.github_publisher_bans from anon, authenticated;
grant all on public.github_publisher_bans to service_role;

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

  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) - 'date_of_birth';
  new.raw_app_meta_data :=
    coalesce(new.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('age_verified_at', now());
  return new;
end;
$$;

drop trigger if exists enforce_minimum_signup_age on auth.users;
create trigger enforce_minimum_signup_age
before insert on auth.users
for each row execute function public.enforce_minimum_signup_age();
