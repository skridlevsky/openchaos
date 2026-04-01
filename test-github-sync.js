const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GITHUB_TOKEN = 'process.env.GITHUB_TOKEN';
const REPO_OWNER = 'skridlevsky';
const REPO_NAME = 'openchaos';

async function testGitHubAPI() {
  console.log('测试GitHub API连接...');
  
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'OpenChaos-Analytics-Test'
  };
  
  try {
    // 测试用户认证
    console.log('1. 测试用户认证...');
    const userResponse = await fetch('https://api.github.com/user', { headers });
    if (!userResponse.ok) {
      throw new Error(`用户认证失败: ${userResponse.status}`);
    }
    const user = await userResponse.json();
    console.log(`   用户: ${user.login} (${user.name})`);
    
    // 测试仓库访问
    console.log('2. 测试仓库访问...');
    const repoResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, { headers });
    if (!repoResponse.ok) {
      throw new Error(`仓库访问失败: ${repoResponse.status}`);
    }
    const repo = await repoResponse.json();
    console.log(`   仓库: ${repo.full_name} (${repo.stargazers_count} stars)`);
    
    // 测试PR列表
    console.log('3. 测试PR列表...');
    const prsResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&per_page=5`, { headers });
    if (!prsResponse.ok) {
      throw new Error(`PR列表失败: ${prsResponse.status}`);
    }
    const prs = await prsResponse.json();
    console.log(`   找到 ${prs.length} 个开放PR:`);
    prs.forEach(pr => {
      console.log(`   - PR #${pr.number}: ${pr.title} (${pr.user.login})`);
    });
    
    // 测试第一个PR的详情
    if (prs.length > 0) {
      console.log('4. 测试PR详情...');
      const pr = prs[0];
      const prDetailResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${pr.number}`, { headers });
      if (prDetailResponse.ok) {
        const prDetail = await prDetailResponse.json();
        console.log(`   PR #${pr.number} 详情:`);
        console.log(`     投票: +${prDetail.reactions['+1'] || 0} 👍`);
        console.log(`     评论: ${prDetail.comments} 条`);
        console.log(`     状态: ${prDetail.state}`);
      }
    }
    
    // 检查API限制
    console.log('5. 检查API限制...');
    const rateLimitResponse = await fetch('https://api.github.com/rate_limit', { headers });
    if (rateLimitResponse.ok) {
      const rateLimit = await rateLimitResponse.json();
      const core = rateLimit.resources.core;
      console.log(`   API限制: ${core.remaining}/${core.limit} 次剩余`);
      console.log(`   重置时间: ${new Date(core.reset * 1000).toLocaleTimeString()}`);
    }
    
    console.log('✅ GitHub API测试完成');
    
  } catch (error) {
    console.error('❌ GitHub API测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应头:', error.response.headers);
    }
  }
}

testGitHubAPI();
