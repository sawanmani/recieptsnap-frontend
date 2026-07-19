'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Camera, 
  TrendingUp, 
  Download, 
  IndianRupee,
  Receipt,
  Wallet,
  FileOutput
} from 'lucide-react';
import CursorScrubVideo from '@/components/CursorScrubVideo';

// AnimatedOrbs component for floating background shapes
const AnimatedOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      <div 
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--tw-gradient-stops))',
          '--tw-gradient-from': 'var(--accent-mint)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-via, transparent), var(--tw-gradient-to, transparent)'
        } as React.CSSProperties}
      ></div>
      <div 
        className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--tw-gradient-stops))',
          '--tw-gradient-from': 'var(--accent-peach)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-via, transparent), var(--tw-gradient-to, transparent)'
        } as React.CSSProperties}
      ></div>
      <div 
        className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--tw-gradient-stops))',
          '--tw-gradient-from': 'var(--soft-lavender)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-via, transparent), var(--tw-gradient-to, transparent)'
        } as React.CSSProperties}
      ></div>
    </div>
  );
};

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine the button link based on auth status
  const buttonHref = status === 'authenticated' ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CursorScrubVideo />
      <AnimatedOrbs />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center py-6">
          <div className="text-2xl font-bold text-white">ReceiptSnap</div>
          <div className="space-x-4">
            {status === 'authenticated' ? (
              <Link 
                href="/dashboard" 
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-colors backdrop-blur-sm"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-colors backdrop-blur-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <CursorScrubVideo />
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Smart Receipt Scanning
            </h1>
            <p className="text-xl max-w-2xl mb-10">
              Automatically scan receipts, track UPI payments, and simplify expense management for Indian freelancers during tax filing.
            </p>
            
            {isMounted && (
              <Link 
                href={buttonHref}
                className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg transform hover:scale-105 duration-300"
              >
                Try Now
              </Link>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Simple steps to automate your expense tracking journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
              <div className="bg-primaryPastel w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Snap a Receipt</h3>
              <p className="text-gray-600">
                Take a photo of your receipt or import digital bills with our easy-to-use scanner.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
              <div className="bg-accentMint w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Automatic Categorization</h3>
              <p className="text-gray-600">
                Our AI automatically extracts merchant, amount, date, and categorizes expenses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
              <div className="bg-accentPeach w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileOutput className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Tax-Ready Exports</h3>
              <p className="text-gray-600">
                Generate comprehensive reports for tax filing and financial analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16">
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-10 shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="bg-primaryPastel w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IndianRupee className="text-purple-600 w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Expense Tracking</h3>
                <p className="text-gray-600">Monitor all your expenses with detailed insights</p>
              </div>
              <div>
                <div className="bg-accentMint w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-purple-600 w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Financial Insights</h3>
                <p className="text-gray-600">Visualize spending patterns over time</p>
              </div>
              <div>
                <div className="bg-accentPeach w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="text-purple-600 w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Tax Preparation</h3>
                <p className="text-gray-600">Prepare for tax season with organized records</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold text-purple-800 mb-6">Ready to Simplify Your Expense Management?</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Join thousands of freelancers who trust ReceiptSnap for effortless receipt scanning and expense tracking.
          </p>
          
          {isMounted && (
            <Link 
              href={buttonHref}
              className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg transform hover:scale-105 duration-300 inline-block"
            >
              Get Started Today
            </Link>
          )}
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} ReceiptSnap. Empowering freelancers with smart expense tracking.</p>
        </footer>
      </div>
    </div>
  );
}