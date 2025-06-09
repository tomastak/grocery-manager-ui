import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  LoginRequest,
  AuthResponse,
  ApiError,
  CreateOrderRequest,
  Order,
} from "@/types/product";

// API base URL from OpenAPI spec
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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

      // Handle different response scenarios
      if (!response.ok) {
        let errorData: any = {};

        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, create error from status
        }

        const error: ApiError = {
          status: response.status,
          error: errorData.error || response.statusText,
          message:
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          timestamp: errorData.timestamp || new Date().toISOString(),
          data: errorData.data,
        };
        throw error;
      }

      // Handle empty responses (e.g., DELETE operations that return 204)
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
          status: 0,
          error: "NetworkError",
          message: "Network error. Please check your connection and try again.",
          timestamp: new Date().toISOString(),
        } as ApiError;
      }
      throw error;
    }
  }

  // Authentication - simplified since there's no dedicated auth endpoint
  // We'll test authentication by trying to fetch products
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Create Base64 encoded credentials
    const encoded = btoa(`${credentials.username}:${credentials.password}`);
    localStorage.setItem("auth_credentials", encoded);

    try {
      // Test authentication by fetching products
      await this.request<Product[]>("/api/v1/products", { method: "GET" });

      return {
        user: {
          username: credentials.username,
          role: "admin",
        },
        token: encoded,
      };
    } catch (error) {
      localStorage.removeItem("auth_credentials");
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem("auth_credentials");
  }

  // Products API - matching the exact OpenAPI specification

  /**
   * Get all products
   * @param onlyActive - If true (default), returns only active products. If false, includes archived products
   */
  async getProducts(onlyActive: boolean = true): Promise<Product[]> {
    const params = new URLSearchParams();
    params.append("onlyActive", onlyActive.toString());

    return this.request<Product[]>(`/api/v1/products?${params.toString()}`);
  }

  /**
   * Get product by code
   */
  async getProduct(code: string): Promise<Product> {
    return this.request<Product>(
      `/api/v1/products/${encodeURIComponent(code)}`,
    );
  }

  /**
   * Create a new product
   */
  async createProduct(product: CreateProductRequest): Promise<Product> {
    return this.request<Product>("/api/v1/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    code: string,
    product: UpdateProductRequest,
  ): Promise<Product> {
    return this.request<Product>(
      `/api/v1/products/${encodeURIComponent(code)}`,
      {
        method: "PUT",
        body: JSON.stringify(product),
      },
    );
  }

  /**
   * Delete (archive) a product
   * Returns 204 for successful archival or 409 if product has active orders
   */
  async deleteProduct(code: string): Promise<void> {
    return this.request<void>(`/api/v1/products/${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
  }

  // Orders API - matching the exact OpenAPI specification

  /**
   * Create a new order
   */
  async createOrder(order: CreateOrderRequest): Promise<Order> {
    return this.request<Order>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  }

  /**
   * Pay for an order
   */
  async payOrder(orderCode: string): Promise<Order> {
    return this.request<Order>(`/api/v1/orders/${orderCode}/pay`, {
      method: "POST",
    });
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderCode: string): Promise<Order> {
    return this.request<Order>(`/api/v1/orders/${orderCode}/cancel`, {
      method: "POST",
    });
  }

  // Health check (not in API spec but useful for connection testing)
  async healthCheck(): Promise<{ status: string }> {
    try {
      await this.getProducts();
      return { status: "ok" };
    } catch (error) {
      throw { status: "error", message: "API not accessible" };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
