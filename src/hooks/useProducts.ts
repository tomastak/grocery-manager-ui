import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ApiError,
} from "@/types/product";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(),
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
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
        description: `${newProduct.name} has been successfully created`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Failed to create product",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...product }: UpdateProductRequest) =>
      apiClient.updateProduct(id, product),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["product", updatedProduct.id],
      });
      toast({
        title: "Product updated",
        description: `${updatedProduct.name} has been successfully updated`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Failed to update product",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Failed to delete product",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};
