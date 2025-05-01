export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  address: string;
}

export interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  exp: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
} 