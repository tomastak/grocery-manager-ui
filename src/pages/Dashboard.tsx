import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { DevelopmentBanner } from "@/components/dev/DevelopmentBanner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Package,
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  RefreshCw,
  AlertCircle,
  Archive,
} from "lucide-react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [onlyActive, setOnlyActive] = useState(true);
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts(onlyActive);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Calculate statistics based on the actual API fields
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.pricePerUnit * product.stockQuantity,
    0,
  );
  const lowStockCount = products.filter(
    (product) => product.stockQuantity <= 10 && product.stockQuantity > 0,
  ).length;
  const outOfStockCount = products.filter(
    (product) => product.stockQuantity === 0,
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
    }).format(amount);
  };

  const handleCreateProduct = async (data: CreateProductRequest) => {
    await createProductMutation.mutateAsync(data);
  };

  const handleUpdateProduct = async (data: UpdateProductRequest) => {
    if (!editingProduct) return;
    await updateProductMutation.mutateAsync({
      code: editingProduct.code,
      ...data,
    } as UpdateProductRequest & { code: string });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    await deleteProductMutation.mutateAsync(productToDelete.code);
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleFormClose = () => {
    setProductFormOpen(false);
    setEditingProduct(null);
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load products:{" "}
              {(error as any)?.message || "An unexpected error occurred"}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Development Banner */}
        <DevelopmentBanner />

        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Inventory
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your store's product catalog and inventory levels
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-archived"
                checked={!onlyActive}
                onCheckedChange={(checked) => setOnlyActive(!checked)}
              />
              <Label htmlFor="show-archived" className="text-sm text-gray-600">
                Show archived products
              </Label>
              {!onlyActive && (
                <Badge variant="secondary" className="text-xs">
                  <Archive className="w-3 h-3 mr-1" />
                  Including archived
                </Badge>
              )}
            </div>
            <Button
              onClick={() => setProductFormOpen(true)}
              className="bg-gradient-to-r from-grocery-500 to-fresh-500 hover:from-grocery-600 hover:to-fresh-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Products
              </CardTitle>
              <Package className="h-7 w-7 text-grocery-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalProducts}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {onlyActive ? "Active" : "Active + archived"} inventory items
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Value
              </CardTitle>
              <PiggyBank className="h-7 w-7 text-fresh-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current inventory value
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Low Stock
              </CardTitle>
              <TrendingUp className="h-7 w-7 text-organic-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">
                  {lowStockCount}
                </div>
                {lowStockCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Alert
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Items with ≤10 stock</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Out of Stock
              </CardTitle>
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">
                  {outOfStockCount}
                </div>
                {outOfStockCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Critical
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Items with 0 stock</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts for stock issues (only for active products) */}
        {onlyActive && (lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="space-y-3">
            {outOfStockCount > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{outOfStockCount}</strong> product
                  {outOfStockCount !== 1 ? "s are" : " is"} out of stock.
                  Consider restocking to maintain availability.
                </AlertDescription>
              </Alert>
            )}
            {lowStockCount > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{lowStockCount}</strong> product
                  {lowStockCount !== 1 ? "s have" : " has"} low stock levels.
                  Review inventory and consider reordering.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Products Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Product Catalog
                </CardTitle>
                <CardDescription>
                  Manage your product inventory with real-time updates
                  {!onlyActive && " (including archived products)"}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="shrink-0"
              >
                <RefreshCw
                  className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ProductTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Product Form Dialog */}
      <ProductForm
        open={productFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        product={editingProduct}
        isLoading={
          createProductMutation.isPending || updateProductMutation.isPending
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        product={productToDelete}
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}
