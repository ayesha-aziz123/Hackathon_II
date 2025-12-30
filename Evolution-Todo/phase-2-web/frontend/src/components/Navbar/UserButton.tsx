'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, authClient } from '@/lib/auth'; 

type UserButtonProps = {
  user: any; // ya proper User type
};

export default function UserButton({ user }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession(); // Use useSession from '@/lib/auth'

  const handleSignOut = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');

      // Then call Better Auth signOut
      await authClient.signOut();

      // Redirect to sign-in
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!session) {
    return null; // Don't render if no user is logged in
  }

  return (
    <div className="relative w-auto ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm rounded-full focus:outline-none"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
          {session.user.name ? session.user.name.charAt(0).toUpperCase() : session.user.email.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm  text-black hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}