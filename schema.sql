-- OpenChaos投票分析数据库Schema
-- 创建时间: 2026-04-01 13:59 EDT

-- PR表
CREATE TABLE IF NOT EXISTS prs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER UNIQUE NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  state TEXT CHECK(state IN ('open', 'closed', 'merged')) DEFAULT 'open',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  votes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  metadata JSON
);

-- 投票表
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  pr_id INTEGER NOT NULL REFERENCES prs(id),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  weight REAL DEFAULT 1.0,
  UNIQUE(pr_id, user_id, type)
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER UNIQUE NOT NULL,
  pr_id INTEGER NOT NULL REFERENCES prs(id),
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  sentiment_score REAL DEFAULT 0.0
);

-- 分析结果表
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pr_id INTEGER NOT NULL REFERENCES prs(id),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vote_velocity REAL DEFAULT 0.0,
  comment_velocity REAL DEFAULT 0.0,
  engagement_score REAL DEFAULT 0.0,
  win_probability REAL DEFAULT 0.0,
  confidence_interval_low REAL DEFAULT 0.0,
  confidence_interval_high REAL DEFAULT 1.0,
  key_factors JSON,
  community_sentiment JSON,
  historical_trend JSON,
  UNIQUE(pr_id, timestamp)
);

-- 用户影响力表
CREATE TABLE IF NOT EXISTS user_influence (
  user_id TEXT PRIMARY KEY,
  influence_score REAL DEFAULT 0.0,
  total_votes INTEGER DEFAULT 0,
  successful_predictions INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  last_active TIMESTAMP,
  metadata JSON
);

-- 预测历史表
CREATE TABLE IF NOT EXISTS prediction_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pr_id INTEGER NOT NULL REFERENCES prs(id),
  predicted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  predicted_probability REAL NOT NULL,
  actual_outcome BOOLEAN,
  confidence REAL DEFAULT 0.0,
  features_used JSON,
  model_version TEXT DEFAULT 'v1.0'
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_prs_state ON prs(state);
CREATE INDEX IF NOT EXISTS idx_prs_updated ON prs(updated_at);
CREATE INDEX IF NOT EXISTS idx_votes_pr ON votes(pr_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_pr ON analytics(pr_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_prediction_pr ON prediction_history(pr_id);
CREATE INDEX IF NOT EXISTS idx_prediction_outcome ON prediction_history(actual_outcome);

-- 视图：实时PR排名
CREATE VIEW IF NOT EXISTS pr_ranking AS
SELECT 
  p.id,
  p.number,
  p.title,
  p.author,
  p.state,
  p.votes_count,
  p.comments_count,
  COALESCE(a.win_probability, 0) as win_probability,
  COALESCE(a.engagement_score, 0) as engagement_score,
  ROW_NUMBER() OVER (ORDER BY COALESCE(a.win_probability, 0) DESC) as rank
FROM prs p
LEFT JOIN analytics a ON p.id = a.pr_id 
  AND a.timestamp = (SELECT MAX(timestamp) FROM analytics WHERE pr_id = p.id)
WHERE p.state = 'open'
ORDER BY win_probability DESC;

-- 视图：社区活跃用户
CREATE VIEW IF NOT EXISTS active_users AS
SELECT 
  u.user_id,
  u.influence_score,
  u.total_votes,
  COUNT(DISTINCT v.pr_id) as prs_voted,
  MAX(v.timestamp) as last_vote
FROM user_influence u
JOIN votes v ON u.user_id = v.user_id
GROUP BY u.user_id, u.influence_score, u.total_votes
ORDER BY u.influence_score DESC;

