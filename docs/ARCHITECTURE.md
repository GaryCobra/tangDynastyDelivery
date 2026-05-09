# 系统架构设计文档

> 本文档描述《我在大唐送外卖》的整体架构设计、模块划分和数据流。

---

## 1. 整体架构

```
┌──────────────────────────────────────────────────────┐
│                   视图层 (UI)                          │
│  MainUI · DeliveryUI · StationUI · FinanceUI          │
└──────────────────────┬───────────────────────────────┘
                       │ EventBus 事件驱动
┌──────────────────────▼───────────────────────────────┐
│                   业务逻辑层 (Systems)                 │
│  Delivery · Vehicle · Reputation · Station · Finance  │
└──────────────────────┬───────────────────────────────┘
                       │ 依赖注入
┌──────────────────────▼───────────────────────────────┐
│                   数据模型层 (Models)                  │
│  PlayerData · OrderData · EmployeeData · StationData  │
│  CommodityData                                        │
└──────────────────────┬───────────────────────────────┘
                       │ 持久化
┌──────────────────────▼───────────────────────────────┐
│                   基础设施层 (Core)                    │
│  GameManager · DataManager · CloudManager · AdManager │
└──────────────────────────────────────────────────────┘
```

## 2. 模块职责

### 2.1 核心层 (assets/scripts/core/)

| 模块 | 职责 | 关键方法 |
|------|------|----------|
| `GameManager` | 单例状态机，管理游戏生命周期 | `init()`, `update(dt)`, `getState()` |
| `DataManager` | 本地+云端数据持久化 | `saveGame()`, `loadGame()`, `syncToCloud()` |
| `CloudManager` | 微信云函数调用封装 | `callFunction()`, `login()`, `saveGame()` |
| `AdManager` | 广告展示与奖励发放 | `showRewardedAd()`, `showInterstitialAd()` |

### 2.2 业务系统层 (assets/scripts/systems/)

| 模块 | 职责 | 关键方法 |
|------|------|----------|
| `DeliverySystem` | 订单生成、配送执行、天气变化 | `acceptOrder()`, `updateDelivery()`, `completeDelivery()` |
| `VehicleSystem` | 载具解锁、切换、属性计算 | `unlockVehicle()`, `switchVehicle()`, `getEffectiveSpeed()` |
| `ReputationSystem` | 声望等级、功能解锁 | `addReputation()`, `checkLevelUp()`, `getUnlockedFeatures()` |
| `StationSystem` | 站点建立、员工管理、离线收益 | `establishStation()`, `hireEmployee()`, `calculateOfflineIncome()` |
| `FinanceSystem` | 商品交易、K线、随机事件 | `buy()`, `sell()`, `updateMarket()`, `triggerRandomEvent()` |

### 2.3 数据模型层 (assets/scripts/models/)

| 模块 | 关键属性 |
|------|----------|
| `PlayerData` | coins, reputationLevel, stamina, currentVehicle, unlockedVehicles |
| `OrderData` | type, origin, destination, distance, reward, timeLimit |
| `EmployeeData` | personality, speed, capacity, diligence, morale, fatigue |
| `StationData` | level, employeeSlots, dailyRevenue, upgradeCost |
| `CommodityData` | currentPrice, priceHistory[], playerHolding, playerAvgCost |

### 2.4 UI 控制层 (assets/scripts/ui/)

| 模块 | 对应场景 | 功能 |
|------|----------|------|
| `MainUI` | MainScene | 顶部信息栏、底部导航、地图入口 |
| `DeliveryUI` | DeliveryScene | 订单列表、载具信息、配送进度 |
| `StationUI` | StationScene | 员工列表、雇佣面板、薪资管理 |
| `FinanceUI` | FinanceScene | 商品行情、持仓信息、交易面板 |

### 2.5 工具层 (assets/scripts/utils/)

| 模块 | 功能 |
|------|------|
| `Constants` | 全游戏平衡数值（声望/载具/订单/天气/商品/员工） |
| `EventBus` | 发布-订阅事件总线，模块间解耦通信 |
| `Logger` | 分级日志系统（DEBUG/INFO/WARN/ERROR） |
| `TimeUtils` | 时间格式化、日期比较、离线时间计算 |

## 3. 数据流

### 3.1 游戏初始化流程

```
App.onLoad()
  ├── DataManager.loadGame()
  │     ├── 本地有存档 → 读取 PlayerData
  │     └── 本地无存档 → CloudManager.login()
  │                       └── 创建新 PlayerData
  ├── GameManager.init(playerData)
  ├── 加载 MainScene
  └── 启动 gameLoop (每秒 tick)
```

### 3.2 订单配送流程

```
用户点击"接单"
  ├── DeliverySystem.acceptOrder()
  │     ├── 检查体力
  │     ├── 检查载具载重
  │     └── 扣除体力，创建 DeliveryProgress
  ├── 用户进入配送画面
  ├── DeliverySystem.updateDelivery() [每帧]
  │     ├── 应用天气速度修正
  │     ├── 随机障碍触发
  │     └── 进度更新
  └── DeliverySystem.completeDelivery()
        ├── 计算奖励（完美送达 1.5x）
        ├── 更新声望经验
        ├── 触发广告插屏（概率）
        └── EventBus.emit(ORDER_COMPLETED)
```

### 3.3 数据持久化流程

```
DataManager.saveGame(playerData)
  ├── wx.setStorageSync() (本地)
  └── 如果在线 → CloudManager.saveGame() (云端)

DataManager.loadGame()
  ├── wx.getStorageSync() (本地优先)
  └── 如果本地无数据 → CloudManager.loadGame() (云端回退)
```

## 4. 事件总线设计

使用 EventBus 实现模块间解耦通信。关键事件：

| 事件 | 发射方 | 监听方 | 数据 |
|------|--------|--------|------|
| COINS_CHANGED | Systems | MainUI | coins: number |
| REPUTATION_CHANGED | ReputationSystem | MainUI | level, exp |
| STAMINA_CHANGED | DeliverySystem | MainUI | stamina: number |
| VEHICLE_CHANGED | VehicleSystem | DeliveryUI | type, action |
| ORDER_ACCEPTED | DeliverySystem | DeliveryUI | order: OrderData |
| ORDER_COMPLETED | DeliverySystem | DeliveryUI/Reputation | result |
| WEATHER_CHANGED | DeliverySystem | MainUI/DeliveryUI | weather: WeatherType |
| EMPLOYEE_HIRED | StationSystem | StationUI | employee: EmployeeData |
| COMMODITY_PRICE_CHANGED | FinanceSystem | FinanceUI | market[] |
| RANDOM_EVENT | FinanceSystem | FinanceUI | event |
| AD_REWARD_CLAIMED | AdManager | GameManager | rewardType |
| GAME_SAVED | DataManager | App | - |
| LEVEL_UP | ReputationSystem | MainUI | level |

## 5. 云函数架构

```
cloudfunctions/
├── login/                   # 用户认证与注册
│   └── users collection
├── saveGame/                # 游戏存档写入
├── loadGame/                # 游戏存档读取
│   └── saves collection
├── calculateOfflineEarnings/ # 离线收益计算
│   └── offline_rewards collection
├── rewardAd/                # 广告奖励验证（日限30次）
│   └── ad_logs collection
└── getLeaderboard/          # 排行榜查询
    └── saves collection
```

所有云函数遵循：
- 输入校验（必填参数检查、数据类型验证）
- 错误处理（try-catch + 错误信息返回）
- 无状态设计（每次调用独立）
- 微信上下文自动注入（WXContext）

## 6. 安全设计

| 风险 | 措施 |
|------|------|
| 存档篡改 | 核心逻辑在云端函数，本地仅缓存 |
| 广告刷量 | rewardAd 服务端验证，每日上限 30 次 |
| 离线收益滥用 | 最大计算时长 12 小时，服务端审计日志 |
| 云函数注入 | 输入参数类型校验 + sanitize |
