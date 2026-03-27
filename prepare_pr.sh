#!/bin/bash

# 准备 openchaos $100 赏金 PR 提交脚本

echo "🚀 准备提交 openchaos PR: Dark that Sparks"

# 检查当前状态
echo "📊 当前Git状态:"
git status

# 创建新分支
BRANCH_NAME="enhanced-theme-toggle-$(date +%Y%m%d-%H%M%S)"
echo "🌿 创建分支: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

# 添加所有更改
echo "📁 添加更改文件:"
git add .

# 提交更改
COMMIT_MESSAGE="feat: Enhanced theme toggle with animations and multiple modes

- Add three theme modes: light, dark, system (reversed)
- Implement smooth animations and transitions
- Add localStorage persistence for user preference
- Improve UI with better visual feedback
- Maintain backward compatibility with existing behavior
- Add theme toggle widget to Web2 sidebar
- Update ASCII page with enhanced toggle

Title rhyme: Dark that Sparks"
echo "💾 提交更改:"
git commit -m "$COMMIT_MESSAGE"

echo "✅ 准备完成!"
echo ""
echo "📋 下一步:"
echo "1. 推送分支: git push origin $BRANCH_NAME"
echo "2. 创建PR: 访问 https://github.com/skridlevsky/openchaos/compare"
echo "3. 使用标题: 'Dark that Sparks - Enhanced Theme Toggle with Animations'"
echo "4. 使用PR_DESCRIPTION.md中的内容"
echo "5. 添加标签: enhancement, theme, ui"
echo "6. 请求审查并开始推广!"
echo ""
echo "🎯 记住PR规则:"
echo "- 标题必须包含两个押韵单词"
echo "- 需要至少10个净投票 (👍 - 👎)"
echo "- CI必须通过"
echo "- 无合并冲突"
echo ""
echo "💰 目标: 赢得$100赏金!"