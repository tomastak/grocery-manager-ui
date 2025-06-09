import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product";

// Schema based on the exact OpenAPI specification
const createProductSchema = z.object({
  code: z
    .string()
    .min(1, "Product code is required")
    .max(50, "Product code must be 50 characters or less")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Product code can only contain letters, numbers, hyphens, and underscores",
    ),
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be 255 characters or less"),
  stockQuantity: z
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),
  pricePerUnit: z.number().min(0.01, "Price per unit must be at least $0.01"),
});

const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be 255 characters or less"),
  stockQuantity: z
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),
  pricePerUnit: z.number().min(0.01, "Price per unit must be at least $0.01"),
});

type CreateProductFormData = z.infer<typeof createProductSchema>;
type UpdateProductFormData = z.infer<typeof updateProductSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: CreateProductRequest | UpdateProductRequest,
  ) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

export const ProductForm = ({
  open,
  onOpenChange,
  onSubmit,
  product,
  isLoading,
}: ProductFormProps) => {
  const isEdit = !!product;
  const schema = isEdit ? updateProductSchema : createProductSchema;

  const form = useForm<CreateProductFormData | UpdateProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name: "",
          stockQuantity: 0,
          pricePerUnit: 0,
        }
      : {
          code: "",
          name: "",
          stockQuantity: 0,
          pricePerUnit: 0,
        },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        stockQuantity: product.stockQuantity,
        pricePerUnit: product.pricePerUnit,
      });
    } else {
      form.reset({
        code: "",
        name: "",
        stockQuantity: 0,
        pricePerUnit: 0,
      });
    }
  }, [product, form]);

  const handleSubmit = async (
    data: CreateProductFormData | UpdateProductFormData,
  ) => {
    try {
      await onSubmit(data as CreateProductRequest | UpdateProductRequest);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the product information below."
              : "Fill in the product details to add it to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {!isEdit && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter unique product code (e.g., APPLE001)"
                        {...field}
                        className="bg-white font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for the product. Use letters, numbers,
                      hyphens, and underscores only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product name"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormDescription>
                    Descriptive name for the product (max 255 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Unit *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="bg-white pl-8"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Price in USD (minimum $0.01)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="bg-white"
                      />
                    </FormControl>
                    <FormDescription>
                      Current inventory quantity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEdit && product && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-gray-700">
                    Current Product:
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded border text-xs">
                      {product.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Name:</span>
                    <span>{product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Price:</span>
                    <span>${product.pricePerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Stock:</span>
                    <span>{product.stockQuantity}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-grocery-500 to-fresh-500 hover:from-grocery-600 hover:to-fresh-600"
              >
                {isLoading
                  ? "Saving..."
                  : isEdit
                    ? "Update Product"
                    : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
