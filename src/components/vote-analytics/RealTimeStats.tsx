// 实时统计组件
'use client';

import { useEffect, useState } from 'react';

interface RealTimeStatsProps {
  totalPRs: number;
  totalVotes: number;
  lastUpdated: Date;
}

export default function RealTimeStats({ totalPRs, totalVotes, lastUpdated }: RealTimeStatsProps) {
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('just now');

  useEffect(() => {
    const updateTime = () => {
      const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
      
      if (seconds < 60) {
        setTimeSinceUpdate('just now');
      } else if (seconds < 3600) {
        setTimeSinceUpdate(`${Math.floor(seconds / 60)} minutes ago`);
      } else {
        setTimeSinceUpdate(`${Math.floor(seconds / 3600)} hours ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // 每分钟更新
    
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-4 rounded-lg border border-blue-800/30">
        <div className="text-2xl font-bold">{totalPRs}</div>
        <div className="text-sm text-gray-400">Active PRs</div>
        <div className="mt-2 text-xs text-blue-400">Currently competing</div>
      </div>
      
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-lg border border-green-800/30">
        <div className="text-2xl font-bold">{totalVotes}</div>
        <div className="text-sm text-gray-400">Total Votes</div>
        <div className="mt-2 text-xs text-green-400">Community engagement</div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-lg border border-purple-800/30">
        <div className="text-2xl font-bold">5</div>
        <div className="text-sm text-gray-400">Active Voters</div>
        <div className="mt-2 text-xs text-purple-400">Last 24 hours</div>
      </div>
      
      <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 p-4 rounded-lg border border-amber-800/30">
        <div className="text-2xl font-bold">{timeSinceUpdate}</div>
        <div className="text-sm text-gray-400">Last Updated</div>
        <div className="mt-2 text-xs text-amber-400">Real-time data</div>
      </div>
    </div>
  );
}
