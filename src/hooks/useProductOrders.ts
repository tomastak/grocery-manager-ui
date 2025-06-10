import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export const useProductActiveOrders = (
  productCode: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["product-active-orders", productCode],
    queryFn: () => apiClient.hasActiveOrders(productCode),
    enabled: enabled && !!productCode,
    staleTime: 30000, // Cache for 30 seconds
  });
};

export const useProductFinishedOrders = (
  productCode: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["product-finished-orders", productCode],
    queryFn: () => apiClient.hasFinishedOrders(productCode),
    enabled: enabled && !!productCode,
    staleTime: 30000, // Cache for 30 seconds
  });
};

// Combined hook for getting both order statuses
export const useProductOrderStatus = (
  productCode: string,
  enabled: boolean = true,
) => {
  const activeOrdersQuery = useProductActiveOrders(productCode, enabled);
  const finishedOrdersQuery = useProductFinishedOrders(productCode, enabled);

  return {
    hasActiveOrders: activeOrdersQuery.data ?? false,
    hasFinishedOrders: finishedOrdersQuery.data ?? false,
    isLoading: activeOrdersQuery.isLoading || finishedOrdersQuery.isLoading,
    isError: activeOrdersQuery.isError || finishedOrdersQuery.isError,
    error: activeOrdersQuery.error || finishedOrdersQuery.error,
  };
};

// Helper hook to determine deletion action
export const useDeletionAction = (
  hasActiveOrders: boolean,
  hasFinishedOrders: boolean,
) => {
  if (hasActiveOrders) {
    return {
      canDelete: false,
      canArchive: false,
      action: "none" as const,
      reason:
        "Product has active orders (PENDING or PAID) and cannot be deleted or archived.",
      actionButtonText: "Cannot Delete",
      actionButtonDisabled: true,
    };
  }

  if (hasFinishedOrders) {
    return {
      canDelete: false,
      canArchive: true,
      action: "archive" as const,
      reason:
        "Product has finished orders and will be archived (not permanently deleted).",
      actionButtonText: "Archive Product",
      actionButtonDisabled: false,
    };
  }

  return {
    canDelete: true,
    canArchive: false,
    action: "delete" as const,
    reason: "Product has no orders and will be permanently deleted.",
    actionButtonText: "Delete Product",
    actionButtonDisabled: false,
  };
};
