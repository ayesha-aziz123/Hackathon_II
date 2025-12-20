import { authClient } from './auth';

export class AuthManager {
  private static TOKEN_KEY = 'auth_token';


  
  static setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }
  
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  
  static clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }
  
  static async login(email: string, password: string) {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    console.log("data⭐",data);
    
    
    // Store token in localStorage
    this.setToken(data.access_token);
    
    return data;
  }
  
  static async register(email: string, password: string, name?: string) {
    const response = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const data = await response.json();
    
    // Store token in localStorage
    this.setToken(data.access_token);
    
    return data;
  }
}


export default AuthManager;