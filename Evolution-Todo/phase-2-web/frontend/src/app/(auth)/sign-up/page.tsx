"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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
      // 1. Pehle Better-Auth signUp call karo (ye session banayega)
      const betterAuthResult = await signUp.email({
        email,
        password,
        name,
      });

      if (betterAuthResult?.error) {
        setError(betterAuthResult.error.message || "Better-Auth signup failed");
        setLoading(false);
        return;
      }

      // 2. Phir manual backend register call karo (user DB mein save hoga + token milega)
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to register on backend");
      }

      const data = await res.json();

      // 3. Token aur user_id localStorage mein save karo
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", String(data.id));

      console.log("✅ User registered in DB, token saved:", data.access_token);

      // Success animation before redirect
      setTimeout(() => {
        router.push("/sign-in");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Signup failed. Try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-950 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/4 w-72 h-72 bg-purple-900/20 rounded-full blur-3xl transition-all duration-1000 ${isAnimating ? "translate-y-4 scale-110" : ""}`}
        ></div>
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl transition-all duration-1000 ${isAnimating ? "-translate-y-3 scale-105" : ""}`}
        ></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse"></div>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
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
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-10">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= stepNum ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30" : "bg-gray-800 text-gray-400"}`}
              >
                {stepNum}
              </div>
              <span className="text-xs mt-2 text-gray-400">Step {stepNum}</span>
            </div>
          ))}
          <div className="absolute top-5 left-1/4 right-1/4 h-1 bg-gray-800 -z-10">
            <div
              className={`h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-700 ${step === 2 ? "w-1/2" : step === 3 ? "w-full" : "w-0"}`}
            ></div>
          </div>
        </div>

        {/* Glowing Card */}
        <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  ></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
                Create Account
              </h1>
            </div>
            <p className="text-gray-400 text-center text-sm mt-2">
              Start managing your tasks today

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

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="relative w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all duration-300"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                >
                  Next: Contact Info
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="relative w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all duration-300"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-300 border border-gray-700"
                  >
                    <svg
                      className="w-5 h-5 inline-block mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      ></path>
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                  >
                    Next: Security
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password & Submit */}
            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password
                  </label>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>

                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="relative w-full px-4 py-3 pr-12 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all duration-300"
                      disabled={loading}
                    />

                    {/* 👁 Show / Hide Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? (
                        // Eye Off
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.594M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364 6.364L4.636 4.636"
                          />
                        </svg>
                      ) : (
                        // Eye
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Use at least 8 characters with a mix of letters, numbers &
                    symbols
                  </p>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-purple-600 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                    I agree to the{" "}
                    <span className="text-purple-400 hover:underline cursor-pointer">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="text-purple-400 hover:underline cursor-pointer">
                      Privacy Policy
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-300 border border-gray-700"
                  >
                    <svg
                      className="w-5 h-5 inline-block mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      ></path>
                    </svg>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
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
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          ></path>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors duration-300"
                >
                  Sign in here
                </Link>
              </p>
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

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #111827;
        }

        ::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }
      `}</style>
    </div>
  );
}
