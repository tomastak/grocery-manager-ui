import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  LoginRequest,
  AuthResponse,
  ApiError,
} from "@/types/product";

// Mock data for development - prices updated for Czech koruna
const MOCK_PRODUCTS: Product[] = [
  {
    code: "APPLE001",
    name: "Red Apples",
    stockQuantity: 150,
    pricePerUnit: 45.99, // ~$2 in CZK
  },
  {
    code: "BANANA002",
    name: "Bananas",
    stockQuantity: 80,
    pricePerUnit: 22.5, // ~$1 in CZK
  },
  {
    code: "MILK003",
    name: "Whole Milk 1L",
    stockQuantity: 25,
    pricePerUnit: 79.9, // ~$3.50 in CZK
  },
  {
    code: "BREAD004",
    name: "Whole Wheat Bread",
    stockQuantity: 5,
    pricePerUnit: 68.5, // ~$3 in CZK
  },
  {
    code: "EGGS005",
    name: "Free Range Eggs (12 pack)",
    stockQuantity: 0,
    pricePerUnit: 115.0, // ~$5 in CZK
  },
  {
    code: "TOMATO006",
    name: "Fresh Tomatoes",
    stockQuantity: 45,
    pricePerUnit: 56.9, // ~$2.50 in CZK
  },
  {
    code: "CHEESE007",
    name: "Cheddar Cheese Block",
    stockQuantity: 12,
    pricePerUnit: 137.5, // ~$6 in CZK
  },
  {
    code: "CARROT008",
    name: "Organic Carrots",
    stockQuantity: 35,
    pricePerUnit: 41.0, // ~$1.80 in CZK
  },
];

class MockApiClient {
  private products: Product[] = [...MOCK_PRODUCTS];
  private isAuthenticated = false;

  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private throwError(status: number, message: string): never {
    const error: ApiError = {
      status,
      error: status === 401 ? "Unauthorized" : "Bad Request",
      message,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    await this.delay(800);

    // Demo credentials
    if (credentials.username === "admin" && credentials.password === "admin") {
      this.isAuthenticated = true;
      return {
        user: {
          username: credentials.username,
          role: "admin",
        },
        token: "mock-token-12345",
      };
    }

    this.throwError(401, "Invalid username or password");
  }

  logout(): void {
    this.isAuthenticated = false;
  }

  private checkAuth(): void {
    if (!this.isAuthenticated) {
      this.throwError(401, "Authentication required");
    }
  }

  async getProducts(onlyActive: boolean = true): Promise<Product[]> {
    this.checkAuth();
    await this.delay(300);

    // For demo purposes, we don't have archived products
    return [...this.products];
  }

  async getProduct(code: string): Promise<Product> {
    this.checkAuth();
    await this.delay(200);

    const product = this.products.find((p) => p.code === code);
    if (!product) {
      this.throwError(404, `Product with code '${code}' not found`);
    }
    return product;
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    this.checkAuth();
    await this.delay(600);

    // Check if product code already exists
    const exists = this.products.find((p) => p.code === product.code);
    if (exists) {
      this.throwError(
        409,
        `Product with code '${product.code}' already exists`,
      );
    }

    const newProduct: Product = {
      code: product.code,
      name: product.name,
      stockQuantity: product.stockQuantity,
      pricePerUnit: product.pricePerUnit,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(
    code: string,
    product: UpdateProductRequest,
  ): Promise<Product> {
    this.checkAuth();
    await this.delay(500);

    const index = this.products.findIndex((p) => p.code === code);
    if (index === -1) {
      this.throwError(404, `Product with code '${code}' not found`);
    }

    const updatedProduct: Product = {
      ...this.products[index],
      name: product.name,
      stockQuantity: product.stockQuantity,
      pricePerUnit: product.pricePerUnit,
    };

    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  async deleteProduct(code: string): Promise<void> {
    this.checkAuth();
    await this.delay(400);

    const index = this.products.findIndex((p) => p.code === code);
    if (index === -1) {
      this.throwError(404, `Product with code '${code}' not found`);
    }

    // For demo purposes, we'll actually remove the product
    // In real API, this would archive it
    this.products.splice(index, 1);
  }

  async healthCheck(): Promise<{ status: string }> {
    await this.delay(100);
    return { status: "ok" };
  }
}

export const mockApiClient = new MockApiClient();
