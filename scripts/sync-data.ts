#!/usr/bin/env ts-node
// 数据同步脚本
import { githubSync } from '@/lib/sync/github-sync';
import { analyticsEngine } from '@/lib/analytics/engine';

async function main() {
  console.log('🚀 启动OpenChaos数据同步和分析');
  
  try {
    // 步骤1: 同步GitHub数据
    await githubSync.runFullSync();
    
    // 步骤2: 运行分析
    await analyticsEngine.analyzeAllOpenPRs();
    
    console.log('✅ 数据同步和分析完成');
  } catch (error) {
    console.error('❌ 同步失败:', error);
    process.exit(1);
  }
}

main();
