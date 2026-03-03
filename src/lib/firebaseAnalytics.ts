import { logEvent, getAnalytics, isSupported } from "firebase/analytics";
import app from "./firebase";

let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

async function getAnalyticsInstance() {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;
  const supported = await isSupported();
  if (supported) {
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  }
  return null;
}

export async function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

export async function trackPageView(pagePath: string) {
  await trackEvent("page_view", { page_path: pagePath });
}
