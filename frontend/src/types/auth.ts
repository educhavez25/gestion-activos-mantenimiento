export interface Role {
  id: number;
  name: string;
  slug: 'administrador' | 'supervisor' | 'tecnico' | 'usuario';
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: Role;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
