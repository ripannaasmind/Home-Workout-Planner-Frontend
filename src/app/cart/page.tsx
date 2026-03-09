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
import { useTheme } from "@/context/ThemeContext";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Tag,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productsApi, promoApi } from "@/services/api";
import toast from "react-hot-toast";


// ------- Cart Page Component -------
export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, addToCart } = useCart();
  const { formatPrice } = useTheme();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoData, setPromoData] = useState<{ code: string; discount: number; discountType: string; discountValue: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.getAll({ limit: 4 }).then((res) => {
      setRelatedProducts(
        res.data.map((p) => ({
          id: p._id || p.id || "",
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category,
          description: p.description || "",
        }))
      );
    }).catch(() => {});
  }, []);

  const shippingCost = totalPrice >= 100 ? 0 : 9.99;
  const tax = (totalPrice - promoDiscount) * 0.08;
  const finalTotal = totalPrice - promoDiscount + shippingCost + tax;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await promoApi.validate(promoCode.trim(), totalPrice);
      setPromoData(res.data);
      setPromoDiscount(res.data.discount);
      setPromoApplied(true);
      toast.success(`Promo "${res.data.code}" applied! -${formatPrice(res.data.discount)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid promo code";
      toast.error(msg);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoData(null);
  };

  const handleCheckout = () => {
    const params = new URLSearchParams();
    if (promoData) {
      params.set("promo", promoData.code);
      params.set("discount", String(promoData.discount));
    }
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {}
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
              {}
              <div className="flex-1">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    {}
                    <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-medium text-text-secondary mb-4 pb-4 border-b border-border">
                      <div className="col-span-6">Product</div>
                      <div className="col-span-2 text-center">Price</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>

                    {}
                    <div className="space-y-4 sm:space-y-0 sm:divide-y sm:divide-border">
                      {cart.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="sm:py-4 first:pt-0 last:pb-0"
                        >
                          {}
                          <div className="sm:hidden bg-muted/50 rounded-lg p-4">
                            <div className="flex gap-3 mb-3">
                              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden relative shrink-0">
                                {item.image && item.image.startsWith("http") ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                  <Image
                                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&auto=format"
                                    alt={item.name}
                                    fill
                                    className="object-cover opacity-70"
                                  />
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
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white shrink-0"
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
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>

                          {}
                          <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                            {}
                            <div className="col-span-6 flex items-center gap-4">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-muted rounded-lg overflow-hidden relative shrink-0">
                                {item.image && item.image.startsWith("http") ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                  <Image
                                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&auto=format"
                                    alt={item.name}
                                    fill
                                    className="object-cover opacity-70"
                                  />
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
                                  className="h-7 px-0 text-destructive hover:bg-destructive hover:text-white text-xs"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>

                            {}
                            <div className="col-span-2 text-center">
                              <span className="text-sm lg:text-base font-medium">
                                {formatPrice(item.price)}
                              </span>
                            </div>

                            {}
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

                            {}
                            <div className="col-span-2 text-right">
                              <span className="text-sm lg:text-base font-bold text-foreground">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {}
                    <div className="mt-6 pt-4 border-t border-border flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-white"
                        onClick={clearCart}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {}
                <div className="mt-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                    You might also like
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {relatedProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden group p-0 gap-0 cursor-pointer">
                        <div className="aspect-square bg-muted relative overflow-hidden rounded-t-xl">
                          {product.image && product.image.startsWith("http") ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <Image
                              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format"
                              alt={product.name}
                              fill
                              className="object-cover opacity-60"
                            />
                          )}
                        </div>
                        <CardContent className="p-3 pt-2.5">
                          {product.category && (
                            <span className="inline-block text-[10px] font-medium text-primary border border-primary/40 rounded-full px-2 py-0.5 bg-primary/5 mb-1.5">
                              {product.category}
                            </span>
                          )}
                          <h3 className="font-semibold text-foreground text-xs sm:text-sm line-clamp-1">
                            {product.name}
                          </h3>
                          {(product as { description?: string }).description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                              {(product as { description?: string }).description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-sm font-bold text-primary">
                              {formatPrice(product.price)}
                            </p>
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              4.8
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2 h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {}
              <div className="w-full lg:w-80 xl:w-96 min-w-0">
                <Card className="sticky top-24">
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Order Summary
                    </h2>

                    {}
                    <div className="mb-4">
                      <div className="flex gap-2 flex-wrap xs:flex-nowrap">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="pl-10 h-10"
                            disabled={promoApplied}
                            onKeyDown={(e) => e.key === "Enter" && !promoApplied && handleApplyPromo()}
                          />
                        </div>
                        {promoApplied ? (
                          <Button variant="outline" className="h-10 text-red-500" onClick={handleRemovePromo}>Remove</Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="h-10"
                            onClick={handleApplyPromo}
                            disabled={promoLoading || !promoCode}
                          >
                            {promoLoading ? "..." : "Apply"}
                          </Button>
                        )}
                      </div>
                      {promoApplied && promoData && (
                        <p className="text-xs text-accent mt-1">
                          ✓ &ldquo;{promoData.code}&rdquo; applied! -{promoData.discountType === "percentage" ? `${promoData.discountValue}%` : formatPrice(promoData.discountValue)} off (-{formatPrice(promoData.discount)})
                        </p>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Subtotal</span>
                        <span className="font-medium">{formatPrice(totalPrice)}</span>
                      </div>
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-accent">
                          <span>Discount</span>
                          <span>-{formatPrice(promoDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Shipping</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? (
                            <span className="text-accent">Free</span>
                          ) : (
                            formatPrice(shippingCost)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Tax (8%)</span>
                        <span className="font-medium">{formatPrice(tax)}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {}
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-base font-semibold text-foreground">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>

                    {}
                    {totalPrice < 100 && (
                      <div className="bg-primary/10 rounded-lg p-3 mb-4">
                        <p className="text-xs sm:text-sm text-primary text-center">
                          Add {formatPrice(100 - totalPrice)} more for free shipping!
                        </p>
                      </div>
                    )}

                    {}  
                    <Button onClick={handleCheckout} className="w-full h-11 sm:h-12 bg-primary hover:bg-primary-dark text-white text-sm sm:text-base font-semibold">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Proceed to Checkout
                    </Button>

                    {}
                    <p className="text-xs text-text-secondary text-center mt-3">
                      🔒 Secure checkout powered by Stripe
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            
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
