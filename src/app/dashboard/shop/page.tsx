"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Star, Search, Filter, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { productsApi, Product } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import SafeImage from "@/components/ui/SafeImage";


// ------- Shop Page Component -------
export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToCart } = useCart();
  const { formatPrice } = useTheme();

  useEffect(() => {
    productsApi.getAll({ limit: 50 })
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id || product.id || "",
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Shop"
        description="Browse fitness equipment, nutrition, and programs"
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
          />
        </div>
        <Button variant="outline" className="border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div key={product._id || product.id} className="rounded-2xl bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="h-32 rounded-xl bg-gray-50 dark:bg-gray-800/50 overflow-hidden relative">
                <SafeImage
                  src={product.image?.startsWith("http") ? product.image : "/Images/placeholder.svg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div>
                <Badge className="bg-primary/10 text-primary border-0 text-xs mb-1">{product.category}</Badge>
                <h3 className="text-gray-800 dark:text-gray-100 font-semibold">{product.name}</h3>
                {(product.rating !== undefined) && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-yellow-600">{product.rating}</span>
                    {product.reviewCount !== undefined && (
                      <span className="text-xs text-gray-400">({product.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-800 dark:text-gray-100 font-bold">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-gray-400 text-sm line-through ml-2">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={(product.stock !== undefined) && product.stock === 0}
                  onClick={() => handleAddToCart(product)}
                  className="bg-primary hover:bg-primary/90 text-white gap-1 disabled:opacity-40"
                >
                  <ShoppingCart className="h-3 w-3" />
                  {product.stock === 0 ? "Out of stock" : "Add"}
                </Button>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">No products found.</div>
          )}
        </div>
      )}
    </div>
  );
}
