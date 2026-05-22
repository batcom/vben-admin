# Vben Admin Monorepo

Vue Vben Admin 前端 + NestJS 后端全栈项目。

## 项目结构

```
vue-vben-admin/
├── frontend/     # Vue 3 前端 (基于 vbenjs/vue-vben-admin)
├── backend/      # NestJS 后端
└── README.md
```

## 技术栈

- **前端**: Vue 3 + Ant Design Vue + Vite + TypeScript
- **后端**: NestJS + Prisma + PostgreSQL + JWT
- **权限**: 4 层 RBAC（菜单权限、按钮权限、API 权限、字段权限 + 数据权限）

## 快速开始

### 前端

```bash
cd frontend
pnpm install
pnpm dev
```

### 后端

```bash
cd backend
pnpm install
npx prisma migrate dev
npx prisma db seed
pnpm start:dev
```

默认管理员账号: `admin / admin123`

## 同步上游前端仓库

`frontend/` 目录源自 [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)，upstream 远程已配置。

### 首次同步

```bash
# 拉取上游代码（不会合并）
git fetch upstream

# 将上游 main 分支合并到本地
git merge upstream/main

# 解决冲突（如果有），重点保留：
#   - frontend/apps/web-antd/vite.config.ts（代理配置）
#   - frontend/apps/web-antd/.env.development（VITE_NITRO_MOCK=false）
#   - frontend/pnpm-workspace.yaml（包含 backend 的工作区）
# 冲突解决后：
git add .
git commit
```

### 后续同步

```bash
git fetch upstream
git merge upstream/main
# 解决冲突后提交
```

### 仅同步前端子目录

如果只想拉取上游对 `frontend/` 的更新，可以使用 sparse-checkout：

```bash
# 方法一：直接 merge（推荐，简单）
git fetch upstream
git merge upstream/main

# 方法二：cherry-pick 特定提交
git fetch upstream
git log upstream/main --oneline  # 找到需要的提交
git cherry-pick <commit-hash>
```

### 需要保留的自定义修改

同步上游后，以下文件可能被覆盖，需要重新应用：

| 文件 | 修改内容 |
|------|----------|
| `frontend/apps/web-antd/vite.config.ts` | API 代理指向 `localhost:3001` |
| `frontend/apps/web-antd/.env.development` | `VITE_NITRO_MOCK=false` |
| `frontend/pnpm-workspace.yaml` | 添加 `../backend` 到工作区 |

## Docker 部署

```bash
# 一键启动（PostgreSQL + 后端 + 前端）
docker compose up -d --build

# 初始化数据库
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# 访问
# 前端: http://localhost
# 后端 API: http://localhost/api
```

生产环境请修改 `docker-compose.yml` 中的 JWT 密码和数据库密码。

## Git 远程配置

```bash
# 查看远程
git remote -v

# origin   → git@gitee.com:batcom/vben-admin.git  （自己的仓库）
# upstream → https://github.com/vbenjs/vue-vben-admin.git （上游仓库）
```

## 推送到远程

```bash
git push -u origin main
```
