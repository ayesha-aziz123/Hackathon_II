
"use client";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Types
interface LoginResponse {
  access_token: string;
  token_type: string;
  id: string;
  email: string;
  name: string;
}

interface RegisterResponse {
  access_token: string;
  token_type: string;
  id: string;
  email: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

// Auth Functions
export const auth = {
  // Sign In
  signIn: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Invalid email or password");
    }

    const data = await response.json();
    
    // Save to localStorage
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("user_id", data.id);
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.name || "");

    return data;
  },

  // Sign Up
  signUp: async (
    name: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    const data = await response.json();
    
    // Save to localStorage
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("user_id", data.id);
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.name || "");

    return data;
  },

  // Sign Out
  signOut: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    window.location.href = "/sign-in";
  },

  // Get Current User
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;

    const id = localStorage.getItem("user_id");
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");

    if (!id || !email) return null;

    return { id, email, name: name || "" };
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  },

  // Get auth token
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },
};

// React Hook for session
export const useSession = () => {
  const user = auth.getCurrentUser();
  const isAuthenticated = auth.isAuthenticated();

  return {
    data: user ? { user } : null,
    isLoading: false,
    error: null,
  };
};

// Export individual functions for backward compatibility
export const signIn = auth.signIn;
export const signUp = auth.signUp;
export const signOut = auth.signOut;