# Utils 层知识库

## 模块

### Constants.ts
- **核心数值定义**：所有游戏平衡参数集中在此
- **枚举**：ReputationLevel, OrderType, VehicleType, WeatherType, CommodityType, EmployeePersonality, MapLocation, AchievementType
- **配置表**：VEHICLE_CONFIG, ORDER_TYPE_CONFIG, WEATHER_CONFIG, COMMODITY_CONFIG, EMPLOYEE_TEMPLATES, LOCATION_CONFIG
- **事件名**：GameEvents（16 个事件常量，统一管理）
- **随机事件**：RANDOM_EVENTS（5 个，含价格倍率和概率）
- **游戏参数**：AD_CONFIG, STAMINA_CONFIG, ECONOMY_CONFIG

### EventBus.ts
- **发布-订阅模式**：独立于 Cocos Creator 的事件系统
- **API**：on(event, handler), off(event, handler), once(event, handler), emit(event, ...args), removeAll(event)
- **错误隔离**：每个 handler 独立 try-catch，防止连锁崩溃

### Logger.ts
- **分级日志**：DEBUG/INFO/WARN/ERROR
- **格式**：[大唐外卖][Tag] Message
- **调试建议**：生产环境设为 WARN 级别避免日志过多

### TimeUtils.ts
- **工具函数**：formatTime, formatDate, formatDateTime, isNewDay, hoursSince
