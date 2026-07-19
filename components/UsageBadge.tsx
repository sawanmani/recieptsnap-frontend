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

  return (
    <div className="bg-white rounded-lg shadow p-4 min-w-[200px]">
      <div className="text-sm text-gray-600">Plan: {plan}</div>
      <div className="text-sm text-gray-600">Scans used: {freeScansUsed}/{FREE_SCAN_LIMIT}</div>
      <div className="text-sm text-gray-600">Remaining: {remainingScans} scans</div>
    </div>
  );
}