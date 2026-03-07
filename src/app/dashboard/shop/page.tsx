"use client";

import { ShoppingCart, Star, Search, Filter } from "lucide-react";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const products = [
  { id: 1, name: "Adjustable Dumbbell Set", price: 129.99, originalPrice: 159.99, rating: 4.8, reviews: 124, category: "Equipment", inStock: true },
  { id: 2, name: "Premium Whey Protein", price: 39.99, originalPrice: 49.99, rating: 4.6, reviews: 89, category: "Nutrition", inStock: true },
  { id: 3, name: "Pro Yoga Mat", price: 49.99, rating: 4.7, reviews: 67, category: "Equipment", inStock: true },
  { id: 4, name: "Resistance Bands Set", price: 24.99, originalPrice: 34.99, rating: 4.5, reviews: 103, category: "Equipment", inStock: false },
  { id: 5, name: "HIIT Program Pack", price: 29.99, rating: 4.9, reviews: 212, category: "Program", inStock: true },
  { id: 6, name: "Muscle Recovery Cream", price: 19.99, originalPrice: 24.99, rating: 4.4, reviews: 58, category: "Recovery", inStock: true },
];

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <DashboardTopBar title="Shop" />
      <DashboardHeader
        title="Shop"
        description="Browse fitness equipment, nutrition, and programs"
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search products..." className="pl-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400" />
        </div>
        <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100 gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="h-32 rounded-xl bg-gray-50 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-gray-200" />
            </div>
            <div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs mb-1">{product.category}</Badge>
              <h3 className="text-gray-800 font-semibold">{product.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-yellow-600">{product.rating}</span>
                <span className="text-xs text-gray-400">({product.reviews} reviews)</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
              <div>
                <span className="text-gray-800 font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-gray-400 text-sm line-through ml-2">${product.originalPrice}</span>
                )}
              </div>
              <Button
                size="sm"
                disabled={!product.inStock}
                className="bg-primary hover:bg-primary/90 text-white gap-1 disabled:opacity-40"
              >
                <ShoppingCart className="h-3 w-3" />
                {product.inStock ? "Add" : "Out of stock"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
