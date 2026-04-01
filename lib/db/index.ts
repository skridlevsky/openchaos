// 数据库连接和工具
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'analytics.db');

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database;

  private constructor() {
    this.db = new Database(DB_PATH, { verbose: console.log });
    this.initialize();
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initialize(): void {
    // 启用外键约束
    this.db.pragma('foreign_keys = ON');
    
    // 启用WAL模式提高并发性能
    this.db.pragma('journal_mode = WAL');
    
    // 设置繁忙超时
    this.db.pragma('busy_timeout = 5000');
    
    console.log('Database initialized at:', DB_PATH);
  }

  getConnection(): Database.Database {
    return this.db;
  }

  // PR相关操作
  async upsertPR(pr: PRData): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO prs (github_id, number, title, author, state, created_at, updated_at, votes_count, comments_count, metadata)
      VALUES (@github_id, @number, @title, @author, @state, @created_at, @updated_at, @votes_count, @comments_count, @metadata)
      ON CONFLICT(github_id) DO UPDATE SET
        title = excluded.title,
        state = excluded.state,
        updated_at = excluded.updated_at,
        votes_count = excluded.votes_count,
        comments_count = excluded.comments_count,
        metadata = excluded.metadata
      RETURNING id
    `);
    
    const result = stmt.get(pr) as { id: number };
    return result.id;
  }

  // 投票相关操作
  async recordVote(vote: VoteData): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO votes (id, pr_id, user_id, type, timestamp, weight)
      VALUES (@id, @pr_id, @user_id, @type, @timestamp, @weight)
    `);
    stmt.run(vote);
  }

  // 分析结果相关操作
  async saveAnalytics(analytics: AnalyticsData): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO analytics (
        pr_id, timestamp, vote_velocity, comment_velocity, engagement_score,
        win_probability, confidence_interval_low, confidence_interval_high,
        key_factors, community_sentiment, historical_trend
      ) VALUES (
        @pr_id, @timestamp, @vote_velocity, @comment_velocity, @engagement_score,
        @win_probability, @confidence_interval_low, @confidence_interval_high,
        @key_factors, @community_sentiment, @historical_trend
      )
    `);
    stmt.run(analytics);
  }

  // 查询操作
  async getOpenPRs(limit: number = 50): Promise<PRData[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM prs 
      WHERE state = 'open' 
      ORDER BY updated_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit) as PRData[];
  }

  async getPRAnalytics(prId: number, limit: number = 10): Promise<AnalyticsData[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM analytics 
      WHERE pr_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(prId, limit) as AnalyticsData[];
  }

  async getCommunityStats(): Promise<CommunityStats> {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_votes,
        AVG(influence_score) as avg_influence,
        MAX(last_active) as last_activity
      FROM user_influence
    `);
    return stmt.get() as CommunityStats;
  }

  // 关闭数据库连接
  close(): void {
    this.db.close();
  }
}

// 类型定义
interface PRData {
  github_id: number;
  number: number;
  title: string;
  author: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  votes_count: number;
  comments_count: number;
  metadata?: any;
}

interface VoteData {
  id: string;
  pr_id: number;
  user_id: string;
  type: string;
  timestamp: string;
  weight?: number;
}

interface AnalyticsData {
  pr_id: number;
  timestamp: string;
  vote_velocity: number;
  comment_velocity: number;
  engagement_score: number;
  win_probability: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  key_factors?: any;
  community_sentiment?: any;
  historical_trend?: any;
}

interface CommunityStats {
  total_users: number;
  total_votes: number;
  avg_influence: number;
  last_activity: string;
}

export const db = DatabaseManager.getInstance();
export type { PRData, VoteData, AnalyticsData, CommunityStats };
