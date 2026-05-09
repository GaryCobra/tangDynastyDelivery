# Models 层知识库

## 职责

数据实体定义，包含序列化/反序列化和业务校验方法。

## 模块

### PlayerData.ts
- **核心数据**：coins, reputationLevel, stamina, currentVehicle
- **集合**：unlockedVehicles[], employeeIds[], inventory[], achievements[]
- **统计**：totalDeliveries, perfectDeliveries, failedDeliveries
- **方法**：createNew(uid), fromJSON(json), toJSON()
- **日记录**：dailyRecord（deliveryCount, adWatchedCount, coinsEarned）

### OrderData.ts
- **属性**：type, origin, destination, distance, reward, timeLimit
- **计算属性**：isExpired, remainingTime
- **链式订单**：OrderChain（steps[], currentStep, rewards[]）
- **ID 生成**：OrderData.generateId() = order_${timestamp}_${random}

### EmployeeData.ts
- **构造**：从 EmployeeTemplate 创建
- **属性**：personality, speed, capacity, diligence, morale, fatigue
- **计算属性**：efficiency, hourlyOutput
- **业务方法**：canWork(), checkStrike(), pay(), work(), rest(), collectTip()
- **性格差异**：SMART 有 30% 小费概率，LAZY 疲劳加速

### StationData.ts
- **属性**：level, employeeSlots, storageCapacity, upgradeCost
- **业务方法**：canUpgrade(), upgrade(), recordRevenue(), recordExpense()
- **等级公式**：upgradeCost = 10000 × 2^(level-1)

### CommodityData.ts
- **属性**：type, currentPrice, priceHistory[], playerHolding, playerAvgCost
- **价格更新**：随机游走 + 波动率 + 事件乘数
- **交易方法**：buy(quantity), sell(quantity)
- **计算属性**：profit, profitPercent
- **K线数据**：priceHistory 最多 168 条

## 序列化

所有模型实现 toJSON() 和 fromJSON() 方法，支持 JSON 深拷贝存档。
