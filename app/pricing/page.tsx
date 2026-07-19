'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckIcon } from '@heroicons/react/24/solid';


export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [processingPlan, setProcessingPlan] = useState<'MONTHLY' | 'YEARLY' | null>(null);
  const [error, setError] = useState('');

  const handleSubscribe = async (planType: 'MONTHLY' | 'YEARLY') => {
    setProcessingPlan(planType);
    
    try {
      const accessToken = session?.accessToken;
      if (!accessToken) {
        alert('Authentication token not available. Please sign in again.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/billing/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ planId: planType.toLowerCase() }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const data = await response.json();
      
      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'ReceiptSnap',
        description: `${planType} Subscription`,
        handler: function (response: any) {
          console.log(response);
          alert('Payment successful!');
          router.refresh(); // Refresh to update subscription status
        },
        modal: {
          ondismiss: function() {
            console.log('Checkout closed by user');
          }
        }
      };

      // @ts-ignore - Razorpay checkout is loaded via script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      alert(error.message || 'An error occurred while creating subscription');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-primaryPastel py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock premium features to enhance your receipt management experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan Card */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 h-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Monthly</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-800">₹199</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Unlimited Receipt Scans</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">SMS Parsing</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Receipt Editing</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Expense Reports</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('MONTHLY')}
              disabled={processingPlan !== null}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                processingPlan === 'MONTHLY' ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
            >
              {processingPlan === 'MONTHLY' ? 'Processing...' : 'Subscribe'}
            </button>
          </div>

          {/* Yearly Plan Card */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 h-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Yearly</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-800">₹999</span>
              <span className="text-gray-600">/year</span>
            </div>
            <div className="text-sm text-green-600 font-medium mt-1">(Save ₹1,389/year)</div>
            <ul className="space-y-2 mb-6 mt-4">
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Unlimited Receipt Scans</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">SMS Parsing</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Receipt Editing</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Expense Reports</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('YEARLY')}
              disabled={processingPlan !== null}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                processingPlan === 'YEARLY' ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
            >
              {processingPlan === 'YEARLY' ? 'Processing...' : 'Subscribe'}
            </button>
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