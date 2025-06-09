import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  LoginRequest,
  AuthResponse,
  ApiError,
} from "@/types/product";

// Default base URL - can be overridden via environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeader(): string | null {
    const credentials = localStorage.getItem("auth_credentials");
    return credentials ? `Basic ${credentials}` : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const authHeader = this.getAuthHeader();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message:
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: errorData.details || errorData.error,
        };
        throw error;
      }

      // Handle empty responses (e.g., DELETE operations)
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "TypeError") {
        // Network error
        throw {
          message: "Network error. Please check your connection and try again.",
          status: 0,
          details: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Create Base64 encoded credentials
    const encoded = btoa(`${credentials.username}:${credentials.password}`);
    localStorage.setItem("auth_credentials", encoded);

    try {
      // Test authentication by fetching user profile or products
      const response = await this.request<{ user: any }>("/auth/me", {
        method: "GET",
      });

      return {
        user: response.user || {
          id: 1,
          username: credentials.username,
          role: "admin",
        },
        token: encoded,
      };
    } catch (error) {
      // If auth endpoint doesn't exist, try products endpoint to validate credentials
      try {
        await this.request<Product[]>("/products", { method: "GET" });
        return {
          user: {
            id: 1,
            username: credentials.username,
            role: "admin",
          },
          token: encoded,
        };
      } catch (productError) {
        localStorage.removeItem("auth_credentials");
        throw productError;
      }
    }
  }

  logout(): void {
    localStorage.removeItem("auth_credentials");
  }

  // Products CRUD
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>("/products");
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(
    id: number,
    product: UpdateProductRequest,
  ): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health");
  }
}

export const apiClient = new ApiClient();
export default apiClient;
