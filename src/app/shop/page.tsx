"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart, Product } from "@/context/CartContext";
import { productsApi } from "@/services/api";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  ShoppingCart,
  Check,
  X,
  ChevronLeft,
  Dumbbell,
  ChevronRight,
  Loader2,
} from "lucide-react";

// Fallback products data
const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Adjustable Dumbbell Set",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=400&h=400&fit=crop",
    category: "Dumbbells",
    description: "Professional adjustable dumbbells 5-52.5 lbs",
  },
  {
    id: "2",
    name: "Premium Yoga Mat",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=400&fit=crop",
    category: "Yoga Mats",
    description: "Extra thick eco-friendly yoga mat",
  },
  {
    id: "3",
    name: "Resistance Bands Set",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop",
    category: "Resistance Bands",
    description: "5-piece resistance bands with handles",
  },
  {
    id: "4",
    name: "Protein Powder - Chocolate",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
    category: "Supplements",
    description: "25g protein per serving, 2lb container",
  },
  {
    id: "5",
    name: "Cast Iron Kettlebell 20lb",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
    category: "Dumbbells",
    description: "Solid cast iron with vinyl coating",
  },
  {
    id: "6",
    name: "Foam Roller Pro",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400&h=400&fit=crop",
    category: "Accessories",
    description: "High density foam for muscle recovery",
  },
  {
    id: "7",
    name: "Cork Yoga Block Set",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=400&h=400&fit=crop",
    category: "Yoga Mats",
    description: "Set of 2 natural cork yoga blocks",
  },
  {
    id: "8",
    name: "Pre-Workout Energy",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1579722820903-96078fb7d59d?w=400&h=400&fit=crop",
    category: "Supplements",
    description: "Maximum energy and focus formula",
  },
  {
    id: "9",
    name: "Pull-Up Resistance Bands",
    price: 35.99,
    image: "https://images.unsplash.com/photo-1616279969096-54b228f5f889?w=400&h=400&fit=crop",
    category: "Resistance Bands",
    description: "Heavy duty bands for pull-up assist",
  },
  {
    id: "10",
    name: "Hex Dumbbell Pair 25lb",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop",
    category: "Dumbbells",
    description: "Rubber coated hex dumbbells",
  },
  {
    id: "11",
    name: "BCAA Recovery Powder",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1579722821273-0f6c1c4e4e88?w=400&h=400&fit=crop",
    category: "Supplements",
    description: "Branch chain amino acids for recovery",
  },
  {
    id: "12",
    name: "Travel Yoga Mat",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
    category: "Yoga Mats",
    description: "Foldable lightweight travel mat",
  },
];

const categories = ["All", "Dumbbells", "Yoga Mats", "Resistance Bands", "Supplements", "Accessories", "Equipment"];

const ITEMS_PER_PAGE = 8;

export default function ShopPage() {
  const { addToCart, cart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getAll();
        if (response.success && response.data && response.data.length > 0) {
          // Map API response to Product interface
          const mappedProducts: Product[] = response.data.map((p, index) => ({
            id: p._id || p.id || String(index + 1),
            name: p.name,
            price: p.price,
            image: p.image,
            category: p.category,
            description: p.description || "",
          }));
          setAllProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Keep fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = allProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
  };

  const isInCart = (productId: string) => {
    return cart.some((item) => item.id === productId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              Premium Equipment
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              Fitness Shop
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-text-secondary max-w-2xl mx-auto">
              Quality equipment to enhance your home workout experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <div className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category
                            ? "bg-primary text-white"
                            : "text-text-secondary hover:bg-muted"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => {
                      setPriceRange(value);
                      setCurrentPage(1);
                    }}
                    max={300}
                    step={10}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between mb-6">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 h-10"
                  />
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {/* Mobile Filter Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden h-10"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40 h-10">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <div className="hidden sm:flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 rounded-r-none ${viewMode === "grid" ? "bg-muted" : ""}`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 rounded-l-none ${viewMode === "list" ? "bg-muted" : ""}`}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden bg-card rounded-xl p-4 border border-border mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Category Select */}
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => {
                        setPriceRange(value);
                        setCurrentPage(1);
                      }}
                      max={300}
                      step={10}
                    />
                  </div>
                </motion.div>
              )}

              {/* Results Count */}
              <p className="text-sm text-text-secondary mb-4">
                Showing {paginatedProducts.length} of {filteredProducts.length} products
              </p>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-text-secondary">Loading products...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
              /* Products Grid */
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
                      : "space-y-4"
                  }
                >
                  {paginatedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      {viewMode === "grid" ? (
                        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                          {/* Product Image */}
                          <div className="relative aspect-[3/2] bg-muted overflow-hidden">
                            {product.image && product.image.startsWith("http") ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                                <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-primary/60" />
                              </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                onClick={() => handleAddToCart(product)}
                                className="bg-primary hover:bg-primary-dark text-white"
                                disabled={addedToCart === product.id}
                              >
                                {addedToCart === product.id ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" /> Added
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                                  </>
                                )}
                              </Button>
                            </div>
                            {/* In Cart Badge */}
                            {isInCart(product.id) && (
                              <Badge className="absolute top-2 right-2 bg-accent text-white text-xs">
                                In Cart
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-2.5 sm:p-3">
                            <Badge variant="outline" className="mb-1.5 text-xs">
                              {product.category}
                            </Badge>
                            <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-0.5">
                              {product.name}
                            </h3>
                            <p className="text-xs text-text-secondary line-clamp-1 mb-1.5">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm sm:text-base font-bold text-primary">
                                ${product.price.toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs sm:text-sm text-text-secondary">4.8</span>
                              </div>
                            </div>
                            {/* Mobile Add to Cart */}
                            <Button
                              onClick={() => handleAddToCart(product)}
                              className="w-full mt-2 sm:hidden bg-primary hover:bg-primary-dark text-white h-8 text-xs"
                              disabled={addedToCart === product.id}
                            >
                              {addedToCart === product.id ? "Added!" : "Add to Cart"}
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        /* List View */
                        <Card className="overflow-hidden">
                          <div className="flex gap-4 p-4">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg overflow-hidden relative shrink-0">
                              {product.image && product.image.startsWith("http") ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                                  <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-primary/60" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className="mb-1 text-xs">
                                {product.category}
                              </Badge>
                              <h3 className="font-semibold text-foreground text-base sm:text-lg">
                                {product.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-text-secondary mb-2">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-4">
                                <span className="text-lg sm:text-xl font-bold text-primary">
                                  ${product.price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-text-secondary">4.8</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Button
                                onClick={() => handleAddToCart(product)}
                                className="bg-primary hover:bg-primary-dark text-white whitespace-nowrap"
                                disabled={addedToCart === product.id}
                              >
                                {addedToCart === product.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <ShoppingCart className="h-4 w-4" />
                                )}
                                <span className="ml-2 hidden sm:inline">
                                  {addedToCart === product.id ? "Added" : "Add"}
                                </span>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="text-4xl sm:text-5xl mb-4">🔍</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                    No products found
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className={`h-9 w-9 ${currentPage === page ? "bg-primary" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
