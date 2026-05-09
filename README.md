# 《我在大唐送外卖》— 微信小程序游戏

> 模拟经营 / 策略 / 放置挂机 · 纯广告变现 · Cocos Creator 3.x + 微信云开发

![Game Banner](assets/textures/backgrounds/bg_main.png)

## 📋 项目概览

扮演大唐长安的一名跑腿小哥，从步行送货开始，通过赚取铜钱升级载具、建立站点、招聘员工，并利用"金融街"低买高卖，最终成为富甲一方的商业大亨。

| 项目 | 信息 |
|------|------|
| 技术栈 | Cocos Creator 3.x (TypeScript) + 微信云开发 |
| 盈利模式 | 纯广告变现（激励视频 + 插屏广告） |
| 目标平台 | 微信小游戏 |
| 仓库地址 | https://github.com/GaryCobra/tangDynastyDelivery |

## 🏗️ 项目结构

```
tangDynastyDelivery/
├── assets/
│   ├── scenes/               # Cocos Creator 场景文件
│   ├── scripts/
│   │   ├── core/             # 核心管理器（状态、数据、广告、云）
│   │   ├── systems/          # 游戏系统（送货、载具、站点、金融、声望）
│   │   ├── ui/               # UI 控制器
│   │   ├── models/           # 数据模型
│   │   └── utils/            # 工具（常量、事件总线、日志、时间）
│   └── textures/             # 59 个游戏素材（角色、载具、建筑、UI等）
├── cloudfunctions/           # 6 个微信云函数
├── docs/                     # 项目文档
├── doc/                      # 需求文档（PRD + 美术需求）
├── project.json              # Cocos Creator 配置
├── tsconfig.json
├── package.json
├── game.json                 # 微信小游戏配置
└── project.config.json       # 微信开发者工具配置
```

## 🎮 核心玩法

### 送货系统
- **4 种订单类型**：普通、加急、贵重、连环
- **天气系统**：晴天/雨天/雪天，影响速度和体力消耗
- **双路线选择**：主干道（快但需躲避人群）vs 小巷（短但有障碍）
- **完美送达**：躲避障碍积攒进度条，获得 1.5x 额外铜钱

### 载具系统
| 载具 | 载重 | 速度 | 解锁条件 |
|------|------|------|----------|
| 双腿 | 10kg | 1.0m/s | 初始 |
| 三轮推车 | 50kg | 1.5m/s | 小有名气 |
| 四轮平板车 | 100kg | 1.8m/s | 员外 + 看10次广告 |
| 牛车 | 300kg | 1.2m/s | 乡绅 + 看30次广告 |
| 马车 | 500kg | 2.5m/s | 富豪 + 看50次广告 |

### 站点系统
- 声望达到"小有名气"且拥有 5000 铜钱可建立站点
- 8 种员工（老实/机灵/懒散三种性格）
- 装备升级（保温箱、统一制服）
- 薪资结算与罢工机制
- 离线收益（最长 12 小时）

### 金融系统
- 5 种商品：粮食、丝绸、瓷器、茶叶、香料
- 随机事件：西域商路通、江南大旱、宫廷采购等
- 广告解锁"胡商密报"趋势提示
- 简易 K 线图

## 🛠️ 技术架构

```
App.ts (入口)
├── GameManager (状态机)
├── DataManager (本地 + 云存档)
├── CloudManager (微信云函数桥接)
├── AdManager (激励视频/插屏广告)
│
├── DeliverySystem (送货核心)
├── VehicleSystem (载具管理)
├── ReputationSystem (声望等级)
├── StationSystem (站点运营)
└── FinanceSystem (商品交易)
```

## ☁️ 云函数

| 函数 | 说明 | 集合 |
|------|------|------|
| login | 用户登录/注册 | users |
| saveGame | 保存游戏进度 | saves |
| loadGame | 加载游戏进度 | saves |
| calculateOfflineEarnings | 离线收益计算 | offline_rewards |
| rewardAd | 广告奖励验证 | ad_logs |
| getLeaderboard | 排行榜（Top100）| saves |

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/GaryCobra/tangDynastyDelivery.git

# 2. 安装依赖
cd tangDynastyDelivery
npm install

# 3. 用 Cocos Creator 打开项目
cocos open .

# 4. 构建微信小游戏
cocos build --platform wechatgame

# 5. 用微信开发者工具打开 build/wechatgame 目录
```

## 📄 许可证

MIT License © 2024 GaryCobra
