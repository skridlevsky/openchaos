#!/usr/bin/env python3
"""
简单PR状态检查
"""

import json
import subprocess
from datetime import datetime

def check_pr_status():
    """检查PR状态"""
    print("🔍 检查PR #226 状态...")
    
    try:
        # 获取PR基本信息
        result = subprocess.run(
            ['gh', 'pr', 'view', '226', '--repo', 'skridlevsky/openchaos', '--json', 'number,title,state,url,createdAt'],
            capture_output=True,
            text=True,
            check=True
        )
        
        pr_data = json.loads(result.stdout)
        print(f"✅ PR #{pr_data['number']}: {pr_data['title']}")
        print(f"🔗 链接: {pr_data['url']}")
        print(f"📝 状态: {pr_data['state']}")
        print(f"🕐 创建时间: {pr_data['createdAt']}")
        
        # 获取反应（投票）
        result = subprocess.run(
            ['gh', 'pr', 'view', '226', '--repo', 'skridlevsky/openchaos', '--json', 'reactions'],
            capture_output=True,
            text=True,
            check=True
        )
        
        reactions_data = json.loads(result.stdout)
        reactions = reactions_data.get('reactions', {})
        
        thumbs_up = reactions.get('+1', 0)
        thumbs_down = reactions.get('-1', 0)
        net_votes = thumbs_up - thumbs_down
        
        print(f"\n🎯 投票情况:")
        print(f"   👍 赞成: {thumbs_up}")
        print(f"   👎 反对: {thumbs_down}")
        print(f"   📈 净投票: {net_votes}/10 (目标)")
        
        # 计算进度
        goal = 10
        progress = min(100, (net_votes / goal) * 100) if goal > 0 else 0
        
        print(f"   📊 进度: {progress:.1f}%")
        
        # 剩余时间计算
        created_at = datetime.fromisoformat(pr_data['createdAt'].replace('Z', '+00:00'))
        deadline = created_at.replace(hour=19, minute=0, second=0)  # 周六19:00 UTC
        
        # 如果创建时间已经过了周六19:00，则计算下周六
        if created_at.weekday() >= 5:  # 5=周六, 6=周日
            days_to_add = (5 - created_at.weekday()) % 7
            if days_to_add == 0:
                days_to_add = 7
            deadline = deadline.replace(day=created_at.day + days_to_add)
        
        now = datetime.utcnow()
        time_left = deadline - now
        
        if time_left.total_seconds() > 0:
            hours_left = int(time_left.total_seconds() / 3600)
            print(f"\n⏰ 剩余时间: {hours_left} 小时")
            
            if net_votes >= goal:
                print("\n🎉 目标已达成！等待合并...")
            else:
                votes_needed = goal - net_votes
                print(f"\n🚀 还需要 {votes_needed} 个净投票")
                
                # 建议
                if net_votes < 3:
                    print("💡 建议: 立即开始Discord和Twitter推广")
                elif net_votes < 7:
                    print("💡 建议: 加强社区互动，请求朋友支持")
                else:
                    print("💡 建议: 最后冲刺，私信请求投票")
        else:
            print("\n⏳ 时间已到！")
            
            if net_votes >= goal:
                print("✅ 成功达到目标！")
            else:
                print(f"❌ 未达到目标，差 {goal - net_votes} 票")
        
        return {
            "success": True,
            "pr": pr_data,
            "votes": {
                "thumbs_up": thumbs_up,
                "thumbs_down": thumbs_down,
                "net_votes": net_votes,
                "progress": progress
            },
            "time_left_hours": hours_left if time_left.total_seconds() > 0 else 0
        }
        
    except subprocess.CalledProcessError as e:
        print(f"❌ 命令执行失败: {e}")
        print(f"错误输出: {e.stderr}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        print(f"❌ 检查失败: {e}")
        return {"success": False, "error": str(e)}

def main():
    """主函数"""
    print("="*50)
    print("🚀 openchaos PR #226 状态检查")
    print("="*50)
    
    result = check_pr_status()
    
    print("\n" + "="*50)
    print("💡 立即行动:")
    print("1. 访问PR: https://github.com/skridlevsky/openchaos/pull/226")
    print("2. 给自己点个 👍")
    print("3. 分享到Discord: https://discord.gg/6S5T5DyzZq")
    print("4. 发Twitter推文")
    print("5. 请求朋友支持")
    print("="*50)
    
    if result.get("success"):
        # 保存结果
        with open("pr_status.json", "w") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print("📄 状态已保存: pr_status.json")

if __name__ == "__main__":
    main()