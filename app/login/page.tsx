'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, CreditCard, FileText, Camera } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard' 
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primaryPastel p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">ReceiptSnap</h1>
          <p className="text-gray-600">Track your expenses effortlessly</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Sign in to your account</h2>
            <p className="text-gray-500 mt-2">Continue with Google to get started</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-accentMint transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Features</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-accentPeach p-3 rounded-full mb-2">
                <Camera className="h-6 w-6 text-purple-700" />
              </div>
              <p className="text-sm text-gray-600">Receipt Scan</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-accentMint p-3 rounded-full mb-2">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <p className="text-sm text-gray-600">Expense Tracking</p>
            </div>
            <div className="flex flex-col items-center text-center col-span-2">
              <div className="bg-softSky p-3 rounded-full mb-2">
                <CreditCard className="h-6 w-6 text-purple-700" />
              </div>
              <p className="text-sm text-gray-600">Financial Insights</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}