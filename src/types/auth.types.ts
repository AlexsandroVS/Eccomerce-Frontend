export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserRegisterData extends UserLoginData {
  full_name: string;
  phone?: string;
}

export interface UserRole {
  role: string;
  permissions: string[];
}

// Tipo que representa un rol que puede venir como string o como objeto
export type UserRoleType = string | UserRole;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
    roles: UserRoleType[];  // Ahora puede ser un array de strings o de objetos UserRole
    created_at: string;
    updated_at: string;
  };
  token: string;
} 