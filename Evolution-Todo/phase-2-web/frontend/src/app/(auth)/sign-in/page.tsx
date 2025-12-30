"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import Link from "next/link";

// Create auth client instance
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Add floating animation for background elements
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Make direct API call to backend to get JWT token
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      // Get token from response
      const data = await response.json();

      // Store in localStorage
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", data.id);

      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }

      // Then do Better Auth sign in
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

     if (result?.error) {
  setError(result.error.message ?? "Invalid email or password");
  setLoading(false);
}
 else {
        // Success animation
        setTimeout(() => {
          router.push("/tasks");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
      console.error(err);
      setLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remember_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-950 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/3 left-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl transition-all duration-1000 ${isAnimating ? "translate-y-4 scale-110" : ""}`}
        ></div>
        <div
          className={`absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-900/15 rounded-full blur-3xl transition-all duration-1000 ${isAnimating ? "-translate-y-3 scale-105" : ""}`}
        ></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse"></div>

        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Glowing Card */}
        <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden animate-fadeIn">
          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-800">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mr-3 shadow-lg shadow-purple-500/30">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  ></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
                Welcome Back
              </h1>
            </div>
            <p className="text-gray-400 text-center text-sm mt-2">
              Sign in to continue to your account
            </p>
          </div>

          <form className="px-8 pt-6 pb-8" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-900/40 to-red-800/30 border border-red-800/50 backdrop-blur-sm animate-shake">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                {/* <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-300 text-sm font-medium">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div> */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg
                      className="w-5 h-5 inline-block ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      ></path>
                    </svg>
                  </>
                )}
              </button>

              <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                <p className="text-gray-500 text-sm">
                  Dont have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors duration-300"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-float {
          animation: float infinite ease-in-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
