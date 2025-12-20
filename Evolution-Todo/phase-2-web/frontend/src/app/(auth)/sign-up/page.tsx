// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { createAuthClient } from 'better-auth/react';
// import Link from 'next/link';

// // Create auth client instance
// const authClient = createAuthClient({
//   baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
// });

// export default function SignUpPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const router = useRouter();

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   console.log("🔵 Signup process started...");

//   try {
//   //   const response = await authClient.signUp.email({
//   //     email,
//   //     password,
//   //     name,
//   //     callbackURL: '/tasks',
//   //   });

//   //   console.log("🟡 Raw response from BetterAuth:", response);

//   //   if (response?.error) {
//   //     console.error("🔴 Signup failed:", response.error.message);
//   //     setError(response.error.message);
//   //     return;
//   //   }

//   //   console.log("🟢 Signup successful! Redirecting to /tasks...");

//   //   router.push('/tasks');
//   // } catch (err) {
//   //   console.error('🔴 Exception during signup:', err);
//   //   setError('An error occurred during sign up. Please try again.');
//   // }

//     const result = await authClient.signUp.email({
//       email,
//       password,
//       name,
//       callbackURL: '/sign-in'
//     });

    
//     console.log("🟡 Raw response from BetterAuth:", result);

//     if (result?.error) {
//       setError(result.error.message);
//       return;
//     }

//     // 2️⃣ FastAPI register (DB save)
//     const res = await fetch("http://localhost:8000/auth/register", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//         password,
//         name,
//       }),
//     });

    
//     console.log("🟢 Signup successful! Redirecting to /tasks...");

//     if (!res.ok) {
//       throw new Error("FastAPI register failed");
//     }

//     // 3️⃣ Redirect to tasks
//     router.push("/tasks");
//   } catch (err) {
//     console.error(err);
//     setError("Signup failed");
//   }
// };


//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create your account
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="rounded-md bg-red-50 p-4">
//               <div className="text-sm text-red-700">{error}</div>
//             </div>
//           )}
//           <input type="hidden" name="remember" defaultValue="true" />
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="name" className="sr-only">
//                 Full Name
//               </label>
//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Full Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//             </div>
//             <div className="-mt-px">
//               <label htmlFor="email-address" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div className="-mt-px">
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               Sign up
//             </button>
//           </div>
//           <div className="text-sm text-center">
//             <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
//               Already have an account? Sign in
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
















'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import Link from 'next/link';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Pehle Better-Auth signUp call karo (ye session banayega)
      const betterAuthResult = await signUp.email({
        email,
        password,
        name,
      });

      if (betterAuthResult?.error) {
        setError(betterAuthResult.error.message || 'Better-Auth signup failed');
        setLoading(false);
        return;
      }

      // 2. Phir manual backend register call karo (user DB mein save hoga + token milega)
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to register on backend');
      }

      const data = await res.json();

      // 3. Token aur user_id localStorage mein save karo
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_id', String(data.id));

      console.log('✅ User registered in DB, token saved:', data.access_token);

      // 4. Redirect to tasks
      router.push('/sign-in');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Signup failed. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // UI same as before
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Sign up'}
          </button>

          <div className="text-center">
            <Link href="/sign-in" className="text-indigo-600 hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}