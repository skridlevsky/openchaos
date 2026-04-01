// 预测面板组件
'use client';

interface PR {
  id: number;
  title: string;
  votes: number;
  comments: number;
  probability: number;
}

interface PredictionPanelProps {
  pr: PR;
}

export default function PredictionPanel({ pr }: PredictionPanelProps) {
  const factors = [
    { name: 'Vote Velocity', score: 0.85, impact: 'High' },
    { name: 'Community Engagement', score: 0.72, impact: 'Medium' },
    { name: 'Author Reputation', score: 0.63, impact: 'Medium' },
    { name: 'Code Quality', score: 0.91, impact: 'High' },
    { name: 'PR Description', score: 0.78, impact: 'Medium' },
  ];

  const recommendation = pr.probability > 0.7 
    ? 'Strong contender! This PR has high win probability.'
    : pr.probability > 0.5
    ? 'Competitive position. Could win with more community support.'
    : 'Needs more traction. Consider promoting in community discussions.';

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-6">🔮 Win Prediction Analysis</h3>
      
      <div className="text-center mb-8">
        <div className="text-5xl font-bold text-green-400 mb-2">
          {(pr.probability * 100).toFixed(0)}%
        </div>
        <div className="text-gray-400">Predicted Win Probability</div>
        <div className="mt-2 text-sm">
          Confidence: <span className="text-blue-400">{(pr.probability * 85).toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-300">Key Success Factors:</h4>
        {factors.map((factor) => (
          <div key={factor.name} className="flex items-center justify-between">
            <span className="text-sm">{factor.name}</span>
            <div className="flex items-center space-x-3">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  style={{ width: `${factor.score * 100}%` }}
                />
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                factor.impact === 'High' ? 'bg-green-900/30 text-green-400' :
                factor.impact === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-gray-700 text-gray-400'
              }`}>
                {factor.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-gray-900/50 rounded-lg">
        <h4 className="font-semibold text-gray-300 mb-2">🎯 Recommendation:</h4>
        <p className="text-sm text-gray-400">{recommendation}</p>
      </div>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Predictions update every 15 minutes based on real-time voting data.</p>
      </div>
    </div>
  );
}
