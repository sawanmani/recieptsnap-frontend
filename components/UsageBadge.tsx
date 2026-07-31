'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function UsageBadge({ refreshKey }: { refreshKey?: number }) {
  const { data: session } = useSession();
  const [usageData, setUsageData] = useState<{ freeScansUsed: number; plan: string; planExpiresAt: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/usage`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsageData(data);
        }
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [refreshKey, session?.accessToken]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 min-w-[200px]">
        <div>Loading...</div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="bg-white rounded-lg shadow p-4 min-w-[200px]">
        <div>Usage: N/A</div>
      </div>
    );
  }

  const { freeScansUsed, plan, planExpiresAt } = usageData;
  const FREE_SCAN_LIMIT = 25; // Correct limit matching backend
  const remainingScans = Math.max(0, FREE_SCAN_LIMIT - freeScansUsed);

  // Determine styling based on plan
  let cardStyle = '';
  if (plan === 'MONTHLY') {
    cardStyle = 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'; // Bright indigo/purple gradient
  } else if (plan === 'YEARLY') {
    cardStyle = 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white'; // Bright amber/gold gradient
  } else {
    cardStyle = 'bg-gray-100 text-gray-800'; // Neutral/gray for FREE plan
  }

  // Calculate progress percentage for free users
  const progressPercentage = (freeScansUsed / FREE_SCAN_LIMIT) * 100;

  return (
    <div className={`${cardStyle} rounded-lg shadow p-4 min-w-[200px]`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Plan:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          plan === 'MONTHLY' 
            ? 'bg-white text-indigo-600' 
            : plan === 'YEARLY' 
              ? 'bg-white text-amber-600' 
              : 'bg-gray-200 text-gray-800'
        }`}>
          {plan}
        </span>
      </div>
      
      {plan === 'FREE' && (
        <>
          <div className="text-xs mb-1">Scans used: {freeScansUsed}/{FREE_SCAN_LIMIT}</div>
          <div className="text-xs mb-2">Remaining: {remainingScans} scans</div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${
            remainingScans <= 3 ? 'bg-red-500' : ''
          }`}>
            <div 
              className={`h-2 rounded-full ${
                remainingScans <= 3 
                  ? 'bg-red-600' 
                  : progressPercentage >= 90 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </>
      )}
      
      {plan !== 'FREE' && (
        <div className="text-sm">Unlimited scans</div>
      )}
    </div>
  );
}