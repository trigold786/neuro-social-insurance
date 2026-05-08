# NSI Platform (NeuroSocialInsurance) 社保定制速算器

**V1.3.0** — 全栈社保智能定制速算平台，支持3套方案精算、个税计算、20城市政策数据、多端覆盖（PWA + 微信小程序）。

## 功能特性

### 精算引擎
- **3套退休方案**：保守型 / 平衡型 / 进取型
- **现金流模拟**：年度缴费与收益全景视图
- **灵敏度分析**：基数变化、延迟退休对养老金的影响
- **IRR/回本年龄**：方案对比一目了然

### 政策知识图谱
- **20城市**社保政策数据（一线：北京/上海/广州/深圳 + 16个重点二线城市）
- **2026最新费率**：养老、医疗、失业、工伤、生育保险
- **政策雷达对比图**：多城市、多维度横向比较

### 个税计算
- **7档累进税率**（3%-45%）
- **7项专项附加扣除**：子女教育/继续教育/大病医疗/住房贷款/住房租金/赡养老人/3岁以下婴幼儿照护
- **累计预扣法**：月度税后工资精准计算

### 用户旅程
- **漏斗式4步信息收集**：引导式交互，降低填写负担
- **Dashboard驾驶舱**：方案概览 + 政策雷达 + 个税 tab 切换
- **PDF报告生成**：异步生成，深色主题，一键下载

### 多端覆盖
- **PWA/H5**：响应式设计，Dark Mode + Light Mode
- **微信小程序**：扫码即用，便捷分享
- **iOS/Android**：Capacitor 打包

---

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户端                              │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ PWA/H5   │  │ 微信小程序   │  │  iOS / Android     │ │
│  │ nsi-mobile│  │ mini-program│  │  (Capacitor)       │ │
│  └────┬─────┘  └─────┬──────┘  └─────────┬──────────┘ │
└───────┼──────────────┼───────────────────┼──────────────┘
        │              │                   │
        ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx Gateway (30310)                      │
│         统一入口 / 静态资源 / SSL termination            │
└────────────────────────┬────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌─────────┐       ┌───────────┐       ┌──────────────┐
│account- │       │ policy-hub│       │actuarial-    │
│center   │       │ (30312)   │       │engine (Go)   │
│(30311)  │       │           │       │ (30313)      │
└────┬────┘       └─────┬─────┘       └──────┬───────┘
     │                  │                    │
     │                  │                    │
     ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                    nsi-business (30314)                  │
│       业务服务 / 方案历史 / 报告生成 / JWT鉴权            │
└────────────────────────┬────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌─────────┐       ┌───────────┐       ┌──────────────┐
│PostgreSQL│       │   Redis   │       │ config-svc   │
│ (5432)  │       │  (6379)   │       │  (30315)     │
└─────────┘       └───────────┘       └──────────────┘
```

---

## 技术栈

### 后端
| 服务 | 语言 | 框架 | 端口 |
|------|------|------|------|
| account-center | Python 3.11 | FastAPI + SQLAlchemy | 30311 |
| policy-hub | Python 3.11 | FastAPI + SQLAlchemy | 30312 |
| actuarial-engine | Go 1.21 | Gin | 30313 |
| nsi-business | Python 3.11 | FastAPI + SQLAlchemy | 30314 |
| config-service | Python 3.11 | FastAPI + SQLAlchemy | 30315 |

### 前端
| 项目 | 框架 | 构建工具 | 端口 |
|------|------|----------|------|
| nsi-mobile | React 18 + TypeScript | Vite + Tailwind | 30300 |
| admin-web | React 18 + TypeScript | Vite + Tailwind | 30301 |

### 基础设施
- **数据库**：PostgreSQL 16
- **缓存**：Redis 7
- **对象存储**：MinIO (S3兼容)
- **网关**：Nginx Alpine
- **容器化**：Docker + Docker Compose

---

## 快速开始

### 前置条件
- Docker & Docker Compose
- Node.js 18+
- Go 1.21+ (仅 actuarial-engine 开发)
- Python 3.11+ (可选，本地后端开发)

### 1. 克隆并进入项目
```bash
git clone https://github.com/trigold786/neuro-social-insurance.git
cd neuro-social-insurance
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env，填入必要的密钥和URL
```

### 3. 启动基础设施 + 后端
```bash
cd infra/docker
docker-compose up --build -d
```

### 4. 启动前端
```bash
# C端 PWA
cd frontend/nsi-mobile
npm install
npm run dev        # http://localhost:30300

# 管理后台 (新开终端)
cd frontend/admin-web
npm install
npm run dev        # http://localhost:30301
```

### 5. 访问
- C端 PWA：http://localhost:30300
- 管理后台：http://localhost:30301
- API Gateway：http://localhost:30310

---

## 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql+asyncpg://nsi:nsi_dev@postgres:5432/nsi_account` |
| `REDIS_URL` | Redis 连接串 | `redis://:nsi_redis_dev@redis:6379/0` |
| `JWT_SECRET` | JWT 签名密钥 | `dev-secret-change-me` (生产必须更换) |
| `ALIYUN_ACCESS_KEY_ID` | 阿里云短信 AccessKey | (开发环境使用占位符) |
| `ALIYUN_ACCESS_KEY_SECRET` | 阿里云短信 Secret | (开发环境使用占位符) |
| `ACCOUNT_CENTER_URL` | 账户服务内部地址 | `http://account-center:30311` |
| `POLICY_HUB_URL` | 政策服务内部地址 | `http://policy-hub:30312` |
| `ACTUARIAL_URL` | 精算引擎内部地址 | `http://actuarial-engine:30313` |

---

## API 文档

启动服务后访问各服务的 Swagger UI：

| 服务 | Swagger URL |
|------|-------------|
| account-center | http://localhost:30311/docs |
| policy-hub | http://localhost:30312/docs |
| actuarial-engine | http://localhost:30313/docs |
| nsi-business | http://localhost:30314/docs |
| config-service | http://localhost:30315/docs |

### 核心接口

| 接口 | 方法 | 服务 | 说明 |
|------|------|------|------|
| `/v1/calc/deep-plan` | POST | actuarial-engine | 深度精算（3套方案） |
| `/v1/calc/tax` | POST | actuarial-engine | 个税计算 |
| `/v1/calc/tax/quick` | GET | actuarial-engine | 快速个税估算 |
| `/v1/reports/{task_id}` | GET | nsi-business | 获取报告生成状态 |
| `/v1/reports/download/{task_id}` | GET | nsi-business | 下载PDF报告 |
| `/v1/policies/compare` | POST | policy-hub | 城市政策对比 |

---

## 微信小程序

小程序代码位于 `mini-program/` 目录。

**配置步骤：**

1. 在 [微信公众平台](https://mp.weixin.qq.com/) 注册小程序，获取 AppID
2. 编辑 `mini-program/project.config.json`，将 `YOUR_WECHAT_APPID` 替换为真实 AppID
3. 编辑 `mini-program/app.js`，将 `getApiBase()` 中的 `YOUR_API_BASE_URL` 替换为实际后端地址
4. 补充 6 个 tabBar 图标（PNG 格式）到 `styles/tabs/` 目录
5. 使用微信开发者工具导入项目

```json
// mini-program/project.config.json
{
  "appid": "YOUR_WECHAT_APPID",  // <-- 替换此处
  ...
}
```

---

## 项目结构

```
nsi-platform/
├── frontend/
│   ├── nsi-mobile/          # C端 PWA (React + Vite + Tailwind)
│   └── admin-web/            # 管理后台
├── services/
│   ├── account-center/      # 账户与认证服务
│   ├── policy-hub/           # 政策知识图谱服务
│   ├── actuarial-engine/    # Go 精算引擎
│   ├── nsi-business/        # 业务逻辑服务
│   └── config-service/       # 配置中心
├── infra/
│   └── docker/              # Docker Compose 配置
├── mini-program/             # 微信小程序
├── shared/                   # 共享类型定义 (.proto / .ts)
├── docs/                     # 项目文档
├── docker-compose.yml
└── README.md
```

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| V1.1.0 | 2026-05-07 | 账户体系、滑块验证码、密码强度、个人资料、设置页面、隐私政策、安全加固 |
| V1.3.0 | 2026-05-08 | 政策知识图谱(20城市)、3套方案精算、漏斗收集、现金流可视化、个税计算、微信小程序、PWA增强 |

---

## 许可证

Private — © 2026 NeuroSocialInsurance
