"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function CheckoutPage() {
  const { cart, totalPrice } = useCart();
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Billing
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Shipping
  const [shipFirstName, setShipFirstName] = useState("");
  const [shipLastName, setShipLastName] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipZip, setShipZip] = useState("");

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [error, setError] = useState("");

  const shippingCost = deliveryMethod === "express" ? 15.00 : totalPrice >= 100 ? 0 : 5.00;
  const total = totalPrice + shippingCost;

  const handlePlaceOrder = () => {
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

    if (paymentMethod === "card") {
      check = validateCardNumber(cardNumber);
      if (!check.valid) { setError(check.message); return; }
      check = validateCardExpiry(expiry);
      if (!check.valid) { setError(check.message); return; }
      check = validateCVC(cvc);
      if (!check.valid) { setError(check.message); return; }
    }

    // All valid — proceed (placeholder for actual order API)
    alert("Order placed successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-primary">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/cart" className="hover:text-primary">Cart</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Checkout</span>
          </nav>

          {/* Page Header */}
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
            {/* Left Column - Form */}
            <div className="flex-1 space-y-6">
              {/* Error */}
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

              {/* Billing Details */}
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

              {/* Shipping Address */}
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

              {/* Delivery Method */}
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

              {/* Payment Method */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Payment Method
                  </h2>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            <span className="font-medium">Credit Card</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" width={32} height={20} className="object-contain" />
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" width={32} height={20} className="object-contain" />
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png" alt="Amex" width={32} height={20} className="object-contain" />
                          </div>
                        </Label>
                      </div>

                      {/* PayPal Option */}
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
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
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

                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="w-full lg:w-80 xl:w-96">
              <Card className="sticky top-24">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Order Summary
                  </h2>

                  {/* Cart Items */}
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

                  {/* Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
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
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Button onClick={handlePlaceOrder} className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold">
                    Place Order
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

