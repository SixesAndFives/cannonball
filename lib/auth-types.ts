export type UserRole = 'super_admin' | 'band_member' | 'public';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name?: string;
}

// These will be used later when we add authentication
export interface AuthContext {
  user?: User;
  isAuthenticated: boolean;
}

// Permission checking functions that currently always return true
export const permissions = {
  canEditTrack: () => true,
  canDeleteTrack: () => true,
  canUploadPhoto: () => true,
  canAddComment: () => true,
  canEditAlbum: () => true,
  canManageUsers: () => true,
} as const;
