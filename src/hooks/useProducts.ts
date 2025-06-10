import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ApiError,
} from "@/types/product";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export const useProducts = (onlyActive: boolean = true) => {
  return useQuery({
    queryKey: ["products", onlyActive],
    queryFn: () => apiClient.getProducts(onlyActive),
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

export const useProduct = (code: string) => {
  return useQuery({
    queryKey: ["product", code],
    queryFn: () => apiClient.getProduct(code),
    enabled: !!code,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: CreateProductRequest) =>
      apiClient.createProduct(product),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product created",
        description: `${newProduct.name} (${newProduct.code}) has been successfully created`,
      });
    },
    onError: (error: ApiError) => {
      let errorMessage = "An unexpected error occurred";

      if (error.status === 409) {
        errorMessage = "A product with this code already exists";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Failed to create product",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      code,
      ...product
    }: UpdateProductRequest & { code: string }) =>
      apiClient.updateProduct(code, product),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["product", updatedProduct.code],
      });
      toast({
        title: "Product updated",
        description: `${updatedProduct.name} has been successfully updated`,
      });
    },
    onError: (error: ApiError) => {
      let errorMessage = "An unexpected error occurred";

      if (error.status === 0) {
        errorMessage =
          "Network/CORS error. Check if your backend allows PUT requests and OPTIONS preflight.";
      } else if (error.status === 403) {
        errorMessage =
          "Forbidden. This might be a CORS issue with PUT requests. Check your backend CORS configuration.";
      } else if (error.status === 404) {
        errorMessage = "Product not found";
      } else if (error.status === 409) {
        errorMessage = "Cannot update this product due to a conflict";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Failed to update product",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Accept an object with code and action
    mutationFn: ({ code }: { code: string; action: "archive" | "delete" }) =>
      apiClient.deleteProduct(code),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title:
          variables.action === "delete"
            ? "Product deleted"
            : "Product archived",
        description:
          variables.action === "delete"
            ? "Product has been successfully deleted"
            : "Product has been successfully archived",
      });
    },
    onError: (error: ApiError, variables) => {
      let errorMessage = "An unexpected error occurred";

      if (error.status === 409) {
        errorMessage =
          "Cannot delete product because it has active orders. The product will be archived instead.";
        // Still invalidate queries since the product might have been archived
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else if (error.status === 404) {
        errorMessage = "Product not found";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title:
          variables?.action === "delete"
            ? "Failed to delete product"
            : "Failed to archive product",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};