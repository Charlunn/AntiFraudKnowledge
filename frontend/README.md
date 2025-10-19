# 反诈知识图谱前端

本目录基于 **Nuxt 3 + Vite + TypeScript + TailwindCSS** 实现反诈知识图谱可视化界面，包含图谱浏览、社区互动、学习资源等模块。

## 环境要求
- Node.js ≥ 18.17
- npm ≥ 9（或使用 pnpm 8、yarn 1.22）

## 快速开始
```bash
# 安装依赖
npm install

# 启动开发服务器（默认为 http://localhost:3000）
npm run dev

# 生产构建与预览
npm run build
npm run preview
```

## 环境变量
在 `.env` 或部署环境中区分 SSR 与浏览器的 API 基地址：

```bash
# 服务端（容器内 SSR）访问后端
API_BASE_SERVER=http://api:8000
# 客户端（浏览器）访问后端
API_BASE_CLIENT=http://localhost:8000

# 兼容旧配置（可选）
NUXT_PUBLIC_API_BASE=/api
ENABLE_OAUTH_LOGIN=false
```

`API_BASE_SERVER` 用于服务端渲染阶段，容器场景下可设置为 `http://api:8000`（docker-compose）或 `http://host.docker.internal:8000`（单容器，Linux 需 `--add-host=host.docker.internal:host-gateway`）。`API_BASE_CLIENT` 提供给浏览器，保持宿主机可访问的地址。

## Docker 运行示例

单容器（Linux 需额外添加 `--add-host`）：

```bash
docker run --rm -it \
  -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e NUXT_HOST=0.0.0.0 -e NITRO_HOST=0.0.0.0 -e NITRO_PORT=3000 \
  -e API_BASE_SERVER=http://host.docker.internal:8000 \
  -e API_BASE_CLIENT=http://localhost:8000 \
  <image-name>
```

docker-compose（前后端位于同一网络，后端服务名为 `api`）：

```yaml
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      NUXT_HOST: "0.0.0.0"
      NITRO_HOST: "0.0.0.0"
      NITRO_PORT: "3000"
      API_BASE_SERVER: "http://api:8000"
      API_BASE_CLIENT: "http://localhost:8000"
    depends_on: [api]
  api:
    image: your-backend-image
    expose: ["8000"]
```

## 验收步骤
1. 在容器内部验证后端连通：
   - `docker exec -it <nuxt-container> sh -lc "curl -sv http://api:8000/health || true"`
   - `docker exec -it <nuxt-container> sh -lc "curl -sv http://host.docker.internal:8000/health || true"`
2. 宿主机执行 `curl -v http://localhost:3000/`，需在 1 秒内返回 HTML。
3. 浏览器访问 `http://localhost:3000/`，首屏正常渲染，终端无 Headers Timeout 报错。
4. 搜索代码库确认 SSR 阶段不再出现 `localhost/127.0.0.1/0.0.0.0` 的硬编码地址。

## 主要特性
- Cytoscape.js 动态知识图谱，支持力导向、层级、时间线布局切换。
- shadcn-vue 风格组件与 Pinia 状态管理，覆盖图谱、学习、社区等场景。
- vue-i18n 双语支持，结合 TailwindCSS 与 Motion One 提供动画效果。

## 目录结构
```
/components/fraud-graph  # 图谱页面组件
/composables             # 组合式函数与状态封装
/mocks                   # 图谱与演练 mock 数据
/stores                  # Pinia 状态（图谱/UI/社区等）
/pages                   # 业务页面入口
/locales                 # 国际化文案
```

## 开发建议
- 若接入真实接口，可在 `stores/useGraphStore.ts` 替换 `initialize`、`expandNode` 等方法。
- 新增图谱或文案时，更新 `mocks/graph` 与 `locales/*` 下的资源。
- 统一使用 `useApi()` 或 `useRuntimeConfig().public.apiBase` 访问接口，避免硬编码地址。
- 建议在容器内通过 `curl` 快速验证后端连通，再启动前端容器。
