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
import { mockApiClient } from "./mockApi";

// Get API base URL from runtime config or environment variable
const getApiBaseUrl = (): string => {
  // Check if running in browser and runtime config is available
  if (typeof window !== "undefined" && (window as any).ENV) {
    return (window as any).ENV.VITE_API_BASE_URL || "http://localhost:8080";
  }

  // Fallback to build-time environment variable
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
};

const API_BASE_URL = getApiBaseUrl();

// Check if we're in development mode without a backend
const isDevelopmentMode =
  import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;

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
    // Use mock API in development mode
    if (isDevelopmentMode) {
      return this.handleMockRequest<T>(endpoint, options);
    }

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

        // Handle SpringBoot error format specifically
        if (response.status === 401) {
          const error: ApiError = {
            status: 401,
            error: "Authentication Failed",
            message:
              "Invalid username or password. Please check your credentials and try again.",
            timestamp: errorData.timestamp || new Date().toISOString(),
            data: errorData.data,
          };
          throw error;
        }

        // Handle other SpringBoot errors
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

  private async handleMockRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body as string) : null;

    // Route to appropriate mock method
    if (endpoint.startsWith("/api/v1/products")) {
      const codeMatch = endpoint.match(/\/api\/v1\/products\/([^?]+)/);

      if (method === "GET" && !codeMatch) {
        // GET /api/v1/products
        const urlParams = new URLSearchParams(endpoint.split("?")[1] || "");
        const onlyActive = urlParams.get("onlyActive") !== "false";
        return mockApiClient.getProducts(onlyActive) as Promise<T>;
      } else if (method === "GET" && codeMatch) {
        // GET /api/v1/products/{code}
        return mockApiClient.getProduct(
          decodeURIComponent(codeMatch[1]),
        ) as Promise<T>;
      } else if (method === "POST") {
        // POST /api/v1/products
        return mockApiClient.createProduct(body) as Promise<T>;
      } else if (method === "PUT" && codeMatch) {
        // PUT /api/v1/products/{code}
        return mockApiClient.updateProduct(
          decodeURIComponent(codeMatch[1]),
          body,
        ) as Promise<T>;
      } else if (method === "DELETE" && codeMatch) {
        // DELETE /api/v1/products/{code}
        return mockApiClient.deleteProduct(
          decodeURIComponent(codeMatch[1]),
        ) as Promise<T>;
      }
    }

    throw new Error(`Mock API: Unsupported endpoint ${method} ${endpoint}`);
  }

  // Authentication - test credentials against SpringBoot API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    if (isDevelopmentMode) {
      const result = await mockApiClient.login(credentials);
      // Store credentials for consistency
      const encoded = btoa(`${credentials.username}:${credentials.password}`);
      localStorage.setItem("auth_credentials", encoded);
      return result;
    }

    // Validate credentials format
    if (!credentials.username || !credentials.password) {
      throw {
        status: 400,
        error: "Invalid Credentials",
        message: "Username and password are required",
        timestamp: new Date().toISOString(),
      } as ApiError;
    }

    // Create Base64 encoded credentials
    const encoded = btoa(`${credentials.username}:${credentials.password}`);

    // Temporarily store credentials for the test request
    localStorage.setItem("auth_credentials", encoded);

    try {
      // Test authentication by fetching products with proper error handling
      await this.request<Product[]>("/api/v1/products", { method: "GET" });

      // If successful, return user info
      return {
        user: {
          username: credentials.username,
          role: "user", // Default role, could be extracted from API response if available
        },
        token: encoded,
      };
    } catch (error) {
      // Remove invalid credentials on failure
      localStorage.removeItem("auth_credentials");

      // Re-throw with more specific message for auth failures
      if ((error as ApiError).status === 401) {
        throw {
          status: 401,
          error: "Authentication Failed",
          message: `Authentication failed for user '${credentials.username}'. Please verify your credentials are correct for the SpringBoot API.`,
          timestamp: new Date().toISOString(),
        } as ApiError;
      }

      throw error;
    }
  }

  logout(): void {
    if (isDevelopmentMode) {
      mockApiClient.logout();
    }
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
  // Note: These will only work with real API, not in mock mode

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

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    if (isDevelopmentMode) {
      return mockApiClient.healthCheck();
    }

    try {
      await this.getProducts();
      return { status: "ok" };
    } catch (error) {
      throw { status: "error", message: "API not accessible" };
    }
  }

  // Get current API base URL for debugging
  getBaseUrl(): string {
    return this.baseURL;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
