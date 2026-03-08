"use client";

import { ShoppingCart, Dumbbell, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
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
}

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Adjustable Dumbbell",
    price: 89.00,
    image: "",
    category: "Equipment",
    iconBg: "bg-gray-100",
    icon: Dumbbell,
    iconColor: "text-gray-600",
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
  },
];

interface RecommendedForYouGridProps {
  products?: Product[];
}

export function RecommendedForYouGrid({ products = defaultProducts }: RecommendedForYouGridProps) {
  const { addToCart } = useCart();
  const { formatPrice } = useTheme();

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
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Recommended for You</h3>
      <div className="space-y-3">
        {products.map((product) => {
          const Icon = product.icon;
          return (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${product.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${product.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{product.name}</p>
                <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-3 gap-1 shrink-0"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
