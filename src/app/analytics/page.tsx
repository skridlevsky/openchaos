// 投票分析仪表板主页面
import VoteDashboard from '@/components/vote-analytics/VoteDashboard';
import { Suspense } from 'react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          📊 Vote Analytics Dashboard
        </h1>
        <p className="text-gray-400">
          Real-time insights for smarter voting decisions in OpenChaos
        </p>
      </header>

      <Suspense fallback={<LoadingSkeleton />}>
        <VoteDashboard />
      </Suspense>

      <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>
          This dashboard helps the OpenChaos community make data-driven voting decisions.
          Data updates every 5 minutes from GitHub API.
        </p>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-800 rounded w-1/3 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}
