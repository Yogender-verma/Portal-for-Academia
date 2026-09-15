export type UserRole = 'student' | 'company' | 'college';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college?: string;
  course?: string;
  createdAt?: string;
}

export interface UserProfile extends AuthUser {
  uid: string;
  displayName: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
}

export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  college?: string;
  course?: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

