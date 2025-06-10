// Product types based on the exact OpenAPI specification

export interface Product {
  code: string;
  name: string;
  stockQuantity: number;
  pricePerUnit: number;
  archived: boolean; // <-- added
}

export interface CreateProductRequest {
  code: string;
  name: string;
  stockQuantity: number;
  pricePerUnit: number;
}

export interface UpdateProductRequest {
  name: string;
  stockQuantity: number;
  pricePerUnit: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

// Order types based on the API specification
export interface OrderItem {
  code?: string;
  productCode: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface CreateOrderRequest {
  items: Array<{
    productCode: string;
    quantity: number;
  }>;
}

export interface Order {
  code?: string;
  status?: "PENDING" | "PAID" | "CANCELED" | "EXPIRED";
  totalAmount?: number;
  expiresAt?: string;
  items: OrderItem[];
}

// Error handling types
export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  data?: Record<string, string>;
}

// Auth types (simplified since no dedicated auth endpoint)
export interface User {
  username: string;
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