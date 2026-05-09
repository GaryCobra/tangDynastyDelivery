# UI 层知识库

## 职责

游戏界面控制器，处理用户交互和数据显示。

## 模块

### MainUI.ts
- **类型**：cc.Component
- **场景**：MainScene
- **功能**：顶部信息栏（铜钱/声望/体力/天气/天数）、底部导航按钮
- **注册事件**：COINS_CHANGED, REPUTATION_CHANGED, STAMINA_CHANGED, WEATHER_CHANGED, LEVEL_UP, DAY_CHANGED
- **导航**：onDeliveryClick(), onStationClick(), onFinanceClick()

### DeliveryUI.ts
- **类型**：cc.Component
- **场景**：DeliveryScene
- **功能**：订单列表（ScrollView + Prefab 动态生成）、载具信息、配送进度条
- **数据源**：DeliverySystem（每帧 updateDelivery）
- **交互**：接单按钮 → acceptOrder() → 进入配送 → 进度更新

### StationUI.ts
- **类型**：cc.Component
- **场景**：StationScene
- **功能**：员工列表、雇佣面板（模板列表）、薪资管理、站点建立
- **面板切换**：无站点时显示建立面板，有站点时显示运营面板
- **交互**：雇佣→hireEmployee()、解雇→fireEmployee()、支付薪资→payEmployeeSalaries()

### FinanceUI.ts
- **类型**：cc.Component
- **场景**：FinanceScene
- **功能**：商品行情列表、持仓信息、交易面板（买入/卖出）
- **特殊交互**：广告密报按钮（解锁趋势提示）
- **数据刷新**：每秒 tick

## UI 模式

1. **Prefab 动态生成**— 列表项使用 Prefab + ScrollView.content.appendChild()
2. **事件驱动刷新**— 数据变更通过 EventBus 监听，不轮询（除配送进度）
3. **面板切换**— 通过 node.active 控制显示隐藏
4. **数据绑定**— 从系统层读取，通过 label.string 直接设置

## 场景管理

通过 GameManager.setState() 切换场景状态。各 UI 在 onLoad 中初始化对应的 System 实例。
