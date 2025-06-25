export interface Album {
  id: string;  // Derived from original_album_name
  original_album_name: string;
  title: string;  // Either new_album_name or original_album_name
  year?: string;
  cover_image?: string;
  notes?: string;
  tracks: Track[];
  gallery?: GalleryItem[];
  comments?: Comment[];
  personnel: string[];  // Array of user IDs
}

export interface Track {
  id: string;
  title: string;
  audio_url: string;
  duration?: string;
  artist?: string;
  album?: string;
  album_id?: string;
  album_title?: string;
  year?: number;
  track_number?: number;
  genre?: string;
  comment?: string;
  composer?: string;
  bitrate?: number;
  sample_rate?: number;
  channels?: number;
  lossless?: boolean;
}

export interface GalleryItem {
  id: string;
  album_id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  title: string;
  caption: string;
  tagged_users: string[];
  uploaded_by: string;
  created_at: string;
  file_name: string;
  content_type: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  user_id?: string;
  profile_image?: string;
  created_at: string;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  duration: number;
  audio_url?: string;
  album_id: string;
  album_title: string;
  cover_image?: string;
  added_at?: number;
}

export interface Playlist {
  id: string;
  title: string;
  cover_image?: string;
  user_id: string;
  created_at: number;
  tracks: PlaylistTrack[];
}

export interface User {
  id: string;          // UUID for the user
  full_name: string;    // Display name
  user_name: string;    // Login username
  password: string;
  profile_image?: string;
  created_at: string;
  instruments?: string;  // Comma-separated list of instruments
}
