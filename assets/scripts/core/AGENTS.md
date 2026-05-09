# Core 层知识库

## 职责

核心基础设施层，提供游戏生命周期管理、数据持久化、云服务和广告服务。

## 模块

### GameManager.ts
- **类型**：单例 (static getInstance())
- **职责**：状态机管理 (LOADING/RUNNING/PAUSED/DELIVERY/FINANCE/STATION)
- **关键方法**：init(), update(dt), getState(), setState()
- **依赖**：PlayerData, EventBus
- **游戏循环**：每秒 tick，60 秒自动存档，86400 秒（游戏天）切换

### DataManager.ts
- **类型**：单例
- **职责**：本地 (wx.getStorageSync) + 云端 (CloudManager) 两级存储
- **关键方法**：saveGame(), loadGame(), deleteGame(), syncToCloud(), syncFromCloud()
- **策略**：离线本地缓存，在线本地+云端双重写入
- **降级**：云端不可用时静默回退到本地

### AdManager.ts
- **类型**：单例
- **职责**：激励视频和插屏广告管理
- **关键方法**：showRewardedAd(), showInterstitialAd()
- **奖励类型**：coins (50), stamina (30), finance_tip (1)
- **限制**：每日 30 次 (AD_CONFIG.MAX_DAILY_REWARDED_ADS)
- **降级**：SDK 不可用时自动模拟奖励（非微信环境调试）

### CloudManager.ts
- **类型**：单例
- **职责**：封装 wx.cloud.callFunction，提供类型化调用
- **关键方法**：login(), saveGame(), loadGame(), calculateOfflineEarnings(), rewardAd(), getLeaderboard()
- **初始化**：wx.cloud.init({ env: DYNAMIC_CURRENT_ENV })

## 通信

- Core 层通过 EventBus.emit() 通知 UI 层数据变化
- Systems 层通过构造参数接收 PlayerData
- 不直接操作 UI 组件

## 扩展指南

添加新的云函数：
1. 在 cloudfunctions/ 下创建目录
2. 实现 index.js + package.json
3. 在 CloudManager.ts 中添加类型化方法
4. 在 docs/API.md 中添加文档
