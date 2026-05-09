# 部署指南

> 本文档描述《我在大唐送外卖》微信小游戏的完整发布流程。

---

## 前置条件

- [ ] 已注册微信小程序账号（[mp.weixin.qq.com](https://mp.weixin.qq.com)）
- [ ] 已完成小程序认证（个人主体或企业主体）
- [ ] 已开通微信云开发
- [ ] 已创建广告位（激励视频 + 插屏）

## 步骤 1：项目配置

### 1.1 修改 AppID

打开 `project.config.json`，将 `appid` 替换为你的微信小程序 AppID：

```json
{
  "appid": "wx_your_actual_appid",
  "projectname": "tangDynastyDelivery"
}
```

### 1.2 配置广告位

编辑 `assets/scripts/utils/Constants.ts`：

```typescript
export const AD_CONFIG = {
  REWARDED_VIDEO_PLACEMENT_ID: 'adunit_your_rewarded_video_id',
  INTERSTITIAL_PLACEMENT_ID: 'adunit_your_interstitial_id',
  // ...
};
```

### 1.3 配置云环境

在微信开发者工具的 `cloudfunctions/` 目录，右键选择当前云环境：

```
cloudfunctions/ → 右键 → 更多设置 → 选择云环境
```

或在代码中初始化时指定：

```typescript
// assets/scripts/core/CloudManager.ts
wx.cloud.init({
  env: 'your-cloud-env-id',  // 替换为实际环境 ID
  traceUser: true,
});
```

## 步骤 2：部署云函数

### 方法一：微信开发者工具（推荐）

1. 打开微信开发者工具
2. 在项目根目录右键点击 `cloudfunctions/`
3. 选择"同步云函数" → "上传所有云函数"
4. 等待部署完成（状态变为"已部署"）

### 方法二：命令行

```bash
# 安装微信云 CLI
npm install -g wx-cloud-cli

# 登录
wx-cloud-cli login

# 部署所有云函数
cd cloudfunctions
for dir in */; do
  wx-cloud-cli deploy "$dir" --env your-cloud-env-id
done
```

### 验证云函数

部署后在微信开发者工具的"云开发"面板中：
- 确认 6 个云函数均显示"已部署"状态
- 测试 `login` 函数返回正常

## 步骤 3：构建游戏

### 3.1 Cocos Creator 构建

```bash
# 在项目根目录
cocos build --platform wechatgame
```

或通过 Cocos Creator 编辑器：
1. 打开项目
2. `项目` → `构建发布`
3. 发布平台：微信小游戏
4. 填入 AppID
5. 点击"构建"

### 3.2 构建产物

构建完成后，产物位于：

```
build/wechatgame/
├── game.js          # 游戏主代码
├── project.config.json
├── assets/          # 资源文件
└── ...
```

## 步骤 4：微信开发者工具调试

1. 打开微信开发者工具
2. 导入 `build/wechatgame/` 目录
3. 填入 AppID
4. 点击"编译"

### 调试检查项

- [ ] 游戏启动正常，无报错
- [ ] 云函数调用成功（login/saveGame/loadGame）
- [ ] 广告位正常展示
- [ ] 游戏存档正常读写
- [ ] 排行榜正常显示

## 步骤 5：上传审核

### 5.1 准备提交材料

| 材料 | 说明 |
|------|------|
| 游戏截图 | 5 张，展示核心玩法 |
| 游戏介绍 | 140 字以内 |
| 类目选择 | 游戏 → 休闲 |
| 用户协议 | 隐私协议文本 |
| 年龄限制 | 建议 12+ |

### 5.2 提交审核

1. 在微信开发者工具中点击"上传"
2. 填写版本号（如 `1.0.0`）
3. 填写更新说明
4. 提交后到 [mp.weixin.qq.com](https://mp.weixin.qq.com) 管理后台
5. 进入"版本管理" → "提交审核"
6. 填写审核信息后提交

### 5.3 审核常见问题

| 问题 | 解决方案 |
|------|----------|
| 无网络权限 | 确保 `game.json` 不禁止网络请求 |
| 广告展示异常 | 确认广告位已审核通过（测试时可使用测试广告位） |
| 云开发未开通 | 在微信公众平台开通云开发服务 |
| 类目不符 | 确保类目选择"游戏"相关 |

## 步骤 6：发布

1. 审核通过后，在管理后台点击"发布"
2. 选择"全量发布"或"灰度发布"
3. 确认发布

## 运营配置

### 流量主开通

1. 在 [mp.weixin.qq.com](https://mp.weixin.qq.com) → "流量主"
2. 开通流量主功能
3. 创建广告位获取 ID
4. 将广告位 ID 填入游戏配置

### 数据监控

重点关注指标：

| 指标 | 目标值 | 监控方式 |
|------|--------|----------|
| 人均广告次数 | > 5次/日 | 微信后台数据助手 |
| 次日留存 | > 20% | 微信后台数据助手 |
| 金融参与度 | > 30% | 自定义云函数统计 |

### 版本更新

1. 修改游戏代码
2. 重新构建 `cocos build --platform wechatgame`
3. 在微信开发者工具上传新版本
4. 提交审核 → 发布

## 故障排查

### 问题：云函数返回 404

```
原因：云函数未部署或环境 ID 配置错误
解决：确认 cloudfunctions/ 已同步，环境 ID 匹配
```

### 问题：广告无法展示

```
原因：广告位未审核通过 / 测试设备限制
解决：使用微信官方测试广告位 ID 进行调试
```

### 问题：游戏加载黑屏

```
原因：Cocos Creator 构建配置错误
解决：检查构建平台是否为 wechatgame，assets 是否完整
```
