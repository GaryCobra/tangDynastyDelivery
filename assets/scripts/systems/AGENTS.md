# Systems 层知识库

## 职责

游戏业务逻辑层，实现所有核心玩法系统。

## 模块

### DeliverySystem.ts
- **构造参数**：PlayerData
- **核心功能**：订单池管理、配送执行、天气变化
- **订单类型**：NORMAL / EXPRESS / VALUABLE / CHAIN
- **天气系统**：SUNNY / RAINY / SNOWY，概率权重 0.6/0.25/0.15
- **路线选择**：main road (快+障碍) vs alley (短+减速)
- **完美送达**：障碍闪避率基于载具稳定性
- **关键方法**：acceptOrder(), updateDelivery(), completeDelivery(), updateWeather()
- **事件**：ORDER_ACCEPTED, ORDER_COMPLETED, ORDER_FAILED, WEATHER_CHANGED

### VehicleSystem.ts
- **构造参数**：PlayerData
- **载具类型**：LEGS / HANDCART / FLATBED / OX_CART / HORSE_CART
- **解锁条件**：reputationLevel 或 adWatchCount（Flatbed: 员外+10广告, Ox: 乡绅+30广告, Horse: 富豪+50广告）
- **关键方法**：unlockVehicle(), switchVehicle(), getEffectiveSpeed(), checkAndUnlock()
- **事件**：VEHICLE_CHANGED

### ReputationSystem.ts
- **构造参数**：PlayerData
- **等级**：7 级（布衣→小有名气→员外→乡绅→富豪→大乡绅→一方巨富）
- **功能解锁**：各等级解锁不同订单类型和载具
- **关键方法**：addReputation(), checkLevelUp(), getReputationMultiplier()
- **乘数**：1.0 → 2.5（随等级递增）
- **事件**：REPUTATION_CHANGED, LEVEL_UP

### StationSystem.ts
- **构造参数**：PlayerData
- **前置条件**：声望≥小有名气 + 5000铜钱
- **员工系统**：8 个员工模板，3 种性格（HONEST/SMART/LAZY）
- **运营机制**：薪资结算、罢工条件、疲劳度、士气
- **装备升级**：保温箱(1000)、统一制服(1500)
- **离线收益**：等级×员工数×效率×时长×0.5，上限12h
- **关键方法**：establishStation(), hireEmployee(), processEmployeeWork(), calculateOfflineIncome()
- **事件**：EMPLOYEE_HIRED, EMPLOYEE_FIRED, COINS_CHANGED

### FinanceSystem.ts
- **无构造参数**（内部初始化市场数据）
- **商品**：GRAIN/SILK/PORCELAIN/TEA/SPICE
- **价格机制**：随机游走 + 波动率 + 事件加成
- **随机事件**：5 种（西域商路通、江南大旱、宫廷采购、茶马古道、胡商云集）
- **K线**：最多 168 条记录（7天×24h）
- **广告密报**：趋势提示（up/down/stable），每次观看广告解锁
- **关键方法**：buy(), sell(), updateMarket(), triggerRandomEvent(), getTrendHint()
- **事件**：COMMODITY_PRICE_CHANGED, RANDOM_EVENT

## 依赖关系

```
DeliverySystem → PlayerData, EventBus, Constants
VehicleSystem → PlayerData, EventBus, Constants
ReputationSystem → PlayerData, EventBus, Constants
StationSystem → PlayerData, StationData, EmployeeData, EventBus, Constants
FinanceSystem → CommodityData, EventBus, Constants
```

## 设计原则

1. 所有系统通过构造方法接收 PlayerData 引用（无需单例访问）
2. 数值变更后通过 EventBus 通知 UI
3. 不直接依赖 UI 组件或 Cocos Creator 节点
