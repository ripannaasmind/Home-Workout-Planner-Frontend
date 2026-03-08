"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { paymentApi, ordersApi, type PublicPaymentMethods } from "@/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  sanitize,
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateZip,
  validateCardNumber,
  validateCardExpiry,
  validateCVC,
} from "@/lib/validation";
import {
  CreditCard,
  Truck,
  ChevronRight,
  Dumbbell,
  AlertCircle,
  Loader2,
} from "lucide-react";


function CheckoutContent() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const promoCodeParam = searchParams.get("promo") || "";
  const promoDiscountParam = parseFloat(searchParams.get("discount") || "0");

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PublicPaymentMethods | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    paymentApi.getPublicMethods()
      .then((res) => {
        setPaymentMethods(res.data);
        if (res.data.stripe.enabled) setPaymentMethod("stripe");
        else if (res.data.paypal.enabled) setPaymentMethod("paypal");
        else if (res.data.cashOnDelivery.enabled) setPaymentMethod("cod");
      })
      .catch(() => {
        setPaymentMethods({ stripe: { enabled: false, publishableKey: "" }, paypal: { enabled: false, clientId: "" }, cashOnDelivery: { enabled: true } });
        setPaymentMethod("cod");
      });
  }, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [billingEmail, setBillingEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");

  const [shipFirstName, setShipFirstName] = useState("");
  const [shipLastName, setShipLastName] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipZip, setShipZip] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [error, setError] = useState("");

  const shippingCost = deliveryMethod === "express" ? 15.00 : totalPrice >= 100 ? 0 : 5.00;
  const discount = promoDiscountParam;
  const subtotalAfterDiscount = Math.max(0, totalPrice - discount);
  const tax = subtotalAfterDiscount * 0.08;
  const total = subtotalAfterDiscount + shippingCost + tax;

  const handlePlaceOrder = async () => {
    setError("");

    let check = validateName(firstName);
    if (!check.valid) { setError("First Name: " + check.message); return; }
    check = validateName(lastName);
    if (!check.valid) { setError("Last Name: " + check.message); return; }
    check = validateEmail(billingEmail);
    if (!check.valid) { setError(check.message); return; }
    check = validatePhone(phone);
    if (!check.valid) { setError(check.message); return; }

    if (!sameAsBilling) {
      check = validateName(shipFirstName);
      if (!check.valid) { setError("Shipping First Name: " + check.message); return; }
      check = validateName(shipLastName);
      if (!check.valid) { setError("Shipping Last Name: " + check.message); return; }
      check = validateAddress(shipAddress, "Street Address");
      if (!check.valid) { setError(check.message); return; }
      check = validateAddress(shipCity, "City");
      if (!check.valid) { setError(check.message); return; }
      check = validateAddress(shipState, "State");
      if (!check.valid) { setError(check.message); return; }
      check = validateZip(shipZip);
      if (!check.valid) { setError(check.message); return; }
    }

    if (paymentMethod === "stripe") {
      check = validateCardNumber(cardNumber);
      if (!check.valid) { setError(check.message); return; }
      check = validateCardExpiry(expiry);
      if (!check.valid) { setError(check.message); return; }
      check = validateCVC(cvc);
      if (!check.valid) { setError(check.message); return; }
    }

    if (!user || !token) { setError("You must be logged in to place an order"); return; }
    if (cart.length === 0) { setError("Your cart is empty"); return; }

    setPlacing(true);
    ordersApi.create({
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      })),
      subtotal: totalPrice,
      discount,
      promoCode: promoCodeParam || null,
      shipping: shippingCost,
      tax,
      total,
      paymentMethod: paymentMethod as "stripe" | "paypal" | "cod",
      billingDetails: {
        firstName: sanitize(firstName),
        lastName: sanitize(lastName),
        email: sanitize(billingEmail),
        phone: sanitize(phone),
      },
      shippingAddress: sameAsBilling
        ? { firstName: sanitize(firstName), lastName: sanitize(lastName), address: "", city: "", state: "", zip: "" }
        : { firstName: sanitize(shipFirstName), lastName: sanitize(shipLastName), address: sanitize(shipAddress), city: sanitize(shipCity), state: sanitize(shipState), zip: sanitize(shipZip) },
    }, token)
      .then(() => {
        clearCart();
        toast.success("Order placed successfully!");
        router.push("/dashboard/orders");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to place order";
        setError(msg);
      })
      .finally(() => setPlacing(false));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {}
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-primary">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/cart" className="hover:text-primary">Cart</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Checkout</span>
          </nav>

          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground italic mb-2">
              Checkout
            </h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Complete your order securely
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {}
            <div className="flex-1 space-y-6">
              {}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Billing Details
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="First Name"
                        className="h-11"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Last Name"
                        className="h-11"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="email" className="text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email Address"
                      className="h-11"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="phone" className="text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone Number"
                      className="h-11"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Shipping Address
                  </h2>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="sameAsBilling"
                      checked={sameAsBilling}
                      onCheckedChange={(checked) => setSameAsBilling(checked as boolean)}
                    />
                    <Label htmlFor="sameAsBilling" className="text-sm cursor-pointer">
                      Same as billing address
                    </Label>
                  </div>

                  {!sameAsBilling && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input placeholder="First Name" className="h-11" value={shipFirstName} onChange={(e) => setShipFirstName(e.target.value)} />
                        <Input placeholder="Last Name" className="h-11" value={shipLastName} onChange={(e) => setShipLastName(e.target.value)} />
                      </div>
                      <Input placeholder="Street Address" className="h-11" value={shipAddress} onChange={(e) => setShipAddress(e.target.value)} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Input placeholder="City" className="h-11" value={shipCity} onChange={(e) => setShipCity(e.target.value)} />
                        <Input placeholder="State" className="h-11" value={shipState} onChange={(e) => setShipState(e.target.value)} />
                        <Input placeholder="ZIP Code" className="h-11 col-span-2 sm:col-span-1" value={shipZip} onChange={(e) => setShipZip(e.target.value)} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Delivery Method
                  </h2>
                  
                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            <span className="font-medium">Standard Delivery</span>
                          </div>
                          <p className="text-sm text-text-secondary mt-0.5">
                            3-5 days • {totalPrice >= 100 ? "Free" : "$5.00"}
                          </p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-accent" />
                            <span className="font-medium">Express Delivery</span>
                          </div>
                          <p className="text-sm text-text-secondary mt-0.5">
                            1-2 days • $15.00
                          </p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Payment Method
                  </h2>

                  {!paymentMethods ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">

                      {paymentMethods.stripe.enabled && (
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-violet-600" />
                            <span className="font-medium">Credit / Debit Card</span>
                            <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded font-medium">Stripe</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" width={32} height={20} className="object-contain" />
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" width={32} height={20} className="object-contain" />
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png" alt="Amex" width={32} height={20} className="object-contain" />
                          </div>
                        </Label>
                      </div>
                      )}

                      {paymentMethods.paypal.enabled && (
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-20" viewBox="0 0 101 32" fill="none">
                              <path d="M12.237 6.364h-6.89c-.47 0-.87.34-.944.8L1.99 23.12c-.055.34.208.647.554.647h3.29c.47 0 .87-.34.943-.8l.913-5.794c.074-.46.473-.8.944-.8h2.177c4.534 0 7.15-2.194 7.835-6.538.308-1.9.012-3.393-.88-4.438-.98-1.15-2.716-1.782-5.03-1.782z" fill="#003087"/>
                              <path d="M38.5 6.364h-6.89c-.47 0-.87.34-.943.8l-2.413 15.957c-.055.34.208.647.554.647h3.53c.327 0 .606-.238.658-.56l.687-4.352c.073-.46.473-.8.943-.8h2.178c4.534 0 7.15-2.194 7.835-6.538.308-1.9.013-3.393-.88-4.438-.98-1.15-2.716-1.782-5.03-1.782z" fill="#009CDE"/>
                            </svg>
                          </div>
                        </Label>
                      </div>
                      )}

                      {paymentMethods.cashOnDelivery.enabled && (
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Cash on Delivery</span>
                          </div>
                          <p className="text-sm text-text-secondary mt-0.5">Pay when your order arrives</p>
                        </Label>
                      </div>
                      )}

                      {!paymentMethods.stripe.enabled && !paymentMethods.paypal.enabled && !paymentMethods.cashOnDelivery.enabled && (
                        <p className="text-sm text-gray-500 text-center py-4">No payment methods are currently available.</p>
                      )}
                    </div>
                  </RadioGroup>
                  )}

                  {paymentMethod === "stripe" && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-sm">
                          Card Number
                        </Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="cardNumber"
                            placeholder="Card Number"
                            className="pl-10 h-11"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry" className="text-sm">
                            Expiration Date
                          </Label>
                          <Input
                            id="expiry"
                            placeholder="MM / YY"
                            className="h-11"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc" className="text-sm">
                            CVC
                          </Label>
                          <Input
                            id="cvc"
                            placeholder="CVC"
                            className="h-11"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                      <p className="text-sm text-blue-700">You will be redirected to PayPal to complete your payment securely.</p>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                      <p className="text-sm text-green-700">You will pay in cash when your order is delivered to your door.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {}
            <div className="w-full lg:w-80 xl:w-96">
              <Card className="sticky top-24">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Order Summary
                  </h2>

                  {}
                  <div className="space-y-4 mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/30">
                              <Dumbbell className="w-6 h-6 text-primary/60" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-text-secondary">
                            {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-accent">
                        <span>Promo ({promoCodeParam})</span>
                        <span>-${discount.toFixed(2)}</span>
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

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Button onClick={handlePlaceOrder} disabled={placing} className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold">
                    {placing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Placing Order...</> : "Place Order"}
                  </Button>

                  <p className="text-xs text-text-secondary text-center mt-3">
                    🔒 Your payment information is secure
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


// ------- Checkout Page Component -------
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
