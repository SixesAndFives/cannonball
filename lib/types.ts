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
  personnel?: string[];
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
  url: string;
  caption?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}
