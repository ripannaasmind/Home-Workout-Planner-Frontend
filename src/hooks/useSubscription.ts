"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscriptionApi, type Subscription } from "@/services/api";

export interface SubscriptionState {
  subscription: Subscription | null;
  isPremium: boolean;
  isLoading: boolean;
}

export function useSubscription(): SubscriptionState {
  const { token, user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    subscriptionApi
      .getCurrent(token)
      .then((res) => setSubscription(res.data))
      .catch(() => setSubscription(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  // Admin always gets premium access
  const isAdmin = (user as { role?: string })?.role === "admin";

  const isPremium =
    isAdmin ||
    (subscription !== null &&
      subscription.status === "active" &&
      (subscription.plan === "monthly" ||
        subscription.plan === "yearly" ||
        subscription.plan === "lifetime" ||
        (typeof subscription.plan === "object" &&
          (subscription.plan as { slug?: string }).slug !== "free")));

  return { subscription, isPremium, isLoading };
}
