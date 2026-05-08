# NSI 微信小程序

基于 NSI (NeuroSocialInsurance) 社保定制速算器的小程序端。

## 项目结构

```
mini-program/
├── app.js              # 全局应用逻辑
├── app.json            # 全局配置 (页面路由、tabBar、window)
├── app.wxss            # 全局样式 (深色主题)
├── project.config.json # 微信开发者工具项目配置
├── pages/
│   ├── index/         # 首页 (Dashboard)
│   ├── sandbox/        # 精算推演沙盘
│   └── profile/        # 个人中心 (方案历史/个税计算)
├── components/        # 公共组件
├── utils/
│   └── api.js         # API 封装
└── styles/
    └── tabs/          # tabBar 图标 (需手动添加 PNG)
```

## 使用方法

1. **打开微信开发者工具**, 选择「导入项目」
2. 选择 `nsi-platform/mini-program` 目录
3. 填入 AppID (`wxxxxxxxxxxx` 需替换为真实小程序 AppID)
4. 填写项目名称 `nsi-miniprogram`
5. 点击「导入」

## 配置后端地址

编辑 `app.js` 中的 `getApiBase()` 方法:

```js
getApiBase() {
  return 'https://your-backend-domain.com/v1'  // 替换为实际后端地址
}
```

## tabBar 图标

在 `styles/tabs/` 目录下添加以下 6 个 PNG 图标 (推荐尺寸 81x81):

- `home.png` / `home-active.png`
- `sandbox.png` / `sandbox-active.png`
- `profile.png` / `profile-active.png`

## 功能模块

| 页面 | 功能 |
|------|------|
| 首页 | 智能档案、方案概览、政策情报雷达 |
| 沙盘 | 3套方案对比、缴费基数/退休年龄滑块、投入产出预测、保存方案、导出报告 |
| 个人中心 | 参保历史、已保存方案、个税计算器 (7项专项附加扣除) |

## 开发命令

```bash
# 使用微信开发者工具打开项目
# Development: 直接在开发者工具中热重载
# Build: 微信开发者工具菜单 → 构建 npm
```

## 注意事项

- 小程序需配置合法域名 (微信公众平台后台)
- 后端 API 必须支持 HTTPS (开发阶段可临时开启不校验)
- `GITHUB_PERSONAL_ACCESS_TOKEN` 需在微信小程序后台配置
