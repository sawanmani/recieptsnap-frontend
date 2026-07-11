'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planType: 'MONTHLY' | 'YEARLY') => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // Call backend to create a subscription
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const subscriptionData = await response.json();

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        subscription_id: subscriptionData.id,
        name: 'ReceiptSnap',
        description: planType === 'MONTHLY' ? 'Monthly Premium Plan' : 'Yearly Premium Plan',
        theme: {
          color: '#E8DFF5', // Using the primary pastel color
        },
        modal: {
          ondismiss: function() {
            console.log('Checkout closed by user');
          }
        },
        handler: function(response: any) {
          console.log('Payment successful', response);
          alert('Subscription created successfully!');
          router.push('/dashboard');
        }
      };

      // @ts-ignore - Razorpay checkout is loaded via script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      alert(error.message || 'An error occurred while creating subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primaryPastel py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock premium features to enhance your receipt management experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100 transform transition duration-500 hover:scale-105">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-800 mb-2">Monthly Plan</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">₹99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-accentMint mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited receipt scans
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-accentMint mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-accentMint mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center opacity-50">
                  <svg className="h-5 w-5 text-accentMint mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Annual reports (coming soon)
                </li>
              </ul>
              <button
                onClick={() => handleSubscribe('MONTHLY')}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  loading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
                }`}
              >
                {loading ? 'Processing...' : 'Subscribe Monthly'}
              </button>
            </div>
          </div>

          {/* Yearly Plan Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-400 transform transition duration-500 hover:scale-105 relative">
            <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-2xl text-sm font-semibold">
              MOST POPULAR
            </div>
            <div className="text-center pt-6">
              <h2 className="text-2xl font-bold text-purple-800 mb-2">Yearly Plan</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">₹999</span>
                <span className="text-gray-600">/year</span>
                <div className="text-sm text-green-600 font-medium mt-1">(Save ₹189)</div>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-accentMint mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited receipt scans
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-accentMint mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-accentMint mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-accentMint mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Annual reports
                </li>
              </ul>
              <button
                onClick={() => handleSubscribe('YEARLY')}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  loading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
                }`}
              >
                {loading ? 'Processing...' : 'Subscribe Yearly'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800">Can I change plans later?</h4>
              <p className="text-gray-600 mt-1">Yes, you can upgrade, downgrade, or cancel your subscription anytime.</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800">Is there a free trial?</h4>
              <p className="text-gray-600 mt-1">We offer a free tier with limited scans. No credit card required to start.</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800">What payment methods do you accept?</h4>
              <p className="text-gray-600 mt-1">We accept all major credit/debit cards, net banking, UPI, and digital wallets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}