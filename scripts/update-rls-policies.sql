-- Drop existing policies
drop policy if exists "Allow read access for all authenticated users" on users;
drop policy if exists "Allow read access for all authenticated users" on albums;
drop policy if exists "Allow read access for all authenticated users" on tracks;
drop policy if exists "Allow read access for all authenticated users" on playlists;
drop policy if exists "Allow read access for all authenticated users" on playlist_tracks;
drop policy if exists "Allow read access for all authenticated users" on album_personnel;
drop policy if exists "Allow read access for all authenticated users" on comments;

-- Create new policies that allow both read and write
create policy "Enable all access for authenticated users"
on users for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users"
on albums for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users"
on tracks for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users"
on playlists for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users"
on playlist_tracks for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users"
on album_personnel for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users"
on comments for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Also enable anon access for migration
create policy "Enable insert access for anon"
on users for insert
with check (true);

create policy "Enable insert access for anon"
on albums for insert
with check (true);

create policy "Enable insert access for anon"
on tracks for insert
with check (true);

create policy "Enable insert access for anon"
on playlists for insert
with check (true);

create policy "Enable insert access for anon"
on playlist_tracks for insert
with check (true);

create policy "Enable insert access for anon"
on album_personnel for insert
with check (true);

create policy "Enable insert access for anon"
on comments for insert
with check (true);
