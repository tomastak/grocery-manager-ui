export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  expiryDate?: string;
  supplier?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  expiryDate?: string;
  supplier?: string;
  isActive?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
