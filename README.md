# NSI Platform (NeuroSocialInsurance)

社保定制速算器全栈平台骨架。

## 服务矩阵

| 服务 | 端口 | 技术栈 | 职责 |
|------|------|--------|------|
| nginx (gateway) | 30310 | Nginx | API 统一入口、静态资源 |
| account-center | 30311 | Python/FastAPI | 用户身份中台（跨C/B端共享） |
| policy-hub | 30312 | Python/FastAPI | 政策中台（DaaS） |
| actuarial-engine | 30313 | Go/Gin | 无状态精算引擎 |
| nsi-business | 30314 | Python/FastAPI | C端业务服务（档案/报告） |
| config-service | 30315 | Python/FastAPI | 配置中心（动态热更新） |

## 前端

| 项目 | 端口 | 技术栈 | 职责 |
|------|------|--------|------|
| nsi-mobile | 30300 | React18+Vite+Tailwind | C端PWA/H5 |
| admin-web | 30301 | React18+Vite+Tailwind | 业务管理后台 |

## 端口规则

- **30300-30399**：NSI 平台专属端口段
- **30300**：前端开发服务器（nsi-mobile）
- **30301**：管理后台开发服务器（admin-web）
- **30310**：API Gateway（Nginx）对外主入口
- **30311-30315**：后端微服务内部端口
- **例外端口**：5432(PostgreSQL)、6379(Redis)、9000/9001(MinIO) —— 详见 docs/PORT_ALLOCATION.md

## 启动（开发环境）

```bash
# 基础设施 + 全部后端服务
cd infra/docker
docker-compose up --build

# 前端开发（新开终端）
cd frontend/nsi-mobile
npm install
npm run dev      # 运行在 30300

# 管理后台开发（新开终端）
cd frontend/admin-web
npm install
npm run dev      # 运行在 30301
```

## 访问地址

- C端 PWA: http://localhost:30300
- 管理后台: http://localhost:30301
- API Gateway: http://localhost:30310
