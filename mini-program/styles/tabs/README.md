# TabBar Icons

微信小程序 tabBar 需要 6 个 PNG 图标，尺寸要求：

| 文件名 | 尺寸 | 说明 |
|--------|------|------|
| `home.png` | 81×81 px | 首页未选中 |
| `home-active.png` | 81×81 px | 首页选中 |
| `sandbox.png` | 81×81 px | 沙盘未选中 |
| `sandbox-active.png` | 81×81 px | 沙盘选中 |
| `profile.png` | 81×81 px | 我的未选中 |
| `profile-active.png` | 81×81 px | 我的选中 |

**要求：**
- 格式：PNG（不支持网络图片）
- 尺寸：建议 81×81 px（@2x高清屏），最大不超过 1024×1024
- 主题色：`#00d4ff` (选中) / `#7b8fa6` (未选中)
- 背景：透明或与 tabBar 背景一致 (`#0d1526`)

放置在此目录下后，图标将自动在 tabBar 中显示。
