'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface UsageData {
  plan: string;
  freeScansUsed: number;
  freeScansRemaining: number;
  planExpiresAt?: string | null;
}

export default function UsageBadge() {
  const { data: session } = useSession();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/usage`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }

        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        setError('Could not load usage information');
        console.error('Error fetching usage data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsageData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 min-w-[200px]">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !usageData) {
    return (
      <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-700">
        {error || 'Usage data unavailable'}
      </div>
    );
  }

  const { plan, freeScansUsed, freeScansRemaining, planExpiresAt } = usageData;
  
  // Determine badge styling based on plan and usage
  const isNearLimit = plan === 'FREE' && freeScansRemaining <= 5 && freeScansRemaining >= 0;
  const isOverLimit = plan === 'FREE' && freeScansRemaining === 0;

  return (
    <div className={`rounded-lg p-4 shadow ${
      isOverLimit ? 'bg-red-100 border border-red-300' :
      isNearLimit ? 'bg-yellow-100 border border-yellow-300' :
      'bg-white border border-gray-200'
    }`}>
      <h3 className="font-semibold text-gray-800 mb-2">Usage</h3>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Plan:</span>
          <span className={`font-medium ${
            plan === 'FREE' ? 'text-purple-600' : 'text-green-600'
          }`}>
            {plan}
          </span>
        </div>
        
        {plan === 'FREE' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Scans used:</span>
              <span className="font-medium">{freeScansUsed}/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining:</span>
              <span className={`font-medium ${
                isOverLimit ? 'text-red-600' : 
                isNearLimit ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {freeScansRemaining === -1 ? 'Unlimited' : `${freeScansRemaining} scans`}
              </span>
            </div>
          </>
        )}
        
        {plan !== 'FREE' && (
          <div className="flex justify-between">
            <span className="text-gray-600">Expiry:</span>
            <span className="font-medium">
              {planExpiresAt ? new Date(planExpiresAt).toLocaleDateString() : 'Never'}
            </span>
          </div>
        )}
      </div>
      
      {isOverLimit && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-xs text-red-700 font-medium">
            Free limit reached. Upgrade to continue scanning.
          </p>
        </div>
      )}
      
      {isNearLimit && !isOverLimit && plan === 'FREE' && (
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <p className="text-xs text-yellow-700 font-medium">
            Approaching scan limit. Consider upgrading.
          </p>
        </div>
      )}
    </div>
  );
}