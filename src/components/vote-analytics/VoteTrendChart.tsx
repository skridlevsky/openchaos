// 投票趋势图表组件
'use client';

import { useState, useEffect } from 'react';

interface VoteTrendChartProps {
  prId: number;
}

export default function VoteTrendChart({ prId }: VoteTrendChartProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  
  // 模拟趋势数据
  const trendData = {
    '24h': [2, 3, 5, 4, 6, 8, 7, 9, 10, 12, 11, 13, 15, 14, 16, 18, 17, 19, 20, 22, 21, 23, 24, 25],
    '7d': [5, 8, 12, 15, 18, 22, 25],
    '30d': [2, 5, 8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82, 85, 88, 92, 95, 98]
  };

  const data = trendData[timeRange];

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">📈 Vote Trend Analysis</h3>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64 flex items-end space-x-1">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center"
            style={{ height: '100%' }}
          >
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t"
              style={{ height: `${(value / Math.max(...data)) * 90}%` }}
            />
            <div className="text-xs text-gray-500 mt-1">
              {timeRange === '24h' ? index : timeRange === '7d' ? `Day ${index + 1}` : index + 1}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-900/50 rounded">
          <div className="text-2xl font-bold text-green-400">+{data[data.length - 1] - data[0]}</div>
          <div className="text-sm text-gray-400">Total Votes Gained</div>
        </div>
        <div className="text-center p-3 bg-gray-900/50 rounded">
          <div className="text-2xl font-bold text-blue-400">
            {((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Growth Rate</div>
        </div>
        <div className="text-center p-3 bg-gray-900/50 rounded">
          <div className="text-2xl font-bold text-purple-400">
            {((data[data.length - 1] - data[data.length - 2])).toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Last Period Change</div>
        </div>
      </div>
    </div>
  );
}
