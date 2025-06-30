import api from './api.service';
import type { UserRoleType } from '../types/auth.types';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  roles: UserRoleType[];
  created_at: string;
  updated_at: string;
}

export interface UserCreateData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  roles: string[];
}

export interface UserUpdateData {
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roles?: string[];
  is_active?: boolean;
}

export interface UserListParams {
  role?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

class UserService {
  private baseURL = '/users';

  async getAll(params?: UserListParams): Promise<UserListResponse> {
    const response = await api.get(this.baseURL, { params });
    return response.data;
  }

  async getById(id: string): Promise<User> {
    const response = await api.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: UserCreateData): Promise<User> {
    const response = await api.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: UserUpdateData): Promise<User> {
    const response = await api.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }
}

export const userService = new UserService(); 