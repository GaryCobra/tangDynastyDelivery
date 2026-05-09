# 云函数知识库

## 概述

6 个微信云函数，使用 Node.js + wx-server-sdk，部署在微信云开发环境。

## 通用模式

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // 获取用户: wxContext.OPENID
  // 操作数据库: cloud.database().collection('name')
  try { ... } catch (e) { return { error: e.message }; }
};
```

## 函数清单

| 函数 | 集合 | 输入 | 输出 |
|------|------|------|------|
| login | users | (空) | { openid, isNewUser } |
| saveGame | saves | { uid, gameData } | { success } |
| loadGame | saves | (空) | { found, uid, gameData } |
| calculateOfflineEarnings | offline_rewards | { uid, lastLoginTime, stationLevel, employeeCount, totalEfficiency } | { coins, hours, message } |
| rewardAd | ad_logs | { uid, adType, rewardType } | { success, rewardAmount, dailyCount } |
| getLeaderboard | saves | (空) | { list[] } |

## 安全约束

- 所有函数通过 WXContext 自动获取用户身份
- rewardAd 每日上限 30 次（按 date+_openid 统计）
- calculateOfflineEarnings 最大 12 小时
- saveGame 限制 100KB 数据大小
