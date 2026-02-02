# React 19 Custom SSR 实现原理手册

本文件详细记录了本项目（`react-custom-ssr`）中自定义服务端渲染（Server-Side Rendering）的实现机制。

---

## 核心架构：两阶段映射

项目采用了 **“两阶段构建、三步走运行”** 的模型，通过 Webpack 的多编译器模式（Multi-compiler）确保前后端代码的隔离与协作。

### 1. 构建阶段 (Build Time)
- **双端打包**：同时生成 `Client Bundle`（用于浏览器执行）和 `Server Bundle`（用于 Node.js 执行）。
- **资源清单**：通过 `@loadable/webpack-plugin` 生成 `loadable-stats.json`。该文件记录了所有异步组件（Chunk）与物理文件名的映射关系，是服务端精准注入 JS/CSS 的关键。

### 2. 运行时阶段 (Runtime)

#### 第一步：数据预取 (Data Prefetching)
当请求到达 Koa 服务器时：
1. **路由匹配**：使用 `react-router-dom` 的 `matchRoutes` 识别当前页面路径。
2. **异步拉取**：检查匹配到的路由是否配置了 `loadData`（基于 TanStack Query）。
3. **状态脱水 (Dehydration)**：在服务器端获取数据并存入 `QueryClient`。

#### 第二步：流式渲染 (Streaming Rendering)
1. **renderToPipeableStream**：利用 React 19 的新特性，将组件树渲染为流（Stream）。
2. **分段发送**：
   - **Shell 段**：包含 `<head>` 中的 SEO 信息、初始 HTML 骨架。
   - **Content 段**：随渲染进度逐步推送的 HTML 内容。
   - **Bootstrap 段**：在末尾注入序列化后的 `JSON` 数据（脱水状态）和脚本链接。

#### 第三步：客户端激活 (Hydration)
1. **注水 (Hydration)**：浏览器下载完 JS 后，调用 `hydrateRoot`。
2. **状态同步**：客户端 `QueryClient` 自动读取 HTML 底部注入的 JSON 数据，并填充缓存，从而避免首屏闪烁和重复请求。

---

## 关键技术组件

| 组件 | 作用 |
| :--- | :--- |
| **@loadable/component** | 处理按路由分包（Code Splitting）及 SSR 资源追踪。 |
| **TanStack Query (v5)** | 统一前后端数据请求模型，负责状态的脱水与注水。 |
| **react-helmet-async** | 管理 SSR 环境下的动态 SEO 标签（Title, Meta, Lang）。 |
| **Koa + @koa/router** | 提供底层 HTTP 服务，管理请求上下文。 |

---

## 降级与容错机制

- **isSSR 标志位**：服务端会在 HTML 底部插入一个注入了 `isSSR: true` 的 `<script id="__APP_FLAG__">`。
- **自动降级**：如果服务端渲染失败，或者 CDN 劫持导致没有该标志位，客户端逻辑会自动回退到 `createRoot().render()`（即纯 CSR 模式），确保页面始终可用。

---

## 开发建议
1. **LoadData 定义**：新增路由时，请务必在 `src/routes/index.tsx` 中定义 `loadData` 和 `queryKey`。
2. **样式隔离**：推荐使用 `.module.less` 实现样式私有化，避免 SSR 时的全局样式冲突。
3. **副作用控制**：确保组件的 `useEffect` 逻辑只在客户端运行，SSR 阶段不会执行。
