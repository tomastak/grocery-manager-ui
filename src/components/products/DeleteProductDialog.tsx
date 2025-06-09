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
import { Product } from "@/types/product";
import { Archive, AlertTriangle, Info } from "lucide-react";

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
  if (!product) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
    }).format(amount);
  };

  const totalValue = product.pricePerUnit * product.stockQuantity;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              <Archive className="w-5 h-5 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              Archive Product
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            Are you sure you want to archive this product? This action will
            remove it from the active inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 px-6">
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

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Note:</strong>
                  <p>
                    If this product has active orders (PENDING or PAID), it will
                    be archived but not permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            {product.stockQuantity > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <strong>Warning:</strong> This product still has{" "}
                    {product.stockQuantity} units in stock worth{" "}
                    {formatCurrency(totalValue)}. Consider transferring or
                    managing this inventory before archiving.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <AlertDialogHeader></AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Archiving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Archive className="w-4 h-4" />
                <span>Archive Product</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
