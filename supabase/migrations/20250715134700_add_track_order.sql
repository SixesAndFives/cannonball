-- Add track_order column to tracks table
ALTER TABLE tracks ADD COLUMN track_order integer;

-- Initialize track_order based on created_at timestamps
WITH ordered_tracks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY created_at) as row_num
  FROM tracks
)
UPDATE tracks 
SET track_order = ordered_tracks.row_num
FROM ordered_tracks
WHERE tracks.id = ordered_tracks.id;

-- Make track_order non-nullable
ALTER TABLE tracks ALTER COLUMN track_order SET NOT NULL;
