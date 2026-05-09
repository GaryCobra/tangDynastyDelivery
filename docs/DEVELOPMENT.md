# 开发指南

> 本文档帮助开发者搭建本地开发环境，理解项目工作流。

---

## 环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 18.x | 云函数本地调试 |
| Cocos Creator | 3.8.0+ | 游戏引擎/IDE |
| 微信开发者工具 | 最新版 | 微信小游戏调试 |
| TypeScript | 5.x | 游戏脚本语言 |

## 初始化设置

### 1. 克隆项目

```bash
git clone https://github.com/GaryCobra/tangDynastyDelivery.git
cd tangDynastyDelivery
```

### 2. 安装依赖

```bash
npm install
```

### 3. 微信云开发配置

在 `project.config.json` 中设置你的 AppID：

```json
{
  "appid": "wx你的AppID",
  "cloudfunctionRoot": "cloudfunctions/"
}
```

部署云函数：

```bash
# 在微信开发者工具中
# 右键 cloudfunctions/ → 同步云函数
# 或使用命令行工具
```

### 4. 广告配置

在 `assets/scripts/utils/Constants.ts` 中配置广告位 ID：

```typescript
export const AD_CONFIG = {
  REWARDED_VIDEO_PLACEMENT_ID: '你的激励视频广告位ID',
  INTERSTITIAL_PLACEMENT_ID: '你的插屏广告位ID',
  // ...
};
```

## 开发工作流

### 代码结构

```
assets/scripts/
├── App.ts            # 入口：初始化游戏管理器
├── core/             # 核心单例管理器
├── systems/          # 业务逻辑系统
├── models/           # 数据模型
├── ui/               # UI 控制器（继承 cc.Component）
└── utils/            # 工具函数和常量
```

### 添加新功能

1. **数据模型** → 在 `models/` 中创建/扩展数据类
2. **业务逻辑** → 在 `systems/` 中创建系统类，接收 `PlayerData`
3. **UI 界面** → 在 Cocos Creator 中搭建 Scene/Node，绑定 `ui/` 下的组件
4. **事件通信** → 使用 `EventBus.emit/on` 解耦模块
5. **持久化** → `DataManager` 自动处理本地+云存档

### 数值调整

所有游戏平衡数值集中在 `assets/scripts/utils/Constants.ts`：

```typescript
// 调整载具属性
export const VEHICLE_CONFIG = { ... };

// 调整订单奖励
export const ORDER_TYPE_CONFIG = { ... };

// 调整商品波动率
export const COMMODITY_CONFIG = { ... };
```

调整后需重新测试经济循环，确保：
- 前期赚钱速度适中（不劝退）
- 后期有明确付费/广告驱动卡点

## 调试技巧

### 1. 模拟广告

`AdManager` 有自动降级逻辑：当微信广告 SDK 不可用时，自动模拟奖励发放。在 Cocos Creator 预览模式下直接可用。

### 2. 事件监控

在浏览器控制台查看带 `[大唐外卖]` 前缀的日志：

```
[大唐外卖][GameManager] Game initialized
[大唐外卖][DeliverySystem] Accepted order: order_xxx
[大唐外卖][FinanceSystem] Event triggered: 西域商路通
```

### 3. 游戏状态

通过 `GameManager.getState()` 获取当前状态：

```typescript
GameState.LOADING  // 加载中
GameState.RUNNING  // 主地图
GameState.DELIVERY // 配送中
GameState.FINANCE  // 金融街
GameState.STATION  // 站点管理
```

### 4. 存档重置

在场景中调用：

```typescript
DataManager.getInstance().deleteGame();  // 清除存档
```

## 构建与发布

### 构建微信小游戏

```bash
# Cocos Creator 命令行
cocos build --platform wechatgame

# 产物位置：build/wechatgame/
```

### 微信开发者工具

1. 打开微信开发者工具
2. 导入 `build/wechatgame/` 目录
3. 填入 AppID
4. 真机预览 / 上传审核

### 云函数部署

```bash
# 登录微信云 CLI
npx wx-cloud-cli login

# 部署所有云函数
npx wx-cloud-cli deploy cloudfunctions/
```

## 素材替换

所有游戏素材位于 `assets/textures/` 目录，按类别组织：

```
textures/
├── characters/     # 角色 PNG
├── vehicles/       # 载具 PNG
├── buildings/      # 建筑 PNG
├── commodities/    # 商品图标
├── ui/             # UI 按钮和图标
├── tiles/          # 地图瓦片
├── effects/        # 动画特效
└── backgrounds/    # 场景背景
```

替换素材后，确保：
1. 文件名与 `asset_manifest.json` 中的引用一致
2. 文件大小符合约束（角色 ≤100KB，建筑 ≤200KB，瓦片 ≤50KB，图标 ≤20KB）
3. 使用 PNG-32（透明通道）或 PNG-8（简单图标）

## 常见问题

**Q: 为什么 wx 全局变量未定义？**
A: 在 Cocos Creator 预览模式下，wx API 不可用。`CloudManager` 和 `AdManager` 有降级逻辑，在非微信环境会自动模拟。

**Q: 如何测试离线收益功能？**
A: 修改 `playerData.lastLoginTime` 为较早的时间戳，然后调用 `DataManager.calculateOfflineEarnings()`。

**Q: 广告点击后没有反应？**
A: 检查 `Constants.ts` 中的广告位 ID 配置，以及广告单元是否已在微信公众平台创建并审核通过。
