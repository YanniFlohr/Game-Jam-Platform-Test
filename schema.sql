-- Nanogram Jams: run once in Supabase > SQL Editor
create table profiles(
  id uuid primary key references auth.users on delete cascade,
  username text not null check (char_length(username) between 3 and 24),
  discord text, is_admin boolean not null default false,
  created_at timestamptz default now());
create unique index profiles_username_key on profiles (lower(username));

create table jams(
  id uuid primary key default gen_random_uuid(),
  name text not null, description text not null default '',
  hue int not null default 260, starts date not null, ends date not null,
  tags text[] not null default '{}', rules text[] not null default '{}',
  banner_url text, created_by uuid references profiles(id), created_at timestamptz default now(),
  check (ends >= starts));

create table games(
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  genre text not null default 'Casual', description text not null default '' check (char_length(description)<=300),
  play_url text not null check (play_url ~ '^https://'),
  banner_url text, jam_id uuid references jams(id) on delete set null,
  created_at timestamptz default now());

create table jam_members(
  jam_id uuid references jams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade default auth.uid(),
  primary key (jam_id, user_id));

create function is_admin() returns boolean language sql security definer stable
as $$ select coalesce((select is_admin from profiles where id = auth.uid()), false) $$;

-- auto-create a profile on sign up (email or Discord)
create function handle_new_user() returns trigger language plpgsql security definer as $$
declare base text; m jsonb := coalesce(new.raw_user_meta_data,'{}'::jsonb);
begin
  base := left(coalesce(m->>'username', m->>'user_name', m->>'full_name', split_part(new.email,'@',1), 'player'), 24);
  if char_length(base) < 3 then base := base || '_gg'; end if;
  if exists(select 1 from profiles where lower(username)=lower(base)) then
    base := left(base,19) || '-' || substr(md5(random()::text),1,4); end if;
  insert into profiles(id, username) values (new.id, base);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table profiles enable row level security;
alter table jams enable row level security;
alter table games enable row level security;
alter table jam_members enable row level security;

create policy "profiles read" on profiles for select using (true);
create policy "profiles update own" on profiles for update using (auth.uid()=id)
  with check (auth.uid()=id and is_admin = (select p.is_admin from profiles p where p.id=auth.uid()));

create policy "jams read" on jams for select using (true);
create policy "jams admin write" on jams for all using (is_admin()) with check (is_admin());

create policy "games read" on games for select using (true);
create policy "games insert" on games for insert to authenticated with check (
  owner = auth.uid() and (jam_id is null or exists(
    select 1 from jam_members m join jams j on j.id=m.jam_id
    where m.jam_id=games.jam_id and m.user_id=auth.uid() and current_date between j.starts and j.ends)));
create policy "games update" on games for update using (owner=auth.uid() or is_admin())
  with check (is_admin() or (owner=auth.uid() and (jam_id is null or exists(
    select 1 from jam_members m join jams j on j.id=m.jam_id
    where m.jam_id=games.jam_id and m.user_id=auth.uid() and current_date between j.starts and j.ends))));
create policy "games delete" on games for delete using (owner=auth.uid() or is_admin());

create policy "members read" on jam_members for select using (true);
create policy "members join" on jam_members for insert to authenticated with check (user_id=auth.uid());
create policy "members leave" on jam_members for delete using (user_id=auth.uid());

-- banner storage (public read, 10 MB images, each user writes only to their own folder)
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('banners','banners',true,10485760,array['image/png','image/jpeg','image/webp','image/gif']);
create policy "banners read" on storage.objects for select using (bucket_id='banners');
create policy "banners upload" on storage.objects for insert to authenticated
  with check (bucket_id='banners' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "banners delete" on storage.objects for delete to authenticated
  using (bucket_id='banners' and ((storage.foldername(name))[1]=auth.uid()::text or is_admin()));

-- AFTER creating the admin user (see steps), run:
-- update profiles set is_admin = true where lower(username) = 'nanogram admin';

-- Already ran an older schema? Raise the banner size limit to 10 MB with:
-- update storage.buckets set file_size_limit = 10485760 where id = 'banners';
