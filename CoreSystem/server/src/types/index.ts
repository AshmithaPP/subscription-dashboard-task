import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface User {
  user_id: string; // Changed from 'id'
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface Plan {
  plan_id: string; // Changed from 'id'
  name: string;
  price: number;
  features: string[];
  duration_days: number;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  subscription_id: string; // Changed from 'id'
  user_id: string;
  plan_id: string;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'expired' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  refresh_token_id: string; // Changed from 'id'
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    user_id: string; // Changed from 'id'
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  adminKey?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface PaginatedResponse<T = any> {
  data: T;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    totalRecords: number;
  };
}

export interface JwtPayloadWithUserId extends JwtPayload {
  userId: string; // This stays as userId since it's in JWT payload
}