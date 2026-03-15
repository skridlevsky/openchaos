"use client";

import { useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { ACHIEVEMENTS } from '@/lib/achievements';

export function BadgeDisplay({ compact = false }: { compact?: boolean }) {
  const { achievements, stats, newlyUnlocked } = useAchievements();
  const [showAll, setShowAll] = useState(false);
  const locked = ACHIEVEMENTS.filter(a => !achievements.find(u => u.id === a.id));
  const displayed = showAll ? achievements : achievements.slice(0, compact ? 5 : 10);
  const progress = Math.round((achievements.length / ACHIEVEMENTS.length) * 100);

  if (compact) {
    return (
      <div className="badge-display-compact" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#ffd700' }}>🏅 Badges</span>
          <span style={{ fontSize: 12, color: '#888' }}>{achievements.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {achievements.slice(0, 5).map(b => <span key={b.id} style={{ fontSize: 20, cursor: 'help' }} title={`${b.name}: ${b.description}`}>{b.icon}</span>)}
          {achievements.length > 5 && <span style={{ fontSize: 14, color: '#888' }}>+{achievements.length - 5}</span>}
        </div>
        {newlyUnlocked.length > 0 && <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', fontSize: 12, padding: '6px 12px', background: 'linear-gradient(135deg, #ffd700, #ffed4e)', color: '#1a1a2e', borderRadius: 6, whiteSpace: 'nowrap' }}>🎉 {newlyUnlocked[0].name}!</div>}
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: 12, padding: 20, margin: '20px 0', border: '2px solid #4a4a6a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontSize: 24, fontWeight: 'bold', color: '#ffd700', margin: 0 }}>🏅 Your Achievements</h3>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>{progress}% Complete</span>
          <div style={{ width: 150, height: 8, background: '#333', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #ffd700, #ffed4e)', width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 15, marginBottom: 20, padding: 15, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center' }}><span style={{ fontSize: 28, fontWeight: 'bold', color: '#4fc3f7' }}>{stats.totalVotes}</span><span style={{ fontSize: 11, color: '#888', display: 'block', textTransform: 'uppercase' }}>Votes</span></div>
        <div style={{ textAlign: 'center' }}><span style={{ fontSize: 28, fontWeight: 'bold', color: '#4fc3f7' }}>{stats.votingStreak}</span><span style={{ fontSize: 11, color: '#888', display: 'block', textTransform: 'uppercase' }}>Streak</span></div>
        <div style={{ textAlign: 'center' }}><span style={{ fontSize: 28, fontWeight: 'bold', color: '#4fc3f7' }}>{stats.prsSubmitted}</span><span style={{ fontSize: 11, color: '#888', display: 'block', textTransform: 'uppercase' }}>PRs</span></div>
        <div style={{ textAlign: 'center' }}><span style={{ fontSize: 28, fontWeight: 'bold', color: '#4fc3f7' }}>{stats.prsWon}</span><span style={{ fontSize: 11, color: '#888', display: 'block', textTransform: 'uppercase' }}>Wins</span></div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 16, color: '#ccc', margin: '0 0 10px 0', paddingBottom: 5, borderBottom: '1px solid #444' }}>Unlocked ({achievements.length})</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {displayed.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, background: 'linear-gradient(135deg, rgba(79,195,247,0.1), rgba(79,195,247,0.05))', border: '1px solid rgba(79,195,247,0.3)', transition: 'transform 0.2s' }}>
              <span style={{ fontSize: 32 }}>{b.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                <span style={{ fontWeight: 'bold', color: '#fff', fontSize: 14 }}>{b.name}</span>
                <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.description}</span>
              </div>
            </div>
          ))}
        </div>
        {achievements.length > 10 && !showAll && <button onClick={() => setShowAll(true)} style={{ background: 'transparent', border: '1px solid #4a4a6a', color: '#4fc3f7', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', marginTop: 10 }}>Show {achievements.length - 10} more...</button>}
      </div>
      {showAll && locked.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 16, color: '#ccc', margin: '0 0 10px 0', paddingBottom: 5, borderBottom: '1px solid #444' }}>Locked ({locked.length})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {locked.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px dashed #444', opacity: 0.6 }}>
                <span style={{ fontSize: 32 }}>🔒</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                  <span style={{ fontWeight: 'bold', color: '#fff', fontSize: 14 }}>{b.name}</span>
                  <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ textAlign: 'center', paddingTop: 15, borderTop: '1px solid #333' }}>
        <button onClick={() => { if(confirm('Reset progress?')) { localStorage.removeItem('openchaos_achievements'); window.location.reload(); } }} style={{ background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Reset Progress</button>
      </div>
      {newlyUnlocked.length > 0 && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'linear-gradient(135deg, #ffd700, #ffed4e)', color: '#1a1a2e', padding: '16px 20px', borderRadius: 12, boxShadow: '0 8px 32px rgba(255,215,0,0.3)', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎉</span>
            <div style={{ fontSize: 14 }}>
              <strong>Achievement Unlocked!</strong>
              {newlyUnlocked.map(a => <div key={a.id}>{a.icon} {a.name}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
