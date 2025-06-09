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
import { Trash2, AlertTriangle } from "lucide-react";

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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              Delete Product
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-2">
            <p>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Product:</span>
                  <span>{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span>{formatCurrency(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Stock:</span>
                  <span>
                    {product.stock} {product.unit || "units"}
                  </span>
                </div>
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="font-medium">SKU:</span>
                    <span>{product.sku}</span>
                  </div>
                )}
              </div>
            </div>

            {product.stock > 0 && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <strong>Warning:</strong> This product still has{" "}
                    {product.stock} units in stock. Deleting it will remove all
                    inventory records.
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Delete Product</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
