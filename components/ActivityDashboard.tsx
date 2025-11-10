"use client";

import { useEffect, useState } from "react";
import type { ActivityData } from "@/types";

/// ActivityDashboard component - displays real-time activity metrics
export default function ActivityDashboard() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivityData = async () => {
    try {
      setIsLoading(data === null); // Only show loading on initial load
      setError(null);

      const response = await fetch("/api/admin/activity");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch activity data");
      }

      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading activity data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error || "No data available"}</p>
          <button
            onClick={fetchActivityData}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Active Users
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">
              {data.activeUsers.current}
            </p>
            <p className="text-sm text-gray-600 mt-1">Current</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {data.activeUsers.today}
            </p>
            <p className="text-sm text-gray-600 mt-1">Today</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {data.activeUsers.thisWeek}
            </p>
            <p className="text-sm text-gray-600 mt-1">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {data.activeUsers.thisMonth}
            </p>
            <p className="text-sm text-gray-600 mt-1">This Month</p>
          </div>
        </div>
      </div>

      {/* Scans Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Scan Activity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {data.scans.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {data.scans.today.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Today</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {data.scans.thisWeek.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {data.scans.thisMonth.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">This Month</p>
          </div>
        </div>

        {/* Hourly Activity Bar Chart */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Scans by Hour (Last 24h)
          </h4>
          <div className="flex items-end justify-between h-32 gap-1">
            {data.scans.byHour.map((hourData, index) => {
              const maxCount = Math.max(...data.scans.byHour.map(h => h.count));
              const height = (hourData.count / maxCount) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 bg-primary-500 rounded-t hover:bg-primary-600 transition-colors relative group"
                  style={{ height: `${height}%`, minHeight: "4px" }}
                  title={`${hourData.hour}: ${hourData.count} scans`}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {hourData.hour}: {hourData.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Threats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Threat Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Detected</span>
              <span className="text-2xl font-bold text-red-600">
                {data.threats.detected}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blocked</span>
              <span className="text-2xl font-bold text-orange-600">
                {data.threats.blocked}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">False Positives</span>
              <span className="text-2xl font-bold text-yellow-600">
                {data.threats.falsePositives}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Threat Domains
          </h3>
          <div className="space-y-3">
            {data.threats.topDomains.map((domain, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {domain.domain}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last seen: {new Date(domain.lastSeen).toLocaleString()}
                  </p>
                </div>
                <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  {domain.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Uptime</p>
            <p className="text-lg font-bold text-green-600">
              {formatUptime(data.system.uptime)}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Response Time</p>
            <p className="text-lg font-bold text-blue-600">
              {data.system.responseTime}ms
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Error Rate</p>
            <p className="text-lg font-bold text-orange-600">
              {data.system.errorRate.toFixed(2)}%
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Memory Usage</p>
            <p className="text-lg font-bold text-purple-600">
              {data.system.memoryUsage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-500">
        <p>Auto-refreshing every 30 seconds</p>
      </div>
    </div>
  );
}
