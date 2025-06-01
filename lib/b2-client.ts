import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { parseBuffer, IAudioMetadata, ICommonTagsResult } from 'music-metadata';
import { Album, Track } from './types.js';
import { fileURLToPath } from 'url';

const keyID = '004b14fc428245a0000000004';
const applicationKey = 'K004XVtx2YqASONarnOJmDZ8Y+uT6xg';
const bucketName = 'cannonball-music';
const bucketId = '3b31f47f3c6472889264051a';

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
}

interface B2File {
  fileName: string;
  contentType: string;
  contentLength: number;
  uploadTimestamp: number;
}

interface B2ListFilesResponse {
  files: B2File[];
  nextFileName: string | null;
}

let authToken: string | null = null;
let apiUrl: string | null = null;
let downloadUrl: string | null = null;
let accountId: string | null = null;

export async function authorize() {
  if (authToken && apiUrl && downloadUrl && accountId) {
    return { authToken, apiUrl, downloadUrl, accountId }
  }

  try {
    console.log('Authorizing with B2...');
    const credentials = Buffer.from(`${keyID}:${applicationKey}`).toString('base64');

    const response = await axios.get<B2AuthResponse>('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    console.log('Authorization successful');
    console.log('API URL:', response.data.apiUrl);
    console.log('Download URL:', response.data.downloadUrl);
    console.log('Account ID:', response.data.accountId);

    authToken = response.data.authorizationToken;
    apiUrl = response.data.apiUrl;
    downloadUrl = response.data.downloadUrl;
    accountId = response.data.accountId;

    return { authToken, apiUrl, downloadUrl, accountId }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Authorization failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } else {
      console.error('Authorization failed:', error);
    }
    throw error;
  }
}

export async function listFiles(prefix: string = '', delimiter: string = '/') {
  const auth = await authorize();

  try {
    console.log('Listing files with prefix:', prefix);
    const filesResponse = await axios.post<B2ListFilesResponse>(`${auth.apiUrl}/b2api/v2/b2_list_file_names`, {
      bucketId,
      prefix,
      delimiter
    }, {
      headers: {
        Authorization: auth.authToken,
        'Content-Type': 'application/json'
      }
    });

    console.log('Raw B2 response:', JSON.stringify(filesResponse.data, null, 2));
    return filesResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error listing files:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } else {
      console.error('Error listing files:', error);
    }
    throw error;
  }
}

export async function getFolders(): Promise<string[]> {
  const response = await listFiles('', '/');
  
  // Get unique folder names from file paths
  const folders = new Set<string>();
  for (const file of response.files) {
    const parts = file.fileName.split('/');
    if (parts.length > 1) {
      folders.add(parts[0]);
    }
  }
  
  return Array.from(folders);
}

async function downloadCoverImage(fileName: string, albumId: string): Promise<string> {
  const { downloadUrl, authToken } = await authorize();
  const b2Url = `${downloadUrl}/file/cannonball-music/${fileName}`;
  
  console.log('Downloading cover image:', b2Url);
  const response = await fetch(b2Url, {
    headers: {
      'Authorization': authToken
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download cover image: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const localPath = `public/images/${albumId}-cover.jpg`;
  await fs.writeFile(localPath, buffer);
  console.log('Saved cover image to:', localPath);
  
  return `/images/${albumId}-cover.jpg`;
}

export async function getTracksFromB2(albumName: string): Promise<{ tracks: Track[], coverImage?: string }> {
  console.log('Getting tracks for album:', albumName);
  const response = await listFiles(albumName + '/');
  console.log('Files found:', response.files.map(f => f.fileName));
  
  // Find cover image
  const coverFile = response.files.find(file => file.fileName.toLowerCase().endsWith('/cover.jpg'));
  let coverImage: string | undefined;
  if (coverFile) {
    try {
      const albumId = albumName.toLowerCase().replace(/\s+/g, '-');
      coverImage = await downloadCoverImage(coverFile.fileName, albumId);
    } catch (error) {
      console.error('Error downloading cover image:', error);
    }
  }

  // Get audio files
  console.log('Looking for MP3 files in response:', response);
  const audioFiles = response.files
    .filter(file => {
      const isAudio = file.fileName.endsWith('.mp3') || file.fileName.endsWith('.wav') || file.fileName.endsWith('.m4a');
      console.log(`File ${file.fileName} is ${isAudio ? '' : 'not '}an audio file`);
      return isAudio;
    })
    .map(file => ({
      fileName: file.fileName,
      url: `${downloadUrl}/file/${bucketName}/${file.fileName}`
    }));

  const tracks = await formatTracks(audioFiles);

  return {
    tracks,
    coverImage
  };
}

async function fetchAndParseMetadata(url: string) {
  console.log('Fetching metadata for:', url);
  // Ensure we have valid auth
  if (!authToken) {
    console.log('No auth token, authorizing...');
    await authorize();
  }
  console.log('Using auth token:', authToken);

  const response = await axios.get(url, { 
    responseType: 'arraybuffer',
    headers: {
      Authorization: authToken!
    }
  });

  try {
    return await parseBuffer(response.data);
  } catch (error) {
    console.error('Error parsing metadata with music-metadata:', error);
    
    // For WAV files, try to parse duration from header
    if (url.toLowerCase().endsWith('.wav')) {
      const buffer = Buffer.from(response.data);
      // WAV header: bytes 40-43 contain sample length
      if (buffer.length >= 44) {
        const sampleLength = buffer.readUInt32LE(40);
        const sampleRate = buffer.readUInt32LE(24);
        const duration = sampleLength / sampleRate;
        return {
          format: {
            duration,
            bitrate: 1152000,
            sampleRate: 48000,
            numberOfChannels: 1,
            lossless: true
          },
          common: {}
        };
      }
    }
    throw error;
  }
}

export async function formatTracks(files: { fileName: string, url: string }[]): Promise<Track[]> {
  const tracks: Track[] = [];

  for (const file of files) {
    try {
      const metadata = await fetchAndParseMetadata(file.url) as IAudioMetadata;
      const fileName = file.fileName.split('/').pop() || '';
      const title = metadata.common?.title || fileName.replace(/\.(mp3|wav|m4a)$/, '');
      
      tracks.push({
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        duration: metadata.format.duration || 0,
        audioUrl: file.url,
        artist: metadata.common?.artist || 'Cannonball',
        album: metadata.common?.album || fileName.split('/')[0],
        year: metadata.common?.year || new Date().getFullYear(),
        trackNumber: metadata.common?.track?.no || undefined,
        genre: metadata.common?.genre?.[0],
        comment: metadata.common?.comment?.[0]?.text,
        composer: metadata.common?.composer?.[0],
        bitrate: metadata.format.bitrate,
        sampleRate: metadata.format.sampleRate,
        channels: metadata.format.numberOfChannels,
        lossless: metadata.format.lossless
      });
    } catch (error) {
      console.error(`Error processing metadata for ${file.fileName}:`, error);
      const fileName = file.fileName.split('/').pop() || '';
      const title = fileName.replace(/\.(mp3|wav|m4a)$/, '');
      
      // Set default metadata based on file name and album
      tracks.push({
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        duration: 0,
        audioUrl: file.url,
        artist: 'Cannonball',
        album: file.fileName.split('/')[0] || '',
        year: new Date().getFullYear(),
        bitrate: file.fileName.endsWith('.wav') ? 1152000 : undefined,
        sampleRate: file.fileName.endsWith('.wav') ? 48000 : 44100,
        channels: 1,
        lossless: file.fileName.endsWith('.wav')
      });
    }
  }

  return tracks;
}

export async function getAlbumFiles(albumName: string): Promise<{ tracks: Track[], coverImage?: string }> {
  try {
    const result = await getTracksFromB2(albumName);
    return result;
  } catch (error) {
    console.error('Error fetching album files:', error)
    return { tracks: [] }
  }
}

export async function syncAlbums(): Promise<void> {
  console.log('Starting album sync...');
  try {
    // Get the current albums.json content
    const albumsPath = path.join(process.cwd(), 'lib', 'albums.json');
    console.log('Writing to albums.json at:', albumsPath);
    console.log('Current working directory:', process.cwd());
    const albumsContent = await fs.readFile(albumsPath, 'utf-8');
    const albumsData = JSON.parse(albumsContent);

    // Get all folders from B2
    const folders = await getFolders();
    console.log('Found folders in B2:', folders);

    // Create a set of B2 folders for quick lookup
    const b2Folders = new Set(folders);

    // Remove albums that no longer exist in B2
    const originalLength = albumsData.albums.length;
    albumsData.albums = albumsData.albums.filter((album: Album) => {
      const exists = b2Folders.has(album.originalAlbumName);
      if (!exists) {
        console.log(`Removing album no longer in B2: ${album.originalAlbumName}`);
      }
      return exists;
    });
    console.log(`Removed ${originalLength - albumsData.albums.length} albums that no longer exist in B2`);

    // Create a set of existing albums for quick lookup
    const existingAlbums = new Set(albumsData.albums.map((album: Album) => album.originalAlbumName));

    // Add new albums from B2
    for (const folder of folders) {
      // Skip if album already exists
      if (existingAlbums.has(folder)) {
        console.log(`Skipping existing album: ${folder}`);
        continue;
      }

      console.log(`Processing new album: ${folder}`);
      
      // Get tracks and cover image from the folder
      const { tracks, coverImage } = await getTracksFromB2(folder);
      
      // Create new album entry
      const newAlbum: Album = {
        id: folder.toLowerCase().replace(/\s+/g, '-'),
        originalAlbumName: folder,
        title: folder,
        tracks,
        coverImage
      };

      // Add to albums array
      albumsData.albums.push(newAlbum);
      console.log(`Added new album: ${folder}`);
    }

    // Write back to albums.json
    await fs.writeFile(albumsPath, JSON.stringify(albumsData, null, 2));
    console.log('Albums sync completed successfully');
  } catch (error) {
    console.error('Error syncing albums:', error);
    throw error;
  }
}

// Run syncAlbums if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Running sync directly...');
  syncAlbums().catch(console.error);
}
