# 《我在大唐送外卖》知识库

## 项目类型

微信小游戏 | Cocos Creator 3.x | TypeScript | 纯广告变现

## 目录结构

- **assets/scripts/core/** — 核心管理器（GameManager, DataManager, AdManager, CloudManager）
- **assets/scripts/systems/** — 业务系统（Delivery, Vehicle, Station, Finance, Reputation）
- **assets/scripts/ui/** — UI 控制器（MainUI, DeliveryUI, StationUI, FinanceUI）
- **assets/scripts/models/** — 数据模型（PlayerData, OrderData, EmployeeData, StationData, CommodityData）
- **assets/scripts/utils/** — 工具模块（Constants, EventBus, Logger, TimeUtils）
- **cloudfunctions/** — 微信云函数（login, saveGame, loadGame, calculateOfflineEarnings, rewardAd, getLeaderboard）
- **assets/textures/** — 游戏素材（characters, vehicles, buildings, commodities, ui, tiles, effects, backgrounds）
- **assets/scenes/** — Cocos Creator 场景文件
- **doc/** — 原始需求文档（PRD + 美术需求）
- **docs/** — 项目文档（Architecture, API, Development, Deployment）

## 关键架构决策

1. **单例模式** — GameManager, DataManager, AdManager, CloudManager 均为单例
2. **事件驱动** — 模块间通过 EventBus 解耦通信
3. **依赖注入** — Systems 接收 PlayerData 引用而非直接操作单例
4. **服务端验证** — 广告奖励和离线收益在云函数端计算
5. **离线优先** — 本地缓存为主，云端为备份

## 技术约束

- TypeScript strict 模式
- 纯广告变现，无内购
- 微信云开发免费额度足够个人开发者
- 所有数值集中在 Constants.ts，方便调优

## 入口文件

- **App.ts** — 游戏入口，初始化所有 Manager，加载场景
- 初始化顺序：CloudManager.init() → DataManager.loadGame() → GameManager.init() → MainScene

## 场景流转

```
MainScene (主地图)
  ├── DeliveryScene (送货)
  ├── StationScene (站点管理)
  └── FinanceScene (金融街)
```
