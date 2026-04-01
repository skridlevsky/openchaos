// 投票分析仪表板组件
'use client';

import { useState, useEffect } from 'react';
import PRRanking from './PRRanking';
import VoteTrendChart from './VoteTrendChart';
import CommunityHeatmap from './CommunityHeatmap';
import PredictionPanel from './PredictionPanel';
import RealTimeStats from './RealTimeStats';

// 模拟数据 - 实际中从API获取
const mockPRs = [
  { id: 227, title: 'Type Fast, Vote Cast: ASCII Typing Speed Test', votes: 2, comments: 1, probability: 0.65 },
  { id: 226, title: 'Dark that Sparks - Enhanced Theme Toggle', votes: 1, comments: 0, probability: 0.45 },
  { id: 225, title: 'Badge Madness, Join the Fadness', votes: 3, comments: 2, probability: 0.72 },
  { id: 224, title: 'Deploy Time, Show Prime', votes: 1, comments: 1, probability: 0.38 },
  { id: 223, title: 'Implement VoteMergeManager', votes: 2, comments: 3, probability: 0.58 },
];

export default function VoteDashboard() {
  const [prs, setPRs] = useState(mockPRs);
  const [selectedPR, setSelectedPR] = useState(mockPRs[0]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // 这里实际中会调用API更新数据
    }, 30000); // 每30秒更新

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <RealTimeStats 
        totalPRs={prs.length} 
        totalVotes={prs.reduce((sum, pr) => sum + pr.votes, 0)}
        lastUpdated={lastUpdated}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PRRanking 
            prs={prs} 
            onSelectPR={setSelectedPR}
            selectedPRId={selectedPR.id}
          />
        </div>
        
        <div>
          <PredictionPanel pr={selectedPR} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VoteTrendChart prId={selectedPR.id} />
        <CommunityHeatmap />
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">🎯 How to Use This Dashboard</h3>
        <ul className="space-y-2 text-gray-300">
          <li>• <strong>PR Ranking</strong>: See which PRs are most likely to win based on current voting trends</li>
          <li>• <strong>Vote Trends</strong>: Track how votes are accumulating over time</li>
          <li>• <strong>Community Heatmap</strong>: See which community members are most active</li>
          <li>• <strong>Win Prediction</strong>: Get AI-powered predictions on PR success</li>
        </ul>
      </div>
    </div>
  );
}
