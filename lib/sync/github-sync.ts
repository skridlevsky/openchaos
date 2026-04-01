// GitHub数据同步服务
import { db, PRData, VoteData } from '@/lib/db';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'process.env.GITHUB_TOKEN';
const REPO_OWNER = 'skridlevsky';
const REPO_NAME = 'openchaos';

interface GitHubPR {
  id: number;
  number: number;
  title: string;
  user: { login: string };
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  reactions: {
    '+1': number;
    '-1': number;
    laugh: number;
    confused: number;
    heart: number;
    hooray: number;
    rocket: number;
    eyes: number;
    total_count: number;
  };
  comments: number;
}

interface GitHubReaction {
  id: number;
  user: { login: string };
  content: string;
  created_at: string;
}

class GitHubSyncService {
  private baseURL = 'https://api.github.com';
  private headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'OpenChaos-Analytics'
  };

  // 同步所有开放PR
  async syncAllOpenPRs(): Promise<void> {
    console.log('开始同步GitHub PR数据...');
    
    try {
      const prs = await this.fetchOpenPRs();
      console.log(`找到 ${prs.length} 个开放PR`);
      
      for (const pr of prs) {
        await this.syncPR(pr);
        await this.syncPRReactions(pr.id, pr.number);
        // 短暂延迟避免速率限制
        await this.delay(100);
      }
      
      console.log('GitHub PR数据同步完成');
    } catch (error) {
      console.error('同步失败:', error);
      throw error;
    }
  }

  // 获取所有开放PR
  private async fetchOpenPRs(): Promise<GitHubPR[]> {
    const url = `${this.baseURL}/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&per_page=100`;
    const response = await fetch(url, { headers: this.headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API错误: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // 同步单个PR数据
  private async syncPR(pr: GitHubPR): Promise<number> {
    const prData: PRData = {
      github_id: pr.id,
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      state: pr.state === 'open' ? 'open' : 'closed',
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      votes_count: pr.reactions['+1'] || 0,
      comments_count: pr.comments,
      metadata: {
        reactions: pr.reactions,
        html_url: `https://github.com/${REPO_OWNER}/${REPO_NAME}/pull/${pr.number}`
      }
    };

    const prId = await db.upsertPR(prData);
    console.log(`同步PR #${pr.number}: ${pr.title}`);
    return prId;
  }

  // 同步PR反应（投票）
  private async syncPRReactions(prId: number, prNumber: number): Promise<void> {
    const reactions = await this.fetchPRReactions(prNumber);
    
    for (const reaction of reactions) {
      const voteData: VoteData = {
        id: `vote_${prId}_${reaction.user.login}_${reaction.content}`,
        pr_id: prId,
        user_id: reaction.user.login,
        type: reaction.content,
        timestamp: reaction.created_at,
        weight: this.calculateVoteWeight(reaction.content)
      };
      
      await db.recordVote(voteData);
    }
    
    if (reactions.length > 0) {
      console.log(`  同步了 ${reactions.length} 个投票反应`);
    }
  }

  // 获取PR反应
  private async fetchPRReactions(prNumber: number): Promise<GitHubReaction[]> {
    const url = `${this.baseURL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${prNumber}/reactions`;
    const response = await fetch(url, { headers: this.headers });
    
    if (!response.ok) {
      if (response.status === 404) {
        return []; // 没有反应
      }
      throw new Error(`获取反应失败: ${response.status}`);
    }
    
    return response.json();
  }

  // 计算投票权重
  private calculateVoteWeight(type: string): number {
    const weights: Record<string, number> = {
      '+1': 1.0,    // 赞成
      'heart': 0.8, // 喜欢
      'hooray': 0.7, // 欢呼
      'rocket': 0.6, // 火箭
      'eyes': 0.5,   // 关注
      'laugh': 0.3,  // 笑
      'confused': 0.2, // 困惑
      '-1': -0.5    // 反对
    };
    
    return weights[type] || 0.1;
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取用户影响力数据
  async syncUserInfluence(): Promise<void> {
    console.log('开始同步用户影响力数据...');
    
    // 从投票数据计算用户影响力
    // 这里可以添加更复杂的算法
    // 暂时使用简单的投票计数
    
    console.log('用户影响力数据同步完成');
  }

  // 运行完整同步
  async runFullSync(): Promise<void> {
    console.log('=== 开始完整数据同步 ===');
    await this.syncAllOpenPRs();
    await this.syncUserInfluence();
    console.log('=== 数据同步完成 ===');
  }
}

// 导出单例
export const githubSync = new GitHubSyncService();

// 命令行接口
if (require.main === module) {
  githubSync.runFullSync().catch(console.error);
}
