export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  displayName: string;
  passwordHash: string;
  avatarUrl?: string | null;
}

export interface CreateUserWithPasswordHashData {
  email: string;
  displayName: string;
  passwordHash: string;
  avatarUrl?: string | null;
}
export interface UpdateUserData {
  email?: string;
  displayName?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}
