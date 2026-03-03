import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxtqae3GGjRq8-ANogZjAIl8D4g-pYkuo",
  authDomain: "workout-planner-naasmind.firebaseapp.com",
  projectId: "workout-planner-naasmind",
  storageBucket: "workout-planner-naasmind.firebasestorage.app",
  messagingSenderId: "269570348087",
  appId: "1:269570348087:web:af0f61fe32d50c39805bb2",
  measurementId: "G-XFZ9WGL2K2",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { analytics };
export default app;
