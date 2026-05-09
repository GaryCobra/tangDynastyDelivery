# 云函数 API 文档

> 微信云函数接口规范，所有函数部署在微信云开发环境。

---

## 通用约定

- **请求方式**：`wx.cloud.callFunction({ name, data })`
- **认证**：云函数通过 `cloud.getWXContext()` 自动获取用户身份
- **错误响应格式**：`{ error: string }`
- **成功响应格式**：自定义，见各函数文档

---

## 1. login

用户登录/注册。首次登录自动创建用户记录。

### Request

```json
{}
```

### Response

```json
{
  "openid": "oXXXX_xxxxxxxxxxxx",
  "isNewUser": true
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| openid | string | 微信用户唯一标识 |
| isNewUser | boolean | 是否新用户（首次登录） |

### 集合操作

- **读取**：`users` 集合，查询 `_openid`
- **写入**：新用户插入文档，老用户更新 `lastLoginAt`

---

## 2. saveGame

保存玩家游戏进度到云端。

### Request

```json
{
  "uid": "player_1234567890",
  "gameData": {
    "coins": 1500,
    "reputationLevel": 1,
    "stamina": 80,
    "currentVehicle": "handcart"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | string | 是 | 玩家唯一 ID |
| gameData | object | 是 | 完整游戏数据，大小 < 100KB |

### Response

```json
{
  "success": true
}
```

### 限制

- `gameData` JSON 序列化后不得超过 102400 字节
- 使用 upsert 模式，同一用户仅保留一份存档

---

## 3. loadGame

加载玩家游戏进度。

### Request

```json
{}
```

### Response

```json
{
  "found": true,
  "uid": "player_1234567890",
  "gameData": { ... },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| found | boolean | 是否找到存档 |
| uid | string | 玩家 ID |
| gameData | object | 完整游戏数据 |
| updatedAt | Date | 最后保存时间 |

---

## 4. calculateOfflineEarnings

计算玩家离线期间的站点收益。

### Request

```json
{
  "uid": "player_1234567890",
  "lastLoginTime": 1704067200000,
  "stationLevel": 3,
  "employeeCount": 2,
  "totalEfficiency": 45
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | string | 是 | 玩家 ID |
| lastLoginTime | number | 是 | 上次登录时间戳 (ms) |
| stationLevel | number | 否 | 站点等级，默认 0 |
| employeeCount | number | 否 | 员工数量，默认 0 |
| totalEfficiency | number | 否 | 员工总效率，默认 0 |

### Response

```json
{
  "coins": 1250,
  "hours": 8.5,
  "message": "离线8.5小时，获得1250铜钱"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| coins | number | 离线收益铜钱 |
| hours | number | 实际离线时长（最大 12） |
| message | string | 中文描述信息 |

### 计算公式

```
coins = stationLevel x max(1, employeeCount) x totalEfficiency x hoursOffline x 0.5
```

### 限制

- 离线时长上限：12 小时（AD_CONFIG.OFFLINE_MAX_HOURS）
- 少于 1 小时不计收益
- 所有计算在服务端执行，防止客户端篡改
- 每次计算记录写入 offline_rewards 审计集合

---

## 5. rewardAd

广告奖励服务端验证与发放。

### Request

```json
{
  "uid": "player_1234567890",
  "adType": "rewarded_video",
  "rewardType": "coins"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | string | 是 | 玩家 ID |
| adType | string | 是 | 广告类型 rewarded_video / interstitial |
| rewardType | string | 是 | 奖励类型 coins / stamina / finance_tip |

### Response

```json
{
  "success": true,
  "rewardAmount": 50,
  "dailyCount": 5,
  "rewardType": "coins"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 是否成功 |
| rewardAmount | number | 奖励数量 |
| dailyCount | number | 今日已观看次数 |
| rewardType | string | 奖励类型 |

### 限制

- 每日上限：30 次（MAX_DAILY_ADS）
- 按 date + _openid 统计日活
- 记录写入 ad_logs 集合，含时间戳和奖励类型

---

## 6. getLeaderboard

获取全服排行榜。

### Request

```json
{}
```

### Response

```json
{
  "list": [
    {
      "rank": 1,
      "nickname": "跑腿小哥",
      "coins": 999999,
      "reputationLevel": 6,
      "vehicle": "horse_cart",
      "deliveries": 1234
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 排行榜数组 |
| list[].rank | number | 排名（1-100） |
| list[].nickname | string | 玩家昵称 |
| list[].coins | number | 铜钱数 |
| list[].reputationLevel | number | 声望等级 |
| list[].vehicle | string | 当前载具 |
| list[].deliveries | number | 完成订单数 |

### 查询逻辑

- 按 gameData.coins 降序排列
- 限制 100 条
- 仅查询 nickname, coins, reputationLevel, currentVehicle, totalDeliveries 字段

---

## 错误码说明

| 错误场景 | 错误信息 |
|----------|----------|
| 缺少参数 | Missing uid or gameData |
| 数据过大 | Data too large |
| 广告已达上限 | Daily ad limit reached |
| 服务端错误 | 由 try-catch 捕获返回 |
