// PR排名组件
'use client';

interface PR {
  id: number;
  title: string;
  votes: number;
  comments: number;
  probability: number;
}

interface PRRankingProps {
  prs: PR[];
  onSelectPR: (pr: PR) => void;
  selectedPRId: number;
}

export default function PRRanking({ prs, onSelectPR, selectedPRId }: PRRankingProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">🏆 PR Ranking by Win Probability</h3>
        <span className="text-sm text-gray-400">Updated just now</span>
      </div>
      
      <div className="space-y-4">
        {prs.sort((a, b) => b.probability - a.probability).map((pr) => (
          <div
            key={pr.id}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selectedPRId === pr.id 
                ? 'bg-blue-900/30 border border-blue-700' 
                : 'bg-gray-900/50 hover:bg-gray-800/70'
            }`}
            onClick={() => onSelectPR(pr)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium mb-1">#{pr.id}: {pr.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>👍 {pr.votes} votes</span>
                  <span>💬 {pr.comments} comments</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {(pr.probability * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">win probability</div>
              </div>
            </div>
            
            {/* 概率进度条 */}
            <div className="mt-3">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  style={{ width: `${pr.probability * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700 text-sm text-gray-400">
        <p>Click on any PR to see detailed analytics and predictions.</p>
      </div>
    </div>
  );
}
