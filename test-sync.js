// 简化测试脚本
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'analytics.db');

console.log('测试数据库连接...');
const db = new Database(DB_PATH);

// 测试查询
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('数据库表:', tables.map(t => t.name));

// 测试插入示例数据
const testPR = {
  github_id: 999999,
  number: 999,
  title: 'Test PR',
  author: 'testuser',
  state: 'open',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  votes_count: 5,
  comments_count: 2,
  metadata: JSON.stringify({ test: true })
};

try {
  const stmt = db.prepare(`
    INSERT INTO prs (github_id, number, title, author, state, created_at, updated_at, votes_count, comments_count, metadata)
    VALUES (@github_id, @number, @title, @author, @state, @created_at, @updated_at, @votes_count, @comments_count, @metadata)
  `);
  const result = stmt.run(testPR);
  console.log('插入测试数据成功，ID:', result.lastInsertRowid);
  
  // 查询验证
  const prs = db.prepare("SELECT * FROM prs WHERE github_id = ?").all(999999);
  console.log('查询结果:', prs.length, '条记录');
  
  // 清理测试数据
  db.prepare("DELETE FROM prs WHERE github_id = ?").run(999999);
  console.log('清理测试数据完成');
  
} catch (error) {
  console.error('数据库操作错误:', error.message);
}

db.close();
console.log('✅ 数据库测试完成');
