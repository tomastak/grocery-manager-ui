import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
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
import {
  Plus,
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Refresh,
  AlertCircle,
} from "lucide-react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { Product, CreateProductRequest } from "@/types/product";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Calculate statistics
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0,
  );
  const lowStockCount = products.filter(
    (product) => product.stock <= 10,
  ).length;
  const outOfStockCount = products.filter(
    (product) => product.stock === 0,
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCreateProduct = async (data: CreateProductRequest) => {
    await createProductMutation.mutateAsync(data);
  };

  const handleUpdateProduct = async (data: CreateProductRequest) => {
    if (!editingProduct) return;
    await updateProductMutation.mutateAsync({ id: editingProduct.id, ...data });
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
    await deleteProductMutation.mutateAsync(productToDelete.id);
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
                <Refresh className="w-4 h-4 mr-1" />
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
          <Button
            onClick={() => setProductFormOpen(true)}
            className="bg-gradient-to-r from-grocery-500 to-fresh-500 hover:from-grocery-600 hover:to-fresh-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Products
              </CardTitle>
              <Package className="h-5 w-5 text-grocery-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalProducts}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active inventory items
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Value
              </CardTitle>
              <DollarSign className="h-5 w-5 text-fresh-600" />
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
              <TrendingUp className="h-5 w-5 text-organic-500" />
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
              <AlertTriangle className="h-5 w-5 text-red-500" />
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

        {/* Alerts for stock issues */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
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
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="shrink-0"
              >
                <Refresh
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
