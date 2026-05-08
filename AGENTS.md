# NeuroSocialInsurance (NSI) - 项目实施计划
## 当前版本: V1.3.0

## 1. 项目现状概述
### 1.1 当前状态
- 已有完整的微服务架构（account-center, policy-hub, actuarial-engine, nsi-business, config-service
- 完整的前端实现（nsi-mobile, admin-web）
- V1.1.0已完成: 账户体系、滑块验证码、密码强度、个人资料、设置页面、隐私政策、安全加固
- 基于Capacitor的PWA + iOS/Android架构

### 1.2 目标版本
- **V1.3.0: 合并Phase1+Phase2
  - 政策知识图谱（20+城市）
  - 3套方案精算引擎
  - 漏斗式信息收集
  - 现金流模拟与可视化
  - 个税计算整合
  - 多端覆盖（PWA + iOS/Android + 微信小程序 + 支付宝小程序）

---

## 2. 实施计划（按功能模块划分

### 2.1 Phase1: MVP核心功能（4个一线城市）

#### 2.1.1 后端增强
| 任务 | 状态 | 优先级 |
|-----|------|------|
| PolicyHub: 政策知识图谱增强（北京/上海/广州/深圳基础数据结构） | 📋 | 🔴高 |
| ActuarialEngine: 3套方案精算逻辑（保守/平衡/进取） | 📋 | 🔴高 |
| ActuarialEngine: 现金流模拟 | 📋 | 🔴高 |
| nsi-business: 方案历史保存 | 📋 | 🔴高 |
| account-center: 用户画像扩展 | 📋 | 🔴高 |

#### 2.1.2 前端增强
| 任务 | 状态 | 优先级 |
|-----|------|------|
| authStore: 扩展用户画像字段（参保历史、资产、偏好 | 📋 | 🔴高 |
| calcStore: 支持3套方案并行展示 | 📋 | 🔴高 |
| Sandbox页面重构（三栏布局） | 📋 | 🔴高 |
| 漏斗式信息收集组件 | 📋 | 🔴高 |
| Dashboard页面增强（政策雷达、方案概览） | 📋 | 🔴高 |
| Profile页面扩展（参保历史、方案历史） | 📋 | 🔴高 |
| 现金流可视化（Chart.js增强） | 📋 | 🔴高 |
| PWA + iOS/Android完善 | 📋 | 🟡中 |

### 2.2 Phase2: 全国覆盖与个税

| 任务 | 状态 | 优先级 |
|-----|------|------|
| 政策知识图谱扩展至20+城市 | 📋 | 🟡中 |
| 个税计算整合 | 📋 | 🟡中 |
| 微信小程序 | 📋 | 🟡中 |
| 支付宝小程序 | 📋 | 🟡中 |

---

## 3. 技术架构

### 3.1 后端微服务
| 服务 | 职责 | 技术栈 |
|-----|------|------|
| account-center | 账户、认证、个人资料 | FastAPI + SQLAlchemy |
| policy-hub | 政策管理、知识图谱 | FastAPI + SQLAlchemy |
| actuarial-engine | 精算计算（Go ++++ | Gin + Go |
| nsi-business | 业务逻辑、方案历史、报告生成 | FastAPI + SQLAlchemy |
| config-service | 配置管理 | FastAPI + SQLAlchemy |
| **新增**: policy-crawler | 政策采集（可选） | Python定时任务 |

### 3.2 前端架构
| 端 | 技术栈 |
|-----|------|
| PWA/H5 | React + Vite + Zustand + Tailwind |
| iOS/Android | Capacitor + React Native? 共享组件库 |
| 微信小程序 | 微信原生小程序SDK + React组件适配层 |
| 支付宝小程序 | 支付宝原生小程序SDK + React组件适配层 |

---

## 4. 关键数据结构设计

### 4.1 政策数据模型
```yaml
Policy:
  - policy_id
  - region_code
  - policy_type
  - policy_subtype
  - name
  - description
  - effective_date
  - expiry_date
  - version
  - status
  - params: JSONB
    - 缴费基数上下限
    - 缴费比例
    - 个人账户记账比例
    - 待遇计算公式
    - 其他参数
  - sources: PolicySource[]
```

### 4.2 用户画像扩展
```typescript
interface AuthState {
  // 现有字段...
  // 新增字段
  contributionHistory: ContributionRecord[]
  assets: {
    personalAccountBalance: number
    commercialInsurance: { medical: boolean; pension: boolean; other: boolean }
    housingFund: { balance: number; monthlyContribution: number }
  }
  preferences: {
    targetMonthlyPension: number
    monthlyBudget: number
    riskAppetite: 'conservative' | 'balanced' | 'aggressive'
  }
  assumptions: {
    inflationRate: number
    wageGrowthRate: number
    interestRate: number
  }
}

interface ContributionRecord {
  startDate: Date
  endDate: Date
  region: string
  baseSalary: number
  employmentType: string
  isTransitional: boolean
}
```

### 4.3 精算方案结构
```typescript
interface Strategy {
  id: string
  type: 'conservative' | 'balanced' | 'aggressive'
  name: string
  description: string
  params: {
    baseSalaryStrategy: number
    retirementAge: number
    strategy: string
  }
  result: {
    totalInvested: number
    monthlyPension: number
    irr: number
    breakEvenAge: number
    cashflows: Cashflow[]
  }
}

interface Cashflow {
  year: number
  age: number
  type: 'contribution' | 'benefit'
  amount: number
  cumulative: number
}
```

---

## 5. 实施顺序与依赖关系

1. 后端精算引擎增强（3套方案+现金流）
2. 前端calcStore扩展
3. 前端Sandbox页面重构
4. 政策知识图谱基础数据
5. 前端漏斗式信息收集
6. Dashboard/Profile页面增强
7. 多端适配

---

## 6. 风险与缓解措施
| 风险 | 缓解措施 |
|-----|---------|
| 精算模型复杂度高 | 从简单模型开始，迭代优化 |
| 政策数据获取难度大 | 先手动录入核心城市，再做基础数据 |
| 多端适配工作量大 | 核心业务逻辑共享，UI层适配 |
| 微信/支付宝小程序打通复杂 | 最后做，V1.3.0先聚焦PWA+APP |

---

## 7. 下一步行动

1. 增强精算引擎后端实现
2. 增强前端calcStore和Sandbox页面
3. 政策知识图谱基础数据
4. 前端各页面业务增强
5. 多端适配

---

## 8. 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| V1.1.0 | 2026-05-07 | 账户体系+滑块验证码+密码强度+个人资料+设置页面+隐私政策+安全加固 |
| V1.3.0 | 进行中 | 政策知识图谱+3套方案+漏斗收集+现金流可视化+个税整合+多端覆盖 |
