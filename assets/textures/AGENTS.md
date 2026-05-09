# 游戏素材知识库

## 概述

59 个 PNG 素材，使用 Python/Pillow 生成，Q版卡通风格。

## 素材清单

| 分类 | 数量 | 文件命名 | 说明 |
|------|------|----------|------|
| characters | 8 | player_male.png, player_male_run.png, player_male_carry.png, player_female.png, npc_*.png | 主角+4个NPC |
| vehicles | 5 | vehicle_*.png | 5级载具 |
| buildings | 9 | building_*.png | 9个长安地标 |
| commodities | 5 | commodity_*.png | 5种商品 |
| ui | 18 | btn_*.png, icon_*.png, panel_*.png | 按钮/图标/面板 |
| tiles | 6 | tile_*.png | 地图瓦片 |
| effects | 5 | effect_*.png | 动画特效 |
| backgrounds | 3 | bg_*.png | 场景背景 |

## 索引文件

asset_manifest.json — 完整的资源路径映射表

## 生成脚本

generate_assets.py — 使用 Pillow 生成所有素材。如需重新生成或修改风格：
```bash
python3 generate_assets.py
```

## 替换指南

1. 保持文件名与 asset_manifest.json 一致
2. 使用 PNG-32（透明通道）或 PNG-8（简单图标）
3. 大小限制：角色≤100KB，建筑≤200KB，瓦片≤50KB，图标≤20KB
4. 分辨率参考：1080×1920 竖屏设计
