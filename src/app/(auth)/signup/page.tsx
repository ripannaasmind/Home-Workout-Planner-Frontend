"use client";

import { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { sanitize, validateName, validateEmail, validatePassword, validateConfirmPassword } from "@/lib/validation";
import { 
  Dumbbell, 
  Mail, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";


// ------- Signup Page Component -------
export default function SignupPage() {
  const router = useRouter();
  const { register, googleLogin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["bg-gray-200", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameCheck = validateName(name);
    if (!nameCheck.valid) { setError(nameCheck.message); return; }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) { setError(emailCheck.message); return; }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) { setError(passCheck.message); return; }

    const confirmCheck = validateConfirmPassword(password, confirmPassword);
    if (!confirmCheck.valid) { setError(confirmCheck.message); return; }

    if (!agreeTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const registeredUser = await register(sanitize(name), sanitize(email), password);
      if (registeredUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const loggedInUser = await googleLogin({
        googleId: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        avatar: user.photoURL || "",
      });
      if (loggedInUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative bg-primary/5">
        <div className="absolute inset-0">
          <SafeImage
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200"
            alt="Fitness"
            fill
            sizes="45vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-l from-background via-background/80 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 ml-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl xl:text-4xl font-bold text-foreground mb-4">
              Start your fitness journey today
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Create your free account and get access to personalized workout plans.
            </p>
            
            {}
            <div className="space-y-4">
              {[
                "Personalized workout plans",
                "Progress tracking & analytics",
                "500+ exercise library",
                "Community support",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {}
          <Link href="/" className="flex items-center gap-2 mb-6 sm:mb-8">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-foreground">FitHome</span>
          </Link>

          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Join FitHome and start achieving your fitness goals
            </p>
          </motion.div>

          {}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {}
          <div className="mb-6">
            <Button
              variant="outline"
              className="w-full h-11 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm font-medium"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <svg className="h-4 w-4 mr-2 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs sm:text-sm text-text-secondary">
              or continue with email
            </span>
          </div>

          {}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 sm:h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 sm:h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 sm:h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength
                            ? strengthColors[passwordStrength]
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary">
                    Password strength: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-11 sm:h-12"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 bg-primary hover:bg-primary-dark text-white text-sm sm:text-base font-semibold"
              disabled={isLoading || !agreeTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
