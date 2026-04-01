#!/usr/bin/env python3
"""
PR推广助手 - 自动监控和推广openchaos PR
"""

import os
import time
import json
from datetime import datetime, timedelta
import subprocess

class PRPromoter:
    """PR推广助手"""
    
    def __init__(self):
        self.pr_number = 226
        self.repo = "skridlevsky/openchaos"
        self.pr_url = f"https://github.com/{self.repo}/pull/{self.pr_number}"
        self.discord_webhook = os.environ.get('DISCORD_WEBHOOK', '')
        self.vote_goal = 10
        self.deadline = "2026-03-29T19:00:00Z"  # 周六19:00 UTC
        
    def get_pr_status(self):
        """获取PR状态"""
        try:
            result = subprocess.run(
                ['gh', 'pr', 'view', str(self.pr_number), '--repo', self.repo, '--json', 'state,reactions,comments'],
                capture_output=True,
                text=True,
                check=True
            )
            data = json.loads(result.stdout)
            return data
        except Exception as e:
            print(f"获取PR状态失败: {e}")
            return {"state": "UNKNOWN", "reactions": {}, "comments": []}
    
    def analyze_votes(self, reactions):
        """分析投票情况"""
        if not reactions:
            return {"thumbs_up": 0, "thumbs_down": 0, "net_votes": 0}
        
        thumbs_up = reactions.get('+1', 0)
        thumbs_down = reactions.get('-1', 0)
        net_votes = thumbs_up - thumbs_down
        
        return {
            "thumbs_up": thumbs_up,
            "thumbs_down": thumbs_down,
            "net_votes": net_votes,
            "progress": min(100, (net_votes / self.vote_goal) * 100)
        }
    
    def generate_status_report(self):
        """生成状态报告"""
        pr_data = self.get_pr_status()
        votes = self.analyze_votes(pr_data.get('reactions', {}))
        
        now = datetime.utcnow()
        deadline = datetime.fromisoformat(self.deadline.replace('Z', '+00:00'))
        time_left = deadline - now
        hours_left = int(time_left.total_seconds() / 3600)
        
        report = {
            "timestamp": now.isoformat(),
            "pr_number": self.pr_number,
            "pr_url": self.pr_url,
            "state": pr_data.get('state', 'UNKNOWN'),
            "votes": votes,
            "time_left_hours": hours_left,
            "comments_count": len(pr_data.get('comments', [])),
            "goal_reached": votes['net_votes'] >= self.vote_goal
        }
        
        return report
    
    def print_report(self, report):
        """打印报告"""
        print("\n" + "="*50)
        print(f"📊 PR #{report['pr_number']} 状态报告")
        print("="*50)
        
        print(f"🔗 链接: {report['pr_url']}")
        print(f"📝 状态: {report['state']}")
        print(f"💬 评论: {report['comments_count']} 条")
        
        votes = report['votes']
        print(f"\n🎯 投票情况:")
        print(f"   👍 赞成: {votes['thumbs_up']}")
        print(f"   👎 反对: {votes['thumbs_down']}")
        print(f"   📈 净投票: {votes['net_votes']}/{self.vote_goal}")
        print(f"   📊 进度: {votes['progress']:.1f}%")
        
        print(f"\n⏰ 剩余时间: {report['time_left_hours']} 小时")
        
        if report['goal_reached']:
            print("\n🎉 目标已达成！等待合并...")
        elif report['time_left_hours'] <= 0:
            print("\n⏳ 时间已到！")
        else:
            votes_needed = self.vote_goal - votes['net_votes']
            print(f"\n🚀 还需要 {votes_needed} 个净投票")
            
            # 建议行动
            if votes['net_votes'] < 3:
                print("💡 建议: 立即开始Discord和Twitter推广")
            elif votes['net_votes'] < 7:
                print("💡 建议: 加强社区互动，请求朋友支持")
            else:
                print("💡 建议: 最后冲刺，私信请求投票")
        
        print("="*50)
    
    def generate_promotion_message(self, report):
        """生成推广消息"""
        votes = report['votes']
        hours_left = report['time_left_hours']
        
        if hours_left <= 0:
            return None
        
        messages = []
        
        # Discord消息
        discord_msg = f"""🎨 **openchaos PR #{self.pr_number} 需要你的支持！**

**"Dark that Sparks - Enhanced Theme Toggle with Animations"**

当前投票: 👍 {votes['thumbs_up']} | 👎 {votes['thumbs_down']} | 净投票: {votes['net_votes']}/{self.vote_goal}
剩余时间: {hours_left}小时

🔗 {self.pr_url}

**功能亮点**:
• 三种主题模式 + 平滑动画
• 保持项目特色的"反转系统偏好"
• localStorage保存用户选择
• 响应式设计，移动端友好

请帮忙点个 👍 支持一下！我们需要至少{self.vote_goal}个净投票才能被合并。

谢谢！ 🙏"""
        
        messages.append(("Discord", discord_msg))
        
        # Twitter消息
        twitter_msg = f"""🎨 Support openchaos PR #{self.pr_number}: "Dark that Sparks"

Enhanced theme toggle with smooth animations, 3 modes, and localStorage.

Current: {votes['net_votes']}/{self.vote_goal} net votes needed
Time left: {hours_left}h

Vote with 👍 if you like it!

{self.pr_url}

#openchaos #opensource #github"""
        
        messages.append(("Twitter", twitter_msg))
        
        # GitHub评论更新
        if votes['net_votes'] > 0:
            github_comment = f"""## 📊 投票进度更新

当前投票情况:
- 👍 赞成: {votes['thumbs_up']}
- 👎 反对: {votes['thumbs_down']}
- 📈 净投票: {votes['net_votes']}/{self.vote_goal}
- ⏰ 剩余时间: {hours_left}小时

感谢所有支持者！ 🙏

还需要 {self.vote_goal - votes['net_votes']} 个净投票才能达到目标。

请继续分享和支持！"""
            
            messages.append(("GitHub Comment", github_comment))
        
        return messages
    
    def save_report(self, report):
        """保存报告到文件"""
        filename = f"pr_status_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"📄 报告已保存: {filename}")
    
    def run(self, interval_minutes=60):
        """运行监控"""
        print("🚀 PR推广助手启动")
        print(f"监控PR: #{self.pr_number}")
        print(f"目标: {self.vote_goal}个净投票")
        print(f"截止: {self.deadline}")
        
        try:
            while True:
                # 生成报告
                report = self.generate_status_report()
                
                # 打印报告
                self.print_report(report)
                
                # 保存报告
                self.save_report(report)
                
                # 生成推广消息
                messages = self.generate_promotion_message(report)
                if messages:
                    print("\n💡 推广消息建议:")
                    for platform, msg in messages:
                        print(f"\n[{platform}]:")
                        print("-"*40)
                        print(msg[:200] + "..." if len(msg) > 200 else msg)
                        print("-"*40)
                
                # 检查是否完成
                if report['goal_reached'] or report['time_left_hours'] <= 0:
                    print("\n🎉 监控完成!")
                    break
                
                # 等待下一次检查
                print(f"\n⏳ 下次检查: {interval_minutes}分钟后")
                time.sleep(interval_minutes * 60)
                
        except KeyboardInterrupt:
            print("\n👋 手动停止")
        except Exception as e:
            print(f"❌ 错误: {e}")

def main():
    """主函数"""
    promoter = PRPromoter()
    
    # 立即运行一次
    report = promoter.generate_status_report()
    promoter.print_report(report)
    
    # 询问是否开始监控
    response = input("\n开始自动监控？(y/n): ").strip().lower()
    if response == 'y':
        promoter.run(interval_minutes=30)  # 每30分钟检查一次
    else:
        print("单次检查完成")

if __name__ == "__main__":
    main()