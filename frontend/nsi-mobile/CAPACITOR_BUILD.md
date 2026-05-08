# NSI Mobile - Capacitor 原生打包指南

> 基于 Capacitor 6.x，将 React 18 PWA 打包为 Android APK 与 iOS IPA。

---

## 前置要求

| 平台 | 环境 | 版本 |
|------|------|------|
| **通用** | Node.js | 18+ |
| **通用** | npm | 9+ |
| **Android** | Android Studio | Hedgehog (2023.1.1) + |
| **Android** | JDK | 17 |
| **Android** | Android SDK | API 34 |
| **iOS** | macOS | 13+ |
| **iOS** | Xcode | 15+ |
| **iOS** | CocoaPods | 1.12+ |

---

## 快速开始

### 1. 安装依赖

```bash
cd nsi-platform/frontend/nsi-mobile
npm install
```

### 2. 构建 Web 资源

```bash
npm run build
```

产物输出到 `dist/` 目录。

---

## Android APK 打包

### 3. 同步 Capacitor 资源到 Android 工程

```bash
npx cap sync android
```

### 4. 打开 Android Studio

```bash
npx cap open android
```

在 Android Studio 中：

1. **等待 Gradle Sync 完成**
2. **配置签名（发布包必需）**
   - `File > Project Structure > Modules > app > Signing Configs`
   - 或直接在 `android/app/build.gradle` 中配置 keystore
3. **构建 Release APK**
   - `Build > Generate Signed Bundle / APK...`
   - 选择 APK，选择 release 签名配置
   - 输出路径：`android/app/build/outputs/apk/release/app-release.apk`

### 5. 命令行构建（可选）

```bash
cd android
./gradlew assembleRelease
```

产物：`android/app/build/outputs/apk/release/app-release.apk`

---

## iOS IPA 打包

### 3. 同步 Capacitor 资源到 iOS 工程

```bash
npx cap sync ios
```

### 4. 安装 CocoaPods 依赖

```bash
cd ios/App
pod install
```

### 5. 打开 Xcode

```bash
npx cap open ios
```

在 Xcode 中：

1. **选择 Team**：`Signing & Capabilities` → 选择 Apple Developer Team
2. **配置 Bundle Identifier**：`com.nsi.socialinsurance`
3. **构建 Archive**
   - `Product > Archive`（选择 Any iOS Device）
4. **导出 IPA**
   - `Window > Organizer` → 选择最新 Archive → `Distribute App`
   - 选择 `Ad Hoc`（内部测试）或 `App Store`（上架）

---

## Capacitor 插件集成清单

| 插件 | 用途 | 安装状态 |
|------|------|---------|
| `@capacitor/preferences` | JWT Token、政策缓存本地存储 | package.json 已声明 |
| `@capacitor/network` | 离线模式检测 | package.json 已声明 |
| `@capacitor/camera` | OCR账单拍照 | package.json 已声明 |
| `@capacitor/push-notifications` | 报告完成/政策更新推送 | package.json 已声明 |

### 插件使用示例

```typescript
import { Preferences } from '@capacitor/preferences'
import { Camera, CameraResultType } from '@capacitor/camera'

// 本地存储Token
await Preferences.set({ key: 'access_token', value: token })
const { value } = await Preferences.get({ key: 'access_token' })

// 拍照上传
const photo = await Camera.getPhoto({
  resultType: CameraResultType.Uri,
  source: CameraSource.Camera,
  quality: 80,
})
```

---

## 环境变量

创建 `.env.production`：

```bash
VITE_API_BASE=https://api.nsi.example.com/api/v1
```

---

## 发布版本管理

| 版本 | versionName | versionCode | 更新内容 |
|------|-------------|-------------|---------|
| 1.0.2 | 1.0.2 | 102 | V1.0.2 PRD：验证码+个保法删除+原生打包 |

---

## 常见问题

**Q: Android 构建提示 `compileSdkVersion` 不匹配**
A: 确保 Android Studio SDK Manager 中已安装 API 34。

**Q: iOS 构建提示 `No such module 'Capacitor'`**
A: 确保已运行 `pod install`，且使用 `.xcworkspace` 而非 `.xcodeproj` 打开。

**Q: 网络请求在真机上报错**
A: Android 已在 `AndroidManifest.xml` 中配置 `android:usesCleartextTraffic="true"`；生产环境应使用 HTTPS。
