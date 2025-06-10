import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";
import {
  Archive,
  AlertTriangle,
  Info,
  Trash2,
  ShoppingCart,
  Ban,
  CheckCircle2,
} from "lucide-react";
import {
  useProductOrderStatus,
  useDeletionAction,
} from "@/hooks/useProductOrders";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  product: Product | null;
  isLoading?: boolean;
}

export const DeleteProductDialog = ({
  open,
  onOpenChange,
  onConfirm,
  product,
  isLoading,
}: DeleteProductDialogProps) => {
  // Get order status for the product
  const {
    hasActiveOrders,
    hasFinishedOrders,
    isLoading: isCheckingOrders,
    isError: orderCheckError,
  } = useProductOrderStatus(product?.code || "", open && !!product);

  // Determine what action can be taken
  const deletionAction = useDeletionAction(hasActiveOrders, hasFinishedOrders);

  if (!product) return null;

  // If product is archived, override action to block deletion
  const isArchived = product.archived;
  const finalAction = isArchived
    ? {
        ...deletionAction,
        action: "none" as const,
        reason: "Archived products cannot be deleted or archived.",
        actionButtonText: "Cannot Delete",
        actionButtonDisabled: true,
      }
    : deletionAction;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
    }).format(amount);
  };

  const totalValue = product.pricePerUnit * product.stockQuantity;

  const getActionIcon = () => {
    switch (finalAction.action) {
      case "delete":
        return <Trash2 className="w-5 h-5 text-red-600" />;
      case "archive":
        return <Archive className="w-5 h-5 text-orange-600" />;
      case "none":
        return <Ban className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = () => {
    switch (finalAction.action) {
      case "delete":
        return "bg-red-100";
      case "archive":
        return "bg-orange-100";
      case "none":
        return "bg-gray-100";
    }
  };

  const getActionTitle = () => {
    switch (finalAction.action) {
      case "delete":
        return "Delete Product";
      case "archive":
        return "Archive Product";
      case "none":
        return "Cannot Delete Product";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center justify-center w-10 h-10 ${getActionColor()} rounded-full`}
            >
              {getActionIcon()}
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              {getActionTitle()}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {isCheckingOrders
              ? "Checking product orders to determine available actions..."
              : orderCheckError
                ? "Error checking product orders. Please try again."
                : "Review the product details and order status below."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 px-6">
          {/* Product Details */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Product Code:</span>
                <span className="font-mono bg-white px-2 py-1 rounded border text-sm">
                  {product.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span
                  className="text-right max-w-xs truncate"
                  title={product.name}
                >
                  {product.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Price per Unit:</span>
                <span>{formatCurrency(product.pricePerUnit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Stock Quantity:</span>
                <span>{product.stockQuantity}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Value:</span>
                <span>{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>

          {/* Order Status Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-medium">Order Status</span>
            </div>

            {isCheckingOrders ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : orderCheckError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <strong>Error:</strong> Could not check order status. Please
                    try again.
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Active Orders Status */}
                <div
                  className={`p-3 rounded-lg border ${hasActiveOrders ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
                >
                  <div className="flex items-center space-x-2">
                    {hasActiveOrders ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    <div className="text-sm">
                      <div className="font-medium">Active Orders</div>
                      <div
                        className={
                          hasActiveOrders ? "text-red-700" : "text-green-700"
                        }
                      >
                        {hasActiveOrders
                          ? "Has active orders"
                          : "No active orders"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finished Orders Status */}
                <div
                  className={`p-3 rounded-lg border ${hasFinishedOrders ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}
                >
                  <div className="flex items-center space-x-2">
                    {hasFinishedOrders ? (
                      <Info className="w-4 h-4 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    <div className="text-sm">
                      <div className="font-medium">Finished Orders</div>
                      <div
                        className={
                          hasFinishedOrders
                            ? "text-orange-700"
                            : "text-green-700"
                        }
                      >
                        {hasFinishedOrders
                          ? "Has finished orders"
                          : "No finished orders"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Explanation */}
          {!isCheckingOrders && !orderCheckError && (
            <div
              className={`p-4 rounded-lg border ${
                finalAction.action === "delete"
                  ? "bg-red-50 border-red-200"
                  : finalAction.action === "archive"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    finalAction.action === "delete"
                      ? "bg-red-100"
                      : finalAction.action === "archive"
                        ? "bg-orange-100"
                        : "bg-gray-100"
                  }`}
                >
                  {getActionIcon()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">
                      {finalAction.action === "delete" &&
                        "Permanent Deletion"}
                      {finalAction.action === "archive" && "Archive Only"}
                      {finalAction.action === "none" && "Action Blocked"}
                    </h4>
                    <Badge
                      variant={
                        finalAction.action === "delete"
                          ? "destructive"
                          : finalAction.action === "archive"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {finalAction.action === "delete" && "Permanent"}
                      {/*{finalAction.action === "archive" && "Reversible"}*/}
                      {finalAction.action === "none" && "Blocked"}
                    </Badge>
                  </div>
                  <p
                    className={`text-sm ${
                      finalAction.action === "delete"
                        ? "text-red-700"
                        : finalAction.action === "archive"
                          ? "text-orange-700"
                          : "text-gray-700"
                    }`}
                  >
                    {finalAction.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stock Warning */}
          {product.stockQuantity > 0 && finalAction.canDelete && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <strong>Stock Warning:</strong> This product still has{" "}
                  {product.stockQuantity} units in stock worth{" "}
                  {formatCurrency(totalValue)}. This inventory will be
                  permanently lost.
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={
              isLoading ||
              finalAction.actionButtonDisabled ||
              isCheckingOrders
            }
            className={
              finalAction.action === "delete"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : finalAction.action === "archive"
                  ? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
                  : "bg-gray-600 hover:bg-gray-700 focus:ring-gray-600"
            }
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : isCheckingOrders ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {getActionIcon()}
                <span>{finalAction.actionButtonText}</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
