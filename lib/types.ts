export interface Album {
  id: string;  // Derived from originalAlbumName
  originalAlbumName: string;
  title: string;  // Either newAlbumName or originalAlbumName
  year?: number;
  coverImage?: string;
  notes?: string;
  tracks: Track[];
  gallery?: GalleryItem[];
  comments?: Comment[];
  personnel: string[];  // Array of user IDs
}

export interface Track {
  id: string;
  title: string;
  duration: number;  // Changed to number for seconds
  audioUrl?: string;
  // Metadata fields
  artist?: string;
  album?: string;
  year?: number;
  trackNumber?: number;
  genre?: string;
  comment?: string;
  composer?: string;
  // Audio format information
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  lossless?: boolean;
}

export interface GalleryItem {
  id: string;
  albumId: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  caption: string;
  taggedUsers: string[];
  uploadedBy: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  userId: string;
  profileImage?: string;
}

export interface User {
  id: string;          // UUID for the user
  fullName: string;    // Display name
  userName: string;    // Login username
  password: string;    // Plain text for now
  profileImage?: string;
  createdAt: string;
  instruments?: string;  // Comma-separated list of instruments
}
