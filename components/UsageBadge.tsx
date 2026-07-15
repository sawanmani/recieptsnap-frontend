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
    return <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Loading...</div>;
  }

  if (!usageData) {
    return <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Usage: N/A</div>;
  }

  const { freeScansUsed, plan, planExpiresAt } = usageData;
  const maxFreeScans = 100; // This should match your backend limit
  const percentage = Math.round((freeScansUsed / maxFreeScans) * 100);

  let bgColor = 'bg-green-100';
  let textColor = 'text-green-800';
  if (percentage > 80) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  }
  if (percentage > 95) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }

  return (
    <div className={`${bgColor} ${textColor} px-3 py-1 rounded-full text-sm font-medium`}>
      Scans used: {freeScansUsed}/{maxFreeScans} ({percentage}%)
    </div>
  );
}