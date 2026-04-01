// 社区热图组件
'use client';

export default function CommunityHeatmap() {
  const activeUsers = [
    { name: 'sungdark', votes: 12, influence: 0.92 },
    { name: 'smallshao', votes: 8, influence: 0.85 },
    { name: 'ma-moon', votes: 15, influence: 0.78 },
    { name: 'qwldcl-del', votes: 6, influence: 0.71 },
    { name: 'wdxia134', votes: 9, influence: 0.65 },
    { name: 'alice', votes: 4, influence: 0.58 },
    { name: 'bob', votes: 7, influence: 0.52 },
    { name: 'charlie', votes: 3, influence: 0.45 },
  ];

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-6">👥 Community Activity Heatmap</h3>
      
      <div className="space-y-4">
        {activeUsers.map((user) => (
          <div key={user.name} className="flex items-center">
            <div className="w-32 text-sm font-medium truncate">{user.name}</div>
            <div className="flex-1 ml-4">
              <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"
                  style={{ width: `${user.influence * 100}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-right">
              <span className="text-green-400 font-semibold">{user.votes}</span>
              <span className="text-gray-500 text-sm ml-1">votes</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex justify-between text-sm text-gray-400">
          <div>
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
            High Influence
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
            Medium Influence
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-gray-600 rounded-full mr-2"></span>
            Low Influence
          </div>
        </div>
      </div>
    </div>
  );
}
