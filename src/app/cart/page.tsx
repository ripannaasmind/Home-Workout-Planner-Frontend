"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart, Product } from "@/context/CartContext";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Tag,
  Dumbbell,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Related products for upselling
const relatedProducts: Product[] = [
  {
    id: "rel-1",
    name: "Workout Gloves",
    price: 24.99,
    image: "/products/gloves.jpg",
    category: "Accessories",
    description: "Padded workout gloves",
  },
  {
    id: "rel-2",
    name: "Shaker Bottle",
    price: 14.99,
    image: "/products/shaker.jpg",
    category: "Accessories",
    description: "BPA-free protein shaker",
  },
  {
    id: "rel-3",
    name: "Gym Towel",
    price: 19.99,
    image: "/products/towel.jpg",
    category: "Accessories",
    description: "Quick-dry microfiber towel",
  },
  {
    id: "rel-4",
    name: "Jump Rope Pro",
    price: 18.99,
    image: "/products/jumprope.jpg",
    category: "Accessories",
    description: "Speed jump rope with counter",
  },
];

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, addToCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const shippingCost = totalPrice >= 100 ? 0 : 9.99;
  const tax = (totalPrice - promoDiscount) * 0.08;
  const finalTotal = totalPrice - promoDiscount + shippingCost + tax;

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "fit10") {
      setPromoDiscount(totalPrice * 0.1);
      setPromoApplied(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                  Shopping Cart
                </h1>
                <p className="text-sm sm:text-base text-text-secondary">
                  {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
                </p>
              </div>
              <Link href="/shop">
                <Button variant="outline" className="h-10 text-sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </motion.div>

          {cart.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="flex-1">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    {/* Cart Header - Desktop */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-medium text-text-secondary mb-4 pb-4 border-b border-border">
                      <div className="col-span-6">Product</div>
                      <div className="col-span-2 text-center">Price</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-4 sm:space-y-0 sm:divide-y sm:divide-border">
                      {cart.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="sm:py-4 first:pt-0 last:pb-0"
                        >
                          {/* Mobile Layout */}
                          <div className="sm:hidden bg-muted/50 rounded-lg p-4">
                            <div className="flex gap-3 mb-3">
                              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden relative shrink-0">
                                {item.image && item.image.startsWith("http") ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                                    <Dumbbell className="w-8 h-8 text-primary/60" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-text-secondary mt-1">
                                  {item.category}
                                </p>
                                <p className="text-sm font-bold text-primary mt-1">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-10 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-base font-bold text-foreground">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                            {/* Product Info */}
                            <div className="col-span-6 flex items-center gap-4">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-muted rounded-lg overflow-hidden relative shrink-0">
                                {item.image && item.image.startsWith("http") ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                                    <Dumbbell className="w-8 h-8 lg:w-10 lg:h-10 text-primary/60" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-foreground text-sm lg:text-base line-clamp-1">
                                  {item.name}
                                </h3>
                                <p className="text-xs lg:text-sm text-text-secondary">
                                  {item.category}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-0 text-destructive hover:text-destructive text-xs"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="col-span-2 text-center">
                              <span className="text-sm lg:text-base font-medium">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2 flex justify-center">
                              <div className="flex items-center border border-border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-10 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Total */}
                            <div className="col-span-2 text-right">
                              <span className="text-sm lg:text-base font-bold text-foreground">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Clear Cart */}
                    <div className="mt-6 pt-4 border-t border-border flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={clearCart}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Products */}
                <div className="mt-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                    You might also like
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {relatedProducts.map((product) => (
                      <div key={product.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow overflow-hidden">
                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                          {product.image && product.image.startsWith("http") ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                              <Dumbbell className="w-10 h-10 text-primary/40" />
                            </div>
                          )}
                        </div>
                        {/* Body */}
                        <div className="p-4 flex flex-col gap-2 flex-1">
                          <span className="self-start text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                          <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                            <span className="text-base font-bold text-primary">${product.price.toFixed(2)}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-500">4.8</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-white gap-1.5 h-8 text-xs"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-80 xl:w-96">
                <Card className="sticky top-24">
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Order Summary
                    </h2>

                    {/* Promo Code */}
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="pl-10 h-10"
                            disabled={promoApplied}
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="h-10"
                          onClick={handleApplyPromo}
                          disabled={promoApplied || !promoCode}
                        >
                          {promoApplied ? "Applied" : "Apply"}
                        </Button>
                      </div>
                      {promoApplied && (
                        <p className="text-xs text-accent mt-1">
                          Promo code FIT10 applied! (-10%)
                        </p>
                      )}
                      <p className="text-xs text-text-secondary mt-1">
                        Try &quot;FIT10&quot; for 10% off
                      </p>
                    </div>

                    <Separator className="my-4" />

                    {/* Summary Details */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Subtotal</span>
                        <span className="font-medium">${totalPrice.toFixed(2)}</span>
                      </div>
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-accent">
                          <span>Discount</span>
                          <span>-${promoDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Shipping</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? (
                            <span className="text-accent">Free</span>
                          ) : (
                            `$${shippingCost.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Tax (8%)</span>
                        <span className="font-medium">${tax.toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Total */}
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-base font-semibold text-foreground">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Free Shipping Notice */}
                    {totalPrice < 100 && (
                      <div className="bg-primary/10 rounded-lg p-3 mb-4">
                        <p className="text-xs sm:text-sm text-primary text-center">
                          Add ${(100 - totalPrice).toFixed(2)} more for free shipping!
                        </p>
                      </div>
                    )}

                    {/* Checkout Button */}
                    <Button className="w-full h-11 sm:h-12 bg-primary hover:bg-primary-dark text-white text-sm sm:text-base font-semibold">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Proceed to Checkout
                    </Button>

                    {/* Secure Checkout */}
                    <p className="text-xs text-text-secondary text-center mt-3">
                      🔒 Secure checkout powered by Stripe
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Empty Cart */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 sm:py-16 lg:py-20"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-sm sm:text-base text-text-secondary mb-6 max-w-md mx-auto">
                Looks like you haven&apos;t added any items to your cart yet. 
                Start shopping to find amazing fitness products!
              </p>
              <Link href="/shop">
                <Button className="h-11 px-6 bg-primary hover:bg-primary-dark text-white">
                  Start Shopping
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
