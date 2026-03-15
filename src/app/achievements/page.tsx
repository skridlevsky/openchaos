"use client";

import { BadgeDisplay } from "@/components/BadgeDisplay";
import { Web2Layout } from "@/components/Web2Layout";

export default function AchievementsPage() {
  return (
    <Web2Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#ffd700', textAlign: 'center', marginBottom: 10 }}>🏅 Achievement Center</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 30, fontSize: 14 }}>Track your OpenChaos journey! Earn badges by voting, submitting PRs, and participating in the chaos.</p>
        <BadgeDisplay />
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 20, marginTop: 30, border: '1px solid #333' }}>
          <h3 style={{ color: '#4fc3f7', marginTop: 0, marginBottom: 15 }}>💡 How to Earn Badges</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '8px 0', color: '#ccc', borderBottom: '1px solid #222' }}><strong>Vote regularly</strong> - Cast votes on PRs to earn voting badges and build streaks</li>
            <li style={{ padding: '8px 0', color: '#ccc', borderBottom: '1px solid #222' }}><strong>Submit PRs</strong> - Contribute to OpenChaos with your own features and fixes</li>
            <li style={{ padding: '8px 0', color: '#ccc', borderBottom: '1px solid #222' }}><strong>Win votes</strong> - Get your PRs merged by community vote</li>
            <li style={{ padding: '8px 0', color: '#ccc' }}><strong>Stay active</strong> - Vote on consecutive days to build your streak</li>
          </ul>
        </div>
      </div>
    </Web2Layout>
  );
}
