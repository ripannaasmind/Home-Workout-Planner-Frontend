"use client";

import { Dumbbell, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  iconBg: string;
  icon: React.ElementType;
  iconColor: string;
  type: "cart" | "view";
}

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Adjustable Dumbbell",
    price: 39.00,
    image: "",
    category: "Equipment",
    iconBg: "bg-gray-100",
    icon: Dumbbell,
    iconColor: "text-gray-600",
    type: "cart",
  },
  {
    id: "2",
    name: "Whey Protein Powder",
    price: 49.00,
    image: "",
    category: "Supplements",
    iconBg: "bg-blue-50",
    icon: Package,
    iconColor: "text-blue-500",
    type: "view",
  },
];

export function RecommendedForYouList({ products = defaultProducts }: { products?: Product[] }) {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Recommended for You</h3>
      <div className="space-y-3">
        {products.map((product) => {
          const Icon = product.icon;
          return (
            <div key={product.id} className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${product.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${product.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{product.name}</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">${product.price.toFixed(2)}</p>
              </div>
              {product.type === "cart" ? (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-3 gap-1 shrink-0"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add
                </Button>
              ) : (
                <Link
                  href="/dashboard/workouts"
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary whitespace-nowrap transition-colors"
                >
                  View Workout
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
